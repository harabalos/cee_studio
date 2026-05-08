/**
 * POST /api/membership/checkout
 *
 * Creates a Stripe Subscription Checkout session for the chosen plan.
 *
 * Flow:
 *   1. Validate input
 *   2. Find or create Stripe Customer for this email (idempotent)
 *   3. Find or create Stripe Price for the plan (lazy, see lib/stripe/products.ts)
 *   4. Create Checkout Session with mode=subscription
 *   5. Return URL → browser redirects
 *
 * The `customer.subscription.created` webhook handles the rest:
 *   - Creates `users` row (if missing)
 *   - Creates `memberships` row with status=active, allocates hours
 *   - Sets minimum_until = now + 3 months
 *   - Sends welcome email + magic link
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { addMonths } from "date-fns";
import { stripe } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getPriceIdForPlan } from "@/lib/stripe/products";
import { PLANS, MINIMUM_MONTHS, type PlanKey } from "@/lib/memberships/plans";

const bodySchema = z.object({
  plan: z.enum(["starter", "pro", "unlimited"]),
  guest: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    company: z.string().optional(),
  }),
  lang: z.enum(["de", "en", "fr", "it"]).default("de"),
});

export async function POST(req: Request) {
  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "invalid_params", details: body.error.flatten() }, { status: 400 });
  }
  const { plan, guest, lang } = body.data;

  const planDef = PLANS[plan as PlanKey];
  const supabase = getSupabaseAdmin();

  // 1. Find or create Stripe Customer
  let stripeCustomerId: string;
  const existingUser = await supabase
    .from("users")
    .select("id, stripe_customer_id")
    .eq("email", guest.email.toLowerCase())
    .maybeSingle();

  if (existingUser.data?.stripe_customer_id) {
    stripeCustomerId = existingUser.data.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: guest.email.toLowerCase(),
      name: guest.name,
      phone: guest.phone,
      metadata: { source: "membership_signup" },
    });
    stripeCustomerId = customer.id;
    // Save back to DB if user exists
    if (existingUser.data?.id) {
      await supabase
        .from("users")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", existingUser.data.id);
    }
  }

  // 2. Get (or lazy-create) Stripe Price
  let priceId: string;
  try {
    priceId = await getPriceIdForPlan(plan as PlanKey);
  } catch (e) {
    console.error("[membership/checkout] price provisioning failed", e);
    return NextResponse.json({ error: "price_setup_failed" }, { status: 500 });
  }

  // 3. Create Checkout Session
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const minimumUntil = addMonths(new Date(), MINIMUM_MONTHS).toISOString();

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/membership/signup?plan=${plan}&cancelled=1`,
      locale: lang,
      subscription_data: {
        metadata: {
          plan_key: plan,
          hours_per_month: String(planDef.hoursPerMonth),
          minimum_until: minimumUntil,
          guest_name: guest.name,
          guest_phone: guest.phone,
          guest_company: guest.company ?? "",
        },
      },
    });
  } catch (e) {
    console.error("[membership/checkout] stripe error", e);
    return NextResponse.json({ error: "stripe_error" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
