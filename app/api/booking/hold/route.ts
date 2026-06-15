/**
 * POST /api/booking/hold
 *
 * Body: { duration, date (YYYY-MM-DD Zurich local), time (HH:mm Zurich local),
 *         addons[], guest{...}, lang, terms_accepted }
 *
 * Flow:
 *  1. Validate input
 *  2. Re-check availability server-side (no trust client)
 *  3. Create pending_holds row (30min expiry — matches Stripe Checkout minimum)
 *  4. Compute price breakdown
 *  5. Create Stripe Checkout session (mode=payment, automatic_payment_methods → TWINT auto-shows in CH)
 *  6. Return { url } for client redirect
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { stripe, STRIPE_CURRENCY } from "@/lib/stripe/server";
import { computeAvailableSlots, getZurichHour, zurichLocalToUtcRange } from "@/lib/booking/availability";
import { calcPrice, formatChf } from "@/lib/booking/pricing";
import type { Duration } from "@/types/booking";

// Stripe Checkout requires expires_at >= 30min in future, so hold needs to match.
const HOLD_MINUTES = 30;

const bodySchema = z.object({
  duration: z.number().refine((n) => [1, 2, 3, 4, 8].includes(n)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  addons: z.array(z.enum(["lighting", "backdrops"])),
  premium: z.boolean().optional().default(false),
  guest: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    company: z.string().optional(),
    street: z.string().min(3),
    postalCode: z.string().min(3),
    city: z.string().min(2),
    shootType: z.string().optional(),
  }),
  lang: z.enum(["de", "en", "fr", "it"]),
  termsAccepted: z.literal(true),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_params", issues: parsed.error.format() }, { status: 400 });
  }

  const { duration, date, time, addons, premium, guest, lang } = parsed.data;
  const supabase = getSupabaseAdmin();

  // Compute UTC range
  const { startUtc, endUtc } = zurichLocalToUtcRange(date, time, duration);

  // Re-check availability server-side
  const nowIso = new Date().toISOString();
  const [{ data: bookings }, { data: holds }, { data: blocked }, { data: settings }] = await Promise.all([
    supabase.from("bookings").select("start_time,end_time").in("status", ["confirmed", "completed", "no_show"]).lt("start_time", endUtc.toISOString()).gt("end_time", startUtc.toISOString()),
    supabase.from("pending_holds").select("start_time,end_time").gt("expires_at", nowIso).lt("start_time", endUtc.toISOString()).gt("end_time", startUtc.toISOString()),
    supabase.from("blocked_dates").select("start_time,end_time").lt("start_time", endUtc.toISOString()).gt("end_time", startUtc.toISOString()),
    supabase.from("settings").select("operating_hours,buffer_minutes,prices,addon_prices,late_night_starts_at,late_night_surcharge_chf_per_hour").eq("id", 1).single(),
  ]);

  const busy = [...(bookings ?? []), ...(holds ?? []), ...(blocked ?? [])].map((b) => ({
    start: new Date(b.start_time),
    end: new Date(b.end_time),
  }));

  const operatingHours = (settings?.operating_hours as { start: string; end: string }) ?? { start: "08:00", end: "22:00" };
  const bufferMinutes = settings?.buffer_minutes ?? 30;

  const availableSlots = computeAvailableSlots({
    date,
    duration: duration as Duration,
    busy,
    operatingHours,
    bufferMinutes,
  });

  if (!availableSlots.includes(time)) {
    return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
  }

  // Price calculation
  const startHour = getZurichHour(startUtc);
  const lateNightStartHour = parseInt((settings?.late_night_starts_at as string ?? "20:00").split(":")[0], 10);
  const lateNightSurchargePerHour = (settings?.late_night_surcharge_chf_per_hour as number) ?? 1000;
  const prices = settings?.prices as Record<string, number> | undefined;
  const addonPrices = settings?.addon_prices as Record<string, number> | undefined;

  const breakdown = calcPrice({
    duration: duration as Duration,
    startHour,
    addons,
    premium,
    prices: prices as never,
    addonPrices: addonPrices as never,
    lateNightSurchargeChfPerHour: lateNightSurchargePerHour,
    lateNightStartHour,
  });

  // Create hold
  const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
  const holdInsert = await supabase.from("pending_holds").insert({
    start_time: startUtc.toISOString(),
    end_time: endUtc.toISOString(),
    expires_at: holdExpiresAt.toISOString(),
    payload: {
      duration,
      addons,
      premium,
      guest,
      lang,
      breakdown,
      shoot_type: guest.shootType ?? null,
    },
  }).select().single();

  if (holdInsert.error || !holdInsert.data) {
    console.error("[hold] insert error", holdInsert.error);
    return NextResponse.json({ error: "hold_create_failed" }, { status: 500 });
  }

  const holdId = holdInsert.data.id as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Build Stripe line items
  type LineItem = {
    price_data: {
      currency: string;
      product_data: { name: string; description?: string };
      unit_amount: number;
    };
    quantity: number;
  };
  const lineItems: LineItem[] = [
    {
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: {
          name: `Studio Rental — ${duration}h`,
          description: `${date} · ${time} (Europe/Zurich)`,
        },
        unit_amount: breakdown.baseChf,
      },
      quantity: 1,
    },
  ];
  for (const addon of addons) {
    const price = addonPrices?.[addon] ?? { lighting: 2000, backdrops: 3000 }[addon];
    lineItems.push({
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: { name: `Add-on: ${addon}` },
        unit_amount: price,
      },
      quantity: 1,
    });
  }
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

  // Create Stripe Checkout session.
  // No payment_method_types specified → Stripe shows whatever's enabled in the dashboard.
  // (Card always on; TWINT auto-appears once activated post-verification.)
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: guest.email,
      locale: stripeLocale(lang),
      success_url: `${siteUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/booking?cancelled=1`,
      expires_at: Math.floor(holdExpiresAt.getTime() / 1000),
      metadata: {
        hold_id: holdId,
        duration: String(duration),
        date,
        time,
        lang,
        addons: addons.join(","),
        premium: String(premium),
        guest_name: guest.name,
        guest_phone: guest.phone,
        guest_company: guest.company ?? "",
        guest_street: guest.street,
        guest_postal_code: guest.postalCode,
        guest_city: guest.city,
        shoot_type: guest.shootType ?? "",
      },
      payment_intent_data: {
        description: `CEE Studio booking · ${date} ${time} · ${formatChf(breakdown.totalChf)}`,
      },
    });
  } catch (e) {
    // Stripe failed → free up the slot we just held
    await supabase.from("pending_holds").delete().eq("id", holdId);
    console.error("[hold] stripe error", e);
    return NextResponse.json({ error: "stripe_error" }, { status: 500 });
  }

  // Save session id back to hold (for webhook lookup)
  await supabase.from("pending_holds").update({ stripe_session_id: session.id }).eq("id", holdId);

  return NextResponse.json({
    url: session.url,
    holdId,
    expiresAt: holdExpiresAt.toISOString(),
    breakdown,
  });
}

function stripeLocale(lang: "de" | "en" | "fr" | "it"): "de" | "en" | "fr" | "it" {
  return lang;
}
