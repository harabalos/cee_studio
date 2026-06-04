/**
 * POST /api/admin/blog/:id/retranslate   body: { source: "en"|"de"|"fr"|"it" }
 *
 * Re-translates the post's other languages FROM the chosen source language.
 * Lets the English-reading owner edit the English version and refresh DE/FR/IT.
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getPostByIdAdmin, type BlogLang } from "@/lib/blog/db";
import { retranslate, type TranslatedFields } from "@/lib/blog/generate";

const LANGS: BlogLang[] = ["de", "en", "fr", "it"];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes("DUMMY")) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  let body: { source?: BlogLang } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const source = body.source;
  if (!source || !LANGS.includes(source)) {
    return NextResponse.json({ error: "invalid_source" }, { status: 400 });
  }

  const post = await getPostByIdAdmin(params.id);
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const sourceFields: TranslatedFields = {
    title: post.title[source] ?? "",
    summary: post.summary[source] ?? "",
    metaDescription: post.meta_description[source] ?? "",
    sections: post.body[source] ?? [],
  };

  if (!sourceFields.title || sourceFields.sections.length === 0) {
    return NextResponse.json({ error: "source_empty" }, { status: 400 });
  }

  try {
    const targets = LANGS.filter((l) => l !== source);
    const translated = await retranslate(source, sourceFields, targets);

    // Merge translations back into the multilingual maps.
    const title = { ...post.title };
    const summary = { ...post.summary };
    const metaDescription = { ...post.meta_description };
    const bodyMap = { ...post.body };
    for (const t of targets) {
      title[t] = translated[t].title;
      summary[t] = translated[t].summary;
      metaDescription[t] = translated[t].metaDescription;
      bodyMap[t] = translated[t].sections;
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("blog_posts")
      .update({ title, summary, meta_description: metaDescription, body: bodyMap })
      .eq("id", params.id);
    if (error) return NextResponse.json({ error: "save_failed", detail: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, translated: targets });
  } catch (e) {
    return NextResponse.json({ error: "translate_failed", detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
