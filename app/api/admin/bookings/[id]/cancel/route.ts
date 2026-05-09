/**
 * POST /api/admin/bookings/[id]/cancel
 *
 * Admin-initiated cancellation. Bypasses the customer cancellation rules
 * (weekend, <48h) since admin discretion overrides them.
 *
 * Behavior depends on payment method:
 *   - Stripe-paid (card / twint): processes a Stripe refund for the full amount
 *   - admin_cash / admin_prepaid / invoice / membership_hours: just marks cancelled
 *     (no refund flow — admin handles cash/invoice settlement themselves)
 *
 * For member bookings, refunds the deducted hours back to the membership balance.
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Idempotent
  if (booking.status === "cancelled") {
    return NextResponse.json({ ok: true, alreadyCancelled: true, refundChf: booking.refund_chf });
  }

  let refundedChf = 0;
  let stripeRefundError: string | null = null;

  // Process Stripe refund if applicable
  if (booking.stripe_payment_intent_id && booking.payment_status === "paid") {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        reason: "requested_by_customer",
      });
      refundedChf = refund.amount;
    } catch (e) {
      stripeRefundError = e instanceof Error ? e.message : "refund_failed";
      // Continue — we still want to mark cancelled even if Stripe refund failed
      // (admin can manually handle in Stripe dashboard)
    }
  }

  // Update booking to cancelled
  const updates: Record<string, unknown> = {
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
    cancelled_by: "admin",
  };
  if (refundedChf > 0) {
    updates.payment_status = "refunded";
    updates.refund_chf = refundedChf;
  }

  await supabase.from("bookings").update(updates).eq("id", params.id);

  // Refund member hours if it was a member booking
  if (booking.membership_id && booking.hours_deducted && booking.hours_deducted > 0) {
    const { data: m } = await supabase
      .from("memberships")
      .select("hours_balance")
      .eq("id", booking.membership_id)
      .single();
    if (m) {
      await supabase
        .from("memberships")
        .update({ hours_balance: Number(m.hours_balance) + Number(booking.hours_deducted) })
        .eq("id", booking.membership_id);
    }
  }

  return NextResponse.json({
    ok: true,
    refundChf: refundedChf,
    stripeRefundError, // populated if Stripe call failed (admin should reconcile manually)
  });
}
