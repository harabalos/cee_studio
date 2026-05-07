/**
 * Admin dashboard stats — pure aggregation queries against bookings.
 * All results in CHF cents (display layer formats with formatChf).
 */

import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type BookingRow = {
  id: string;
  start_time: string;
  duration_hours: number;
  total_chf: number;
  payment_status: string;
  status: string;
};

export type DashboardStats = {
  today: { bookings: BookingRow[]; revenue: number; count: number };
  week:  { revenue: number; count: number };
  month: { revenue: number; count: number; previousMonth: number; deltaPct: number | null };
  next7Days: { count: number };
  upcomingThisWeek: BookingRow[];
};

/** Sum total_chf for confirmed/completed bookings within an inclusive window. */
function sumPaid(rows: BookingRow[]): number {
  return rows
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .filter((b) => b.payment_status === "paid")
    .reduce((s, b) => s + b.total_chf, 0);
}

export async function getDashboardStats(now = new Date()): Promise<DashboardStats> {
  const supabase = getSupabaseAdmin();

  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const monthStart = startOfMonth(now).toISOString();
  const monthEnd = endOfMonth(now).toISOString();
  const prevMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
  const prevMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();
  const next7End = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Single broad query, then partition in JS — fewer roundtrips.
  const broadStart = prevMonthStart < weekStart ? prevMonthStart : weekStart;
  const broadEnd = next7End > monthEnd ? next7End : monthEnd;

  const { data: all } = await supabase
    .from("bookings")
    .select("id, start_time, duration_hours, total_chf, payment_status, status")
    .gte("start_time", broadStart)
    .lte("start_time", broadEnd)
    .order("start_time", { ascending: true });

  const rows = (all ?? []) as BookingRow[];

  const within = (s: string, e: string) =>
    rows.filter((b) => b.start_time >= s && b.start_time <= e);

  const todayRows = within(todayStart, todayEnd);
  const weekRows = within(weekStart, weekEnd);
  const monthRows = within(monthStart, monthEnd);
  const prevMonthRows = within(prevMonthStart, prevMonthEnd);
  const next7Rows = within(now.toISOString(), next7End);

  const monthRev = sumPaid(monthRows);
  const prevMonthRev = sumPaid(prevMonthRows);
  const deltaPct = prevMonthRev > 0 ? Math.round(((monthRev - prevMonthRev) / prevMonthRev) * 100) : null;

  return {
    today: {
      bookings: todayRows.filter((b) => b.status === "confirmed" || b.status === "completed"),
      revenue: sumPaid(todayRows),
      count: todayRows.filter((b) => b.status === "confirmed" || b.status === "completed").length,
    },
    week:  { revenue: sumPaid(weekRows),  count: weekRows.filter((b) => b.status === "confirmed" || b.status === "completed").length },
    month: {
      revenue: monthRev,
      count: monthRows.filter((b) => b.status === "confirmed" || b.status === "completed").length,
      previousMonth: prevMonthRev,
      deltaPct,
    },
    next7Days: { count: next7Rows.filter((b) => b.status === "confirmed").length },
    upcomingThisWeek: weekRows.filter((b) => b.status === "confirmed" && new Date(b.start_time) > now).slice(0, 10),
  };
}
