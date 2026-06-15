/**
 * GET /api/calendar/owner.ics?token=<OWNER_ICS_TOKEN>
 *
 * Returns a live iCal (.ics) feed of all confirmed bookings — used by the
 * owner to subscribe in Apple/Google/Outlook calendar.
 *
 * One-way (booking → calendar). Auto-refreshes every ~hour by the calendar app.
 * Protected by `OWNER_ICS_TOKEN` env var (random string).
 */

import { NextResponse } from "next/server";
import ical from "ical-generator";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  const expected = process.env.OWNER_ICS_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "feed_disabled" }, { status: 503 });
  }
  if (token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  // Pull confirmed bookings from the past 30 days through the next 365 days
  const from = new Date(); from.setDate(from.getDate() - 30);
  const to = new Date(); to.setDate(to.getDate() + 365);

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id, start_time, end_time, duration_hours, total_chf,
      guest_name, guest_email, guest_phone, guest_company, shoot_type,
      payment_method, status, manage_token
    `)
    .gte("start_time", from.toISOString())
    .lte("start_time", to.toISOString())
    .in("status", ["confirmed", "completed"])
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const cal = ical({
    name: "CEE Studio — Bookings",
    description: "Confirmed studio bookings",
    timezone: "Europe/Zurich",
    prodId: { company: "CEE Studio", product: "Bookings", language: "DE" },
    ttl: 60 * 60, // hint to clients: refresh hourly
  });

  for (const b of bookings ?? []) {
    const summary = `${b.duration_hours}h · ${b.guest_name ?? "Guest"}${b.guest_company ? " · " + b.guest_company : ""}`;
    const lines = [
      `${b.guest_name ?? ""}`,
      b.guest_email ? `Email: ${b.guest_email}` : null,
      b.guest_phone ? `Phone: ${b.guest_phone}` : null,
      b.guest_company ? `Company: ${b.guest_company}` : null,
      b.shoot_type ? `Shoot: ${b.shoot_type}` : null,
      `Total: CHF ${(b.total_chf / 100).toFixed(2)}`,
      `Payment: ${b.payment_method}`,
      `Manage: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ceestudio.ch"}/booking/manage/${b.manage_token}`,
    ]
      .filter(Boolean)
      .join("\n");

    cal.createEvent({
      id: b.id,
      start: new Date(b.start_time),
      end: new Date(b.end_time),
      summary,
      description: lines,
      location: "Thurgauerstrasse 117, 8152 Glattpark (Opfikon)",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ceestudio.ch"}/booking/manage/${b.manage_token}`,
    });
  }

  return new NextResponse(cal.toString(), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="ceestudio-bookings.ics"',
      "Cache-Control": "private, max-age=600",
    },
  });
}
