/**
 * GET /api/cron/auto-complete
 *
 * Daily cron that flips bookings from `confirmed` → `completed` once their end_time
 * has passed (with 1-hour grace, in case admin wants to mark no-show first).
 *
 * Also useful for revenue / completed-bookings stats.
 *
 * Auth: requires Authorization: Bearer ${CRON_SECRET}.
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const GRACE_HOURS = 1;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - GRACE_HOURS * 60 * 60 * 1000).toISOString();
  const supabase = getSupabaseAdmin();

  const { error, count } = await supabase
    .from("bookings")
    .update({ status: "completed" }, { count: "exact" })
    .eq("status", "confirmed")
    .lt("end_time", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, completed: count ?? 0 });
}
