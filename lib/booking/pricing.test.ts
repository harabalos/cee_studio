import { describe, it, expect } from "vitest";
import {
  calcPrice,
  countLateNightHours,
  formatChf,
  DEFAULT_PRICES,
  DEFAULT_ADDON_PRICES,
} from "./pricing";

describe("countLateNightHours", () => {
  it("returns 0 when booking ends before late-night cutoff", () => {
    expect(countLateNightHours({ startHour: 14, durationHours: 4 })).toBe(0);   // 14-18
    expect(countLateNightHours({ startHour: 16, durationHours: 4 })).toBe(0);   // 16-20 exactly
  });

  it("counts only the hours that cross the cutoff", () => {
    expect(countLateNightHours({ startHour: 19, durationHours: 4 })).toBe(3);   // 19-23 → 20,21,22
    expect(countLateNightHours({ startHour: 20, durationHours: 2 })).toBe(2);   // 20-22 fully
    expect(countLateNightHours({ startHour: 18, durationHours: 4 })).toBe(2);   // 18-22 → 20,21
  });

  it("respects custom late-night start hour", () => {
    expect(countLateNightHours({ startHour: 16, durationHours: 4, lateNightStartHour: 18 })).toBe(2);
  });

  it("caps at end of day (24:00)", () => {
    expect(countLateNightHours({ startHour: 21, durationHours: 8 })).toBe(3);   // 21-29 → clamped to 24
  });
});

describe("calcPrice", () => {
  it("uses tier price for the duration (not linear)", () => {
    expect(calcPrice({ duration: 1, startHour: 10, addons: [] }).baseChf).toBe(7000);
    expect(calcPrice({ duration: 4, startHour: 10, addons: [] }).baseChf).toBe(25000);  // not 4x70
    expect(calcPrice({ duration: 8, startHour: 10, addons: [] }).baseChf).toBe(49000);  // not 8x70
  });

  it("sums add-ons", () => {
    const r = calcPrice({ duration: 2, startHour: 10, addons: ["lighting", "podcast"] });
    expect(r.addonsChf).toBe(2000 + 4000);   // 60 CHF
    expect(r.totalChf).toBe(12000 + 6000);   // 180 CHF
  });

  it("adds late-night surcharge when applicable", () => {
    const r = calcPrice({ duration: 4, startHour: 19, addons: [] });
    // 4h Half Day = 250, 3 late-night hours × 10 = 30 → total 280
    expect(r.lateNightHours).toBe(3);
    expect(r.lateNightChf).toBe(3000);
    expect(r.totalChf).toBe(28000);
  });

  it("no surcharge when ending exactly at 20:00", () => {
    const r = calcPrice({ duration: 2, startHour: 18, addons: [] });
    expect(r.lateNightHours).toBe(0);
    expect(r.lateNightChf).toBe(0);
  });

  it("throws on unknown duration", () => {
    expect(() => calcPrice({ duration: 5 as unknown as 1, startHour: 10, addons: [] })).toThrow();
  });

  it("throws on unknown addon", () => {
    expect(() => calcPrice({ duration: 1, startHour: 10, addons: ["nonsense" as unknown as "lighting"] })).toThrow();
  });

  it("uses overridden prices when provided", () => {
    const r = calcPrice({
      duration: 1,
      startHour: 10,
      addons: [],
      prices: { ...DEFAULT_PRICES, 1: 9999 },
    });
    expect(r.baseChf).toBe(9999);
  });

  it("uses default add-on prices match constants", () => {
    expect(DEFAULT_ADDON_PRICES.lighting).toBe(2000);
    expect(DEFAULT_ADDON_PRICES.backdrops).toBe(3000);
    expect(DEFAULT_ADDON_PRICES.podcast).toBe(4000);
  });
});

describe("formatChf", () => {
  it("formats whole CHF without decimals", () => {
    expect(formatChf(7000)).toBe("CHF 70");
    expect(formatChf(25000)).toBe("CHF 250");
  });

  it("formats fractional CHF with 2 decimals", () => {
    expect(formatChf(7050)).toBe("CHF 70.50");
    expect(formatChf(150)).toBe("CHF 1.50");
  });

  it("handles zero", () => {
    expect(formatChf(0)).toBe("CHF 0");
  });
});
