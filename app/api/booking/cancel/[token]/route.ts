/**
 * POST /api/booking/cancel/[token]
 *
 * Customer-initiated cancellation via the manage link.
 * Re-evaluates rules server-side — never trusts the client.
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { evaluateCancellation } from "@/lib/booking/cancellation";
import { sendCancellationCustomer, sendCancellationOwner } from "@/lib/email/booking-emails";

export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const supabase = getSupabaseAdmin();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("manage_token", params.token)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "already_cancelled" }, { status: 409 });
  }

  const decision = evaluateCancellation({
    bookingStartUtc: booking.start_time,
    totalPaidChf: booking.total_chf,
  });

  if (!decision.allowed) {
    return NextResponse.json({ error: decision.reason }, { status: 403 });
  }

  // Issue refund (if paid via Stripe)
  let refundedChf = 0;
  if (booking.stripe_payment_intent_id && booking.payment_status === "paid") {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: decision.refundChf,
        reason: "requested_by_customer",
      });
      refundedChf = refund.amount;
    } catch (e) {
      console.error("[cancel] refund failed", e);
      return NextResponse.json({ error: "refund_failed" }, { status: 500 });
    }
  }

  // Mark cancelled
  const { data: updated, error: updErr } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: "customer",
      payment_status: refundedChf > 0 ? "refunded" : booking.payment_status,
      refund_chf: refundedChf,
    })
    .eq("id", booking.id)
    .select()
    .single();

  if (updErr || !updated) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // Notify
  try {
    await sendCancellationCustomer(updated, refundedChf);
  } catch (e) {
    console.error("[cancel] customer email failed", e);
  }
  try {
    await sendCancellationOwner(updated);
  } catch (e) {
    console.error("[cancel] owner email failed", e);
  }

  return NextResponse.json({ ok: true, refundedChf });
}
