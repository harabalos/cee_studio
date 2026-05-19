/**
 * Email rendering tests — verify each React Email template renders to
 * non-empty HTML in all 4 languages, with no broken interpolations.
 *
 * Maps to TESTING_GUIDE.md Test 14 (email deliverability — content side).
 * Real-inbox arrival requires manual check.
 */

import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import BookingConfirmationCustomer from "@/emails/BookingConfirmationCustomer";
import BookingConfirmationOwner from "@/emails/BookingConfirmationOwner";
import BookingCancellationCustomer from "@/emails/BookingCancellationCustomer";
import BookingCancellationOwner from "@/emails/BookingCancellationOwner";
import BookingReminder24h from "@/emails/BookingReminder24h";

const LANGS = ["de", "en", "fr", "it"] as const;

describe("BookingConfirmationCustomer renders", () => {
  for (const lang of LANGS) {
    it(`renders in ${lang}`, async () => {
      const html = await render(
        BookingConfirmationCustomer({
          lang,
          name: "QA Tester",
          startStr: "Mittwoch, 20. Mai 2026 14:00",
          endStr: "15:00",
          durationHours: 1,
          totalStr: "CHF 70.00",
          address: "Thurgauerstrasse 117, 8152 Glattpark",
          doorCode: "1212",
          wifiPassword: "Ceestudio00",
          manageUrl: "https://ceestudio.ch/booking/manage/abc123",
          accountUrl: "https://ceestudio.ch/login?email=test&next=/account",
        })
      );
      expect(html.length).toBeGreaterThan(500);
      // Verify no broken React/template literals leaked through
      expect(html).not.toMatch(/\{[a-z]+\}/);
      expect(html).not.toMatch(/undefined/);
      // Verify customer name + total made it in
      expect(html).toContain("QA Tester");
      expect(html).toContain("CHF 70.00");
    });
  }
});

describe("BookingConfirmationOwner renders", () => {
  it("renders with customer info", async () => {
    const html = await render(
      BookingConfirmationOwner({
        name: "QA Tester",
        email: "qa@example.test",
        phone: "+41 79 000 0000",
        company: "Test AG",
        shootType: "portrait",
        startStr: "Mittwoch, 20. Mai 2026 14:00",
        endStr: "15:00",
        durationHours: 1,
        totalStr: "CHF 70.00",
        paymentMethod: "card",
        manageUrl: "https://ceestudio.ch/admin/bookings/abc123",
      })
    );
    expect(html.length).toBeGreaterThan(500);
    expect(html).toContain("QA Tester");
    expect(html).toContain("qa@example.test");
  });
});

describe("BookingCancellationCustomer renders all languages", () => {
  for (const lang of LANGS) {
    it(`renders in ${lang} with refund`, async () => {
      const html = await render(
        BookingCancellationCustomer({
          lang,
          name: "QA Tester",
          startStr: "Mittwoch, 20. Mai 2026 14:00",
          refundStr: "CHF 68.50",
        })
      );
      expect(html.length).toBeGreaterThan(300);
      expect(html).toContain("QA Tester");
    });

    it(`renders in ${lang} without refund (member booking)`, async () => {
      const html = await render(
        BookingCancellationCustomer({
          lang,
          name: "QA Tester",
          startStr: "Mittwoch, 20. Mai 2026 14:00",
          refundStr: null,
        })
      );
      expect(html.length).toBeGreaterThan(300);
    });
  }
});

describe("BookingCancellationOwner renders", () => {
  it("renders without errors", async () => {
    const html = await render(
      BookingCancellationOwner({
        name: "QA Tester",
        email: "qa@example.test",
        phone: "+41 79 000 0000",
        startStr: "Mittwoch, 20. Mai 2026 14:00",
      })
    );
    expect(html.length).toBeGreaterThan(200);
  });
});

describe("BookingReminder24h renders all languages", () => {
  for (const lang of LANGS) {
    it(`renders in ${lang}`, async () => {
      const html = await render(
        BookingReminder24h({
          lang,
          name: "QA Tester",
          startStr: "Morgen 14:00",
          durationHours: 1,
          address: "Thurgauerstrasse 117, 8152 Glattpark",
          doorCode: "1212",
          wifiPassword: "Ceestudio00",
          manageUrl: "https://ceestudio.ch/booking/manage/abc123",
        })
      );
      expect(html.length).toBeGreaterThan(300);
      expect(html).toContain("QA Tester");
    });
  }
});
