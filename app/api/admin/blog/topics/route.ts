/**
 * Manage the blog topic queue. POST /api/admin/blog/topics
 * body: { action: "create"|"update"|"delete", id?, keyword?, brief?, image_url?, status?, sort? }
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let b: {
    action?: string;
    id?: string;
    keyword?: string;
    brief?: string;
    image_url?: string | null;
    status?: string;
    sort?: number;
  } = {};
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (b.action === "create") {
    const { data, error } = await supabase
      .from("blog_topics")
      .insert({ keyword: b.keyword ?? "", brief: b.brief ?? "", image_url: b.image_url ?? null, status: "queued", sort: b.sort ?? 999 })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "create_failed", detail: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data.id });
  }

  if (b.action === "update") {
    if (!b.id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
    const patch: Record<string, unknown> = {};
    for (const k of ["keyword", "brief", "image_url", "status", "sort"] as const) {
      if (k in b) patch[k] = b[k];
    }
    const { error } = await supabase.from("blog_topics").update(patch).eq("id", b.id);
    if (error) return NextResponse.json({ error: "update_failed", detail: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (b.action === "delete") {
    if (!b.id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
    const { error } = await supabase.from("blog_topics").delete().eq("id", b.id);
    if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
