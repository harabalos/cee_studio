/**
 * Integration — Stripe webhook handler end-to-end.
 *
 * Strategy: construct properly-signed Stripe events using
 * `stripe.webhooks.generateTestHeaderString()` and POST them to
 * /api/webhooks/stripe. Then verify the handler's side effects
 * (booking inserted, hold deleted, status updates, etc).
 *
 * This is the BEST coverage we can get without using the Stripe CLI —
 * the signature path is real, the handler path is real, only the
 * triggering event source is faked.
 *
 * What this verifies (which IS our code):
 *   - checkout.session.completed → booking row finalized, hold removed,
 *     guest_email persisted, total_chf correct, payment_status=paid
 *   - checkout.session.expired → hold row deleted
 *   - charge.refunded → booking marked refunded, refund_chf populated
 *
 * Subscription event coverage is in `membership-flow.test.ts` since
 * those require a real Stripe Customer + Subscription to retrieve.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { stripe } from "@/lib/stripe/server";
import { admin, cleanupQA, qaEmail, QA_PREFIX } from "./helpers/supabase";

const SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const BASE = process.env.QA_BASE_URL ?? "http://localhost:3001";
const HAS_SECRET = !!SECRET;

// Quick reachability check — fail fast if dev server is down
let SERVER_REACHABLE = false;

function signEvent(payload: string): string {
  return stripe.webhooks.generateTestHeaderString({
    payload,
    secret: SECRET!,
  });
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

describe.skipIf(!HAS_SECRET)("Stripe webhook — booking-side events (E2E)", () => {
  beforeAll(async () => {
    try {
      const res = await fetch(`${BASE}/api/availability?duration=1`, {
        signal: AbortSignal.timeout(3000),
      });
      SERVER_REACHABLE = res.status < 500;
    } catch {
      SERVER_REACHABLE = false;
    }
    if (!SERVER_REACHABLE) {
      console.warn(
        `[webhook-events] dev server not reachable at ${BASE} — webhook tests will skip. ` +
          `Start dev with: npx next dev --port 3001`
      );
    }
    await cleanupQA();
  });

  afterAll(async () => {
    await cleanupQA();
  });

  it("checkout.session.completed → finalizes booking + deletes hold", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    // 1. Insert pending hold
    const sessionId = `cs_test_qa_completed_${Date.now().toString(36)}`;
    const email = qaEmail("wh-completed");
    const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    start.setUTCHours(13, 0, 0, 0); // 13:00 UTC = 14:00/15:00 Zurich
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const { data: hold, error: holdErr } = await admin
      .from("pending_holds")
      .insert({
        stripe_session_id: sessionId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        payload: {
          duration: 1,
          addons: [],
          guest: { name: "QA Webhook Completed", email, phone: "+41 79 000 0010" },
          lang: "de",
          breakdown: {
            baseChf: 7000,
            addonsChf: 0,
            lateNightChf: 0,
            totalChf: 7000,
            lateNightHours: 0,
          },
          shoot_type: null,
        },
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .select()
      .single();
    expect(holdErr).toBeNull();
    expect(hold).toBeTruthy();

    // 2. Fire the webhook event. payment_intent is set to a non-existent
    //    id; the handler wraps that retrieval in try/catch and falls back
    //    to method "card" (covered by the try block in finalizeBooking).
    const { body, sig } = buildEvent("checkout.session.completed", {
      id: sessionId,
      object: "checkout.session",
      payment_intent: `pi_test_qa_${Date.now()}`,
      payment_status: "paid",
      status: "complete",
      mode: "payment",
      amount_total: 7000,
      currency: "chf",
    });

    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);

    // 3. Verify side effects
    const { data: booking } = await admin
      .from("bookings")
      .select("status, payment_status, total_chf, guest_email, duration_hours")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    expect(booking).toBeTruthy();
    expect(booking?.status).toBe("confirmed");
    expect(booking?.payment_status).toBe("paid");
    expect(booking?.total_chf).toBe(7000);
    expect(booking?.guest_email).toBe(email);
    expect(Number(booking?.duration_hours)).toBe(1);

    // Hold deleted
    const { data: stillExists } = await admin
      .from("pending_holds")
      .select("id")
      .eq("id", hold!.id)
      .maybeSingle();
    expect(stillExists).toBeNull();
  });

  it("checkout.session.expired → deletes the hold", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const sessionId = `cs_test_qa_expired_${Date.now().toString(36)}`;
    const email = qaEmail("wh-expired");
    const start = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
    start.setUTCHours(14, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const { data: hold } = await admin
      .from("pending_holds")
      .insert({
        stripe_session_id: sessionId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        payload: {
          duration: 1,
          addons: [],
          guest: { name: "QA Expired", email, phone: "+41 79 000 0011" },
          lang: "de",
          breakdown: { baseChf: 7000, addonsChf: 0, lateNightChf: 0, totalChf: 7000, lateNightHours: 0 },
          shoot_type: null,
        },
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .select()
      .single();
    expect(hold).toBeTruthy();

    const { body, sig } = buildEvent("checkout.session.expired", {
      id: sessionId,
      object: "checkout.session",
    });
    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);

    // Hold should be gone
    const { data: stillExists } = await admin
      .from("pending_holds")
      .select("id")
      .eq("id", hold!.id)
      .maybeSingle();
    expect(stillExists).toBeNull();

    // No booking should have been created
    const { data: booking } = await admin
      .from("bookings")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    expect(booking).toBeNull();
  });

  it("charge.refunded → marks booking refunded with refund_chf", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    // Seed a booking via direct insert
    const piId = `pi_test_qa_refund_${Date.now().toString(36)}`;
    const email = qaEmail("wh-refund");
    const start = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);
    start.setUTCHours(15, 0, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const { data: booking } = await admin
      .from("bookings")
      .insert({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_hours: 2,
        base_price_chf: 14000,
        addons_price_chf: 0,
        late_night_surcharge_chf: 0,
        total_chf: 14000,
        payment_method: "card",
        payment_status: "paid",
        stripe_session_id: `cs_test_qa_refund_${Date.now().toString(36)}`,
        stripe_payment_intent_id: piId,
        status: "confirmed",
        guest_name: "QA Refund",
        guest_email: email,
        guest_phone: "+41 79 000 0012",
        preferred_lang: "de",
      })
      .select()
      .single();
    expect(booking).toBeTruthy();

    // Fire charge.refunded for full amount
    const { body, sig } = buildEvent("charge.refunded", {
      id: `ch_test_qa_${Date.now()}`,
      object: "charge",
      payment_intent: piId,
      amount: 14000,
      amount_refunded: 14000,
    });
    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);

    const { data: updated } = await admin
      .from("bookings")
      .select("payment_status, refund_chf")
      .eq("id", booking!.id)
      .single();
    expect(updated?.payment_status).toBe("refunded");
    expect(updated?.refund_chf).toBe(14000);
  });

  it("charge.refunded with partial amount → marks partially_refunded", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const piId = `pi_test_qa_partial_${Date.now().toString(36)}`;
    const email = qaEmail("wh-partial");
    const start = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000);
    start.setUTCHours(13, 0, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const { data: booking } = await admin
      .from("bookings")
      .insert({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_hours: 2,
        base_price_chf: 14000,
        addons_price_chf: 0,
        late_night_surcharge_chf: 0,
        total_chf: 14000,
        payment_method: "card",
        payment_status: "paid",
        stripe_session_id: `cs_test_qa_partial_${Date.now().toString(36)}`,
        stripe_payment_intent_id: piId,
        status: "confirmed",
        guest_name: "QA Partial Refund",
        guest_email: email,
        guest_phone: "+41 79 000 0013",
        preferred_lang: "de",
      })
      .select()
      .single();
    expect(booking).toBeTruthy();

    // 50% refund — 7000/14000 cents
    const { body, sig } = buildEvent("charge.refunded", {
      id: `ch_test_qa_partial_${Date.now()}`,
      object: "charge",
      payment_intent: piId,
      amount: 14000,
      amount_refunded: 7000,
    });
    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);

    const { data: updated } = await admin
      .from("bookings")
      .select("payment_status, refund_chf")
      .eq("id", booking!.id)
      .single();
    expect(updated?.payment_status).toBe("partially_refunded");
    expect(updated?.refund_chf).toBe(7000);
  });

  it("unknown event types are accepted (no-op) — Stripe sends many", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const { body, sig } = buildEvent("customer.created", {
      id: `cus_test_qa_${Date.now()}`,
      object: "customer",
    });
    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);
  });
});
