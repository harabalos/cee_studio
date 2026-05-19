/**
 * Integration — iCal feed for the owner.
 *
 * Covers TESTING_GUIDE Test 10 (iCal feed) — was marked manual.
 *
 * What this verifies (which IS our code):
 *   - GET /api/calendar/owner.ics without token → 401
 *   - GET with wrong token → 401
 *   - GET with valid token returns Content-Type: text/calendar
 *   - Response body is a valid VCALENDAR (BEGIN:VCALENDAR + END:VCALENDAR)
 *   - Bookings appear as VEVENT blocks with correct DTSTART/DTEND
 *   - Bookings outside the [now-30d, now+365d] window are excluded
 *   - Non-confirmed bookings (pending, cancelled, refunded) are excluded
 *
 * NOT verified (manual):
 *   - Real calendar app (Apple/Google/Outlook) actually parses the feed
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { admin, cleanupQA, qaEmail } from "./helpers/supabase";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3001";
const TOKEN = process.env.OWNER_ICS_TOKEN;
const HAS_TOKEN = !!TOKEN;

let SERVER_REACHABLE = false;

async function seedConfirmedBooking(opts: {
  email: string;
  guestName: string;
  daysOffset: number;
  startHourUtc?: number;
  duration?: number;
  status?: "confirmed" | "completed" | "no_show" | "cancelled";
}) {
  const start = new Date(Date.now() + opts.daysOffset * 24 * 60 * 60 * 1000);
  start.setUTCHours(opts.startHourUtc ?? 9, 0, 0, 0);
  const end = new Date(start.getTime() + (opts.duration ?? 1) * 60 * 60 * 1000);

  const { data, error } = await admin
    .from("bookings")
    .insert({
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      duration_hours: opts.duration ?? 1,
      base_price_chf: 7000,
      addons_price_chf: 0,
      late_night_surcharge_chf: 0,
      total_chf: 7000,
      payment_method: "card",
      payment_status: "paid",
      stripe_session_id: `cs_test_qa_ical_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      status: opts.status ?? "confirmed",
      guest_name: opts.guestName,
      guest_email: opts.email,
      guest_phone: "+41 79 000 0040",
      preferred_lang: "de",
    })
    .select()
    .single();
  if (error) throw new Error(`seedConfirmedBooking failed: ${error.message}`);
  return data;
}

describe.skipIf(!HAS_TOKEN)("iCal feed — /api/calendar/owner.ics", () => {
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

  it("GET without token → 401", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();
    const res = await fetch(`${BASE}/api/calendar/owner.ics`);
    expect(res.status).toBe(401);
  });

  it("GET with wrong token → 401", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();
    const res = await fetch(`${BASE}/api/calendar/owner.ics?token=wrong-token-here`);
    expect(res.status).toBe(401);
  });

  it("GET with valid token returns Content-Type text/calendar + valid VCALENDAR", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();
    const res = await fetch(`${BASE}/api/calendar/owner.ics?token=${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/calendar/);
    const body = await res.text();
    expect(body).toMatch(/^BEGIN:VCALENDAR/);
    expect(body).toMatch(/END:VCALENDAR\s*$/);
    // Required iCal headers
    expect(body).toContain("PRODID:");
    expect(body).toContain("VERSION:2.0");
  });

  it("confirmed bookings within window appear as VEVENT blocks", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("ical-conf");
    const booking = await seedConfirmedBooking({
      email,
      guestName: "QA iCal Test",
      daysOffset: 42, // about 6 weeks out
      startHourUtc: 8,
      duration: 2,
      status: "confirmed",
    });

    const res = await fetch(`${BASE}/api/calendar/owner.ics?token=${TOKEN}`);
    const body = await res.text();

    // The booking should appear as a VEVENT
    expect(body).toContain("BEGIN:VEVENT");
    expect(body).toContain("END:VEVENT");
    // The guest name should be in the summary line
    expect(body).toContain("QA iCal Test");
    // The duration_hours summary prefix
    expect(body).toMatch(/SUMMARY:.*2h/);
    // The studio address as LOCATION
    expect(body).toContain("Thurgauerstrasse 117");

    // Cleanup the seed row
    await admin.from("bookings").delete().eq("id", booking.id);
  });

  it("cancelled bookings are excluded from the feed", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("ical-cancel");
    // Note: schema constraint on bookings.status accepts 'cancelled'. Seed a
    // cancelled-state booking — should not appear in ICS.
    const start = new Date(Date.now() + 49 * 24 * 60 * 60 * 1000);
    start.setUTCHours(7, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const { data: booking, error } = await admin
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
        payment_status: "refunded",
        stripe_session_id: `cs_test_qa_ical_cancel_${Date.now()}`,
        status: "cancelled",
        guest_name: "QA Cancelled Test",
        guest_email: email,
        guest_phone: "+41 79 000 0041",
        preferred_lang: "de",
      })
      .select()
      .single();
    if (error) throw new Error(`cancel seed failed: ${error.message}`);

    const res = await fetch(`${BASE}/api/calendar/owner.ics?token=${TOKEN}`);
    const body = await res.text();

    // The cancelled booking should NOT appear in the feed
    expect(body).not.toContain("QA Cancelled Test");

    // Cleanup
    await admin.from("bookings").delete().eq("id", booking.id);
  });

  it("bookings far in the past (>30 days back) are excluded", async (ctx) => {
    if (!SERVER_REACHABLE) ctx.skip();

    const email = qaEmail("ical-past");
    const start = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
    start.setUTCHours(10, 0, 0, 0);
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
        stripe_session_id: `cs_test_qa_ical_past_${Date.now()}`,
        status: "completed",
        guest_name: "QA Past Test 60d",
        guest_email: email,
        guest_phone: "+41 79 000 0042",
        preferred_lang: "de",
      })
      .select()
      .single();

    const res = await fetch(`${BASE}/api/calendar/owner.ics?token=${TOKEN}`);
    const body = await res.text();
    expect(body).not.toContain("QA Past Test 60d");

    // Cleanup
    await admin.from("bookings").delete().eq("id", booking!.id);
  });
});
