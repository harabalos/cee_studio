/**
 * Local smoke test for the auto-generated PDFs.
 * Renders sample Nutzungsvertrag + Rechnung documents to /tmp so you
 * can open them and visually verify.
 *
 *   npx tsx scripts/test-pdfs.tsx
 */

import { writeFileSync } from "fs";
import {
  generateUsageAgreementPdf,
  generateInvoicePdf,
  buildUsageAgreementProps,
  buildInvoiceProps,
} from "../lib/pdf/generate";

async function main() {
  const usageAgreement = await generateUsageAgreementPdf(
    buildUsageAgreementProps({
      bookingId: "abc-1234",
      startTime: "2026-05-20T13:45:00Z",
      endTime: "2026-05-20T15:15:00Z",
      durationHours: 1.5,
      totalChf: 10500,
      customerName: "Liliia Steiner",
      customerEmail: "liliiazhulii@gmail.com",
      customerPhone: "+41 79 968 34 88",
      customerCompany: null,
      lang: "de",
    })
  );
  writeFileSync("/tmp/sample-nutzungsvertrag.pdf", usageAgreement);
  console.log("✓ /tmp/sample-nutzungsvertrag.pdf");

  const invoice = await generateInvoicePdf(
    buildInvoiceProps({
      invoiceNo: "1010-01",
      startTime: "2026-05-20T13:45:00Z",
      durationHours: 1,
      basePriceChf: 7000,
      addons: [{ key: "podcast", priceChf: 4000 }],
      lateNightChf: 0,
      totalChf: 11000,
      customerName: "Liliia Steiner",
      customerEmail: "liliiazhulii@gmail.com",
      bankIban: "CH3000700114902030289",
      twintNumber: "076 240 20 56",
      lang: "de",
    })
  );
  writeFileSync("/tmp/sample-invoice.pdf", invoice);
  console.log("✓ /tmp/sample-invoice.pdf");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
