/**
 * POST /api/membership/portal
 *
 * Creates a Stripe Customer Portal session for the logged-in user.
 * Customer Portal lets them update payment, view invoices, change plan,
 * cancel subscription (with our 3-month minimum enforced via metadata).
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST() {
  const supabase = getSupabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = getSupabaseAdmin();
  const { data: user } = await admin
    .from("users")
    .select("stripe_customer_id")
    .eq("email", auth.user.email.toLowerCase())
    .maybeSingle();

  if (!user?.stripe_customer_id) {
    return NextResponse.json({ error: "no_customer" }, { status: 404 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/account`,
  });

  return NextResponse.json({ url: portal.url });
}
