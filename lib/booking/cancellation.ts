/**
 * Cancellation rule logic.
 *
 * Rules:
 * - Weekend (Sat/Sun) bookings are non-cancellable, no refund.
 * - Weekday >=48h before booking: full refund minus Stripe fee (CHF 1.50).
 * - Weekday <48h before booking: non-cancellable, no refund.
 *
 * Returns rule decision so both UI and server can use the same logic.
 */

import { differenceInHours } from "date-fns";
import { getZurichDayOfWeek } from "./availability";

export type CancellationDecision =
  | { allowed: true; refundChf: number; reason: "weekday_48h_plus" }
  | { allowed: false; reason: "weekend"; messageKey: "cancellation_weekend_blocked" }
  | { allowed: false; reason: "less_than_48h"; messageKey: "cancellation_too_late" };

const STRIPE_FEE_CHF = 150; // CHF 1.50 in cents

export function evaluateCancellation(opts: {
  bookingStartUtc: Date | string;
  totalPaidChf: number;
  now?: Date;
}): CancellationDecision {
  const start = typeof opts.bookingStartUtc === "string" ? new Date(opts.bookingStartUtc) : opts.bookingStartUtc;
  const now = opts.now ?? new Date();
  const dow = getZurichDayOfWeek(start);

  // 0=Sun, 6=Sat
  if (dow === 0 || dow === 6) {
    return { allowed: false, reason: "weekend", messageKey: "cancellation_weekend_blocked" };
  }

  const hoursUntil = differenceInHours(start, now);
  if (hoursUntil < 48) {
    return { allowed: false, reason: "less_than_48h", messageKey: "cancellation_too_late" };
  }

  return {
    allowed: true,
    refundChf: Math.max(0, opts.totalPaidChf - STRIPE_FEE_CHF),
    reason: "weekday_48h_plus",
  };
}
