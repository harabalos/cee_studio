/**
 * Date helpers for QA tests — produce dates relative to "now" that
 * are guaranteed to fall on weekdays in the future, in Europe/Zurich.
 *
 * Used so test scenarios stay valid no matter when the suite runs.
 */

import { format } from "date-fns";

export type QAFutureDate = {
  date: string; // YYYY-MM-DD (Zurich local)
  weekday: number; // 0-6, 0=Sunday
};

/**
 * Returns a date `daysFromNow` ahead that lands on a weekday (Mon-Fri).
 * If the target day lands on a weekend, advances to the next Monday.
 */
export function futureWeekday(daysFromNow: number): QAFutureDate {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  // Bump weekends → Monday
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return {
    date: format(d, "yyyy-MM-dd"),
    weekday: d.getDay(),
  };
}

/**
 * Returns the next upcoming Saturday (for weekend-blocking tests).
 */
export function nextSaturday(): QAFutureDate {
  const d = new Date();
  while (d.getDay() !== 6) {
    d.setDate(d.getDate() + 1);
  }
  // Make sure it's at least 7 days out to clear past dates
  if (d.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    d.setDate(d.getDate() + 7);
  }
  return { date: format(d, "yyyy-MM-dd"), weekday: 6 };
}
