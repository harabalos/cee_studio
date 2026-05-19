/**
 * Integration — Member booking flow + hour deduction.
 *
 * Covers TESTING_GUIDE Tests 12a-f (member booking) which were manual.
 *
 * Strategy: the `/api/me/booking` endpoint requires an authenticated
 * Supabase session, which is awkward to mint outside Playwright. So we
 * exercise the same deduction logic via the webhook path:
 *
 *   1. Seed user + active membership directly (admin DB)
 *   2. Insert a pending_hold with payload.member populated (this is the
 *      shape /api/me/booking creates for partial-coverage bookings)
 *   3. Fire checkout.session.completed webhook (signed)
 *   4. Verify booking row has user_id + membership_id + hours_deducted
 *   5. Verify memberships.hours_balance decremented correctly
 *
 * This is the SAME code path production runs through after Stripe
 * confirms payment — only the trigger source is faked.
 *
 * What this NOT covers (still manual):
 *   - "Full coverage, no extras" direct booking (Path 1 in /api/me/booking)
 *     — no Stripe involved, so no webhook to exercise. Better suited to
 *     a future E2E that signs in via magic-link + fires the POST.
 *   - 3-month minimum commitment on cancellation
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { stripe } from "@/lib/stripe/server";
import { admin, cleanupQA, qaEmail } from "./helpers/supabase";

const SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const BASE = process.env.QA_BASE_URL ?? "http://localhost:3001";
const HAS_SECRET = !!SECRET;

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

async function seedMemberAndHold(opts: {
  email: string;
  startingBalance: number;
  rolledOver?: number;
  duration: number;
  hoursToDeduct: number;
  totalChf: number;
  baseChf: number;
  addonsChf?: number;
  lateNightChf?: number;
  plan?: "starter" | "pro" | "unlimited";
  /** Offset in days from now — must differ across tests to avoid the
   *  `bookings_no_overlap` exclusion constraint at the DB level. */
  daysOffset?: number;
  startHourUtc?: number;
}) {
  // Seed user
  const { data: user } = await admin
    .from("users")
    .insert({
      email: opts.email,
      name: "QA Member Booker",
      phone: "+41 79 000 0030",
      role: "member",
      preferred_lang: "de",
    })
    .select()
    .single();

  // Seed membership
  const plan = opts.plan ?? "starter";
  const hoursPerMonth = plan === "pro" ? 9 : plan === "unlimited" ? 16 : 4;
  const { data: membership } = await admin
    .from("memberships")
    .insert({
      user_id: user!.id,
      plan,
      status: "active",
      stripe_subscription_id: `qa-test-mb-sub-${Date.now()}`,
      hours_per_month: hoursPerMonth,
      hours_balance: opts.startingBalance,
      hours_rolled_over: opts.rolledOver ?? 0,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  // Insert member-partial hold (the shape /api/me/booking creates)
  const sessionId = `cs_test_qa_member_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const start = new Date(Date.now() + (opts.daysOffset ?? 7) * 24 * 60 * 60 * 1000);
  start.setUTCHours(opts.startHourUtc ?? 13, 0, 0, 0);
  const end = new Date(start.getTime() + opts.duration * 60 * 60 * 1000);

  const { data: hold } = await admin
    .from("pending_holds")
    .insert({
      stripe_session_id: sessionId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      payload: {
        duration: opts.duration,
        addons: [],
        guest: {
          name: "QA Member Booker",
          email: opts.email,
          phone: "+41 79 000 0030",
        },
        lang: "de",
        breakdown: {
          baseChf: opts.baseChf,
          addonsChf: opts.addonsChf ?? 0,
          lateNightChf: opts.lateNightChf ?? 0,
          totalChf: opts.totalChf,
          lateNightHours: 0,
        },
        shoot_type: null,
        member: {
          membership_id: membership!.id,
          user_id: user!.id,
          hours_to_deduct: opts.hoursToDeduct,
        },
      },
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  return { user: user!, membership: membership!, hold: hold!, sessionId };
}

describe.skipIf(!HAS_SECRET)("Member booking — hours deduction via webhook", () => {
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
  });

  it("partial coverage (4h booking, 2h balance) → 2h deducted + booking has membership_id", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("mb-partial");
    const { user, membership, sessionId } = await seedMemberAndHold({
      email,
      startingBalance: 2,
      duration: 4,
      hoursToDeduct: 2, // only 2h from balance, 2h paid as overage
      baseChf: 10000, // 2h overage × CHF 50
      totalChf: 10000,
      daysOffset: 7,
      startHourUtc: 13,
    });

    const { body, sig } = buildEvent("checkout.session.completed", {
      id: sessionId,
      object: "checkout.session",
      payment_intent: `pi_test_qa_${Date.now()}`,
      payment_status: "paid",
      status: "complete",
      mode: "payment",
      amount_total: 10000,
      currency: "chf",
    });
    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);

    // Booking created with member context
    const { data: booking } = await admin
      .from("bookings")
      .select("user_id, membership_id, hours_deducted, total_chf, payment_method")
      .eq("stripe_session_id", sessionId)
      .single();
    expect(booking?.user_id).toBe(user.id);
    expect(booking?.membership_id).toBe(membership.id);
    expect(Number(booking?.hours_deducted)).toBe(2);
    expect(booking?.total_chf).toBe(10000);
    expect(booking?.payment_method).toBe("card");

    // Balance reduced from 2 to 0
    const { data: updatedMembership } = await admin
      .from("memberships")
      .select("hours_balance")
      .eq("id", membership.id)
      .single();
    expect(Number(updatedMembership?.hours_balance)).toBe(0);
  });

  it("full coverage with add-ons (2h booking, 4h balance, lighting addon) → 2h deducted + addon paid", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("mb-fullcov-addon");

    // Manual hold construction to include the add-on
    const { data: user } = await admin
      .from("users")
      .insert({
        email,
        name: "QA Full Cov Addon",
        phone: "+41 79 000 0031",
        role: "member",
        preferred_lang: "de",
      })
      .select()
      .single();
    const { data: membership } = await admin
      .from("memberships")
      .insert({
        user_id: user!.id,
        plan: "starter",
        status: "active",
        stripe_subscription_id: `qa-test-mb-addon-sub-${Date.now()}`,
        hours_per_month: 4,
        hours_balance: 4,
        hours_rolled_over: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    const sessionId = `cs_test_qa_addon_${Date.now().toString(36)}`;
    const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    start.setUTCHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    await admin.from("pending_holds").insert({
      stripe_session_id: sessionId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      payload: {
        duration: 2,
        addons: ["lighting"],
        guest: { name: "QA Full Cov Addon", email, phone: "+41 79 000 0031" },
        lang: "de",
        breakdown: {
          baseChf: 0, // covered by plan hours
          addonsChf: 2000, // CHF 20
          lateNightChf: 0,
          totalChf: 2000,
          lateNightHours: 0,
        },
        shoot_type: null,
        member: {
          membership_id: membership!.id,
          user_id: user!.id,
          hours_to_deduct: 2,
        },
      },
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });

    const { body, sig } = buildEvent("checkout.session.completed", {
      id: sessionId,
      object: "checkout.session",
      payment_intent: `pi_test_qa_addon_${Date.now()}`,
      payment_status: "paid",
      status: "complete",
      mode: "payment",
      amount_total: 2000,
      currency: "chf",
    });
    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);

    // Booking + add-on row both created
    const { data: booking } = await admin
      .from("bookings")
      .select("id, hours_deducted, total_chf")
      .eq("stripe_session_id", sessionId)
      .single();
    expect(Number(booking?.hours_deducted)).toBe(2);
    expect(booking?.total_chf).toBe(2000);

    const { data: addons } = await admin
      .from("booking_addons")
      .select("addon_key, price_chf")
      .eq("booking_id", booking!.id);
    expect(addons?.length).toBe(1);
    expect(addons?.[0].addon_key).toBe("lighting");
    expect(addons?.[0].price_chf).toBe(2000);

    // Balance reduced from 4 to 2
    const { data: updatedMembership } = await admin
      .from("memberships")
      .select("hours_balance")
      .eq("id", membership!.id)
      .single();
    expect(Number(updatedMembership?.hours_balance)).toBe(2);
  });

  it("rolled-over hours deducted first (FIFO)", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("mb-fifo");
    const { user, membership, sessionId } = await seedMemberAndHold({
      email,
      startingBalance: 6, // 4 fresh + 2 rolled over
      rolledOver: 2,
      duration: 3,
      hoursToDeduct: 3,
      baseChf: 0, // fully covered by hours
      totalChf: 0,
      daysOffset: 21, // different day to avoid overlap with prior tests
      startHourUtc: 11,
    });

    // We can't go through Stripe with totalChf=0 (Stripe rejects $0 sessions),
    // so simulate the post-completion state by firing the webhook directly.
    // Even with totalChf=0 the handler still creates the booking + deducts.
    const { body, sig } = buildEvent("checkout.session.completed", {
      id: sessionId,
      object: "checkout.session",
      payment_intent: `pi_test_qa_fifo_${Date.now()}`,
      payment_status: "paid",
      status: "complete",
      mode: "payment",
      amount_total: 0,
      currency: "chf",
    });
    const res = await postWebhook(body, sig);
    expect(res.status).toBe(200);

    // Hours_balance reduced from 6 to 3
    const { data: updatedMembership } = await admin
      .from("memberships")
      .select("hours_balance, hours_rolled_over")
      .eq("id", membership.id)
      .single();
    expect(Number(updatedMembership?.hours_balance)).toBe(3);
    // Rolled-over consumed first: was 2, after deducting 3, 2 from rolled + 1 from fresh
    expect(Number(updatedMembership?.hours_rolled_over)).toBe(0);
  });
});
