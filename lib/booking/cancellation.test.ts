import { describe, it, expect } from "vitest";
import { evaluateCancellation } from "./cancellation";

describe("evaluateCancellation", () => {
  // 2026-05-04 = Monday. 2026-05-09 = Saturday. 2026-05-10 = Sunday.

  it("blocks weekend bookings (Saturday)", () => {
    // Saturday afternoon (Zurich), called way ahead of time
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-09T12:00:00Z"),  // Sat Zurich 14:00 CEST
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

  it("blocks weekday bookings less than 48h away", () => {
    // Booking Wed 12:00 UTC, called Tue 14:00 UTC → 22 hours away
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-06T12:00:00Z"),
      totalPaidChf: 25000,
      now: new Date("2026-05-05T14:00:00Z"),
    });
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.reason).toBe("less_than_48h");
  });

  it("allows weekday bookings >=48h away with refund minus Stripe fee", () => {
    // Booking Friday, called Monday → 4 days
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-08T12:00:00Z"),  // Friday
      totalPaidChf: 25000,                                  // 250 CHF
      now: new Date("2026-05-04T10:00:00Z"),                // Monday
    });
    expect(r.allowed).toBe(true);
    if (r.allowed) {
      expect(r.refundChf).toBe(25000 - 150);   // 248.50 CHF after Stripe fee
      expect(r.reason).toBe("weekday_48h_plus");
    }
  });

  it("never returns negative refund for tiny totals", () => {
    const r = evaluateCancellation({
      bookingStartUtc: new Date("2026-05-08T12:00:00Z"),
      totalPaidChf: 100,                                   // 1 CHF — less than fee
      now: new Date("2026-05-04T10:00:00Z"),
    });
    expect(r.allowed).toBe(true);
    if (r.allowed) {
      expect(r.refundChf).toBe(0);
    }
  });

  it("48h boundary: exactly 48h is allowed", () => {
    const start = new Date("2026-05-08T12:00:00Z");  // Friday
    const now = new Date("2026-05-06T12:00:00Z");    // Wed exactly 48h before
    const r = evaluateCancellation({ bookingStartUtc: start, totalPaidChf: 7000, now });
    expect(r.allowed).toBe(true);
  });
});
