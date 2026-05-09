/**
 * High-level email helpers for the booking flow.
 * Builds React Email components and dispatches via lib/email/send.
 */

import ical from "ical-generator";
import { sendEmail } from "./send";
import { formatZurich } from "@/lib/booking/availability";
import { formatChf } from "@/lib/booking/pricing";
import BookingConfirmationCustomer from "@/emails/BookingConfirmationCustomer";
import BookingConfirmationOwner from "@/emails/BookingConfirmationOwner";
import BookingCancellationCustomer from "@/emails/BookingCancellationCustomer";
import BookingCancellationOwner from "@/emails/BookingCancellationOwner";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type Lang = "de" | "en" | "fr" | "it";

export type BookingEmailData = {
  id: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  base_price_chf: number;
  addons_price_chf: number;
  late_night_surcharge_chf: number;
  total_chf: number;
  payment_method: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_company: string | null;
  shoot_type: string | null;
  manage_token: string;
  preferred_lang: Lang;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const STUDIO_ADDRESS = "Thurgauerstrasse 117, 8152 Glattpark (Opfikon)";

const SUBJECTS = {
  customer_confirmation: {
    de: "Buchung bestätigt — CEE Studio",
    en: "Booking confirmed — CEE Studio",
    fr: "Réservation confirmée — CEE Studio",
    it: "Prenotazione confermata — CEE Studio",
  },
  customer_cancellation: {
    de: "Buchung storniert — CEE Studio",
    en: "Booking cancelled — CEE Studio",
    fr: "Réservation annulée — CEE Studio",
    it: "Prenotazione annullata — CEE Studio",
  },
};

async function getStudioSecrets() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("settings").select("door_code, wifi_password").eq("id", 1).single();
  return {
    doorCode: data?.door_code ?? "",
    wifiPassword: data?.wifi_password ?? "",
  };
}

function buildIcs(booking: BookingEmailData) {
  const cal = ical({ name: "CEE Studio Booking" });
  cal.createEvent({
    start: new Date(booking.start_time),
    end: new Date(booking.end_time),
    summary: "CEE Studio Booking",
    description: `${booking.duration_hours}h booking · ${formatChf(booking.total_chf)}`,
    location: STUDIO_ADDRESS,
    url: `${SITE_URL}/booking/manage/${booking.manage_token}`,
  });
  return cal.toString();
}

export async function sendBookingConfirmation(booking: BookingEmailData) {
  if (!booking.guest_email) return;
  const lang = booking.preferred_lang ?? "de";
  const secrets = await getStudioSecrets();
  const ics = buildIcs(booking);

  const accountUrl = booking.guest_email
    ? `${SITE_URL}/login?email=${encodeURIComponent(booking.guest_email)}&next=${encodeURIComponent("/account")}`
    : `${SITE_URL}/login?next=${encodeURIComponent("/account")}`;

  const props = {
    lang,
    name: booking.guest_name ?? "",
    startStr: formatZurich(booking.start_time),
    endStr: formatZurich(booking.end_time, "HH:mm"),
    durationHours: booking.duration_hours,
    totalStr: formatChf(booking.total_chf),
    address: STUDIO_ADDRESS,
    doorCode: secrets.doorCode,
    wifiPassword: secrets.wifiPassword,
    manageUrl: `${SITE_URL}/booking/manage/${booking.manage_token}`,
    accountUrl,
  };

  await sendEmail({
    to: booking.guest_email,
    subject: SUBJECTS.customer_confirmation[lang],
    react: BookingConfirmationCustomer(props),
    template: "booking_confirmation_customer",
    lang,
    attachments: [{ filename: "booking.ics", content: ics }],
    metadata: { booking_id: booking.id },
  });
}

export async function sendOwnerNotification(booking: BookingEmailData) {
  const ownerEmails = (process.env.ADMIN_ALLOWED_EMAILS ?? "info@ceestudio.ch").split(",").map((e) => e.trim()).filter(Boolean);

  for (const to of ownerEmails) {
    await sendEmail({
      to,
      subject: `New booking — ${formatZurich(booking.start_time)} · ${formatChf(booking.total_chf)}`,
      react: BookingConfirmationOwner({
        name: booking.guest_name ?? "",
        email: booking.guest_email ?? "",
        phone: booking.guest_phone ?? "",
        company: booking.guest_company ?? "",
        shootType: booking.shoot_type ?? "",
        startStr: formatZurich(booking.start_time),
        endStr: formatZurich(booking.end_time, "HH:mm"),
        durationHours: booking.duration_hours,
        totalStr: formatChf(booking.total_chf),
        paymentMethod: booking.payment_method,
        manageUrl: `${SITE_URL}/booking/manage/${booking.manage_token}`,
      }),
      template: "booking_confirmation_owner",
      lang: "de",
      metadata: { booking_id: booking.id },
    });
  }
}

export async function sendCancellationCustomer(booking: BookingEmailData, refundedChf: number) {
  if (!booking.guest_email) return;
  const lang = booking.preferred_lang ?? "de";

  await sendEmail({
    to: booking.guest_email,
    subject: SUBJECTS.customer_cancellation[lang],
    react: BookingCancellationCustomer({
      lang,
      name: booking.guest_name ?? "",
      startStr: formatZurich(booking.start_time),
      refundStr: refundedChf > 0 ? formatChf(refundedChf) : null,
    }),
    template: "booking_cancellation_customer",
    lang,
    metadata: { booking_id: booking.id, refund: refundedChf },
  });
}

export async function sendCancellationOwner(booking: BookingEmailData) {
  const ownerEmails = (process.env.ADMIN_ALLOWED_EMAILS ?? "info@ceestudio.ch").split(",").map((e) => e.trim()).filter(Boolean);

  for (const to of ownerEmails) {
    await sendEmail({
      to,
      subject: `Cancelled — ${formatZurich(booking.start_time)} · ${booking.guest_name ?? ""}`,
      react: BookingCancellationOwner({
        name: booking.guest_name ?? "",
        email: booking.guest_email ?? "",
        phone: booking.guest_phone ?? "",
        startStr: formatZurich(booking.start_time),
      }),
      template: "booking_cancellation_owner",
      lang: "de",
      metadata: { booking_id: booking.id },
    });
  }
}
