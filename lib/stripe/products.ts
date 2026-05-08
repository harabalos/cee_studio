/**
 * Stripe Products + Prices for memberships — created lazily on first use.
 *
 * Strategy: when /api/membership/checkout is called, look up the price ID for
 * the chosen plan in the `settings.stripe_membership_prices` JSONB field. If
 * missing, create the Product + Price in Stripe and persist the ID.
 *
 * This means no manual Stripe Dashboard setup needed — just deploy and the
 * first signup of each plan auto-provisions everything.
 */

import { stripe } from "./server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { PLANS, type PlanKey, type PlanDef } from "@/lib/memberships/plans";

const STRIPE_CURRENCY = "chf";

interface MembershipPriceMap {
  [key: string]: { productId: string; priceId: string };
}

async function getStoredPriceMap(): Promise<MembershipPriceMap> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("settings")
    .select("stripe_membership_prices")
    .eq("id", 1)
    .single();
  return (data?.stripe_membership_prices as MembershipPriceMap | null) ?? {};
}

async function persistPriceMap(map: MembershipPriceMap): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("settings").update({ stripe_membership_prices: map }).eq("id", 1);
}

async function createProductAndPrice(plan: PlanDef): Promise<{ productId: string; priceId: string }> {
  const product = await stripe.products.create({
    name: `CEE Studio — ${plan.nameEn}`,
    description: plan.taglineEn,
    metadata: { plan_key: plan.key, hours_per_month: String(plan.hoursPerMonth) },
  });

  const price = await stripe.prices.create({
    product: product.id,
    currency: STRIPE_CURRENCY,
    unit_amount: plan.priceChfPerMonth,
    recurring: { interval: "month" },
    nickname: `${plan.nameEn} monthly`,
    metadata: { plan_key: plan.key },
  });

  return { productId: product.id, priceId: price.id };
}

/**
 * Get (or create on first call) the Stripe price ID for a membership plan.
 */
export async function getPriceIdForPlan(planKey: PlanKey): Promise<string> {
  const plan = PLANS[planKey];
  if (!plan) throw new Error(`Unknown plan: ${planKey}`);

  const map = await getStoredPriceMap();
  const existing = map[planKey];
  if (existing?.priceId) {
    // Verify it still exists and is active in Stripe
    try {
      const price = await stripe.prices.retrieve(existing.priceId);
      if (price.active) return existing.priceId;
    } catch {
      /* fall through to recreate */
    }
  }

  // Create fresh
  const created = await createProductAndPrice(plan);
  map[planKey] = created;
  await persistPriceMap(map);
  return created.priceId;
}
