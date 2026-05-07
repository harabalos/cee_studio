/**
 * POST /api/webhooks/stripe
 *
 * Phase 1 events:
 *  - checkout.session.completed   → finalize booking from hold
 *  - checkout.session.expired     → delete hold
 *  - charge.refunded              → mark booking refunded
 *
 * Body must be raw (Stripe signature verification). We use Request.text().
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendBookingConfirmation, sendOwnerNotification } from "@/lib/email/booking-emails";

export const runtime = "nodejs";
// IMPORTANT: do NOT add a 'json' body parser config — we need raw body.

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no_signature" }, { status: 400 });

  let event: Stripe.Event;
  const raw = await req.text();
  try {
    event = constructWebhookEvent(raw, sig);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await finalizeBooking(supabase, session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabase.from("pending_holds").delete().eq("stripe_session_id", session.id);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (piId) {
          await supabase
            .from("bookings")
            .update({
              payment_status: charge.amount_refunded === charge.amount ? "refunded" : "partially_refunded",
              refund_chf: charge.amount_refunded,
            })
            .eq("stripe_payment_intent_id", piId);
        }
        break;
      }
      default:
        // unknown event types are fine — Stripe sends many
        break;
    }
  } catch (err) {
    console.error("[webhook] handler error", { type: event.type, err });
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function finalizeBooking(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  session: Stripe.Checkout.Session
) {
  // 1. Find the hold via stripe_session_id
  const { data: hold } = await supabase
    .from("pending_holds")
    .select("*")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (!hold) {
    console.warn("[webhook] no hold found for session", session.id);
    return;
  }

  const payload = hold.payload as {
    duration: number;
    addons: string[];
    guest: { name: string; email: string; phone: string; company?: string; shootType?: string };
    lang: "de" | "en" | "fr" | "it";
    breakdown: { baseChf: number; addonsChf: number; lateNightChf: number; totalChf: number; lateNightHours: number };
    shoot_type: string | null;
  };

  // 2. Determine payment method (TWINT or card) — set on session.payment_method_types in Stripe
  const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  let methodLabel: "card" | "twint" = "card";
  try {
    if (piId) {
      const stripe = (await import("@/lib/stripe/server")).stripe;
      const pi = await stripe.paymentIntents.retrieve(piId, { expand: ["latest_charge"] });
      const charge = pi.latest_charge as Stripe.Charge | null;
      const pmType = charge?.payment_method_details?.type;
      if (pmType === "twint") methodLabel = "twint";
    }
  } catch (e) {
    console.warn("[webhook] could not retrieve payment intent for method", e);
  }

  // 3. Insert booking row (atomic with hold deletion via Postgres txn-like sequence)
  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      start_time: hold.start_time,
      end_time: hold.end_time,
      duration_hours: payload.duration,
      base_price_chf: payload.breakdown.baseChf,
      addons_price_chf: payload.breakdown.addonsChf,
      late_night_surcharge_chf: payload.breakdown.lateNightChf,
      total_chf: payload.breakdown.totalChf,
      payment_method: methodLabel,
      payment_status: "paid",
      stripe_session_id: session.id,
      stripe_payment_intent_id: piId,
      status: "confirmed",
      guest_name: payload.guest.name,
      guest_email: payload.guest.email,
      guest_phone: payload.guest.phone,
      guest_company: payload.guest.company ?? null,
      shoot_type: payload.shoot_type,
      preferred_lang: payload.lang,
    })
    .select()
    .single();

  if (bookingErr || !booking) {
    console.error("[webhook] booking insert failed", bookingErr);
    return;
  }

  // 4. Insert add-ons
  if (payload.addons.length > 0) {
    const addonRows = payload.addons.map((key) => ({
      booking_id: booking.id,
      addon_key: key,
      price_chf: { lighting: 2000, backdrops: 3000, podcast: 4000 }[key as "lighting" | "backdrops" | "podcast"],
    }));
    await supabase.from("booking_addons").insert(addonRows);
  }

  // 5. Delete hold
  await supabase.from("pending_holds").delete().eq("id", hold.id);

  // 6. Send confirmation emails
  try {
    await sendBookingConfirmation(booking);
  } catch (e) {
    console.error("[webhook] customer email failed (non-fatal)", e);
  }
  try {
    await sendOwnerNotification(booking);
  } catch (e) {
    console.error("[webhook] owner email failed (non-fatal)", e);
  }
}
