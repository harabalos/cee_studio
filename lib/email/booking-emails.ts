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
import {
  buildUsageAgreementProps,
  buildInvoiceProps,
  generateUsageAgreementPdf,
  generateInvoicePdf,
} from "@/lib/pdf/generate";

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

async function getInvoicingSettings() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("settings")
    .select("bank_iban, twint_number, next_invoice_number, invoice_prefix")
    .eq("id", 1)
    .single();
  return {
    bankIban: data?.bank_iban ?? "CH3000700114902030289",
    twintNumber: data?.twint_number ?? "076 240 20 56",
    nextInvoiceNumber: (data?.next_invoice_number as number) ?? 1010,
    invoicePrefix: (data?.invoice_prefix as string) ?? "",
  };
}

/**
 * Atomically allocate the next invoice number and persist booking.invoice_number.
 * Returns the formatted invoice string (prefix + number).
 */
async function allocateInvoiceNumber(bookingId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const inv = await getInvoicingSettings();
  const formatted = `${inv.invoicePrefix}${inv.nextInvoiceNumber}`;

  // Bump counter + record on the booking. If two webhooks race we just
  // get adjacent numbers — acceptable for a low-volume studio.
  await Promise.all([
    supabase
      .from("settings")
      .update({ next_invoice_number: inv.nextInvoiceNumber + 1 })
      .eq("id", 1),
    supabase
      .from("bookings")
      .update({ invoice_number: formatted })
      .eq("id", bookingId)
      .is("invoice_number", null),
  ]);

  return formatted;
}

async function buildPdfAttachments(booking: BookingEmailData): Promise<
  { filename: string; content: Buffer }[]
> {
  const lang = booking.preferred_lang ?? "de";
  const invoiceNo = await allocateInvoiceNumber(booking.id);
  const inv = await getInvoicingSettings();

  // Fetch add-ons to itemise them on the invoice
  const supabase = getSupabaseAdmin();
  const { data: addons } = await supabase
    .from("booking_addons")
    .select("addon_key, price_chf")
    .eq("booking_id", booking.id);

  const usageAgreementPdf = await generateUsageAgreementPdf(
    buildUsageAgreementProps({
      bookingId: booking.id,
      startTime: booking.start_time,
      endTime: booking.end_time,
      durationHours: booking.duration_hours,
      totalChf: booking.total_chf,
      customerName: booking.guest_name ?? "",
      customerEmail: booking.guest_email ?? "",
      customerPhone: booking.guest_phone ?? "",
      customerCompany: booking.guest_company,
      lang,
    })
  );

  const invoicePdf = await generateInvoicePdf(
    buildInvoiceProps({
      invoiceNo,
      startTime: booking.start_time,
      durationHours: booking.duration_hours,
      basePriceChf: booking.base_price_chf,
      addons: (addons ?? []).map((a) => ({
        key: a.addon_key as string,
        priceChf: a.price_chf as number,
      })),
      lateNightChf: booking.late_night_surcharge_chf,
      totalChf: booking.total_chf,
      customerName: booking.guest_name ?? "",
      customerEmail: booking.guest_email ?? "",
      bankIban: inv.bankIban,
      twintNumber: inv.twintNumber,
      lang,
    })
  );

  return [
    {
      filename: `Nutzungsvertrag_${invoiceNo}.pdf`,
      content: usageAgreementPdf,
    },
    {
      filename: `Rechnung_${invoiceNo}.pdf`,
      content: invoicePdf,
    },
  ];
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

  // Auto-generate Nutzungsvertrag + Rechnung PDFs. Best-effort: if PDF
  // rendering fails for any reason, the email still goes out with just
  // the .ics so the customer isn't blocked.
  let pdfAttachments: { filename: string; content: Buffer }[] = [];
  try {
    pdfAttachments = await buildPdfAttachments(booking);
  } catch (e) {
    console.error("[booking-emails] PDF generation failed (non-fatal)", e);
  }

  await sendEmail({
    to: booking.guest_email,
    subject: SUBJECTS.customer_confirmation[lang],
    react: BookingConfirmationCustomer(props),
    template: "booking_confirmation_customer",
    lang,
    attachments: [
      { filename: "booking.ics", content: ics },
      ...pdfAttachments,
    ],
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
