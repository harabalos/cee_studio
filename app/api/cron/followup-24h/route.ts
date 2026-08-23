/**
 * GET /api/cron/followup-24h
 *
 * Sends a thank-you email to guests whose booking finished "yesterday"
 * (previous calendar day in Europe/Zurich). Runs once per day around
 * 09:30 UTC — after auto-complete (04:00 UTC) has already flipped finished
 * bookings to `completed`.
 *
 * Idempotent via email_log: a booking is skipped if it already has a
 * template="booking_followup" row with status="sent". (No new column on
 * `bookings` — reuses the existing send log instead of a schema migration.)
 *
 * Auth: requires Authorization: Bearer ${CRON_SECRET}.
 */

import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import BookingFollowUp from "@/emails/BookingFollowUp";

const ZURICH_TZ = "Europe/Zurich";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // "Yesterday" in Europe/Zurich
  const nowZurichString = formatInTimeZone(new Date(), ZURICH_TZ, "yyyy-MM-dd");
  const todayZurich = new Date(nowZurichString);
  const yesterdayZurich = addDays(todayZurich, -1);

  const yesterdayStr = formatInTimeZone(yesterdayZurich, ZURICH_TZ, "yyyy-MM-dd");
  const startUtc = fromZonedTime(`${yesterdayStr}T00:00:00`, ZURICH_TZ);
  const endUtc = fromZonedTime(`${yesterdayStr}T23:59:59`, ZURICH_TZ);

  const supabase = getSupabaseAdmin();

  // Bookings that finished yesterday. `completed` is the normal state by now
  // (auto-complete already ran); `confirmed` is included as a fallback in
  // case that cron hasn't caught this one yet. Cancelled/no-show excluded.
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, guest_name, guest_email, preferred_lang")
    .in("status", ["completed", "confirmed"])
    .gte("end_time", startUtc.toISOString())
    .lte("end_time", endUtc.toISOString())
    .not("guest_email", "is", null);

  if (error) {
    console.error("[followup-24h] db error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "No bookings finished yesterday" });
  }

  // Idempotency check: which of these bookings already got a follow-up?
  const { data: sentLogs } = await supabase
    .from("email_log")
    .select("metadata")
    .eq("template", "booking_followup")
    .eq("status", "sent");
  const alreadySent = new Set(
    (sentLogs ?? [])
      .map((l) => (l.metadata as { booking_id?: string } | null)?.booking_id)
      .filter(Boolean)
  );

  const ownerBcc = (process.env.ADMIN_ALLOWED_EMAILS ?? "info@ceestudio.ch")
    .split(",").map((e) => e.trim()).filter(Boolean);

  let sent = 0;
  const failures: string[] = [];
  const skipped: string[] = [];

  for (const b of bookings) {
    if (!b.guest_email) continue;
    if (alreadySent.has(b.id)) {
      skipped.push(b.id);
      continue;
    }
    const lang = (b.preferred_lang ?? "de") as "de" | "en" | "fr" | "it";
    try {
      await sendEmail({
        to: b.guest_email,
        subject: subjectFor(lang),
        react: BookingFollowUp({ lang, name: b.guest_name ?? "" }),
        bcc: ownerBcc,
        template: "booking_followup",
        lang,
        metadata: { booking_id: b.id },
      });
      sent++;
    } catch (e) {
      console.error("[followup-24h] send failed for", b.id, e);
      failures.push(b.id);
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failures: failures.length,
    skippedAlreadySent: skipped.length,
    bookingsConsidered: bookings.length,
  });
}

function subjectFor(lang: "de" | "en" | "fr" | "it"): string {
  return {
    de: "Vielen Dank für Ihr Shooting — CEE Studio",
    en: "Thank you for your shoot — CEE Studio",
    fr: "Merci pour ton shooting — CEE Studio",
    it: "Grazie per il tuo shooting — CEE Studio",
  }[lang];
}
