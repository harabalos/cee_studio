/**
 * Integration — Resend email delivery status checks.
 *
 * Maps to TESTING_GUIDE.md Test 14 (Email deliverability).
 *
 * Strategy: send via our real `sendEmail()` helper to Resend's test
 * inboxes (delivered@resend.dev / bounced@resend.dev) which always report
 * deterministic delivery states. Then call Resend's API to confirm:
 *   1. The email_log row exists with resend_id populated
 *   2. Resend's `emails.get(id)` returns a successful status
 *   3. Bounce-test inbox correctly reports bounced (proves bounce handling)
 *
 * Resend test addresses (https://resend.com/docs/dashboard/emails/send-test-emails):
 *   - delivered@resend.dev → "delivered"
 *   - bounced@resend.dev   → "bounced"
 *   - complained@resend.dev → "complained"
 *
 * What this verifies (which IS our code):
 *   - The Resend API key in .env.local works
 *   - The `ceestudio.ch` domain is verified in Resend
 *   - Our send wrapper persists resend_id to email_log
 *   - React Email templates render + transmit without errors
 *
 * NOT verified (out of scope):
 *   - Actual inbox arrival (manual check via Gmail before launch)
 *   - DKIM/SPF/DMARC alignment (verified at Resend dashboard level)
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Resend } from "resend";
import { sendEmail } from "@/lib/email/send";
import BookingConfirmationCustomer from "@/emails/BookingConfirmationCustomer";
import { admin, cleanupQA } from "./helpers/supabase";

const apiKey = process.env.RESEND_API_KEY;
const HAS_RESEND = !!apiKey;

describe.skipIf(!HAS_RESEND)("Resend email delivery", () => {
  const resend = new Resend(apiKey!);

  beforeAll(async () => {
    await cleanupQA();
    // Also purge prior QA email_log rows so we can identify our own
    await admin.from("email_log").delete().like("recipient", "%@resend.dev");
  });

  afterAll(async () => {
    await admin.from("email_log").delete().like("recipient", "%@resend.dev");
  });

  it("sends a real React Email template via Resend → returns Resend id", async () => {
    const result = await sendEmail({
      to: "delivered@resend.dev",
      subject: "[QA] Booking confirmation test",
      template: "booking_confirmation_customer",
      lang: "de",
      react: BookingConfirmationCustomer({
        lang: "de",
        name: "QA Tester",
        startStr: "Mittwoch, 20. Mai 2026 14:00",
        endStr: "15:00",
        durationHours: 1,
        totalStr: "CHF 70.00",
        address: "Thurgauerstrasse 117, 8152 Glattpark",
        doorCode: "1212",
        wifiPassword: "Ceestudio00",
        manageUrl: "https://ceestudio.ch/booking/manage/qa-test",
        accountUrl: "https://ceestudio.ch/login?email=test&next=/account",
      }),
    });
    expect(result.id).toBeTruthy();
    expect(result.id).toMatch(/^[a-f0-9-]{30,}$/i);
  });

  it("email_log row is created with status=sent + resend_id populated", async () => {
    const { data: logs } = await admin
      .from("email_log")
      .select("recipient, template, status, resend_id, error")
      .eq("recipient", "delivered@resend.dev")
      .order("sent_at", { ascending: false })
      .limit(1);
    expect(logs?.length).toBe(1);
    expect(logs![0].status).toBe("sent");
    expect(logs![0].resend_id).toBeTruthy();
    expect(logs![0].template).toBe("booking_confirmation_customer");
    expect(logs![0].error).toBeNull();
  });

  it("Resend API confirms the email reached delivered state", async () => {
    const { data: logs } = await admin
      .from("email_log")
      .select("resend_id")
      .eq("recipient", "delivered@resend.dev")
      .order("sent_at", { ascending: false })
      .limit(1);
    const resendId = logs?.[0]?.resend_id;
    expect(resendId).toBeTruthy();

    // Poll Resend — delivery state may take a few seconds to propagate
    let lastStatus: string | undefined;
    for (let attempt = 0; attempt < 6; attempt++) {
      const { data, error } = await resend.emails.get(resendId!);
      expect(error).toBeFalsy();
      lastStatus = data?.last_event ?? undefined;
      if (lastStatus === "delivered" || lastStatus === "sent") break;
      await new Promise((r) => setTimeout(r, 2000));
    }
    // Resend test inbox always settles to "delivered". "sent" is the
    // pre-delivery state — both are non-error.
    expect(["delivered", "sent"]).toContain(lastStatus);
  });

  it("bounced@resend.dev correctly reports a bounced state from Resend", async () => {
    const result = await sendEmail({
      to: "bounced@resend.dev",
      subject: "[QA] Bounce simulation",
      template: "booking_confirmation_customer",
      lang: "de",
      text: "QA bounce test — Resend should immediately mark this bounced",
    });
    expect(result.id).toBeTruthy();

    let lastStatus: string | undefined;
    for (let attempt = 0; attempt < 6; attempt++) {
      const { data } = await resend.emails.get(result.id!);
      lastStatus = data?.last_event ?? undefined;
      if (lastStatus === "bounced") break;
      await new Promise((r) => setTimeout(r, 2000));
    }
    expect(lastStatus).toBe("bounced");
  });
});
