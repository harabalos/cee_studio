/**
 * GET /api/membership/by-session?session_id=cs_...
 *
 * Polled by /membership/success while the webhook finalizes the subscription.
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "missing_session" }, { status: 400 });

  // Look up subscription via Stripe → then membership in DB
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (!subId) return NextResponse.json({ membership: null }, { status: 202 });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("memberships")
    .select("id, plan, status")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();

  if (!data) return NextResponse.json({ membership: null }, { status: 202 });
  return NextResponse.json({ membership: data });
}
