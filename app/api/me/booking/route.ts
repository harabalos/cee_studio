/**
 * POST /api/me/booking
 *
 * Member-only booking that deducts hours from balance instead of paying.
 *
 * Auth: Supabase session required.
 * Body: same as /api/booking/hold but no payment fields needed.
 *
 * If the booking duration > current balance:
 *   Return 402 with `extraNeeded` so the UI can offer "pay extra" flow
 *   (Phase 2.5 — for now, member must use exactly available hours).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { calcPrice, DEFAULT_PRICES, DEFAULT_ADDON_PRICES } from "@/lib/booking/pricing";
import { sendBookingConfirmation, sendOwnerNotification } from "@/lib/email/booking-emails";
import type { AddonKey, Duration } from "@/types/booking";

const ZURICH_TZ = "Europe/Zurich";

const bodySchema = z.object({
  duration: z.number().refine((n) => [1, 2, 3, 4, 8].includes(n)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  addons: z.array(z.enum(["lighting", "backdrops", "podcast"])).default([]),
  shootType: z.string().optional(),
  termsAccepted: z.literal(true),
});

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_params", details: body.error.flatten() }, { status: 400 });
  }
  const { duration, date, time, addons, shootType } = body.data;

  const admin = getSupabaseAdmin();
  const userEmail = auth.user.email.toLowerCase();

  // Find user + membership
  const { data: dbUser } = await admin
    .from("users")
    .select("id, name, phone, company, preferred_lang")
    .eq("email", userEmail)
    .maybeSingle();
  if (!dbUser) return NextResponse.json({ error: "no_user_record" }, { status: 404 });

  const { data: membership } = await admin
    .from("memberships")
    .select("id, hours_balance, hours_rolled_over, status")
    .eq("user_id", dbUser.id)
    .eq("status", "active")
    .maybeSingle();
  if (!membership) {
    return NextResponse.json({ error: "no_active_membership" }, { status: 403 });
  }

  // Hour-balance check
  const balance = Number(membership.hours_balance);
  if (balance < duration) {
    return NextResponse.json(
      { error: "insufficient_hours", balance, needed: duration },
      { status: 402 }
    );
  }

  // Compute booking time + check availability
  const startUtc = fromZonedTime(`${date}T${time}:00`, ZURICH_TZ);
  const endUtc = new Date(startUtc.getTime() + duration * 60 * 60 * 1000);

  const overlap = await admin
    .from("bookings")
    .select("id")
    .in("status", ["confirmed", "completed", "no_show"])
    .lt("start_time", endUtc.toISOString())
    .gt("end_time", startUtc.toISOString())
    .limit(1);
  if (overlap.error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  if (overlap.data && overlap.data.length > 0) {
    return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
  }

  // Pricing for add-ons (still chargeable separately — TBD: invoice or charge later)
  // For Phase 1 of memberships: add-ons are free for members
  const startHour = parseInt(time.split(":")[0], 10);
  const breakdown = calcPrice({
    duration: duration as Duration,
    startHour,
    addons: addons as AddonKey[],
    prices: DEFAULT_PRICES,
    addonPrices: DEFAULT_ADDON_PRICES,
  });

  const lang = (dbUser.preferred_lang ?? "de") as "de" | "en" | "fr" | "it";

  // Insert booking
  const { data: booking, error: insertErr } = await admin
    .from("bookings")
    .insert({
      user_id: dbUser.id,
      membership_id: membership.id,
      start_time: startUtc.toISOString(),
      end_time: endUtc.toISOString(),
      duration_hours: duration,
      base_price_chf: 0, // covered by membership
      addons_price_chf: breakdown.addonsChf, // currently 0 effective for members
      late_night_surcharge_chf: 0,
      total_chf: 0,
      payment_method: "membership_hours",
      payment_status: "paid",
      hours_deducted: duration,
      status: "confirmed",
      guest_email: userEmail,
      guest_name: dbUser.name ?? "",
      guest_phone: dbUser.phone ?? "",
      guest_company: dbUser.company ?? null,
      shoot_type: shootType ?? null,
      preferred_lang: lang,
    })
    .select()
    .single();

  if (insertErr || !booking) {
    return NextResponse.json({ error: "db_error", details: insertErr?.message }, { status: 500 });
  }

  if (addons.length > 0) {
    await admin.from("booking_addons").insert(
      addons.map((k) => ({
        booking_id: booking.id,
        addon_key: k,
        price_chf: 0, // members get add-ons free in v1
      }))
    );
  }

  // Deduct hours
  // Rolled-over hours used FIRST (FIFO so they expire correctly)
  const usingRolledOver = Math.min(Number(membership.hours_rolled_over), duration);
  await admin
    .from("memberships")
    .update({
      hours_balance: balance - duration,
      hours_rolled_over: Number(membership.hours_rolled_over) - usingRolledOver,
    })
    .eq("id", membership.id);

  // Send confirmation email
  try {
    await sendBookingConfirmation(booking);
    await sendOwnerNotification(booking);
  } catch (e) {
    console.error("[me/booking] email failed", e);
  }

  return NextResponse.json({
    ok: true,
    booking: {
      id: booking.id,
      manage_token: booking.manage_token,
    },
    newBalance: balance - duration,
  });
}
