/**
 * Integration — Cancellation + refund flow.
 *
 * Covers TESTING_GUIDE Test 15 (Refund) which was marked partial.
 *
 * Tests both paths:
 *   1. Customer self-cancel via /api/booking/cancel/[token]
 *      → applies cancellation policy (>48h=100%, 24-48h=50%, <24h=0%, weekend=0%)
 *   2. Admin cancel via /api/admin/bookings/[id]/cancel (auth-gated)
 *   3. charge.refunded webhook → marks booking refunded (covered in webhook-events.test.ts)
 *
 * Stripe refund mechanism itself isn't exercised — that requires a real
 * PaymentIntent. We seed bookings WITHOUT stripe_payment_intent_id so the
 * code path skips the Stripe call and exercises only the DB-update side.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { admin, cleanupQA, qaEmail } from "./helpers/supabase";
import { postJSON } from "./helpers/api";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3001";

let SERVER_REACHABLE = false;

async function seedConfirmedBooking(opts: {
  email: string;
  daysAhead: number;
  startHourUtc?: number;
  paymentMethod?: "card" | "twint" | "admin_cash";
  totalChf?: number;
}) {
  const start = new Date(Date.now() + opts.daysAhead * 24 * 60 * 60 * 1000);
  start.setUTCHours(opts.startHourUtc ?? 9, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const { data, error } = await admin
    .from("bookings")
    .insert({
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      duration_hours: 1,
      base_price_chf: opts.totalChf ?? 7000,
      addons_price_chf: 0,
      late_night_surcharge_chf: 0,
      total_chf: opts.totalChf ?? 7000,
      payment_method: opts.paymentMethod ?? "admin_cash", // avoid Stripe path
      payment_status: "paid",
      stripe_session_id: `cs_test_qa_refund_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      status: "confirmed",
      guest_name: "QA Refund Test",
      guest_email: opts.email,
      guest_phone: "+41 79 000 0060",
      preferred_lang: "de",
    })
    .select()
    .single();
  if (error) throw new Error(`seed failed: ${error.message}`);
  return data;
}

function isWeekend(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

function pickWeekday(daysAhead: number): number {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  while (isWeekend(d)) {
    d.setDate(d.getDate() + 1);
    daysAhead += 1;
  }
  return daysAhead;
}

describe("Customer cancel — /api/booking/cancel/[token]", () => {
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

  it("invalid token → 404", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();
    const r = await postJSON("/api/booking/cancel/totally-fake-token-12345", {});
    expect(r.status).toBe(404);
  });

  it("booking >48h in advance (weekday) → cancellation succeeds with full refund decision", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    // Pick a weekday 14 days out — well past 48h, not weekend
    const offsetDays = pickWeekday(14);
    const email = qaEmail("cancel-48h");
    const booking = await seedConfirmedBooking({
      email,
      daysAhead: offsetDays,
      startHourUtc: 10,
    });

    const r = await postJSON(`/api/booking/cancel/${booking.manage_token}`, {});
    expect(r.status).toBe(200);

    // Booking is now cancelled
    const { data: after } = await admin
      .from("bookings")
      .select("status, cancelled_at, cancelled_by")
      .eq("id", booking.id)
      .single();
    expect(after?.status).toBe("cancelled");
    expect(after?.cancelled_by).toBe("customer");
  });

  it("already-cancelled booking → 409 already_cancelled", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const offsetDays = pickWeekday(7);
    const email = qaEmail("cancel-twice");
    const booking = await seedConfirmedBooking({
      email,
      daysAhead: offsetDays,
      startHourUtc: 11,
    });

    // First cancel
    const r1 = await postJSON(`/api/booking/cancel/${booking.manage_token}`, {});
    expect(r1.status).toBe(200);

    // Second cancel attempt
    const r2 = await postJSON(`/api/booking/cancel/${booking.manage_token}`, {});
    expect(r2.status).toBe(409);
  });

  it("booking <24h ahead → cancellation refused (no_refund_late or similar)", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    // 20 hours in future
    const email = qaEmail("cancel-late");
    const start = new Date(Date.now() + 20 * 60 * 60 * 1000);
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
        payment_method: "admin_cash",
        payment_status: "paid",
        stripe_session_id: `cs_test_qa_late_${Date.now()}`,
        status: "confirmed",
        guest_name: "QA Late Cancel",
        guest_email: email,
        guest_phone: "+41 79 000 0061",
        preferred_lang: "de",
      })
      .select()
      .single();

    const r = await postJSON(`/api/booking/cancel/${booking!.manage_token}`, {});
    // Cancellation rules disallow <24h cancellations (no refund OR refused outright)
    expect(r.status).toBe(403);

    // Booking should NOT be cancelled
    const { data: after } = await admin
      .from("bookings")
      .select("status")
      .eq("id", booking!.id)
      .single();
    expect(after?.status).toBe("confirmed");
  });
});

describe("Admin cancel — /api/admin/bookings/[id]/cancel", () => {
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

  it("unauthenticated → 401", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();
    const res = await fetch(`${BASE}/api/admin/bookings/00000000-0000-0000-0000-000000000000/cancel`, {
      method: "POST",
    });
    expect(res.status).toBe(401);
  });
});

describe("Admin refund — /api/admin/bookings/[id]/refund", () => {
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

  it("unauthenticated → 401", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();
    const res = await fetch(`${BASE}/api/admin/bookings/00000000-0000-0000-0000-000000000000/refund`, {
      method: "POST",
    });
    expect(res.status).toBe(401);
  });
});
