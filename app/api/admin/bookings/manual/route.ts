/**
 * POST /api/admin/bookings/manual
 *
 * Admin-only manual booking entry (for phone, walk-in, or B2B-invoice clients).
 * Skips Stripe — booking is confirmed immediately.
 *
 * Re-checks availability server-side. Optionally sends a confirmation email.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { calcPrice, DEFAULT_PRICES, DEFAULT_ADDON_PRICES } from "@/lib/booking/pricing";
import { sendBookingConfirmation, sendOwnerNotification } from "@/lib/email/booking-emails";
import { ensureUserAndLinkBooking } from "@/lib/booking/link-user";
import type { AddonKey, Duration } from "@/types/booking";

const ZURICH_TZ = "Europe/Zurich";

const bodySchema = z.object({
  duration: z.number().refine((n) => [1, 2, 3, 4, 8].includes(n)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  guest: z.object({
    name: z.string().min(1),
    email: z.string().email().nullable().optional(),
    phone: z.string().min(1),
    company: z.string().optional(),
    shoot_type: z.string().optional(),
  }),
  addons: z.array(z.enum(["lighting", "backdrops", "podcast"])).default([]),
  paymentMethod: z.enum(["admin_cash", "admin_prepaid", "invoice"]),
  lang: z.enum(["de", "en", "fr", "it"]).default("de"),
  sendEmail: z.boolean().default(true),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_params", details: parsed.error.flatten() }, { status: 400 });

  const b = parsed.data;
  const duration = b.duration as Duration;
  const startLocal = parseLocalDateTime(b.date, b.time);
  const startUtc = fromZonedTime(startLocal, ZURICH_TZ);
  const endUtc = new Date(startUtc.getTime() + duration * 60 * 60 * 1000);

  // Re-check no conflict
  const supabase = getSupabaseAdmin();
  const overlap = await supabase
    .from("bookings")
    .select("id")
    .eq("status", "confirmed")
    .lt("start_time", endUtc.toISOString())
    .gt("end_time", startUtc.toISOString())
    .limit(1);

  if (overlap.error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  if (overlap.data && overlap.data.length > 0) {
    return NextResponse.json({ error: "slot_conflict" }, { status: 409 });
  }

  // Pricing — same calculator as the customer flow
  const startHour = parseInt(b.time.split(":")[0], 10);
  const breakdown = calcPrice({
    duration,
    startHour,
    addons: b.addons as AddonKey[],
    prices: DEFAULT_PRICES,
    addonPrices: DEFAULT_ADDON_PRICES,
  });

  const paymentStatus = b.paymentMethod === "invoice" ? "invoice_pending" : "paid";

  // Insert booking
  const { data: created, error } = await supabase
    .from("bookings")
    .insert({
      start_time: startUtc.toISOString(),
      end_time: endUtc.toISOString(),
      duration_hours: duration,
      base_price_chf: breakdown.baseChf,
      addons_price_chf: breakdown.addonsChf,
      late_night_surcharge_chf: breakdown.lateNightChf,
      total_chf: breakdown.totalChf,
      payment_method: b.paymentMethod,
      payment_status: paymentStatus,
      guest_name: b.guest.name,
      guest_email: b.guest.email ?? null,
      guest_phone: b.guest.phone,
      guest_company: b.guest.company ?? null,
      shoot_type: b.guest.shoot_type ?? null,
      preferred_lang: b.lang,
      notes: b.notes ?? null,
      status: "confirmed",
    })
    .select()
    .single();

  if (error || !created) {
    return NextResponse.json({ error: error?.message ?? "insert_failed" }, { status: 500 });
  }

  // Insert addons
  if (b.addons.length > 0) {
    await supabase.from("booking_addons").insert(
      b.addons.map((key) => ({
        booking_id: created.id,
        addon_key: key,
        price_chf: DEFAULT_ADDON_PRICES[key as AddonKey],
      }))
    );
  }

  // Auto-link to user by email
  if (b.guest.email) {
    await ensureUserAndLinkBooking({
      bookingId: created.id,
      email: b.guest.email,
      name: b.guest.name,
      phone: b.guest.phone,
      company: b.guest.company,
      preferredLang: b.lang,
    });
  }

  // Optionally email
  if (b.sendEmail && b.guest.email) {
    try {
      const emailBooking = {
        id: created.id,
        start_time: created.start_time,
        end_time: created.end_time,
        duration_hours: created.duration_hours,
        base_price_chf: created.base_price_chf,
        addons_price_chf: created.addons_price_chf,
        late_night_surcharge_chf: created.late_night_surcharge_chf,
        total_chf: created.total_chf,
        payment_method: created.payment_method,
        guest_name: created.guest_name,
        guest_email: created.guest_email,
        guest_phone: created.guest_phone,
        guest_company: created.guest_company,
        shoot_type: created.shoot_type,
        manage_token: created.manage_token,
        preferred_lang: created.preferred_lang,
      };
      await Promise.all([
        sendBookingConfirmation(emailBooking),
        sendOwnerNotification(emailBooking),
      ]);
    } catch (e) {
      console.error("[manual booking] email failed", e);
      // Don't fail the request — booking is created, log the error
    }
  }

  return NextResponse.json({ ok: true, booking: created });
}

function parseLocalDateTime(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mm] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, mm));
}
