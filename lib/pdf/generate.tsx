/**
 * Server-side PDF generation helpers.
 *
 * Renders the React-PDF components (UsageAgreement, Invoice) to Buffers
 * that can be attached to outgoing emails via Resend.
 *
 * Why renderToBuffer (not renderToStream / renderToFile):
 *   - Resend attachments need raw Buffer content
 *   - Buffer keeps the whole pipeline in memory, no temp files needed
 *   - Generation takes ~50-150ms per document on Vercel edge — acceptable
 */

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { UsageAgreement, type UsageAgreementProps } from "./UsageAgreement";
import { Invoice, type InvoiceProps } from "./Invoice";

export async function generateUsageAgreementPdf(
  props: UsageAgreementProps
): Promise<Buffer> {
  return renderToBuffer(<UsageAgreement {...props} />);
}

export async function generateInvoicePdf(props: InvoiceProps): Promise<Buffer> {
  return renderToBuffer(<Invoice {...props} />);
}

// =====================================================================
// Helpers for formatting data the way the PDFs expect it
// =====================================================================

const ZURICH_TZ = "Europe/Zurich";

function fmtChf(cents: number): string {
  return `CHF ${(cents / 100).toFixed(2)}`;
}

function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  // Swiss DD.MM.YYYY format regardless of UI locale — universally readable
  return date.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: ZURICH_TZ,
  });
}

function fmtTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZURICH_TZ,
  });
}

function fmtTimeRange(start: Date | string, end: Date | string): string {
  return `${fmtTime(start)} - ${fmtTime(end)}`;
}

/**
 * Build the props for a UsageAgreement PDF from a booking row.
 */
export function buildUsageAgreementProps(opts: {
  bookingId: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalChf: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string | null;
  lang: "de" | "en" | "fr" | "it";
}): UsageAgreementProps {
  const lang = opts.lang;
  const serviceLabel: Record<typeof lang, string> = {
    de: `Studio Miete (${opts.durationHours}h) inkl. Setup- & Abbauzeit`,
    en: `Studio rental (${opts.durationHours}h) incl. setup & breakdown time`,
    fr: `Location studio (${opts.durationHours}h) inclus setup & démontage`,
    it: `Noleggio studio (${opts.durationHours}h) incl. setup & smontaggio`,
  };

  return {
    lang,
    bookingId: opts.bookingId,
    date: fmtDate(opts.startTime),
    time: fmtTimeRange(opts.startTime, opts.endTime),
    service: serviceLabel[lang],
    totalChf: fmtChf(opts.totalChf),
    customerName: opts.customerName,
    customerEmail: opts.customerEmail,
    customerPhone: opts.customerPhone,
    customerCompany: opts.customerCompany ?? null,
    issuedAt: fmtDate(new Date()),
  };
}

/**
 * Build the props for an Invoice PDF.
 */
export function buildInvoiceProps(opts: {
  invoiceNo: string;
  startTime: string;
  durationHours: number;
  basePriceChf: number;
  addons: { key: string; priceChf: number }[];
  lateNightChf: number;
  totalChf: number;
  customerName: string;
  customerEmail: string;
  bankIban: string;
  twintNumber: string;
  lang: "de" | "en" | "fr" | "it";
}): InvoiceProps {
  const lang = opts.lang;
  const addonLabels: Record<string, Record<typeof lang, string>> = {
    lighting: {
      de: "Zusatzlicht Setup",
      en: "Additional Lighting Setup",
      fr: "Éclairage Supplémentaire",
      it: "Setup Illuminazione Extra",
    },
    backdrops: {
      de: "Alle Backdrops",
      en: "All Backdrops Access",
      fr: "Accès à tous les Fonds",
      it: "Accesso a Tutti gli Sfondi",
    },
    podcast: {
      de: "Podcast Setup",
      en: "Podcast Setup",
      fr: "Setup Podcast",
      it: "Setup Podcast",
    },
  };

  const lateNightLabel: Record<typeof lang, string> = {
    de: "Late-Night Zuschlag",
    en: "Late-night surcharge",
    fr: "Supplément Late Night",
    it: "Supplemento Late Night",
  };

  const studioRentalLabel: Record<typeof lang, string> = {
    de: `Studio Miete (${opts.durationHours}h)`,
    en: `Studio rental (${opts.durationHours}h)`,
    fr: `Location studio (${opts.durationHours}h)`,
    it: `Noleggio studio (${opts.durationHours}h)`,
  };

  const lineItems: InvoiceProps["lineItems"] = [
    {
      description: studioRentalLabel[lang],
      unitPriceChf: fmtChf(opts.basePriceChf),
      quantity: 1,
      amountChf: fmtChf(opts.basePriceChf),
    },
  ];

  for (const a of opts.addons) {
    const label = addonLabels[a.key]?.[lang] ?? a.key;
    lineItems.push({
      description: label,
      unitPriceChf: fmtChf(a.priceChf),
      quantity: 1,
      amountChf: fmtChf(a.priceChf),
    });
  }

  if (opts.lateNightChf > 0) {
    lineItems.push({
      description: lateNightLabel[lang],
      unitPriceChf: fmtChf(opts.lateNightChf),
      quantity: 1,
      amountChf: fmtChf(opts.lateNightChf),
    });
  }

  // CEE Studio is not VAT-registered yet (turnover below CHF 100k/year),
  // so taxes are 0. When/if VAT registration kicks in, derive from settings.
  const taxChf = 0;

  return {
    lang,
    invoiceNo: opts.invoiceNo,
    issuedAt: fmtDate(new Date()),
    customerName: opts.customerName,
    customerEmail: opts.customerEmail,
    lineItems,
    taxChf: fmtChf(taxChf),
    totalChf: fmtChf(opts.totalChf),
    bankIban: opts.bankIban,
    twintNumber: opts.twintNumber,
  };
}
