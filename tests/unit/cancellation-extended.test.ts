/**
 * Extended cancellation tests — exhaustive 3-tier boundary coverage.
 *
 * Maps to TESTING_GUIDE.md Test 2 (sub-tests 2a-2c). The base
 * `lib/booking/cancellation.test.ts` covers happy paths; this file
 * focuses on exact boundary times and rare combinations.
 */

import { describe, it, expect } from "vitest";
import { evaluateCancellation } from "@/lib/booking/cancellation";

const NOW = new Date("2026-05-04T10:00:00Z"); // Monday morning Zurich

describe("evaluateCancellation — exhaustive boundaries", () => {
  it("48h sharp → 100% refund tier (>= boundary)", () => {
    const start = new Date(NOW.getTime() + 48 * 60 * 60 * 1000);
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 10000, now: NOW });
    expect(r.allowed).toBe(true);
    if (r.allowed) expect(r.refundPercent).toBe(100);
  });

  it("47h 59min → 50% tier (just inside 24-48h)", () => {
    const start = new Date(NOW.getTime() + (47 * 60 + 59) * 60 * 1000);
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 10000, now: NOW });
    expect(r.allowed).toBe(true);
    if (r.allowed) expect(r.refundPercent).toBe(50);
  });

  it("24h sharp → 50% tier (>= boundary)", () => {
    const start = new Date(NOW.getTime() + 24 * 60 * 60 * 1000);
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 10000, now: NOW });
    expect(r.allowed).toBe(true);
    if (r.allowed) expect(r.refundPercent).toBe(50);
  });

  it("23h 59min → blocked (less than 24h)", () => {
    const start = new Date(NOW.getTime() + (23 * 60 + 59) * 60 * 1000);
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 10000, now: NOW });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.reason).toBe("less_than_24h");
  });

  it("0h (already started) → blocked", () => {
    const r = evaluateCancellation({ bookingStartUtc: NOW, totalPaidChf: 10000, now: NOW });
    expect(r.allowed).toBe(false);
  });

  it("past booking → blocked", () => {
    const start = new Date(NOW.getTime() - 60 * 60 * 1000);
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 10000, now: NOW });
    expect(r.allowed).toBe(false);
  });
});

describe("evaluateCancellation — Saturday/Sunday detection (Zurich tz)", () => {
  it("Saturday morning at UTC 12:00 → weekend reason", () => {
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-09T12:00:00Z"),
      totalPaidChf: 10000,
      now: new Date("2026-05-01T10:00:00Z"),
    });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.reason).toBe("weekend");
  });

  it("Sunday 18:00 Zurich (16:00 UTC summer DST) → weekend reason", () => {
    // 2026-05-10 16:00 UTC = 18:00 CEST (Sunday in Zurich)
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-10T16:00:00Z"),
      totalPaidChf: 10000,
      now: new Date("2026-05-01T10:00:00Z"),
    });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.reason).toBe("weekend");
  });
});

describe("evaluateCancellation — refund math", () => {
  it("100% tier: full refund minus CHF 1.50 fee", () => {
    const start = new Date(NOW.getTime() + 72 * 60 * 60 * 1000);
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 7000, now: NOW });
    if (r.allowed) {
      expect(r.refundChf).toBe(7000 - 150);
      expect(r.chargeChf).toBe(0);
    }
  });

  it("50% tier: half refund minus fee, half retained", () => {
    const start = new Date(NOW.getTime() + 36 * 60 * 60 * 1000);
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 14000, now: NOW });
    if (r.allowed) {
      expect(r.refundChf).toBe(7000 - 150);
      expect(r.chargeChf).toBe(7000);
    }
  });

  it("CHF 0 total (member booking) → no negative refund", () => {
    const start = new Date(NOW.getTime() + 72 * 60 * 60 * 1000);
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 0, now: NOW });
    if (r.allowed) {
      expect(r.refundChf).toBe(0);
      expect(r.chargeChf).toBe(0);
    }
  });
});
