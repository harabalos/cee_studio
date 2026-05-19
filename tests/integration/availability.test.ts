/**
 * Integration test — /api/availability endpoint.
 *
 * Verifies that the slot computation API responds correctly to various
 * date/duration combinations and returns a sensible slot list.
 *
 * Maps to TESTING_GUIDE.md Test 4 prerequisite (slot computation).
 */

import { describe, it, expect } from "vitest";
import { getJSON } from "./helpers/api";
import { futureWeekday, nextSaturday } from "./helpers/dates";

type AvailabilityResp = {
  date: string;
  duration: number;
  slots: string[];
  closedReason?: string;
};

describe("GET /api/availability", () => {
  it("returns slot list for valid weekday + 1h duration", async () => {
    const d = futureWeekday(5);
    const r = await getJSON<AvailabilityResp>(
      `/api/availability?date=${d.date}&duration=1`
    );
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body.slots)).toBe(true);
    expect(r.body.slots.length).toBeGreaterThan(0);
  });

  it("returns slot list for 8h duration (fewer slots)", async () => {
    const d = futureWeekday(7);
    const r = await getJSON<AvailabilityResp>(
      `/api/availability?date=${d.date}&duration=8`
    );
    expect(r.status).toBe(200);
    // 8h bookings have fewer viable start times than 1h
    expect(r.body.slots.length).toBeLessThan(15);
  });

  it("missing date param returns 400", async () => {
    const r = await getJSON(`/api/availability?duration=1`);
    expect(r.status).toBe(400);
  });

  it("invalid duration returns 400", async () => {
    const d = futureWeekday(5);
    const r = await getJSON(`/api/availability?date=${d.date}&duration=99`);
    expect(r.status).toBe(400);
  });

  it("malformed date returns 400", async () => {
    const r = await getJSON(`/api/availability?date=not-a-date&duration=1`);
    expect(r.status).toBe(400);
  });

  it("Saturday request still returns slots (weekend booking allowed, no-cancel policy applies later)", async () => {
    const d = nextSaturday();
    const r = await getJSON<AvailabilityResp>(
      `/api/availability?date=${d.date}&duration=1`
    );
    expect(r.status).toBe(200);
    // Weekends are bookable (just non-cancellable)
    expect(r.body.slots.length).toBeGreaterThan(0);
  });
});
