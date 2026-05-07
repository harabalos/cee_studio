/**
 * Email sender (Resend wrapper).
 * Logs all sends to email_log table for debugging deliverability.
 */
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Lazy init — env may not be present at module load (e.g. during Next build).
let _resend: Resend | null = null;
function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  _resend = new Resend(key);
  return _resend;
}
const FROM = process.env.RESEND_FROM ?? "CEE Studio <bookings@ceestudio.ch>";

type SendOpts = {
  to: string;
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
  attachments?: { filename: string; content: Buffer | string }[];
  replyTo?: string;
  template: string;     // for logging — "booking_confirmation_customer", etc.
  lang?: "de" | "en" | "fr" | "it";
  metadata?: Record<string, unknown>;
};

export async function sendEmail(opts: SendOpts) {
  const { to, subject, react, html, text, attachments, replyTo, template, lang, metadata } = opts;

  let resendId: string | null = null;
  let status: "sent" | "failed" = "sent";
  let error: string | null = null;

  try {
    const result = await getResend().emails.send({
      from: FROM,
      to,
      subject,
      react,
      html,
      text,
      attachments,
      replyTo,
    });
    if (result.error) {
      status = "failed";
      error = result.error.message;
    } else {
      resendId = result.data?.id ?? null;
    }
  } catch (e) {
    status = "failed";
    error = e instanceof Error ? e.message : String(e);
  }

  // Best-effort log; don't fail the request if logging fails
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("email_log").insert({
      recipient: to,
      template,
      lang,
      subject,
      resend_id: resendId,
      status,
      error,
      metadata: metadata ?? null,
    });
  } catch {
    /* swallow */
  }

  if (status === "failed") {
    throw new Error(`Email send failed: ${error}`);
  }
  return { id: resendId };
}
