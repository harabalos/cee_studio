import { describe, it, expect } from "vitest";
import { evaluateCancellation } from "./cancellation";

describe("evaluateCancellation", () => {
  // 2026-05-04 = Monday. 2026-05-09 = Saturday. 2026-05-10 = Sunday.

  it("blocks weekend bookings (Saturday)", () => {
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-09T12:00:00Z"),
      totalPaidChf: 25000,
      now: new Date("2026-05-01T10:00:00Z"),
    });
    expect(r.allowed).toBe(false);
    if (!r.allowed) {
      expect(r.reason).toBe("weekend");
    }
  });

  it("blocks weekend bookings (Sunday)", () => {
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-10T12:00:00Z"),
      totalPaidChf: 25000,
      now: new Date("2026-05-01T10:00:00Z"),
    });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.reason).toBe("weekend");
  });

  it("blocks weekday bookings less than 24h away (100% charge, no refund)", () => {
    // Booking Wed 12:00 UTC, called Tue 14:00 UTC → 22 hours away
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-06T12:00:00Z"),
      totalPaidChf: 25000,
      now: new Date("2026-05-05T14:00:00Z"),
    });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.reason).toBe("less_than_24h");
  });

  it("allows weekday bookings 24-48h away with 50% refund", () => {
    // Booking Wed 12:00 UTC, called Mon 16:00 UTC → ~44h away
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-06T12:00:00Z"),
      totalPaidChf: 25000,
      now: new Date("2026-05-04T16:00:00Z"),
    });
    expect(r.allowed).toBe(true);
    if (r.allowed) {
      expect(r.refundPercent).toBe(50);
      expect(r.refundChf).toBe(25000 / 2 - 150); // 50% minus payment fee
      expect(r.chargeChf).toBe(25000 / 2);
      expect(r.reason).toBe("weekday_24_to_48h");
    }
  });

  it("allows weekday bookings >=48h away with full refund minus fee", () => {
    // Booking Friday, called Monday → 4 days
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-08T12:00:00Z"),
      totalPaidChf: 25000,
      now: new Date("2026-05-04T10:00:00Z"),
    });
    expect(r.allowed).toBe(true);
    if (r.allowed) {
      expect(r.refundPercent).toBe(100);
      expect(r.refundChf).toBe(25000 - 150);
      expect(r.chargeChf).toBe(0);
      expect(r.reason).toBe("weekday_48h_plus");
    }
  });

  it("never returns negative refund for tiny totals", () => {
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-08T12:00:00Z"),
      totalPaidChf: 100, // 1 CHF — less than fee
      now: new Date("2026-05-04T10:00:00Z"),
    });
    expect(r.allowed).toBe(true);
    if (r.allowed) {
      expect(r.refundChf).toBe(0);
    }
  });

  it("48h boundary: exactly 48h is allowed and gets full refund", () => {
    const start = new Date("2026-05-08T12:00:00Z");
    const now = new Date("2026-05-06T12:00:00Z");
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 7000, now });
    expect(r.allowed).toBe(true);
    if (r.allowed) {
      expect(r.refundPercent).toBe(100);
    }
  });

  it("24h boundary: exactly 24h is allowed and gets 50% refund", () => {
    const start = new Date("2026-05-08T12:00:00Z");
    const now = new Date("2026-05-07T12:00:00Z");
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 14000, now });
    expect(r.allowed).toBe(true);
    if (r.allowed) {
      expect(r.refundPercent).toBe(50);
      expect(r.refundChf).toBe(7000 - 150);
      expect(r.chargeChf).toBe(7000);
    }
  });
});
