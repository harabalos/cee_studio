/**
 * GET /api/availability?date=YYYY-MM-DD&duration=4
 *
 * Returns the available start times (HH:mm in Zurich local) for the given
 * date + duration, taking into account confirmed bookings, non-expired holds,
 * and admin-blocked dates.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { addDays, parseISO } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { computeAvailableSlots } from "@/lib/booking/availability";
import type { Duration } from "@/types/booking";

const ZURICH_TZ = "Europe/Zurich";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration: z.coerce.number().refine((n) => [1, 2, 3, 4, 8].includes(n)),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = querySchema.safeParse({
    date: url.searchParams.get("date"),
    duration: url.searchParams.get("duration"),
  });

  if (!params.success) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  const { date, duration } = params.data;

  // Window: the whole calendar day in Zurich tz, expanded slightly to
  // capture any cross-midnight bookings (defensive — we cap at 22:00 anyway).
  const dayStartLocal = parseLocalMidnight(date);
  const dayEndLocal = parseLocalMidnight(formatDate(addDays(parseISO(date), 1)));
  const dayStartUtc = fromZonedTime(dayStartLocal, ZURICH_TZ);
  const dayEndUtc = fromZonedTime(dayEndLocal, ZURICH_TZ);

  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  // Confirmed bookings overlapping this day
  const bookingsRes = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("status", "confirmed")
    .lt("start_time", dayEndUtc.toISOString())
    .gt("end_time", dayStartUtc.toISOString());

  // Non-expired holds overlapping this day
  const holdsRes = await supabase
    .from("pending_holds")
    .select("start_time, end_time")
    .gt("expires_at", nowIso)
    .lt("start_time", dayEndUtc.toISOString())
    .gt("end_time", dayStartUtc.toISOString());

  // Admin-blocked dates overlapping
  const blockedRes = await supabase
    .from("blocked_dates")
    .select("start_time, end_time")
    .lt("start_time", dayEndUtc.toISOString())
    .gt("end_time", dayStartUtc.toISOString());

  if (bookingsRes.error || holdsRes.error || blockedRes.error) {
    console.error("[availability] db error", {
      bookings: bookingsRes.error,
      holds: holdsRes.error,
      blocked: blockedRes.error,
    });
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const busy = [
    ...(bookingsRes.data ?? []),
    ...(holdsRes.data ?? []),
    ...(blockedRes.data ?? []),
  ].map((b) => ({
    start: new Date(b.start_time),
    end: new Date(b.end_time),
  }));

  // Settings — operating hours + buffer
  const settingsRes = await supabase
    .from("settings")
    .select("operating_hours, buffer_minutes")
    .eq("id", 1)
    .single();

  const operatingHours = (settingsRes.data?.operating_hours as { start: string; end: string }) ?? {
    start: "08:00",
    end: "22:00",
  };
  const bufferMinutes = settingsRes.data?.buffer_minutes ?? 30;

  const slots = computeAvailableSlots({
    date,
    duration: duration as Duration,
    busy,
    operatingHours,
    bufferMinutes,
  });

  return NextResponse.json({ date, duration, slots });
}

function parseLocalMidnight(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0));
}

function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
