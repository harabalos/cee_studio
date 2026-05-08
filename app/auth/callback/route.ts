/**
 * GET /auth/callback?token_hash=...&type=magiclink&next=...
 *
 * Supabase magic-link / OTP callback. Exchanges the token for a real session
 * cookie so server components can see auth.uid() on subsequent requests.
 *
 * Smart redirect:
 *   - explicit ?next=... wins (used for "go to admin from login form")
 *   - else if email is in ADMIN_ALLOWED_EMAILS → /admin
 *   - else → /account
 */

import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const explicitNext = searchParams.get("next");

  const supabase = getSupabaseServer();

  let verifyError: string | null = null;

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) verifyError = error.message;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) verifyError = error.message;
  } else {
    return NextResponse.redirect(`${origin}/login?error=missing_params`);
  }

  if (verifyError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(verifyError)}`);
  }

  // Determine destination
  let next = explicitNext;
  if (!next) {
    const { data } = await supabase.auth.getUser();
    next = isAdminEmail(data.user?.email) ? "/admin" : "/account";
  }

  return NextResponse.redirect(`${origin}${next}`);
}
