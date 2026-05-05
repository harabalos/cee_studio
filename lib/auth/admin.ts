/**
 * Admin authorization helper.
 * A user is admin if their authenticated email matches one in ADMIN_ALLOWED_EMAILS.
 */

import { getSupabaseServer } from "@/lib/supabase/server";

export async function getAdminUser() {
  const supabase = getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return null;

  const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!allowed.includes(data.user.email.toLowerCase())) return null;

  return data.user;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
