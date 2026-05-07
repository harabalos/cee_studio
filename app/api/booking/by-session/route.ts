/**
 * GET /api/booking/by-session?session_id=cs_...
 *
 * Used by /booking/success to wait for the webhook to finalize the booking.
 * Returns minimal booking info (or 202 while still pending).
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "missing_session" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, duration_hours, total_chf, manage_token, guest_name, preferred_lang")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ booking: null }, { status: 202 });
  }
  return NextResponse.json({ booking });
}
