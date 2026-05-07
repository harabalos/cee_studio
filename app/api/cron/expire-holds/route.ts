/**
 * GET /api/cron/expire-holds
 *
 * Vercel Cron should hit this every 5 minutes. Deletes expired holds as a
 * fallback to checkout.session.expired webhook (in case it doesn't fire).
 *
 * Protected via Authorization: Bearer ${CRON_SECRET}.
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { error, count } = await supabase
    .from("pending_holds")
    .delete({ count: "exact" })
    .lt("expires_at", new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, deleted: count ?? 0 });
}
