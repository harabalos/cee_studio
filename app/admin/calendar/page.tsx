import Link from "next/link";
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, format, addMonths, subMonths } from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { formatChf } from "@/lib/booking/pricing";

export const dynamic = "force-dynamic";

const ZURICH_TZ = "Europe/Zurich";

type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_chf: number;
  payment_method: string;
  status: string;
  guest_name: string | null;
};

export default async function AdminCalendarPage({ searchParams }: { searchParams: { m?: string } }) {
  // Determine the month to render. ?m=YYYY-MM, default = current month (Zurich)
  const todayZ = formatInTimeZone(new Date(), ZURICH_TZ, "yyyy-MM-dd");
  const monthParam = searchParams.m ?? todayZ.slice(0, 7); // YYYY-MM
  const [yy, mm] = monthParam.split("-").map(Number);
  const monthStart = new Date(yy, (mm ?? 1) - 1, 1);
  const monthEnd = endOfMonth(monthStart);

  const monthStartZ = startOfMonth(monthStart);
  const queryStart = fromZonedTime(`${formatInTimeZone(monthStartZ, ZURICH_TZ, "yyyy-MM-dd")}T00:00:00`, ZURICH_TZ);
  const queryEnd = fromZonedTime(`${formatInTimeZone(monthEnd, ZURICH_TZ, "yyyy-MM-dd")}T23:59:59`, ZURICH_TZ);

  const supabase = getSupabaseAdmin();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, duration_hours, total_chf, payment_method, status, guest_name")
    .gte("start_time", queryStart.toISOString())
    .lte("start_time", queryEnd.toISOString())
    .in("status", ["confirmed", "completed"])
    .order("start_time", { ascending: true });

  // Group bookings by Zurich-local date
  const byDate = new Map<string, Booking[]>();
  for (const b of bookings ?? []) {
    const dateKey = formatInTimeZone(b.start_time, ZURICH_TZ, "yyyy-MM-dd");
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(b as Booking);
  }

  // Build the calendar grid: include leading empty cells from prev month so the
  // first row aligns to Monday (dow 1).
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDow = (getDay(monthStart) + 6) % 7; // Mon=0 ... Sun=6
  const cells: ({ date: Date; bookings: Booking[] } | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (const d of days) {
    const key = format(d, "yyyy-MM-dd");
    cells.push({ date: d, bookings: byDate.get(key) ?? [] });
  }
  // Pad trailing to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = format(monthStart, "MMMM yyyy");
  const prevMonth = format(subMonths(monthStart, 1), "yyyy-MM");
  const nextMonth = format(addMonths(monthStart, 1), "yyyy-MM");

  // Month-total stats
  const totalRevenue = (bookings ?? [])
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .filter((b) => b.payment_method !== "membership_hours")
    .reduce((s, b) => s + b.total_chf, 0);
  const totalCount = (bookings ?? []).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-seasons text-2xl md:text-3xl text-brand">Calendar</h1>
          <p className="text-sm text-foreground/60">{monthLabel} · {totalCount} bookings · {formatChf(totalRevenue)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/calendar?m=${prevMonth}`} className="text-xs uppercase tracking-widest border border-accent/40 hover:border-brand px-3 py-2">
            ← Prev
          </Link>
          <Link href={`/admin/calendar?m=${todayZ.slice(0, 7)}`} className="text-xs uppercase tracking-widest border border-accent/40 hover:border-brand px-3 py-2">
            Today
          </Link>
          <Link href={`/admin/calendar?m=${nextMonth}`} className="text-xs uppercase tracking-widest border border-accent/40 hover:border-brand px-3 py-2">
            Next →
          </Link>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 text-[10px] uppercase tracking-widest text-foreground/50">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="aspect-square sm:aspect-auto sm:min-h-[100px]" />;
          const isToday = format(cell.date, "yyyy-MM-dd") === todayZ;
          const isWeekend = [0, 6].includes(getDay(cell.date));
          return (
            <div
              key={i}
              className={`relative border bg-background p-1.5 md:p-2 min-h-[60px] sm:min-h-[100px] ${
                isToday ? "border-brand bg-brand/5" : "border-accent/30"
              } ${isWeekend ? "bg-accent/5" : ""}`}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className={`text-xs font-medium ${isToday ? "text-brand" : ""}`}>
                  {format(cell.date, "d")}
                </span>
                {cell.bookings.length > 0 && (
                  <span className="text-[9px] text-foreground/50">{cell.bookings.length}</span>
                )}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {cell.bookings.slice(0, 3).map((b) => (
                  <Link
                    key={b.id}
                    href={`/admin/bookings/${b.id}/edit`}
                    className="block text-[9px] md:text-[10px] bg-brand text-background px-1 py-0.5 truncate hover:bg-brand-hover"
                    title={`${formatInTimeZone(b.start_time, ZURICH_TZ, "HH:mm")} · ${b.guest_name} · ${b.duration_hours}h`}
                  >
                    {formatInTimeZone(b.start_time, ZURICH_TZ, "HH:mm")} {b.guest_name}
                  </Link>
                ))}
                {cell.bookings.length > 3 && (
                  <p className="text-[9px] text-foreground/50 italic">
                    +{cell.bookings.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
