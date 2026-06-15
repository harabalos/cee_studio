/**
 * POST /api/me/booking
 *
 * Member booking with smart hour deduction.
 *
 * Auth: Supabase session required.
 *
 * Pricing policy:
 *   - Hours from plan cover the BASE studio rental only.
 *   - Overage hours (when balance < duration) charged at CHF 50 / extra hour.
 *   - Add-ons + late-night surcharge charged separately at full price.
 *
 * Two execution paths:
 *
 *   1) Direct booking (no Stripe) — when hours fully cover the booking
 *      AND there are no extras (no add-ons, no late-night).
 *      Total: CHF 0. Returns { mode: "full_coverage_free", booking }.
 *
 *   2) Stripe Checkout — anywhere else (overage hours OR extras present).
 *      Returns { mode: "stripe_checkout", url } for client redirect.
 *      On webhook completion: booking created + hours deducted atomically.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { calcPrice, DEFAULT_PRICES, DEFAULT_ADDON_PRICES, DEFAULT_PREMIUM_SURCHARGE_CHF, PREMIUM_SURCHARGE_BY_PLAN, formatChf } from "@/lib/booking/pricing";
import { stripe, STRIPE_CURRENCY } from "@/lib/stripe/server";
import { sendBookingConfirmation, sendOwnerNotification } from "@/lib/email/booking-emails";
import type { AddonKey, Duration } from "@/types/booking";

const ZURICH_TZ = "Europe/Zurich";
const HOLD_MINUTES = 30;
const MEMBER_EXTRA_HOUR_RATE_CHF = 5000; // CHF 50 per overage hour

const bodySchema = z.object({
  duration: z.number().refine((n) => [1, 2, 3, 4, 8].includes(n)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  addons: z.array(z.enum(["lighting", "backdrops"])).default([]),
  premium: z.boolean().optional().default(false),
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
  const { duration, date, time, addons, premium, shootType } = body.data;

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
    .select("id, plan, hours_balance, hours_rolled_over, status")
    .eq("user_id", dbUser.id)
    .eq("status", "active")
    .maybeSingle();
  if (!membership) {
    return NextResponse.json({ error: "no_active_membership" }, { status: 403 });
  }

  const balance = Number(membership.hours_balance);
  if (balance <= 0) {
    return NextResponse.json(
      { error: "no_balance", balance, needed: duration },
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

  const holdsOverlap = await admin
    .from("pending_holds")
    .select("id")
    .gt("expires_at", new Date().toISOString())
    .lt("start_time", endUtc.toISOString())
    .gt("end_time", startUtc.toISOString())
    .limit(1);
  if (holdsOverlap.data && holdsOverlap.data.length > 0) {
    return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
  }

  // Pricing breakdown (regular pricing for add-ons + late-night)
  const startHour = parseInt(time.split(":")[0], 10);
  // Members get a reduced (or free) premium surcharge based on their plan.
  const memberPremiumSurcharge =
    PREMIUM_SURCHARGE_BY_PLAN[membership.plan as string] ?? DEFAULT_PREMIUM_SURCHARGE_CHF;
  const breakdown = calcPrice({
    duration: duration as Duration,
    startHour,
    addons: addons as AddonKey[],
    premium,
    prices: DEFAULT_PRICES,
    addonPrices: DEFAULT_ADDON_PRICES,
    premiumSurchargeChf: memberPremiumSurcharge,
  });

  const lang = (dbUser.preferred_lang ?? "de") as "de" | "en" | "fr" | "it";
  const hoursToDeduct = Math.min(balance, duration);
  const extraHours = Math.max(0, duration - balance);
  const overageBaseChf = extraHours * MEMBER_EXTRA_HOUR_RATE_CHF;
  const extrasChf = breakdown.addonsChf + breakdown.premiumChf + breakdown.lateNightChf;
  const chargedChf = overageBaseChf + extrasChf;

  // =====================================================================
  // PATH 1 — Direct booking (no Stripe)
  // Only when hours fully cover the booking AND there are no extras.
  // =====================================================================
  if (chargedChf === 0) {
    const { data: booking, error: insertErr } = await admin
      .from("bookings")
      .insert({
        user_id: dbUser.id,
        membership_id: membership.id,
        start_time: startUtc.toISOString(),
        end_time: endUtc.toISOString(),
        duration_hours: duration,
        base_price_chf: 0,
        addons_price_chf: 0,
        late_night_surcharge_chf: 0,
        total_chf: 0,
        payment_method: "membership_hours",
        payment_status: "paid",
        hours_deducted: hoursToDeduct,
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

    // Deduct hours (rolled-over first, FIFO)
    const usingRolledOver = Math.min(Number(membership.hours_rolled_over), hoursToDeduct);
    await admin
      .from("memberships")
      .update({
        hours_balance: balance - hoursToDeduct,
        hours_rolled_over: Number(membership.hours_rolled_over) - usingRolledOver,
      })
      .eq("id", membership.id);

    try {
      await sendBookingConfirmation(booking);
      await sendOwnerNotification(booking);
    } catch (e) {
      console.error("[me/booking] email failed", e);
    }

    return NextResponse.json({
      ok: true,
      mode: "full_coverage_free",
      booking: { id: booking.id, manage_token: booking.manage_token },
      newBalance: balance - hoursToDeduct,
    });
  }

  // =====================================================================
  // PATH 2 — Stripe Checkout
  // Triggered when overageBaseChf > 0 (partial coverage)
  // OR when extrasChf > 0 (add-ons or late-night even with full coverage).
  // =====================================================================

  // Create pending_hold with member context
  const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
  const { data: hold, error: holdErr } = await admin
    .from("pending_holds")
    .insert({
      start_time: startUtc.toISOString(),
      end_time: endUtc.toISOString(),
      expires_at: holdExpiresAt.toISOString(),
      payload: {
        duration,
        addons,
        guest: {
          name: dbUser.name ?? "",
          email: userEmail,
          phone: dbUser.phone ?? "",
          company: dbUser.company ?? undefined,
          shootType: shootType ?? undefined,
        },
        lang,
        breakdown: {
          baseChf: overageBaseChf,
          addonsChf: breakdown.addonsChf,
          premiumChf: breakdown.premiumChf,
          lateNightChf: breakdown.lateNightChf,
          totalChf: chargedChf,
          lateNightHours: breakdown.lateNightHours,
        },
        shoot_type: shootType ?? null,
        member: {
          membership_id: membership.id,
          user_id: dbUser.id,
          hours_to_deduct: hoursToDeduct,
        },
      },
    })
    .select()
    .single();

  if (holdErr || !hold) {
    console.error("[me/booking] hold insert failed", holdErr);
    return NextResponse.json({ error: "hold_create_failed" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  type LineItem = {
    price_data: {
      currency: string;
      product_data: { name: string; description?: string };
      unit_amount: number;
    };
    quantity: number;
  };
  const lineItems: LineItem[] = [];

  // Overage base (extra hours × CHF 50)
  if (overageBaseChf > 0) {
    lineItems.push({
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: {
          name: `Studio Rental — ${extraHours}h extra @ CHF 50/h`,
          description: `${date} · ${time} (Europe/Zurich) — ${hoursToDeduct}h from your plan balance`,
        },
        unit_amount: overageBaseChf,
      },
      quantity: 1,
    });
  }

  // Add-ons (full price, member doesn't get free add-ons)
  const addonLabels: Record<string, string> = {
    lighting: "Additional Lighting Setup",
    backdrops: "All Backdrops Access",
  };
  for (const addon of addons) {
    const price = DEFAULT_ADDON_PRICES[addon as keyof typeof DEFAULT_ADDON_PRICES];
    lineItems.push({
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: { name: `Add-on: ${addonLabels[addon] ?? addon}` },
        unit_amount: price,
      },
      quantity: 1,
    });
  }

  // Premium equipment surcharge (members pay it too — it's an equipment add-on)
  if (breakdown.premiumChf > 0) {
    lineItems.push({
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: { name: "Studio + Premium Equipment" },
        unit_amount: breakdown.premiumChf,
      },
      quantity: 1,
    });
  }

  // Late-night surcharge
  if (breakdown.lateNightChf > 0) {
    lineItems.push({
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: { name: `Late-night surcharge (${breakdown.lateNightHours}h)` },
        unit_amount: breakdown.lateNightChf,
      },
      quantity: 1,
    });
  }

  // For full-coverage-with-extras (no overage), we still want a header line
  // explaining the hours are covered, so the customer doesn't think they're
  // paying for the studio time.
  if (overageBaseChf === 0 && lineItems.length > 0) {
    lineItems.unshift({
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: {
          name: `Studio Rental — ${duration}h (covered by plan)`,
          description: `${date} · ${time} (Europe/Zurich) — ${hoursToDeduct}h from your plan balance`,
        },
        unit_amount: 0,
      },
      quantity: 1,
    });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: userEmail,
      locale: lang,
      success_url: `${siteUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/booking?cancelled=1`,
      expires_at: Math.floor(holdExpiresAt.getTime() / 1000),
      metadata: {
        hold_id: hold.id as string,
        duration: String(duration),
        member_booking: "true",
        hours_to_deduct: String(hoursToDeduct),
        extra_hours: String(extraHours),
      },
      payment_intent_data: {
        description: `CEE Studio member top-up · ${date} ${time} · ${formatChf(chargedChf)}`,
      },
    });
  } catch (e) {
    await admin.from("pending_holds").delete().eq("id", hold.id);
    console.error("[me/booking] stripe error", e);
    return NextResponse.json({ error: "stripe_error" }, { status: 500 });
  }

  await admin.from("pending_holds").update({ stripe_session_id: session.id }).eq("id", hold.id);

  return NextResponse.json({
    ok: true,
    mode: "stripe_checkout",
    url: session.url,
    hoursFromBalance: hoursToDeduct,
    extraHours,
    chargedChf,
    breakdown: {
      overageBaseChf,
      addonsChf: breakdown.addonsChf,
      lateNightChf: breakdown.lateNightChf,
    },
    holdId: hold.id,
    expiresAt: holdExpiresAt.toISOString(),
  });
}
