/**
 * Stripe SDK wrapper (server-only).
 * Switzerland account, CHF currency, TWINT enabled in dashboard.
 */
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[stripe] STRIPE_SECRET_KEY not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_dummy", {
  // Pin API version so behavior doesn't shift under us when Stripe upgrades.
  apiVersion: "2026-04-22.dahlia",
  appInfo: {
    name: "CEE Studio Booking",
    version: "1.0.0",
    url: "https://ceestudio.ch",
  },
});

export const STRIPE_CURRENCY = "chf";

/** Verify webhook signature. Throws on failure. */
export function constructWebhookEvent(rawBody: string | Buffer, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not set");
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
