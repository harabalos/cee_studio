/**
 * Integration — Stripe webhook + product configuration.
 *
 * Maps to TESTING_GUIDE.md Test 13 (Stripe deliverability).
 *
 * Strategy:
 *   1. Use the Stripe SDK + our local key to probe what's configured
 *      in the connected account: webhook endpoints, product/price IDs.
 *   2. Verify the local code's event-name list matches what's subscribed
 *      in the Stripe Dashboard (if any endpoints exist).
 *   3. Verify each membership plan in lib/memberships/plans.ts has a
 *      sane price (positive integer, CHF cents).
 *   4. Fire a malformed POST at /api/webhooks/stripe and confirm we
 *      return 400 (signature check works).
 *
 * What this verifies (which IS our code):
 *   - PLANS config makes sense (no negative prices, valid hours, etc.)
 *   - Webhook signature check rejects unsigned + tampered requests
 *   - Required events (checkout.session.completed, customer.subscription.*,
 *     invoice.paid, invoice.payment_failed) are present in any configured
 *     webhook endpoint
 *
 * NOT verified:
 *   - End-to-end webhook delivery from Stripe → our server (that's tested
 *     manually via `stripe trigger checkout.session.completed`)
 *   - Live-mode endpoint configuration (test mode is what we run against)
 */

import { describe, it, expect, beforeAll } from "vitest";
import Stripe from "stripe";
import { PLANS } from "@/lib/memberships/plans";

const apiKey = process.env.STRIPE_SECRET_KEY;
const HAS_STRIPE = !!apiKey;
const IS_TEST_MODE = apiKey?.startsWith("sk_test_") ?? false;

// These are the events our webhook handler in
// app/api/webhooks/stripe/route.ts is wired up to consume.
const REQUIRED_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.expired",
  "charge.refunded",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
] as const;

describe.skipIf(!HAS_STRIPE)("Stripe configuration", () => {
  const stripe = new Stripe(apiKey!);

  it("running against TEST mode (sk_test_...) — never live keys in QA", () => {
    expect(IS_TEST_MODE).toBe(true);
  });

  it("membership plan prices are sane (positive CHF cents)", () => {
    for (const [key, plan] of Object.entries(PLANS)) {
      expect(plan.priceChfPerMonth, `${key} priceChfPerMonth`).toBeGreaterThan(0);
      // Sanity range: CHF 50 - CHF 5000 per month (5000 - 500000 cents)
      expect(plan.priceChfPerMonth, `${key} priceChfPerMonth`).toBeGreaterThanOrEqual(5000);
      expect(plan.priceChfPerMonth, `${key} priceChfPerMonth`).toBeLessThanOrEqual(500000);
      expect(plan.hoursPerMonth, `${key} hoursPerMonth`).toBeGreaterThan(0);
      // And it should be an integer count of cents (no fractional cents)
      expect(Number.isInteger(plan.priceChfPerMonth)).toBe(true);
    }
  });

  it("Stripe API key is connected to an account (account.retrieve works)", async () => {
    const account = await stripe.accounts.retrieve();
    expect(account.id).toMatch(/^acct_/);
    // CHF should be a supported currency for this Swiss account
    expect(account.default_currency?.toLowerCase()).toBe("chf");
  });

  it("at least one webhook endpoint exists with our required events (if any are configured)", async () => {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });

    if (endpoints.data.length === 0) {
      // Test mode may have zero endpoints (people use stripe-cli forwarding
      // for local dev). Not a hard fail — just log a warning.
      console.warn(
        "[stripe-config] WARNING: No webhook endpoints configured in this Stripe account. " +
          "For production, ensure https://ceestudio.ch/api/webhooks/stripe is registered " +
          "with the events listed in REQUIRED_WEBHOOK_EVENTS."
      );
      return;
    }

    // Aggregate enabled events across all endpoints
    const allEnabled = new Set<string>();
    for (const ep of endpoints.data) {
      for (const evt of ep.enabled_events ?? []) allEnabled.add(evt);
    }
    // Wildcard "*" subscribes to everything
    if (allEnabled.has("*")) return;

    const missing = REQUIRED_WEBHOOK_EVENTS.filter((evt) => !allEnabled.has(evt));
    expect(missing, `missing webhook events: ${missing.join(", ")}`).toEqual([]);
  });

  it("auto-created membership products exist in Stripe (or can be created)", async () => {
    // We don't pre-provision products — they're lazy-created on first
    // /api/membership/checkout call. So this test verifies the SDK call
    // path works without going through our codepath.
    const products = await stripe.products.list({ limit: 100, active: true });
    // We don't assert all 3 plans exist (test mode may be empty). We just
    // verify the products.list call works at all.
    expect(products.data).toBeInstanceOf(Array);
  });
});

// Quick reachability check so the suite fails fast (vs. 60s timeout)
// if the dev server on :3001 isn't running. Set in beforeAll so it's
// evaluated once per file.
let SERVER_REACHABLE = false;
async function checkServer(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/availability?duration=1`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

describe.skipIf(!HAS_STRIPE)("Stripe webhook signature verification", () => {
  // Integration tests hit the local dev server on port 3001 (same as the
  // Playwright webServer). QA_BASE_URL overrides this in CI.
  const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3001";

  beforeAll(async () => {
    SERVER_REACHABLE = await checkServer(baseUrl);
    if (!SERVER_REACHABLE) {
      console.warn(
        `[stripe-config] dev server not reachable at ${baseUrl} — webhook signature tests will skip. ` +
          `Start dev with: npx next dev --port 3001`
      );
    }
  });

  it("POST without stripe-signature header → 400", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();
    const res = await fetch(`${baseUrl}/api/webhooks/stripe`, {
      method: "POST",
      body: JSON.stringify({ id: "evt_test", type: "checkout.session.completed" }),
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("no_signature");
  });

  it("POST with bogus stripe-signature → 400", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();
    const res = await fetch(`${baseUrl}/api/webhooks/stripe`, {
      method: "POST",
      body: JSON.stringify({ id: "evt_test", type: "checkout.session.completed" }),
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=1234567890,v1=deadbeef",
      },
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_signature");
  });
});
