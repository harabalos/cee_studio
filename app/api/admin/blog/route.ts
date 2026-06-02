/**
 * Create a new (empty) blog post draft. POST /api/admin/blog
 * Returns the new post id so the client can open the editor.
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const slug = `entwurf-${Date.now().toString(36)}`;
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      slug,
      status: "draft",
      source: "manual",
      category: "Guide",
      title: { de: "", en: "", fr: "", it: "" },
      summary: { de: "", en: "", fr: "", it: "" },
      meta_description: { de: "", en: "", fr: "", it: "" },
      body: { de: [{ heading: "", body: "" }], en: [], fr: [], it: [] },
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[admin/blog] create failed", error);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
