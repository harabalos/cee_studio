/**
 * GET /api/me
 *
 * Returns the logged-in user's membership status (for client-side
 * adaptation in /booking).
 *
 * Public-safe: returns minimal data (no email/phone leak).
 */

import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.email) return NextResponse.json({ user: null, isAdmin: false });

  const isAdmin = isAdminEmail(auth.user.email);
  const admin = getSupabaseAdmin();
  const { data: dbUser } = await admin
    .from("users")
    .select("id, name, email, phone, company, preferred_lang")
    .eq("email", auth.user.email.toLowerCase())
    .maybeSingle();

  if (!dbUser) {
    return NextResponse.json({ user: { email: auth.user.email }, isAdmin });
  }

  const { data: membership } = await admin
    .from("memberships")
    .select("id, plan, status, hours_balance, hours_per_month")
    .eq("user_id", dbUser.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    user: dbUser,
    membership: membership ?? null,
    isAdmin,
  });
}
