/**
 * Cancellation rule logic.
 *
 * Updated policy (2026-05-22):
 *   Weekday bookings:
 *     >48h before:  free cancellation, 100% refund minus payment fee
 *     24–48h before: 50% refund, 50% charge
 *     <24h before:   non-refundable
 *   Weekend bookings:
 *     >48h before:  free cancellation, 100% refund minus payment fee
 *     <48h before:  non-refundable
 *
 * Returns rule decision so both UI and server use the same logic.
 */

import { differenceInHours } from "date-fns";
import { getZurichDayOfWeek } from "./availability";

export type CancellationDecision =
  | {
      allowed: true;
      refundChf: number;
      chargeChf: number;
      refundPercent: 100 | 50;
      reason: "weekday_48h_plus" | "weekday_24_to_48h" | "weekend_48h_plus";
    }
  | { allowed: false; reason: "weekday_less_than_24h"; messageKey: "cancellation_too_late" }
  | { allowed: false; reason: "weekend_less_than_48h"; messageKey: "cancellation_too_late" };

const PAYMENT_FEE_CHF = 150; // CHF 1.50 in cents (Stripe + minor admin fee)

export function evaluateCancellation(opts: {
  bookingStartUtc: Date | string;
  totalPaidChf: number;
  now?: Date;
}): CancellationDecision {
  const start = typeof opts.bookingStartUtc === "string" ? new Date(opts.bookingStartUtc) : opts.bookingStartUtc;
  const now = opts.now ?? new Date();
  const dow = getZurichDayOfWeek(start);
  const isWeekend = dow === 0 || dow === 6;
  const hoursUntil = differenceInHours(start, now);

  // ===== Weekend rules =====
  if (isWeekend) {
    if (hoursUntil < 48) {
      return {
        allowed: false,
        reason: "weekend_less_than_48h",
        messageKey: "cancellation_too_late",
      };
    }
    return {
      allowed: true,
      refundChf: Math.max(0, opts.totalPaidChf - PAYMENT_FEE_CHF),
      chargeChf: 0,
      refundPercent: 100,
      reason: "weekend_48h_plus",
    };
  }

  // ===== Weekday rules =====
  if (hoursUntil < 24) {
    return {
      allowed: false,
      reason: "weekday_less_than_24h",
      messageKey: "cancellation_too_late",
    };
  }

  if (hoursUntil < 48) {
    const halfAmount = Math.floor(opts.totalPaidChf / 2);
    return {
      allowed: true,
      refundChf: Math.max(0, halfAmount - PAYMENT_FEE_CHF),
      chargeChf: opts.totalPaidChf - halfAmount,
      refundPercent: 50,
      reason: "weekday_24_to_48h",
    };
  }

  return {
    allowed: true,
    refundChf: Math.max(0, opts.totalPaidChf - PAYMENT_FEE_CHF),
    chargeChf: 0,
    refundPercent: 100,
    reason: "weekday_48h_plus",
  };
}
