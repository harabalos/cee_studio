import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: booking } = await supabase.from("bookings").select("*").eq("id", params.id).single();
  if (!booking) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!booking.stripe_payment_intent_id) return NextResponse.json({ error: "no_payment_intent" }, { status: 400 });

  try {
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      reason: "requested_by_customer",
    });
    await supabase
      .from("bookings")
      .update({
        payment_status: "refunded",
        refund_chf: refund.amount,
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: "admin",
      })
      .eq("id", params.id);
    return NextResponse.json({ ok: true, refund: refund.amount });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "refund_failed" }, { status: 500 });
  }
}
