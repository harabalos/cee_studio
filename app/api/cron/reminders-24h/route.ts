/**
 * GET /api/cron/reminders-24h
 *
 * Sends a reminder email to customers whose booking starts "tomorrow"
 * (next calendar day in Europe/Zurich). Runs once per day around 09:00 UTC
 * (~10:00–11:00 Zurich).
 *
 * Idempotent via the `reminder_24h_sent` boolean on bookings — bookings that
 * already received a reminder are skipped.
 *
 * Auth: requires Authorization: Bearer ${CRON_SECRET}.
 */

import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import BookingReminder24h from "@/emails/BookingReminder24h";

const ZURICH_TZ = "Europe/Zurich";
const STUDIO_ADDRESS = "Thurgauerstrasse 117, 8152 Glattpark (Opfikon)";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // "Tomorrow" in Europe/Zurich
  const nowZurichString = formatInTimeZone(new Date(), ZURICH_TZ, "yyyy-MM-dd");
  const todayZurich = new Date(nowZurichString);
  const tomorrowZurich = addDays(todayZurich, 1);

  const tomorrowStr = formatInTimeZone(tomorrowZurich, ZURICH_TZ, "yyyy-MM-dd");
  const startUtc = fromZonedTime(`${tomorrowStr}T00:00:00`, ZURICH_TZ);
  const endUtc = fromZonedTime(`${tomorrowStr}T23:59:59`, ZURICH_TZ);

  const supabase = getSupabaseAdmin();

  // Settings — door code, wifi
  const settingsRes = await supabase
    .from("settings")
    .select("door_code, wifi_password")
    .eq("id", 1)
    .single();
  const doorCode = settingsRes.data?.door_code ?? "";
  const wifiPassword = settingsRes.data?.wifi_password ?? "";

  // Find tomorrow's confirmed bookings that haven't been reminded yet and have an email
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, duration_hours, guest_name, guest_email, manage_token, preferred_lang, addons_price_chf")
    .eq("status", "confirmed")
    .eq("reminder_24h_sent", false)
    .gte("start_time", startUtc.toISOString())
    .lte("start_time", endUtc.toISOString())
    .not("guest_email", "is", null);

  if (error) {
    console.error("[reminders-24h] db error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "No bookings for tomorrow" });
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ceestudio.ch";
  // BCC the owner on every reminder so they get a copy in their own inbox
  // (visibility that the automated email actually went out).
  const ownerBcc = (process.env.ADMIN_ALLOWED_EMAILS ?? "info@ceestudio.ch")
    .split(",").map((e) => e.trim()).filter(Boolean);
  let sent = 0;
  const failures: string[] = [];

  for (const b of bookings) {
    if (!b.guest_email) continue;
    const lang = (b.preferred_lang ?? "de") as "de" | "en" | "fr" | "it";
    const startStr = formatInTimeZone(b.start_time, ZURICH_TZ, "EEEE, d MMM yyyy · HH:mm");
    try {
      await sendEmail({
        to: b.guest_email,
        subject: subjectFor(lang),
        react: BookingReminder24h({
          lang,
          name: b.guest_name ?? "",
          startStr,
          durationHours: b.duration_hours,
          address: STUDIO_ADDRESS,
          doorCode,
          wifiPassword,
          premium: (b.addons_price_chf ?? 0) > 0,
          manageUrl: `${SITE_URL}/booking/manage/${b.manage_token}`,
        }),
        bcc: ownerBcc,
        template: "booking_reminder_24h",
        lang,
        metadata: { booking_id: b.id },
      });
      await supabase.from("bookings").update({ reminder_24h_sent: true }).eq("id", b.id);
      sent++;
    } catch (e) {
      console.error("[reminders-24h] send failed for", b.id, e);
      failures.push(b.id);
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failures: failures.length,
    bookingsConsidered: bookings.length,
  });
}

function subjectFor(lang: "de" | "en" | "fr" | "it"): string {
  return {
    de: "Erinnerung: Dein Shooting morgen — CEE Studio",
    en: "Reminder: your shoot tomorrow — CEE Studio",
    fr: "Rappel : ton shooting demain — CEE Studio",
    it: "Promemoria: il tuo shoot domani — CEE Studio",
  }[lang];
}
