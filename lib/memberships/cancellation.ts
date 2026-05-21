/**
 * Membership cancellation policy.
 *
 * Single source of truth for whether a member can cancel right now,
 * or has to wait until the minimum commitment period ends.
 *
 * The minimum commitment is set at signup time (see
 * /api/membership/checkout/route.ts which calls addMonths(now, MINIMUM_MONTHS)).
 * Currently 3 months — see MINIMUM_MONTHS in plans.ts.
 *
 * Used by:
 *   - app/account/membership/page.tsx to decide whether to show "Manage in
 *     Stripe Portal" vs "Locked until <date>"
 *   - tests/unit/membership-cancellation.test.ts to verify the policy
 */

export type CancellationDecision =
  | { allowed: true; reason: "no_minimum_term" }
  | { allowed: true; reason: "minimum_term_passed" }
  | { allowed: false; reason: "minimum_term_active"; availableAt: Date };

/**
 * Decide whether a member can cancel their subscription right now.
 *
 * @param minimumUntil - the ISO date string OR Date when minimum commitment ends.
 *                       Null/undefined means no minimum (legacy memberships).
 * @param now - reference time for the check (defaults to wall clock).
 */
export function canCancelMembership(
  minimumUntil: string | Date | null | undefined,
  now: Date = new Date()
): CancellationDecision {
  if (!minimumUntil) {
    return { allowed: true, reason: "no_minimum_term" };
  }
  const until = typeof minimumUntil === "string" ? new Date(minimumUntil) : minimumUntil;
  if (Number.isNaN(until.getTime())) {
    // Invalid date — treat as no minimum (don't trap the user)
    return { allowed: true, reason: "no_minimum_term" };
  }
  if (until.getTime() <= now.getTime()) {
    return { allowed: true, reason: "minimum_term_passed" };
  }
  return { allowed: false, reason: "minimum_term_active", availableAt: until };
}
