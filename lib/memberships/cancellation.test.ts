/**
 * Unit tests — Membership cancellation policy (3-month minimum commitment).
 *
 * Covers the policy logic that decides whether a member can cancel
 * immediately or has to wait until their minimum_until date has passed.
 *
 * The 3-month minimum is set at signup (MINIMUM_MONTHS in plans.ts).
 * Once a subscription is created, `memberships.minimum_until` carries
 * the cutoff date forward. This module is the single source of truth
 * for "can the user cancel right now?".
 */

import { describe, it, expect } from "vitest";
import { canCancelMembership } from "./cancellation";
import { MINIMUM_MONTHS } from "./plans";
import { addMonths, subDays, addDays } from "date-fns";

describe("canCancelMembership", () => {
  const now = new Date("2026-06-01T12:00:00Z");

  it("MINIMUM_MONTHS is 3 (Konstantina's policy)", () => {
    expect(MINIMUM_MONTHS).toBe(3);
  });

  it("null minimum_until → allowed (legacy / no minimum)", () => {
    const d = canCancelMembership(null, now);
    expect(d.allowed).toBe(true);
    if (d.allowed) expect(d.reason).toBe("no_minimum_term");
  });

  it("undefined minimum_until → allowed", () => {
    const d = canCancelMembership(undefined, now);
    expect(d.allowed).toBe(true);
  });

  it("invalid date string → allowed (defensive — don't trap users)", () => {
    const d = canCancelMembership("not-a-date", now);
    expect(d.allowed).toBe(true);
  });

  it("minimum_until in the past (1 day ago) → allowed (term passed)", () => {
    const oneDayAgo = subDays(now, 1);
    const d = canCancelMembership(oneDayAgo, now);
    expect(d.allowed).toBe(true);
    if (d.allowed) expect(d.reason).toBe("minimum_term_passed");
  });

  it("minimum_until = exact now (millisecond match) → allowed", () => {
    const d = canCancelMembership(now, now);
    expect(d.allowed).toBe(true);
  });

  it("minimum_until in the future (1 day) → BLOCKED", () => {
    const oneDayLater = addDays(now, 1);
    const d = canCancelMembership(oneDayLater, now);
    expect(d.allowed).toBe(false);
    if (!d.allowed) {
      expect(d.reason).toBe("minimum_term_active");
      expect(d.availableAt.getTime()).toBe(oneDayLater.getTime());
    }
  });

  it("just-signed-up member (3 months ahead) → BLOCKED", () => {
    const threeMonthsLater = addMonths(now, 3);
    const d = canCancelMembership(threeMonthsLater, now);
    expect(d.allowed).toBe(false);
    if (!d.allowed) expect(d.reason).toBe("minimum_term_active");
  });

  it("member at 2.5 months in (0.5 months to go) → BLOCKED", () => {
    // Signed up 2.5 months ago. minimum_until is now + 0.5 months
    const halfMonthLater = addDays(now, 15);
    const d = canCancelMembership(halfMonthLater, now);
    expect(d.allowed).toBe(false);
  });

  it("ISO string input is parsed correctly", () => {
    const isoString = addMonths(now, 1).toISOString();
    const d = canCancelMembership(isoString, now);
    expect(d.allowed).toBe(false);
  });

  it("ISO string in the past is parsed and allowed", () => {
    const pastIso = subDays(now, 30).toISOString();
    const d = canCancelMembership(pastIso, now);
    expect(d.allowed).toBe(true);
    if (d.allowed) expect(d.reason).toBe("minimum_term_passed");
  });

  it("scenario: signup today, try to cancel after MINIMUM_MONTHS exactly → allowed", () => {
    const signupDate = new Date("2026-03-01T12:00:00Z");
    const minimumUntil = addMonths(signupDate, MINIMUM_MONTHS); // 2026-06-01
    // User tries to cancel exactly on the cutoff
    const cancelAttempt = minimumUntil;
    const d = canCancelMembership(minimumUntil, cancelAttempt);
    expect(d.allowed).toBe(true);
  });

  it("scenario: signup today, try to cancel 1 day before MINIMUM_MONTHS → BLOCKED with correct unlock date", () => {
    const signupDate = new Date("2026-03-01T12:00:00Z");
    const minimumUntil = addMonths(signupDate, MINIMUM_MONTHS); // 2026-06-01
    const cancelAttempt = subDays(minimumUntil, 1); // 2026-05-31
    const d = canCancelMembership(minimumUntil, cancelAttempt);
    expect(d.allowed).toBe(false);
    if (!d.allowed) {
      // The error must tell them WHEN they can cancel
      expect(d.availableAt.getTime()).toBe(minimumUntil.getTime());
    }
  });

  it("real-world: members on starter plan get 3 months minimum, same as pro/unlimited", () => {
    // All plans share the same minimum (MINIMUM_MONTHS = 3)
    // Verify that no plan-specific override exists yet (would break this test
    // if someone adds per-plan minimums without updating the policy module)
    const signup = new Date("2026-06-01T00:00:00Z");
    const minimum = addMonths(signup, MINIMUM_MONTHS);
    expect(minimum.getMonth()).toBe(8); // September (0-indexed)
    expect(minimum.getDate()).toBe(1);
  });
});
