/**
 * PDF generation tests — verify that both customer documents render
 * without throwing AND produce a non-trivial PDF byte stream.
 *
 * We don't visually-compare the PDF (too brittle for CI). Instead we
 * assert byte-size > 1KB and the magic header `%PDF-` is present.
 *
 * Covers TESTING_GUIDE.md Test 1 expectation "Email with .ics +
 * Nutzungsvertrag.pdf + Rechnung.pdf attached".
 */

import { describe, it, expect } from "vitest";
import {
  generateUsageAgreementPdf,
  generateInvoicePdf,
  buildUsageAgreementProps,
  buildInvoiceProps,
} from "@/lib/pdf/generate";

const SAMPLE_BOOKING = {
  bookingId: "test-booking-001",
  startTime: "2026-05-20T13:00:00Z",
  endTime: "2026-05-20T14:00:00Z",
  durationHours: 1,
  totalChf: 7000,
  customerName: "QA Tester",
  customerEmail: "qa@example.test",
  customerPhone: "+41 79 000 0000",
  customerCompany: null,
};

describe("generateUsageAgreementPdf", () => {
  it("renders DE document", async () => {
    const buf = await generateUsageAgreementPdf(
      buildUsageAgreementProps({ ...SAMPLE_BOOKING, lang: "de" })
    );
    expect(buf.length).toBeGreaterThan(1024);
    expect(buf.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });

  it("renders EN document", async () => {
    const buf = await generateUsageAgreementPdf(
      buildUsageAgreementProps({ ...SAMPLE_BOOKING, lang: "en" })
    );
    expect(buf.length).toBeGreaterThan(1024);
  });

  it("renders FR document", async () => {
    const buf = await generateUsageAgreementPdf(
      buildUsageAgreementProps({ ...SAMPLE_BOOKING, lang: "fr" })
    );
    expect(buf.length).toBeGreaterThan(1024);
  });

  it("renders IT document", async () => {
    const buf = await generateUsageAgreementPdf(
      buildUsageAgreementProps({ ...SAMPLE_BOOKING, lang: "it" })
    );
    expect(buf.length).toBeGreaterThan(1024);
  });

  it("handles long customer names without crashing", async () => {
    const longName = "A".repeat(120);
    const buf = await generateUsageAgreementPdf(
      buildUsageAgreementProps({ ...SAMPLE_BOOKING, customerName: longName, lang: "de" })
    );
    expect(buf.length).toBeGreaterThan(1024);
  });

  it("renders with company field set", async () => {
    const buf = await generateUsageAgreementPdf(
      buildUsageAgreementProps({ ...SAMPLE_BOOKING, customerCompany: "Test AG", lang: "de" })
    );
    expect(buf.length).toBeGreaterThan(1024);
  });
});

describe("generateInvoicePdf", () => {
  it("renders basic invoice (no addons, no late-night)", async () => {
    const buf = await generateInvoicePdf(
      buildInvoiceProps({
        invoiceNo: "TEST-001",
        startTime: SAMPLE_BOOKING.startTime,
        durationHours: 1,
        basePriceChf: 7000,
        addons: [],
        lateNightChf: 0,
        totalChf: 7000,
        customerName: "QA Tester",
        customerEmail: "qa@example.test",
        bankIban: "CH3000700114902030289",
        twintNumber: "076 240 20 56",
        lang: "de",
      })
    );
    expect(buf.length).toBeGreaterThan(1024);
    expect(buf.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });

  it("renders invoice with addons", async () => {
    const buf = await generateInvoicePdf(
      buildInvoiceProps({
        invoiceNo: "TEST-002",
        startTime: SAMPLE_BOOKING.startTime,
        durationHours: 2,
        basePriceChf: 12000,
        addons: [{ key: "lighting", priceChf: 2000 }, { key: "backdrops", priceChf: 3000 }],
        lateNightChf: 0,
        totalChf: 17000,
        customerName: "QA Tester",
        customerEmail: "qa@example.test",
        bankIban: "CH3000700114902030289",
        twintNumber: "076 240 20 56",
        lang: "de",
      })
    );
    expect(buf.length).toBeGreaterThan(1024);
  });

  it("renders invoice with late-night surcharge", async () => {
    const buf = await generateInvoicePdf(
      buildInvoiceProps({
        invoiceNo: "TEST-003",
        startTime: SAMPLE_BOOKING.startTime,
        durationHours: 4,
        basePriceChf: 25000,
        addons: [],
        lateNightChf: 3000,
        totalChf: 28000,
        customerName: "QA Tester",
        customerEmail: "qa@example.test",
        bankIban: "CH3000700114902030289",
        twintNumber: "076 240 20 56",
        lang: "de",
      })
    );
    expect(buf.length).toBeGreaterThan(1024);
  });

  it("renders all 4 languages", async () => {
    for (const lang of ["de", "en", "fr", "it"] as const) {
      const buf = await generateInvoicePdf(
        buildInvoiceProps({
          invoiceNo: `TEST-LANG-${lang}`,
          startTime: SAMPLE_BOOKING.startTime,
          durationHours: 1,
          basePriceChf: 7000,
          addons: [],
          lateNightChf: 0,
          totalChf: 7000,
          customerName: "QA Tester",
          customerEmail: "qa@example.test",
          bankIban: "CH3000700114902030289",
          twintNumber: "076 240 20 56",
          lang,
        })
      );
      expect(buf.length).toBeGreaterThan(1024);
    }
  });
});
