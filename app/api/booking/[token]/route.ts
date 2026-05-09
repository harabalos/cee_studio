/**
 * GET /api/booking/[token]
 *
 * Public, read-only details of a booking by manage token. Used by the
 * /booking/manage/[token] page to render booking info + cancellation eligibility.
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { evaluateCancellation } from "@/lib/booking/cancellation";

// Always read fresh from DB — booking status changes on cancel/refund and
// the manage page polls this after mutation.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const supabase = getSupabaseAdmin();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      id, start_time, end_time, duration_hours,
      base_price_chf, addons_price_chf, late_night_surcharge_chf, total_chf,
      payment_method, payment_status, status,
      guest_name, guest_email, guest_phone, guest_company, shoot_type,
      preferred_lang, manage_token, cancelled_at, refund_chf,
      booking_addons ( addon_key, price_chf )
    `)
    .eq("manage_token", params.token)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const cancellation = booking.status === "confirmed"
    ? evaluateCancellation({ bookingStartUtc: booking.start_time, totalPaidChf: booking.total_chf })
    : null;

  return NextResponse.json({ booking, cancellation });
}
