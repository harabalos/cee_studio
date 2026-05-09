/**
 * GET /auth/callback?token_hash=...&type=...&next=...
 *
 * Handles three Supabase auth flows:
 *   1. token_hash (verifyOtp) — preferred. Cross-browser, works even if user
 *      opens the magic link in a different incognito tab.
 *   2. code (exchangeCodeForSession / PKCE) — used by default templates;
 *      requires SAME browser session that initiated the flow. Fails with
 *      "PKCE code verifier not found" otherwise.
 *   3. Implicit token in URL hash — handled by client-side SDK on the
 *      destination page; we just redirect.
 *
 * Wraps all SDK calls in try/catch so unexpected exceptions surface as a
 * friendly login redirect instead of a 500 page.
 */

import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") as EmailOtpType | null) ?? "email";
  const code = searchParams.get("code");
  const explicitNext = searchParams.get("next");

  let verifyError: string | null = null;

  try {
    const supabase = getSupabaseServer();

    if (token_hash) {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (error) verifyError = error.message;
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        // Distinguish PKCE failure (cross-browser) from real auth errors
        verifyError = /pkce|code verifier/i.test(error.message)
          ? "Magic link must be opened in the same browser that requested it. Try requesting a new link."
          : error.message;
      }
    } else {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Missing auth parameters")}`);
    }

    if (verifyError) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(verifyError)}`);
    }

    // Determine destination — defensive about `next` shape:
    // - empty / missing → smart redirect by role
    // - "/path" → use as-is
    // - "http://host/path" → extract path (handles `{{ .RedirectTo }}` returning a full URL)
    // - looping back to /auth/callback → ignore, fall through to smart redirect
    let nextPath: string | null = explicitNext;
    if (nextPath && /^https?:\/\//i.test(nextPath)) {
      try {
        const u = new URL(nextPath);
        nextPath = u.pathname + u.search;
      } catch {
        nextPath = null;
      }
    }
    if (!nextPath || nextPath === "/auth/callback" || nextPath.startsWith("/auth/callback?")) {
      const { data } = await supabase.auth.getUser();
      nextPath = isAdminEmail(data.user?.email) ? "/admin" : "/account";
    }

    return NextResponse.redirect(`${origin}${nextPath}`);
  } catch (e) {
    console.error("[auth/callback] unexpected error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`);
  }
}
