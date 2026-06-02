/**
 * Admin blog post actions — save edits, publish, discard.
 * PATCH /api/admin/blog/:id   body: { action: "save"|"publish"|"discard", patch?: {...} }
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { slugify } from "@/lib/blog/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { action?: string; patch?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { action, patch } = body;

  // Build the DB update.
  const update: Record<string, unknown> = {};

  if (patch && typeof patch === "object") {
    // Whitelist editable columns only.
    const allowed = [
      "title", "summary", "meta_description", "body",
      "category", "hero_image", "reading_minutes", "internal_links",
    ];
    for (const k of allowed) {
      if (k in patch) update[k] = patch[k];
    }
    // Re-derive slug from the German title when it changes.
    if (patch.title && typeof patch.title === "object") {
      const de = (patch.title as Record<string, string>).de;
      if (de) update.slug = slugify(de);
    }
  }

  if (action === "publish") {
    update.status = "published";
    update.published_at = new Date().toISOString();
  } else if (action === "discard") {
    update.status = "discarded";
  } else if (action === "unpublish") {
    update.status = "pending_review";
    update.published_at = null;
  }
  // action === "save" → only the patch fields, status unchanged.

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .update(update)
    .eq("id", params.id)
    .select("id, slug, status")
    .single();

  if (error) {
    console.error("[admin/blog] update failed", error);
    return NextResponse.json({ error: "update_failed", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, post: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("blog_posts").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
