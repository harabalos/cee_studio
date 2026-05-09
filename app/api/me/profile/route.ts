/**
 * PATCH /api/me/profile
 *
 * Updates the current user's profile (name, phone, company, preferred_lang).
 * Requires an authenticated session — guest users get 401.
 *
 * Email is NOT editable here; changing email = changing the auth identity,
 * which would require a separate confirmation flow we don't ship yet.
 */

import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPPORTED_LANGS = ["de", "en", "fr", "it"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

type Body = {
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  preferred_lang?: Lang | null;
};

function sanitizeStr(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function PATCH(req: Request) {
  const supabase = getSupabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const update: Record<string, string | null> = {};
  if ("name" in body) update.name = sanitizeStr(body.name, 120);
  if ("phone" in body) update.phone = sanitizeStr(body.phone, 40);
  if ("company" in body) update.company = sanitizeStr(body.company, 120);
  if ("preferred_lang" in body) {
    const v = sanitizeStr(body.preferred_lang ?? "");
    if (v && (SUPPORTED_LANGS as readonly string[]).includes(v)) {
      update.preferred_lang = v;
    } else if (v === null) {
      update.preferred_lang = null;
    } else {
      return NextResponse.json({ error: "invalid_lang" }, { status: 400 });
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const userEmail = auth.user.email.toLowerCase();

  // Upsert against the users table (email is the natural identity here).
  // If the user row doesn't exist yet (e.g. first sign-in via magic link
  // without a prior booking), create it.
  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await admin
      .from("users")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select("id, name, phone, company, preferred_lang")
      .single();
    if (error) {
      console.error("[/api/me/profile] update error", error);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ user: updated });
  }

  const { data: created, error } = await admin
    .from("users")
    .insert({
      email: userEmail,
      auth_id: auth.user.id,
      role: "visitor",
      ...update,
    })
    .select("id, name, phone, company, preferred_lang")
    .single();
  if (error) {
    console.error("[/api/me/profile] insert error", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ user: created });
}
