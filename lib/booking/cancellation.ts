/**
 * Cancellation rule logic.
 *
 * Three-tier policy (matches CEE Studio AGB):
 * - Weekend bookings (Sat/Sun): non-cancellable, no refund.
 * - Weekday >48h before: free cancellation, full refund minus payment fee.
 * - Weekday 24-48h before: 50% charge, 50% refunded.
 * - Weekday <24h before: 100% charge, no refund.
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
      reason: "weekday_48h_plus" | "weekday_24_to_48h";
    }
  | { allowed: false; reason: "weekend"; messageKey: "cancellation_weekend_blocked" }
  | { allowed: false; reason: "less_than_24h"; messageKey: "cancellation_too_late" };

const PAYMENT_FEE_CHF = 150; // CHF 1.50 in cents (Stripe + minor admin fee)

export function evaluateCancellation(opts: {
  bookingStartUtc: Date | string;
  totalPaidChf: number;
  now?: Date;
}): CancellationDecision {
  const start = typeof opts.bookingStartUtc === "string" ? new Date(opts.bookingStartUtc) : opts.bookingStartUtc;
  const now = opts.now ?? new Date();
  const dow = getZurichDayOfWeek(start);

  // Weekend bookings — non-refundable (AGB §4)
  if (dow === 0 || dow === 6) {
    return { allowed: false, reason: "weekend", messageKey: "cancellation_weekend_blocked" };
  }

  const hoursUntil = differenceInHours(start, now);

  // Less than 24h — non-refundable (100% charge)
  if (hoursUntil < 24) {
    return { allowed: false, reason: "less_than_24h", messageKey: "cancellation_too_late" };
  }

  // 24-48h window — 50% refund
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

  // >48h — full refund (minus payment processing fee)
  return {
    allowed: true,
    refundChf: Math.max(0, opts.totalPaidChf - PAYMENT_FEE_CHF),
    chargeChf: 0,
    refundPercent: 100,
    reason: "weekday_48h_plus",
  };
}
