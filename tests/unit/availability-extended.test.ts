/**
 * Extended availability tests — covers slot computation edge cases.
 *
 * Maps to TESTING_GUIDE.md Test 4 (slot conflict prevention) and the
 * underlying math that protects against double-booking.
 */

import { describe, it, expect } from "vitest";
import { computeAvailableSlots } from "@/lib/booking/availability";

const DEFAULT_HOURS = { start: "08:00", end: "22:00" };

describe("computeAvailableSlots — happy paths", () => {
  it("empty day returns all hour-aligned slots", () => {
    const slots = computeAvailableSlots({
      date: "2026-05-13",
      duration: 1,
      busy: [],
      operatingHours: DEFAULT_HOURS,
      bufferMinutes: 30,
    });
    // 08:00 → 21:00 (21+1=22 = operating end), every full hour
    expect(slots.length).toBeGreaterThan(10);
    expect(slots).toContain("08:00");
    expect(slots).toContain("14:00");
    expect(slots).toContain("21:00");
  });

  it("excludes slots that don't fit before operating-end", () => {
    const slots = computeAvailableSlots({
      date: "2026-05-13",
      duration: 4,
      busy: [],
      operatingHours: DEFAULT_HOURS,
      bufferMinutes: 30,
    });
    // 4h booking must end by 22:00 → last viable start = 18:00
    expect(slots).toContain("18:00");
    expect(slots).not.toContain("19:00");
  });
});

describe("computeAvailableSlots — conflicts", () => {
  it("removes slot that fully overlaps a busy block", () => {
    const slots = computeAvailableSlots({
      date: "2026-05-13",
      duration: 1,
      busy: [
        {
          start: new Date("2026-05-13T12:00:00+02:00"),
          end: new Date("2026-05-13T13:00:00+02:00"),
        },
      ],
      operatingHours: DEFAULT_HOURS,
      bufferMinutes: 30,
    });
    expect(slots).not.toContain("12:00");
  });

  it("buffer protects adjacent slots — 30min buffer means 11:00 (ending 12:00) is blocked by 12:00 busy", () => {
    const slots = computeAvailableSlots({
      date: "2026-05-13",
      duration: 1,
      busy: [
        {
          start: new Date("2026-05-13T12:00:00+02:00"),
          end: new Date("2026-05-13T13:00:00+02:00"),
        },
      ],
      operatingHours: DEFAULT_HOURS,
      bufferMinutes: 30,
    });
    // 11:00 booking ends at 12:00, but with 30min buffer it'd push into the 12:00 booking
    expect(slots).not.toContain("11:00");
    // 10:00 ends at 11:00, has 1h gap before 12:00 → ok
    expect(slots).toContain("10:00");
  });

  it("multiple overlapping busy blocks are all respected", () => {
    const slots = computeAvailableSlots({
      date: "2026-05-13",
      duration: 1,
      busy: [
        {
          start: new Date("2026-05-13T10:00:00+02:00"),
          end: new Date("2026-05-13T11:00:00+02:00"),
        },
        {
          start: new Date("2026-05-13T15:00:00+02:00"),
          end: new Date("2026-05-13T16:00:00+02:00"),
        },
      ],
      operatingHours: DEFAULT_HOURS,
      bufferMinutes: 30,
    });
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("15:00");
  });
});

describe("computeAvailableSlots — operating hours edges", () => {
  it("respects custom operating hours (10:00-18:00)", () => {
    const slots = computeAvailableSlots({
      date: "2026-05-13",
      duration: 1,
      busy: [],
      operatingHours: { start: "10:00", end: "18:00" },
      bufferMinutes: 30,
    });
    expect(slots).not.toContain("08:00");
    expect(slots).not.toContain("09:00");
    expect(slots).toContain("10:00");
    expect(slots).toContain("17:00");
    expect(slots).not.toContain("18:00");
  });
});
