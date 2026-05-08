/**
 * GET /api/cron/expire-rolled-over
 *
 * Daily — expires rolled-over hours past their expiry date.
 *
 * Logic: when rolled_over_expires_at < now, deduct hours_rolled_over from
 * hours_balance and reset hours_rolled_over to 0.
 *
 * Auth: requires Authorization: Bearer ${CRON_SECRET}.
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  // Find memberships with expired rolled-over hours
  const { data: expired, error } = await supabase
    .from("memberships")
    .select("id, hours_balance, hours_rolled_over")
    .lt("rolled_over_expires_at", nowIso)
    .gt("hours_rolled_over", 0);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let updated = 0;
  for (const m of expired ?? []) {
    const newBalance = Math.max(0, Number(m.hours_balance) - Number(m.hours_rolled_over));
    await supabase
      .from("memberships")
      .update({
        hours_balance: newBalance,
        hours_rolled_over: 0,
        rolled_over_expires_at: null,
      })
      .eq("id", m.id);
    updated++;
  }

  return NextResponse.json({ ok: true, expired: updated });
}
