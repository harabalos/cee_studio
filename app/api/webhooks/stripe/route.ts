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
import { ensureUserAndLinkBooking } from "@/lib/booking/link-user";
import {
  onSubscriptionCreated,
  onSubscriptionUpdated,
  onSubscriptionDeleted,
  onInvoicePaid,
  onInvoicePaymentFailed,
} from "@/lib/memberships/handlers";

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
      case "customer.subscription.created":
        await onSubscriptionCreated(supabase, event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.updated":
        await onSubscriptionUpdated(supabase, event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await onSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await onInvoicePaid(supabase, event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await onInvoicePaymentFailed(supabase, event.data.object as Stripe.Invoice);
        break;
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
    // Present only when this hold was created via /api/me/booking partial flow
    member?: {
      membership_id: string;
      user_id: string;
      hours_to_deduct: number;
    };
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
  //    Member-partial bookings get user_id, membership_id, hours_deducted populated.
  const isMemberPartial = !!payload.member;
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
      // Member-partial fields (null otherwise)
      user_id: isMemberPartial ? payload.member!.user_id : null,
      membership_id: isMemberPartial ? payload.member!.membership_id : null,
      hours_deducted: isMemberPartial ? payload.member!.hours_to_deduct : 0,
    })
    .select()
    .single();

  if (bookingErr || !booking) {
    console.error("[webhook] booking insert failed", bookingErr);
    return;
  }

  // 4. Insert add-ons — same price for both regular guest and member-partial
  //    (member-full bookings go through /api/me/booking and create their own add-on rows)
  if (payload.addons.length > 0) {
    const addonRows = payload.addons.map((key) => ({
      booking_id: booking.id,
      addon_key: key,
      price_chf: { lighting: 2000, backdrops: 3000 }[key as "lighting" | "backdrops"],
    }));
    await supabase.from("booking_addons").insert(addonRows);
  }

  // 4b. Member-partial: deduct hours from balance
  if (isMemberPartial && payload.member) {
    const { data: m } = await supabase
      .from("memberships")
      .select("hours_balance, hours_rolled_over")
      .eq("id", payload.member.membership_id)
      .maybeSingle();
    if (m) {
      const toDeduct = payload.member.hours_to_deduct;
      const usingRolledOver = Math.min(Number(m.hours_rolled_over), toDeduct);
      await supabase
        .from("memberships")
        .update({
          hours_balance: Number(m.hours_balance) - toDeduct,
          hours_rolled_over: Number(m.hours_rolled_over) - usingRolledOver,
        })
        .eq("id", payload.member.membership_id);
    }
  }

  // 5. Delete hold
  await supabase.from("pending_holds").delete().eq("id", hold.id);

  // 5b. Auto-link booking to a `users` row by email so the customer can
  // sign in later and see all their bookings on /account
  await ensureUserAndLinkBooking({
    bookingId: booking.id,
    email: payload.guest.email,
    name: payload.guest.name,
    phone: payload.guest.phone,
    company: payload.guest.company ?? null,
    preferredLang: payload.lang,
  });

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
