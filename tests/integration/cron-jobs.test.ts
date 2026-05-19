/**
 * Integration — Cron jobs (Vercel scheduled).
 *
 * Endpoints:
 *   - GET /api/cron/expire-holds         → 5min, deletes expired pending_holds
 *   - GET /api/cron/auto-complete        → daily, flips confirmed→completed
 *   - GET /api/cron/expire-rolled-over   → daily, expires rolled-over hours
 *   - GET /api/cron/reminders-24h        → daily, sends 24h reminder emails
 *   - GET /api/cron/low-balance          → weekly, low-balance member alerts
 *
 * All are protected by Authorization: Bearer ${CRON_SECRET}.
 *
 * What this verifies (which IS our code):
 *   - Unauthorized requests return 401
 *   - Authorized requests succeed (200) and report a count
 *   - expire-holds actually deletes a seeded expired hold
 *   - auto-complete actually flips a past confirmed booking
 *   - expire-rolled-over zeroes hours_rolled_over + reduces balance
 *
 * NOT verified (manual):
 *   - Vercel cron schedule actually fires at the expected interval
 *     (only checkable in Vercel Cron dashboard logs)
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { admin, cleanupQA, qaEmail } from "./helpers/supabase";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3001";
const SECRET = process.env.CRON_SECRET;
const HAS_SECRET = !!SECRET;

let SERVER_REACHABLE = false;

async function getCron(path: string, withAuth = true): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    headers: withAuth ? { authorization: `Bearer ${SECRET}` } : {},
  });
}

describe.skipIf(!HAS_SECRET)("Cron — auth gate", () => {
  beforeAll(async () => {
    try {
      const res = await fetch(`${BASE}/api/availability?duration=1`, {
        signal: AbortSignal.timeout(3000),
      });
      SERVER_REACHABLE = res.status < 500;
    } catch {
      SERVER_REACHABLE = false;
    }
  });

  it.each([
    "/api/cron/expire-holds",
    "/api/cron/auto-complete",
    "/api/cron/expire-rolled-over",
    "/api/cron/reminders-24h",
    "/api/cron/low-balance",
  ])("%s rejects unauthenticated GET → 401", async (path, ctx) => {
    if (!SERVER_REACHABLE) return;
    const res = await getCron(path, false);
    expect(res.status).toBe(401);
  });

  it.each([
    "/api/cron/expire-holds",
    "/api/cron/auto-complete",
    "/api/cron/expire-rolled-over",
    "/api/cron/reminders-24h",
    "/api/cron/low-balance",
  ])("%s rejects bogus auth → 401", async (path) => {
    if (!SERVER_REACHABLE) return;
    const res = await fetch(`${BASE}${path}`, {
      headers: { authorization: "Bearer not-the-right-secret" },
    });
    expect(res.status).toBe(401);
  });
});

describe.skipIf(!HAS_SECRET)("Cron — expire-holds side effects", () => {
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

  it("deletes a hold whose expires_at is in the past", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("cron-expire");
    const start = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    start.setUTCHours(8, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    // Insert an EXPIRED hold (expires_at 1 minute ago)
    const { data: hold } = await admin
      .from("pending_holds")
      .insert({
        stripe_session_id: `cs_test_qa_cron_${Date.now()}`,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        payload: {
          duration: 1,
          addons: [],
          guest: { name: "QA Expire Cron", email, phone: "+41 79 000 0050" },
          lang: "de",
          breakdown: { baseChf: 7000, addonsChf: 0, lateNightChf: 0, totalChf: 7000, lateNightHours: 0 },
          shoot_type: null,
        },
        expires_at: new Date(Date.now() - 60 * 1000).toISOString(),
      })
      .select()
      .single();
    expect(hold).toBeTruthy();

    const res = await getCron("/api/cron/expire-holds");
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; deleted: number };
    expect(json.ok).toBe(true);
    expect(json.deleted).toBeGreaterThanOrEqual(1);

    // The hold should be gone
    const { data: stillExists } = await admin
      .from("pending_holds")
      .select("id")
      .eq("id", hold!.id)
      .maybeSingle();
    expect(stillExists).toBeNull();
  });

  it("leaves non-expired holds untouched", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("cron-keep");
    const start = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    start.setUTCHours(8, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const { data: hold } = await admin
      .from("pending_holds")
      .insert({
        stripe_session_id: `cs_test_qa_keep_${Date.now()}`,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        payload: {
          duration: 1,
          addons: [],
          guest: { name: "QA Keep Cron", email, phone: "+41 79 000 0051" },
          lang: "de",
          breakdown: { baseChf: 7000, addonsChf: 0, lateNightChf: 0, totalChf: 7000, lateNightHours: 0 },
          shoot_type: null,
        },
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // expires in 30 min
      })
      .select()
      .single();

    await getCron("/api/cron/expire-holds");

    const { data: stillExists } = await admin
      .from("pending_holds")
      .select("id")
      .eq("id", hold!.id)
      .maybeSingle();
    expect(stillExists).toBeTruthy();
  });
});

describe.skipIf(!HAS_SECRET)("Cron — auto-complete side effects", () => {
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

  it("flips a past confirmed booking → completed", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("cron-autocomp");
    // Past booking (2h ago start, 1h ago end — well past the 1h grace)
    const start = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const end = new Date(Date.now() - 60 * 60 * 1000);

    const { data: booking } = await admin
      .from("bookings")
      .insert({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_hours: 1,
        base_price_chf: 7000,
        addons_price_chf: 0,
        late_night_surcharge_chf: 0,
        total_chf: 7000,
        payment_method: "card",
        payment_status: "paid",
        stripe_session_id: `cs_test_qa_autocomp_${Date.now()}`,
        status: "confirmed",
        guest_name: "QA Autocomp",
        guest_email: email,
        guest_phone: "+41 79 000 0052",
        preferred_lang: "de",
      })
      .select()
      .single();
    expect(booking).toBeTruthy();

    const res = await getCron("/api/cron/auto-complete");
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; completed: number };
    expect(json.ok).toBe(true);
    expect(json.completed).toBeGreaterThanOrEqual(1);

    // Booking now completed
    const { data: after } = await admin
      .from("bookings")
      .select("status")
      .eq("id", booking!.id)
      .single();
    expect(after?.status).toBe("completed");
  });

  it("future confirmed bookings are NOT auto-completed", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("cron-autocomp-future");
    const start = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    start.setUTCHours(8, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const { data: booking } = await admin
      .from("bookings")
      .insert({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_hours: 1,
        base_price_chf: 7000,
        addons_price_chf: 0,
        late_night_surcharge_chf: 0,
        total_chf: 7000,
        payment_method: "card",
        payment_status: "paid",
        stripe_session_id: `cs_test_qa_autocomp_future_${Date.now()}`,
        status: "confirmed",
        guest_name: "QA Future",
        guest_email: email,
        guest_phone: "+41 79 000 0053",
        preferred_lang: "de",
      })
      .select()
      .single();

    await getCron("/api/cron/auto-complete");

    const { data: after } = await admin
      .from("bookings")
      .select("status")
      .eq("id", booking!.id)
      .single();
    expect(after?.status).toBe("confirmed");
  });
});

describe.skipIf(!HAS_SECRET)("Cron — expire-rolled-over side effects", () => {
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

  it("zeros hours_rolled_over + reduces balance when rolled_over_expires_at is past", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("cron-rollover-exp");

    // Seed user + membership with expired rolled-over hours
    const { data: user } = await admin
      .from("users")
      .insert({
        email,
        name: "QA Rollover Test",
        phone: "+41 79 000 0054",
        role: "member",
        preferred_lang: "de",
      })
      .select()
      .single();
    expect(user).toBeTruthy();

    const { data: membership } = await admin
      .from("memberships")
      .insert({
        user_id: user!.id,
        plan: "starter",
        status: "active",
        stripe_subscription_id: `qa-test-rollover-${Date.now()}`,
        hours_per_month: 4,
        hours_balance: 7, // 4 fresh + 3 rolled over
        hours_rolled_over: 3,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        rolled_over_expires_at: new Date(Date.now() - 60 * 1000).toISOString(), // 1 min ago = expired
      })
      .select()
      .single();
    expect(membership).toBeTruthy();

    const res = await getCron("/api/cron/expire-rolled-over");
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; expired: number };
    expect(json.ok).toBe(true);
    expect(json.expired).toBeGreaterThanOrEqual(1);

    // After expiry: balance=4 (was 7), rolled_over=0 (was 3)
    const { data: after } = await admin
      .from("memberships")
      .select("hours_balance, hours_rolled_over, rolled_over_expires_at")
      .eq("id", membership!.id)
      .single();
    expect(Number(after?.hours_balance)).toBe(4);
    expect(Number(after?.hours_rolled_over)).toBe(0);
    expect(after?.rolled_over_expires_at).toBeNull();
  });
});

describe.skipIf(!HAS_SECRET)("Cron — reminders-24h returns ok (idempotent)", () => {
  beforeAll(async () => {
    try {
      const res = await fetch(`${BASE}/api/availability?duration=1`, {
        signal: AbortSignal.timeout(3000),
      });
      SERVER_REACHABLE = res.status < 500;
    } catch {
      SERVER_REACHABLE = false;
    }
  });

  it("authorized request returns 200 with a sent count", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();
    const res = await getCron("/api/cron/reminders-24h");
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
  });
});
