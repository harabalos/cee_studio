/**
 * Integration — PDF attachments path verification.
 *
 * REPRO of user's reported bug: "emails arrive but PDFs are missing."
 *
 * IMPORTANT CAVEAT: Resend's GET /emails/:id API does NOT return attachment
 * metadata (verified by reading the SDK's GetEmailResponseSuccess type:
 * it has bcc, cc, html, last_event, etc — but no attachments field). So
 * we cannot programmatically confirm attachments were delivered.
 *
 * What this test DOES verify:
 *   - PDF generation works (valid %PDF- magic bytes, sane size)
 *   - sendEmail() with attachments[] returns a valid Resend ID
 *   - The email reaches a non-error state (delivered/sent/queued)
 *   - The email_log row in our DB captures the resend_id
 *
 * What this test CANNOT verify:
 *   - Whether Resend actually forwarded the attachments to the recipient
 *   - Whether Gmail rendered them
 *
 * For the user's bug, the actual root cause is most likely:
 *   1. PDF generation is throwing silently in production (try/catch in
 *      buildPdfAttachments → log not seen) → email goes out attachment-less
 *   2. OR Resend silently drops oversize attachments (40MB combined limit)
 *
 * Diagnostic: lib/email/booking-emails.ts was updated to log PDF attempt +
 * outcome + buffer sizes. Check Vercel logs for "[booking-emails]" prefix
 * after a real booking.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Resend } from "resend";
import {
  generateUsageAgreementPdf,
  generateInvoicePdf,
  buildUsageAgreementProps,
  buildInvoiceProps,
} from "@/lib/pdf/generate";
import { sendEmail } from "@/lib/email/send";
import { admin, cleanupQA } from "./helpers/supabase";

const apiKey = process.env.RESEND_API_KEY;
const HAS_RESEND = !!apiKey;

describe.skipIf(!HAS_RESEND)("PDF attachments — generation + send path", () => {
  const resend = new Resend(apiKey!);

  beforeAll(async () => {
    await cleanupQA();
    await admin.from("email_log").delete().like("recipient", "%@resend.dev");
  });

  afterAll(async () => {
    await admin.from("email_log").delete().like("recipient", "%@resend.dev");
  });

  it("Nutzungsvertrag PDF generates as valid Buffer with %PDF- magic bytes", async () => {
    const usageBuf = await generateUsageAgreementPdf(
      buildUsageAgreementProps({
        bookingId: "qa-test-pdf-001",
        startTime: new Date("2026-06-01T13:00:00Z").toISOString(),
        endTime: new Date("2026-06-01T14:00:00Z").toISOString(),
        durationHours: 1,
        totalChf: 7000,
        customerName: "QA PDF Tester",
        customerEmail: "qa@test.local",
        customerPhone: "+41 79 000 0099",
        customerCompany: null,
        lang: "de",
      })
    );

    expect(usageBuf).toBeInstanceOf(Buffer);
    expect(usageBuf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(usageBuf.length).toBeGreaterThan(1000);
    expect(usageBuf.length).toBeLessThan(5 * 1024 * 1024);
  });

  it("Invoice PDF generates as valid Buffer with %PDF- magic bytes", async () => {
    const invoiceBuf = await generateInvoicePdf(
      buildInvoiceProps({
        invoiceNo: "QA-INV-001",
        startTime: new Date("2026-06-01T13:00:00Z").toISOString(),
        durationHours: 1,
        basePriceChf: 7000,
        addons: [],
        lateNightChf: 0,
        totalChf: 7000,
        customerName: "QA PDF Tester",
        customerEmail: "qa@test.local",
        bankIban: "CH00 0000 0000 0000 0000 0",
        twintNumber: "+41 79 000 0000",
        lang: "de",
      })
    );

    expect(invoiceBuf).toBeInstanceOf(Buffer);
    expect(invoiceBuf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(invoiceBuf.length).toBeGreaterThan(1000);
  });

  it("PDF + invoice combined are well under Resend's 40MB limit", async () => {
    const usageBuf = await generateUsageAgreementPdf(
      buildUsageAgreementProps({
        bookingId: "qa-size-test",
        startTime: new Date("2026-06-01T13:00:00Z").toISOString(),
        endTime: new Date("2026-06-01T14:00:00Z").toISOString(),
        durationHours: 1,
        totalChf: 7000,
        customerName: "QA Size Tester",
        customerEmail: "qa@test.local",
        customerPhone: "+41 79 000 0099",
        customerCompany: null,
        lang: "de",
      })
    );
    const invoiceBuf = await generateInvoicePdf(
      buildInvoiceProps({
        invoiceNo: "QA-SIZE-001",
        startTime: new Date("2026-06-01T13:00:00Z").toISOString(),
        durationHours: 1,
        basePriceChf: 7000,
        addons: [],
        lateNightChf: 0,
        totalChf: 7000,
        customerName: "QA Size Tester",
        customerEmail: "qa@test.local",
        bankIban: "CH00 0000 0000 0000 0000 0",
        twintNumber: "+41 79 000 0000",
        lang: "de",
      })
    );

    const totalBytes = usageBuf.length + invoiceBuf.length;
    // eslint-disable-next-line no-console
    console.log("[pdf-size] Usage:", usageBuf.length, "Invoice:", invoiceBuf.length, "Total:", totalBytes);
    expect(totalBytes).toBeLessThan(40 * 1024 * 1024);
  });

  it("sendEmail with PDF attachments → returns Resend ID + email_log row created", async () => {
    const usageBuf = await generateUsageAgreementPdf(
      buildUsageAgreementProps({
        bookingId: "qa-test-pdf-send",
        startTime: new Date("2026-06-01T13:00:00Z").toISOString(),
        endTime: new Date("2026-06-01T14:00:00Z").toISOString(),
        durationHours: 1,
        totalChf: 7000,
        customerName: "QA Send Tester",
        customerEmail: "delivered@resend.dev",
        customerPhone: "+41 79 000 0099",
        customerCompany: null,
        lang: "de",
      })
    );
    const invoiceBuf = await generateInvoicePdf(
      buildInvoiceProps({
        invoiceNo: "QA-INV-002",
        startTime: new Date("2026-06-01T13:00:00Z").toISOString(),
        durationHours: 1,
        basePriceChf: 7000,
        addons: [],
        lateNightChf: 0,
        totalChf: 7000,
        customerName: "QA Send Tester",
        customerEmail: "delivered@resend.dev",
        bankIban: "CH00 0000 0000 0000 0000 0",
        twintNumber: "+41 79 000 0000",
        lang: "de",
      })
    );

    const result = await sendEmail({
      to: "delivered@resend.dev",
      subject: "[QA] PDF attachment path test",
      text: "Booking confirmation — see attached Nutzungsvertrag + Rechnung",
      template: "booking_confirmation_customer",
      lang: "de",
      attachments: [
        { filename: "Nutzungsvertrag_QA.pdf", content: usageBuf },
        { filename: "Rechnung_QA.pdf", content: invoiceBuf },
      ],
    });
    expect(result.id).toBeTruthy();

    // email_log row populated correctly
    const { data: logs } = await admin
      .from("email_log")
      .select("recipient, status, resend_id, error")
      .eq("recipient", "delivered@resend.dev")
      .order("sent_at", { ascending: false })
      .limit(1);
    expect(logs?.length).toBe(1);
    expect(logs![0].status).toBe("sent");
    expect(logs![0].resend_id).toBe(result.id);
    expect(logs![0].error).toBeNull();

    // Resend's GET endpoint can confirm the email reached a non-error state.
    // It CANNOT confirm attachments (not in their response schema).
    let lastEvent: string | undefined;
    for (let attempt = 0; attempt < 6; attempt++) {
      const { data } = await resend.emails.get(result.id!);
      lastEvent = data?.last_event;
      if (lastEvent === "delivered") break;
      await new Promise((r) => setTimeout(r, 2000));
    }
    expect(["delivered", "sent", "queued"]).toContain(lastEvent);

    // Diagnostic: if this passes, the bug is NOT in our send wrapper —
    // it's either in production's buildPdfAttachments throwing (check
    // Vercel logs for "[booking-emails] PDF generation failed"), or in
    // Resend itself dropping attachments silently.
    // eslint-disable-next-line no-console
    console.log("[pdf-send-test] resend_id:", result.id, "last_event:", lastEvent);
  });
});
