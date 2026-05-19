/**
 * Integration — Membership signup + lifecycle flows.
 *
 * Covers TESTING_GUIDE Tests 12a-f (membership flows) which were marked
 * manual in the pre-Stage-B QA report.
 *
 * Strategy:
 *   1. /api/membership/checkout returns a Stripe subscription URL (no
 *      payment method needed at this stage — Stripe collects in their UI)
 *   2. The actual subscription.created event is exercised by constructing
 *      a real Stripe Customer (test mode is free), building a fabricated
 *      Subscription event payload with that customer_id, and POSTing it
 *      through the signed-webhook path. This proves the handler:
 *        - Creates the users row with role=member
 *        - Creates the memberships row with correct plan + hours_per_month
 *        - Sets hours_balance = hours_per_month (first allocation)
 *        - Persists stripe_customer_id + stripe_subscription_id
 *
 * What we still don't auto-cover (manual before launch):
 *   - The Stripe Checkout UI for subscription mode (test card 4242 click)
 *   - invoice.paid renewal with real period boundaries (cron territory)
 *   - 3-month minimum commitment enforcement on cancellation (covered in
 *     a separate unit test once we extract the policy fn)
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { admin, cleanupQA, qaEmail, QA_PREFIX } from "./helpers/supabase";
import { postJSON } from "./helpers/api";

const SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const BASE = process.env.QA_BASE_URL ?? "http://localhost:3001";
const HAS_SECRET = !!SECRET;

// Track Stripe customers we create so we can clean them up
const createdCustomerIds: string[] = [];

let SERVER_REACHABLE = false;

function signEvent(payload: string): string {
  return stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET! });
}

function buildEvent(type: string, dataObject: unknown): { body: string; sig: string } {
  const event = {
    id: `evt_qa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    object: "event",
    api_version: "2026-04-22.dahlia",
    created: Math.floor(Date.now() / 1000),
    type,
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    data: { object: dataObject },
  };
  const body = JSON.stringify(event);
  return { body, sig: signEvent(body) };
}

async function postWebhook(body: string, sig: string) {
  return fetch(`${BASE}/api/webhooks/stripe`, {
    method: "POST",
    body,
    headers: { "content-type": "application/json", "stripe-signature": sig },
  });
}

// Build a believable Stripe Subscription object pointing at a real test
// customer. Sets the metadata our handler reads (`plan_key`, `guest_name`)
// and the period bounds via subscription.items[0] (2026-04-22 shape).
function fabricateSubscription(opts: {
  customerId: string;
  planKey: "starter" | "pro" | "unlimited";
  status?: Stripe.Subscription.Status;
  guestName?: string;
}): Stripe.Subscription {
  const now = Math.floor(Date.now() / 1000);
  const oneMonthLater = now + 30 * 24 * 60 * 60;
  return {
    id: `sub_test_qa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    object: "subscription",
    customer: opts.customerId,
    status: opts.status ?? "active",
    metadata: {
      plan_key: opts.planKey,
      guest_name: opts.guestName ?? "QA Member",
    },
    items: {
      object: "list",
      data: [
        {
          id: `si_test_qa_${Date.now()}`,
          object: "subscription_item",
          // 2026-04-22 moved period bounds onto items
          current_period_start: now,
          current_period_end: oneMonthLater,
        } as unknown as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: "",
    },
    cancel_at_period_end: false,
    created: now,
  } as unknown as Stripe.Subscription;
}

describe.skipIf(!HAS_SECRET)("Membership — /api/membership/checkout", () => {
  beforeAll(async () => {
    try {
      const res = await fetch(`${BASE}/api/availability?duration=1`, {
        signal: AbortSignal.timeout(3000),
      });
      SERVER_REACHABLE = res.status < 500;
    } catch {
      SERVER_REACHABLE = false;
    }
    await cleanupQA();
  });

  afterAll(async () => {
    await cleanupQA();
    // Tear down any test customers we created
    for (const id of createdCustomerIds) {
      try {
        await stripe.customers.del(id);
      } catch {
        /* may already be deleted */
      }
    }
  });

  it("POST /api/membership/checkout (starter) returns valid Stripe URL", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("memb-starter");
    const r = await postJSON<{ url: string }>("/api/membership/checkout", {
      plan: "starter",
      guest: { name: "QA Member Starter", email, phone: "+41 79 000 0020" },
      lang: "de",
    });
    expect(r.status).toBe(200);
    expect(r.body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
  });

  it("POST /api/membership/checkout (pro) returns valid Stripe URL", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("memb-pro");
    const r = await postJSON<{ url: string }>("/api/membership/checkout", {
      plan: "pro",
      guest: { name: "QA Member Pro", email, phone: "+41 79 000 0021" },
      lang: "de",
    });
    expect(r.status).toBe(200);
    expect(r.body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
  });

  it("POST /api/membership/checkout with invalid plan → 400", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("memb-invalid");
    const r = await postJSON("/api/membership/checkout", {
      plan: "ultimate", // not a real plan
      guest: { name: "QA", email, phone: "+41 79 000 0022" },
      lang: "de",
    });
    expect(r.status).toBe(400);
  });
});

