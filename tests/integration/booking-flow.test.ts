/**
 * Integration test — guest booking flow.
 *
 * Verifies /api/booking/hold creates a pending_hold + Stripe Checkout
 * session, and that follow-up reads via /api/booking/by-session work.
 *
 * Maps to TESTING_GUIDE.md Test 1 (Guest booking 1h) — the API portion.
 * Real Stripe payment is covered by E2E tests.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { postJSON, getJSON } from "./helpers/api";
import { admin, qaEmail, cleanupQA } from "./helpers/supabase";
import { futureWeekday } from "./helpers/dates";

beforeAll(async () => {
  // Clear any leftover holds/bookings from prior runs so we don't
  // collide with slots booked in previous failed CI runs.
  await cleanupQA();
});

afterAll(async () => {
  await cleanupQA();
});

describe("POST /api/booking/hold", () => {
  it("creates pending_hold + Stripe Checkout URL for valid request", async () => {
    const d = futureWeekday(7);
    const email = qaEmail("hold");

    const r = await postJSON<{ url: string; holdId: string }>("/api/booking/hold", {
      duration: 1,
      date: d.date,
      time: "14:00",
      addons: [],
      guest: {
        name: "QA Guest",
        email,
        phone: "+41 79 000 0000",
      },
      lang: "de",
      termsAccepted: true,
    });

    expect(r.status).toBe(200);
    expect(r.body.url).toContain("checkout.stripe.com");
    expect(r.body.holdId).toBeTruthy();

    // Verify pending_hold row in DB
    const { data } = await admin
      .from("pending_holds")
      .select("id, start_time, payload")
      .eq("id", r.body.holdId)
      .single();
    expect(data?.id).toBe(r.body.holdId);

    const payload = data?.payload as { guest?: { email?: string } };
    expect(payload?.guest?.email).toBe(email);
  });

  it("rejects invalid duration (99)", async () => {
    const d = futureWeekday(7);
    const r = await postJSON("/api/booking/hold", {
      duration: 99,
      date: d.date,
      time: "14:00",
      addons: [],
      guest: { name: "X", email: qaEmail(), phone: "+41" },
      lang: "de",
      termsAccepted: true,
    });
    expect(r.status).toBe(400);
  });

  it("rejects missing terms acceptance", async () => {
    const d = futureWeekday(7);
    const r = await postJSON("/api/booking/hold", {
      duration: 1,
      date: d.date,
      time: "14:00",
      addons: [],
      guest: { name: "QA Tester", email: qaEmail(), phone: "+41 79 000 0000" },
      lang: "de",
      termsAccepted: false,
    });
    expect(r.status).toBe(400);
  });

  it("rejects podcast addon (no longer supported)", async () => {
    const d = futureWeekday(7);
    const r = await postJSON("/api/booking/hold", {
      duration: 1,
      date: d.date,
      time: "14:00",
      addons: ["podcast"],
      guest: { name: "QA Tester", email: qaEmail(), phone: "+41 79 000 0000" },
      lang: "de",
      termsAccepted: true,
    });
    expect(r.status).toBe(400);
  });

  it("accepts both supported addons (lighting + backdrops)", async () => {
    // Use a date well in the future to avoid colliding with the slot
    // booked by the earlier test in this file.
    const d = futureWeekday(14);
    const r = await postJSON<{ url: string; error?: string }>("/api/booking/hold", {
      duration: 2,
      date: d.date,
      time: "10:00",
      addons: ["lighting", "backdrops"],
      guest: { name: "QA Tester", email: qaEmail("addons"), phone: "+41 79 000 0000" },
      lang: "de",
      termsAccepted: true,
    });
    expect(r.status).toBe(200);
    expect(r.body.url).toBeTruthy();
  });
});

describe("GET /api/booking/by-session", () => {
  it("returns 202 (pending) when session_id doesn't match any booking", async () => {
    const r = await getJSON<{ booking: null | object }>(
      "/api/booking/by-session?session_id=cs_test_does_not_exist_12345"
    );
    expect([200, 202]).toContain(r.status);
    expect(r.body.booking).toBeNull();
  });

  it("400 on missing session_id", async () => {
    const r = await getJSON("/api/booking/by-session");
    expect(r.status).toBe(400);
  });
});
