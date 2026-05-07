import { describe, it, expect } from "vitest";
import { computeAvailableSlots } from "./availability";

const opHours = { start: "08:00", end: "22:00" };

describe("computeAvailableSlots", () => {
  it("returns all 30-min slots from operating hours when nothing is busy", () => {
    const slots = computeAvailableSlots({
      date: "2026-05-04",
      duration: 1,
      busy: [],
      operatingHours: opHours,
      bufferMinutes: 30,
    });
    // 1h booking with 30min buffer: last viable start = 21:00 (so end+buffer fits)
    // Actually we need end of booking <= 22:00 (op end), so last slot for 1h is 21:00.
    expect(slots[0]).toBe("08:00");
    expect(slots).toContain("12:00");
    expect(slots[slots.length - 1]).toBe("21:00");
  });

  it("excludes slots that would push end past operating end", () => {
    const slots = computeAvailableSlots({
      date: "2026-05-04",
      duration: 8,
      busy: [],
      operatingHours: opHours,
      bufferMinutes: 30,
    });
    // 8h: latest start that ends by 22:00 is 14:00
    expect(slots[slots.length - 1]).toBe("14:00");
    expect(slots).not.toContain("14:30"); // would end 22:30
  });

  it("excludes slots overlapping a busy block (with buffer)", () => {
    // Existing booking 14:00-16:00 Zurich = 12:00-14:00 UTC (CEST, +2)
    const slots = computeAvailableSlots({
      date: "2026-05-04",
      duration: 1,
      busy: [
        {
          start: new Date("2026-05-04T12:00:00Z"),
          end: new Date("2026-05-04T14:00:00Z"),
        },
      ],
      operatingHours: opHours,
      bufferMinutes: 30,
    });
    // With 30min buffer, slots from 13:30 to 16:00 should be unavailable
    // (a 1h slot starting at 13:30 would end at 14:30, overlapping the buffer-extended 13:30-16:30)
    expect(slots).not.toContain("13:30");
    expect(slots).not.toContain("14:00");
    expect(slots).not.toContain("15:30");
    // 13:00 should be OK (1h slot 13-14, but buffer requires 13:30 free → not OK actually)
    // Strict: any slot whose end+buffer overlaps a busy block is excluded
    // 13:00 ends 14:00, which is exactly when busy starts → with 30min before-buffer, 13:00 not OK
    // 12:30 ends 13:30, busy starts 14:00 with 30min before-buffer = 13:30 → so 12:30 is excluded too
    expect(slots).toContain("12:00"); // ends 13:00, busy zone starts at 13:30 → safe
    expect(slots).toContain("16:30"); // after the 16:00 busy end + 30min buffer
  });

  it("returns empty when entire day is blocked", () => {
    const slots = computeAvailableSlots({
      date: "2026-05-04",
      duration: 1,
      busy: [
        {
          start: new Date("2026-05-04T05:00:00Z"),  // 07:00 Zurich
          end: new Date("2026-05-04T22:00:00Z"),    // 24:00 Zurich
        },
      ],
      operatingHours: opHours,
      bufferMinutes: 30,
    });
    expect(slots).toEqual([]);
  });

  it("respects custom operating hours", () => {
    const slots = computeAvailableSlots({
      date: "2026-05-04",
      duration: 1,
      busy: [],
      operatingHours: { start: "10:00", end: "16:00" },
      bufferMinutes: 30,
    });
    expect(slots[0]).toBe("10:00");
    expect(slots[slots.length - 1]).toBe("15:00"); // 1h slot, last start that ends by 16:00
  });
});
