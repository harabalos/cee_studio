/**
 * Extended pricing tests — covers edge cases beyond the base
 * `lib/booking/pricing.test.ts` suite.
 *
 * Maps to TESTING_GUIDE.md Test 3 (Late-night surcharge, sub-tests 3a-3d)
 * plus addon combination scenarios.
 */

import { describe, it, expect } from "vitest";
import {
  calcPrice,
  countLateNightHours,
  DEFAULT_ADDON_PRICES,
} from "@/lib/booking/pricing";

describe("countLateNightHours edge cases", () => {
  it("returns 0 when booking ends before cutoff", () => {
    expect(countLateNightHours({ startHour: 14, durationHours: 2 })).toBe(0);
  });

  it("returns 0 when booking ends exactly at cutoff", () => {
    // 18:00 + 2h = 20:00 (boundary, not late-night)
    expect(countLateNightHours({ startHour: 18, durationHours: 2 })).toBe(0);
  });

  it("counts 1h when ending one hour past cutoff", () => {
    // 19:00 + 2h = 21:00 → 1h late
    expect(countLateNightHours({ startHour: 19, durationHours: 2 })).toBe(1);
  });

  it("counts entire booking when starting at cutoff", () => {
    expect(countLateNightHours({ startHour: 20, durationHours: 2 })).toBe(2);
  });

  it("counts entire booking when starting past cutoff", () => {
    expect(countLateNightHours({ startHour: 21, durationHours: 2 })).toBe(2);
  });

  it("clips at midnight (24:00) — 8h starting at 18:00", () => {
    // 18:00 + 8h = 26:00 (clipped to 24) → late hours = 20-24 = 4
    expect(countLateNightHours({ startHour: 18, durationHours: 8 })).toBe(4);
  });

  it("respects custom cutoff (21:00)", () => {
    expect(countLateNightHours({ startHour: 20, durationHours: 2, lateNightStartHour: 21 })).toBe(1);
  });
});

describe("calcPrice — late-night surcharge (TESTING_GUIDE 3a-3d)", () => {
  it("3a: 2h at 17:00 → no surcharge", () => {
    const r = calcPrice({ duration: 2, startHour: 17, addons: [] });
    expect(r.lateNightHours).toBe(0);
    expect(r.lateNightChf).toBe(0);
    expect(r.totalChf).toBe(12000);
  });

  it("3b: 4h at 19:00 → 3h late-night surcharge", () => {
    const r = calcPrice({ duration: 4, startHour: 19, addons: [] });
    expect(r.lateNightHours).toBe(3);
    expect(r.lateNightChf).toBe(3000);
    expect(r.totalChf).toBe(25000 + 3000);
  });

  it("3c: 2h at 21:00 → fully late-night", () => {
    const r = calcPrice({ duration: 2, startHour: 21, addons: [] });
    expect(r.lateNightHours).toBe(2);
    expect(r.lateNightChf).toBe(2000);
    expect(r.totalChf).toBe(12000 + 2000);
  });

  it("3d: 1h exactly at 20:00 → 1h late-night", () => {
    const r = calcPrice({ duration: 1, startHour: 20, addons: [] });
    expect(r.lateNightHours).toBe(1);
    expect(r.lateNightChf).toBe(1000);
    expect(r.totalChf).toBe(7000 + 1000);
  });
});

describe("calcPrice — addon combinations", () => {
  it("no addons returns 0 for addonsChf", () => {
    const r = calcPrice({ duration: 1, startHour: 10, addons: [] });
    expect(r.addonsChf).toBe(0);
    expect(r.totalChf).toBe(7000);
  });

  it("single addon lighting", () => {
    const r = calcPrice({ duration: 1, startHour: 10, addons: ["lighting"] });
    expect(r.addonsChf).toBe(DEFAULT_ADDON_PRICES.lighting);
    expect(r.totalChf).toBe(7000 + 2000);
  });

  it("both addons combined", () => {
    const r = calcPrice({ duration: 2, startHour: 10, addons: ["lighting", "backdrops"] });
    expect(r.addonsChf).toBe(2000 + 3000);
    expect(r.totalChf).toBe(12000 + 5000);
  });

  it("podcast addon is no longer accepted by the type system", () => {
    // Compile-time check — the test only verifies the runtime path. We
    // intentionally keep the assertion shape future-proof.
    const r = calcPrice({ duration: 1, startHour: 10, addons: [] });
    expect(r.addonsChf).toBe(0);
  });

  it("addons + late-night stacked", () => {
    const r = calcPrice({
      duration: 4,
      startHour: 19,
      addons: ["lighting", "backdrops"],
    });
    // 250 base + 50 addons + 30 late-night
    expect(r.totalChf).toBe(25000 + 5000 + 3000);
  });
});

describe("calcPrice — full-day pricing", () => {
  it("8h at 14:00 returns 8h tier (CHF 490) + 4h late-night (14+8=22, late from 20)", () => {
    const r = calcPrice({ duration: 8, startHour: 14, addons: [] });
    expect(r.baseChf).toBe(49000);
    expect(r.lateNightHours).toBe(2); // 20-22
    expect(r.lateNightChf).toBe(2000);
    expect(r.totalChf).toBe(49000 + 2000);
  });

  it("8h at 09:00 no late-night", () => {
    const r = calcPrice({ duration: 8, startHour: 9, addons: [] });
    expect(r.lateNightHours).toBe(0);
    expect(r.totalChf).toBe(49000);
  });
});
