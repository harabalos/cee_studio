/**
 * Availability calculator. Computes available start times for a given date+duration.
 *
 * Inputs (UTC ISO timestamps from DB) are converted to Europe/Zurich local time
 * for slot generation. Output slots are HH:mm strings in Zurich local.
 *
 * Algorithm:
 *   1. Generate all candidate start times within operating hours, in 30-min steps,
 *      such that startTime + duration <= operatingEnd.
 *   2. Build a busy-mask from existing bookings + holds + blocked dates,
 *      expanded by `bufferMinutes` on each side.
 *   3. Filter candidates: a candidate is available iff [start, end] doesn't
 *      intersect the busy mask.
 */

import { addMinutes } from "date-fns";
import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";
import type { Duration } from "@/types/booking";

const ZURICH_TZ = "Europe/Zurich";

interface BusyInterval {
  start: Date; // UTC
  end: Date;   // UTC
}

export interface AvailabilityInput {
  /** YYYY-MM-DD — interpreted as a Zurich-local date */
  date: string;
  duration: Duration;
  busy: BusyInterval[];        // existing bookings + holds + blocked dates
  operatingHours?: { start: string; end: string }; // "08:00", "22:00"
  bufferMinutes?: number;      // default 30
  slotIncrementMinutes?: number; // default 30
}

export function computeAvailableSlots(input: AvailabilityInput): string[] {
  const operating = input.operatingHours ?? { start: "08:00", end: "22:00" };
  const buffer = input.bufferMinutes ?? 30;
  const step = input.slotIncrementMinutes ?? 30;

  // Build operating window as Zurich-local Date objects, then convert to UTC.
  const [opStartH, opStartM] = operating.start.split(":").map(Number);
  const [opEndH, opEndM] = operating.end.split(":").map(Number);

  // fromZonedTime accepts an ISO-like string and treats it as wall-clock in the target zone
  const opStartUtc = fromZonedTime(`${input.date}T${pad(opStartH)}:${pad(opStartM)}:00`, ZURICH_TZ);
  const opEndUtc = fromZonedTime(`${input.date}T${pad(opEndH)}:${pad(opEndM)}:00`, ZURICH_TZ);

  const durationMs = input.duration * 60 * 60 * 1000;

  const slots: string[] = [];
  let cursor = opStartUtc;
  while (true) {
    const slotEnd = new Date(cursor.getTime() + durationMs);
    if (slotEnd > opEndUtc) break;

    if (!intersectsAny(cursor, slotEnd, input.busy, buffer)) {
      // Format as Zurich local HH:mm — formatInTimeZone is host-TZ-independent
      slots.push(formatInTimeZone(cursor, ZURICH_TZ, "HH:mm"));
    }

    cursor = addMinutes(cursor, step);
  }

  return slots;
}

function intersectsAny(start: Date, end: Date, busy: BusyInterval[], bufferMinutes: number): boolean {
  for (const b of busy) {
    const bStart = addMinutes(b.start, -bufferMinutes);
    const bEnd = addMinutes(b.end, bufferMinutes);
    if (start < bEnd && end > bStart) return true;
  }
  return false;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Convert Zurich-local "YYYY-MM-DD" + "HH:mm" + duration into UTC start/end Dates.
 * Used by API hold creation to persist the booking range.
 */
export function zurichLocalToUtcRange(date: string, time: string, durationHours: number): {
  startUtc: Date;
  endUtc: Date;
} {
  const startUtc = fromZonedTime(`${date}T${time}:00`, ZURICH_TZ);
  const endUtc = new Date(startUtc.getTime() + durationHours * 60 * 60 * 1000);
  return { startUtc, endUtc };
}

/** Get the Zurich-local hour (0-23) for a UTC date — used by pricing for late-night calc. */
export function getZurichHour(utc: Date): number {
  const local = toZonedTime(utc, ZURICH_TZ);
  return local.getHours();
}

/** Format a UTC Date as Zurich-local string. Host-TZ-independent. Returns "—" for invalid inputs. */
export function formatZurich(utc: Date | string | null | undefined, pattern = "EEEE, d MMM yyyy · HH:mm"): string {
  if (utc == null || utc === "") return "—";
  const d = typeof utc === "string" ? new Date(utc) : utc;
  if (isNaN(d.getTime())) return "—";
  return formatInTimeZone(d, ZURICH_TZ, pattern);
}

/** Day of week (0=Sun, 6=Sat) in Zurich local. */
export function getZurichDayOfWeek(utc: Date | string): number {
  const d = typeof utc === "string" ? new Date(utc) : utc;
  return toZonedTime(d, ZURICH_TZ).getDay();
}
