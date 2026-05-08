/**
 * GET /api/cron/low-balance
 *
 * Daily — emails members whose hour balance dropped below a threshold (2h).
 * Throttle: don't email same member more than once per 7 days.
 *
 * Auth: requires Authorization: Bearer ${CRON_SECRET}.
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import MembershipLowBalance from "@/emails/MembershipLowBalance";

const THRESHOLD = 2;
const COOLDOWN_DAYS = 7;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const cooldownAgo = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Find active memberships under threshold
  const { data: lowMembers, error } = await supabase
    .from("memberships")
    .select(`
      id, plan, hours_balance, hours_per_month, current_period_end,
      user:users!user_id (id, email, name)
    `)
    .eq("status", "active")
    .lt("hours_balance", THRESHOLD);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ceestudio.ch";

  for (const m of lowMembers ?? []) {
    type LowMember = { id: string; user: { id: string; email: string; name: string | null } | null; hours_balance: number; current_period_end: string | null };
    const tm = m as unknown as LowMember;
    const u = tm.user;
    if (!u?.email) continue;

    // Check cooldown via email_log
    const recent = await supabase
      .from("email_log")
      .select("id")
      .eq("recipient", u.email)
      .eq("template", "membership_low_balance")
      .gt("sent_at", cooldownAgo)
      .limit(1);
    if (recent.data && recent.data.length > 0) continue;

    try {
      await sendEmail({
        to: u.email,
        subject: "Your CEE Studio hours are running low",
        react: MembershipLowBalance({
          name: u.name ?? "",
          balance: Number(tm.hours_balance),
          renewsOn: tm.current_period_end ? new Date(tm.current_period_end).toLocaleDateString("en-CH") : "—",
          accountUrl: `${SITE_URL}/account`,
        }),
        template: "membership_low_balance",
        lang: "de",
        metadata: { membership_id: tm.id },
      });
      sent++;
    } catch (e) {
      console.error("[low-balance] send failed", u.email, e);
    }
  }

  return NextResponse.json({ ok: true, sent, considered: lowMembers?.length ?? 0 });
}
