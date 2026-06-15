/**
 * Subscription lifecycle handlers — invoked from Stripe webhook.
 *
 * Events handled:
 *   - customer.subscription.created      → create membership row, allocate first hours
 *   - customer.subscription.updated      → status / plan changes
 *   - customer.subscription.deleted      → mark cancelled
 *   - invoice.paid                        → renewal: rollover unused hours, allocate new month
 *   - invoice.payment_failed              → mark past_due, email alert
 *
 * Hour rollover logic:
 *   On renewal:
 *     unused_this_cycle = hours_balance - hours_rolled_over   (current month leftover)
 *     rolled_over = min(unused_this_cycle, hours_per_month)   (cap at one month worth)
 *     hours_balance = hours_per_month + rolled_over
 *     rolled_over_expires_at = now + 1 month
 */

import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Stripe 2026-04-22 moved current_period_* onto subscription items, and invoice.subscription
// is now nullable + accessed via different shapes per source. Helpers below paper over both.
function subPeriod(sub: Stripe.Subscription): { start: string | null; end: string | null } {
  // Try top-level (older shapes), then fall back to first item
  const s = sub as unknown as { current_period_start?: number; current_period_end?: number };
  const item = sub.items?.data?.[0] as unknown as { current_period_start?: number; current_period_end?: number } | undefined;
  const start = s.current_period_start ?? item?.current_period_start ?? null;
  const end = s.current_period_end ?? item?.current_period_end ?? null;
  return {
    start: start ? new Date(start * 1000).toISOString() : null,
    end: end ? new Date(end * 1000).toISOString() : null,
  };
}

function invoiceSubscriptionId(inv: Stripe.Invoice): string | null {
  const i = inv as unknown as {
    subscription?: string | { id: string } | null;
    parent?: { subscription_details?: { subscription?: string | { id: string } } };
  };
  const top = i.subscription;
  if (typeof top === "string") return top;
  if (top && typeof top === "object" && "id" in top) return top.id;
  const nested = i.parent?.subscription_details?.subscription;
  if (typeof nested === "string") return nested;
  if (nested && typeof nested === "object" && "id" in nested) return nested.id;
  return null;
}
import { PLANS, type PlanKey } from "@/lib/memberships/plans";
import { sendEmail } from "@/lib/email/send";
import MembershipWelcome from "@/emails/MembershipWelcome";
import MembershipRenewal from "@/emails/MembershipRenewal";
import MembershipPaymentFailed from "@/emails/MembershipPaymentFailed";

type SB = ReturnType<typeof getSupabaseAdmin>;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ceestudio.ch";

/* ============================================================
   subscription.created
   ============================================================ */
export async function onSubscriptionCreated(supabase: SB, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return;
  const email = "email" in customer ? customer.email : null;
  if (!email) {
    console.warn("[memberships] no email on customer", customerId);
    return;
  }
  const emailLower = email.toLowerCase();

  const meta = subscription.metadata ?? {};
  const planKey = (meta.plan_key as PlanKey) || inferPlanFromSubscription(subscription);
  if (!planKey) {
    console.warn("[memberships] could not infer plan for", subscription.id);
    return;
  }
  const plan = PLANS[planKey];
  if (!plan) return;

  // Find or create user
  let userRow: { id: string; role: string | null } | null = null;
  const found = await supabase.from("users").select("id, role").eq("email", emailLower).maybeSingle();
  if (found.data) {
    userRow = found.data as { id: string; role: string | null };
  } else {
    const created = await supabase
      .from("users")
      .insert({
        email: emailLower,
        name: meta.guest_name ?? "",
        phone: meta.guest_phone ?? null,
        company: meta.guest_company || null,
        role: "member",
        stripe_customer_id: customerId,
        preferred_lang: "de",
      })
      .select("id, role")
      .single();
    userRow = (created.data as { id: string; role: string | null } | null) ?? null;
  }
  if (!userRow) {
    console.error("[memberships] user create failed");
    return;
  }

  // Promote to member if visitor
  if (userRow.role === "visitor") {
    await supabase
      .from("users")
      .update({ role: "member", stripe_customer_id: customerId })
      .eq("id", userRow.id);
  } else if (!userRow.role) {
    await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", userRow.id);
  }

  // Insert membership row
  const period = subPeriod(subscription);
  const periodStart = period.start ?? new Date().toISOString();
  const periodEnd = period.end;

  // Idempotent insert via primary unique constraint on stripe_subscription_id.
  // If already exists, ignore (subscription.created may fire twice in some flows).
  const existing = await supabase
    .from("memberships")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();
  if (!existing.data) {
    await supabase.from("memberships").insert({
      user_id: userRow.id,
      plan: planKey,
      status: stripeStatusToOurs(subscription.status),
      stripe_subscription_id: subscription.id,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      hours_per_month: plan.hoursPerMonth,
      hours_balance: plan.hoursPerMonth,
      hours_rolled_over: 0,
      minimum_until: meta.minimum_until ?? null,
    });
  }

  // Send welcome email + magic link to set up account
  try {
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: emailLower,
      options: { redirectTo: `${SITE_URL}/auth/callback?next=/account` },
    });
    await sendEmail({
      to: emailLower,
      subject: subjectWelcome(planKey),
      react: MembershipWelcome({
        planName: plan.nameEn,
        hoursPerMonth: plan.hoursPerMonth,
        priceStr: `CHF ${plan.priceChfPerMonth / 100}`,
        magicLink: linkData?.properties?.action_link ?? `${SITE_URL}/login`,
        accountUrl: `${SITE_URL}/account`,
      }),
      template: "membership_welcome",
      lang: "de",
      metadata: { membership_subscription: subscription.id },
    });
  } catch (e) {
    console.error("[memberships] welcome email failed", e);
  }
}