describe.skipIf(!HAS_SECRET)("Membership — webhook customer.subscription.created (E2E)", () => {
  beforeAll(async () => {
    try {
      const res = await fetch(`${BASE}/api/availability?duration=1`, {
        signal: AbortSignal.timeout(3000),
      });
      SERVER_REACHABLE = res.status < 500;
    } catch {
      SERVER_REACHABLE = false;
    }
    await cleanupQA();
  });

  afterAll(async () => {
    await cleanupQA();
    for (const id of createdCustomerIds) {
      try {
        await stripe.customers.del(id);
      } catch {
        /* may already be deleted */
      }
    }
  });

  it("starter plan → creates users + memberships row with correct hours allocation", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    // 1. Create a REAL Stripe test customer (so stripe.customers.retrieve works
    //    when the handler reads it)
    const email = qaEmail("subwh-starter");
    const customer = await stripe.customers.create({
      email,
      name: "QA Subscription Tester",
      metadata: { qa_test: "true" },
    });
    createdCustomerIds.push(customer.id);

    // 2. Build a believable Stripe.Subscription pointing at that customer
    const subscription = fabricateSubscription({
      customerId: customer.id,
      planKey: "starter",
      guestName: "QA Subscription Tester",
    });

    // 3. Fire signed webhook event
    const { body, sig } = buildEvent("customer.subscription.created", subscription);
    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);

    // 4. Verify users row created
    const { data: user } = await admin
      .from("users")
      .select("id, role, stripe_customer_id, email")
      .eq("email", email.toLowerCase())
      .single();
    expect(user).toBeTruthy();
    expect(user?.role).toBe("member");
    expect(user?.stripe_customer_id).toBe(customer.id);

    // 5. Verify memberships row created with correct plan
    const { data: membership } = await admin
      .from("memberships")
      .select("plan, status, hours_per_month, hours_balance, stripe_subscription_id")
      .eq("user_id", user!.id)
      .single();
    expect(membership).toBeTruthy();
    expect(membership?.plan).toBe("starter");
    expect(membership?.status).toBe("active");
    // Starter = 4 hours/month
    expect(Number(membership?.hours_per_month)).toBe(4);
    expect(Number(membership?.hours_balance)).toBe(4);
    expect(membership?.stripe_subscription_id).toBe(subscription.id);
  });

  it("pro plan → 9 hours/month allocated", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("subwh-pro");
    const customer = await stripe.customers.create({
      email,
      name: "QA Pro Tester",
      metadata: { qa_test: "true" },
    });
    createdCustomerIds.push(customer.id);

    const subscription = fabricateSubscription({
      customerId: customer.id,
      planKey: "pro",
      guestName: "QA Pro Tester",
    });

    const { body, sig } = buildEvent("customer.subscription.created", subscription);
    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);

    const { data: user } = await admin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();
    const { data: membership } = await admin
      .from("memberships")
      .select("plan, hours_per_month")
      .eq("user_id", user!.id)
      .single();
    expect(membership?.plan).toBe("pro");
    expect(Number(membership?.hours_per_month)).toBe(9);
  });

  it("subscription.deleted → marks membership cancelled", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    // Seed a member + active membership directly
    const email = qaEmail("subwh-cancel");
    const customer = await stripe.customers.create({
      email,
      name: "QA Cancel Tester",
      metadata: { qa_test: "true" },
    });
    createdCustomerIds.push(customer.id);

    // Insert directly to fast-track
    const { data: user } = await admin
      .from("users")
      .insert({
        email: email.toLowerCase(),
        name: "QA Cancel Tester",
        phone: "+41 79 000 0023",
        role: "member",
        stripe_customer_id: customer.id,
        preferred_lang: "de",
      })
      .select("id")
      .single();

    const subId = `sub_test_qa_cancel_${Date.now()}`;
    await admin.from("memberships").insert({
      user_id: user!.id,
      plan: "starter",
      status: "active",
      stripe_subscription_id: subId,
      hours_per_month: 4,
      hours_balance: 4,
      hours_rolled_over: 0,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Fire the deleted event
    const subscription = fabricateSubscription({
      customerId: customer.id,
      planKey: "starter",
      status: "canceled",
    });
    // Override the auto-generated id with our seeded subId
    (subscription as { id: string }).id = subId;

    const { body, sig } = buildEvent("customer.subscription.deleted", subscription);
    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);

    const { data: m } = await admin
      .from("memberships")
      .select("status")
      .eq("stripe_subscription_id", subId)
      .single();
    expect(m?.status).toBe("cancelled");
  });
});