/* ============================================================
   subscription.updated
   ============================================================ */
export async function onSubscriptionUpdated(supabase: SB, subscription: Stripe.Subscription) {
  const meta = subscription.metadata ?? {};
  const planKey = (meta.plan_key as PlanKey) || inferPlanFromSubscription(subscription);
  const period = subPeriod(subscription);
  const updates: Record<string, unknown> = {
    status: stripeStatusToOurs(subscription.status),
    current_period_start: period.start,
    current_period_end: period.end,
  };
  if (planKey && PLANS[planKey]) {
    updates.plan = planKey;
    updates.hours_per_month = PLANS[planKey].hoursPerMonth;
  }
  if (subscription.canceled_at) {
    updates.cancelled_at = new Date(subscription.canceled_at * 1000).toISOString();
  }
  await supabase
    .from("memberships")
    .update(updates)
    .eq("stripe_subscription_id", subscription.id);
}

/* ============================================================
   subscription.deleted
   ============================================================ */
export async function onSubscriptionDeleted(supabase: SB, subscription: Stripe.Subscription) {
  await supabase
    .from("memberships")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      hours_balance: 0,
      hours_rolled_over: 0,
    })
    .eq("stripe_subscription_id", subscription.id);
}

/* ============================================================
   invoice.paid — renewal handler
   ============================================================ */
export async function onInvoicePaid(supabase: SB, invoice: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(invoice);
  if (!subId) return;

  const { data: m } = await supabase
    .from("memberships")
    .select("*")
    .eq("stripe_subscription_id", subId)
    .single();
  if (!m) {
    // First payment of new subscription → handled by subscription.created
    return;
  }

  // Don't double-allocate on the first invoice (which fires alongside subscription.created)
  if (invoice.billing_reason === "subscription_create") return;

  // Compute rollover
  const planHours = Number(m.hours_per_month);
  const balanceBefore = Number(m.hours_balance);
  const rolledOverPrev = Number(m.hours_rolled_over);
  const unusedThisCycle = Math.max(0, balanceBefore - rolledOverPrev);
  const rolledOver = Math.min(unusedThisCycle, planHours);
  const newBalance = planHours + rolledOver;
  const rolledOverExpiresAt = new Date();
  rolledOverExpiresAt.setMonth(rolledOverExpiresAt.getMonth() + 1);

  await supabase
    .from("memberships")
    .update({
      status: "active",
      hours_balance: newBalance,
      hours_rolled_over: rolledOver,
      rolled_over_expires_at: rolledOverExpiresAt.toISOString(),
      current_period_start: invoice.period_start
        ? new Date(invoice.period_start * 1000).toISOString()
        : null,
      current_period_end: invoice.period_end
        ? new Date(invoice.period_end * 1000).toISOString()
        : null,
    })
    .eq("id", m.id);

  // Email the member
  const { data: user } = await supabase.from("users").select("email, name").eq("id", m.user_id).single();
  if (user?.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: `Subscription renewed — CEE Studio`,
        react: MembershipRenewal({
          name: user.name ?? "",
          planName: PLANS[m.plan as PlanKey]?.nameEn ?? m.plan,
          hoursAllocated: planHours,
          hoursRolledOver: rolledOver,
          newBalance,
          accountUrl: `${SITE_URL}/account`,
        }),
        template: "membership_renewal",
        lang: "de",
        metadata: { invoice_id: invoice.id, membership_id: m.id },
      });
    } catch (e) {
      console.error("[memberships] renewal email failed", e);
    }
  }
}

/* ============================================================
   invoice.payment_failed
   ============================================================ */
export async function onInvoicePaymentFailed(supabase: SB, invoice: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(invoice);
  if (!subId) return;

  await supabase
    .from("memberships")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subId);

  const { data: m } = await supabase
    .from("memberships")
    .select("user_id")
    .eq("stripe_subscription_id", subId)
    .single();
  if (!m) return;
  const { data: user } = await supabase.from("users").select("email, name").eq("id", m.user_id).single();
  if (!user?.email) return;

  try {
    await sendEmail({
      to: user.email,
      subject: `Payment failed — CEE Studio`,
      react: MembershipPaymentFailed({
        name: user.name ?? "",
        accountUrl: `${SITE_URL}/account`,
      }),
      template: "membership_payment_failed",
      lang: "de",
      metadata: { invoice_id: invoice.id },
    });
  } catch (e) {
    console.error("[memberships] payment_failed email error", e);
  }
}

/* ============================================================ */

function stripeStatusToOurs(s: Stripe.Subscription.Status): "active" | "past_due" | "paused" | "cancelled" {
  switch (s) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "past_due";
    case "paused":
      return "paused";
    case "canceled":
      return "cancelled";
    default:
      return "past_due";
  }
}

function inferPlanFromSubscription(sub: Stripe.Subscription): PlanKey | null {
  // Fallback: read product metadata
  const item = sub.items.data[0];
  const productId = typeof item?.price.product === "string" ? item.price.product : item?.price.product?.id;
  if (!productId) return null;
  // Could fetch product, but cheaper: trust metadata. If missing, return null.
  return null;
}

function subjectWelcome(planKey: PlanKey): string {
  return `Welcome to CEE Studio ${PLANS[planKey].nameEn}`;
}
