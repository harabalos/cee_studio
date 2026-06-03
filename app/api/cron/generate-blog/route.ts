/**
 * GET /api/cron/generate-blog
 *
 * Every ~10 days (Vercel Cron) OR manual admin trigger. Pipeline:
 *   1. Pick next queued topic
 *   2. Claude → German post  3. Claude → EN/FR/IT translations
 *   4. Download the topic's curated image URL → compress → Storage (keyless)
 *   5. Insert blog_posts (status=pending_review)  6. Mark topic used
 *   7. Resend → "draft ready" email to the owner
 *
 * Auth: Authorization: Bearer ${CRON_SECRET}  (or a logged-in admin).
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth/admin";
import { slugify, type BlogLang } from "@/lib/blog/db";
import { generateGermanPost, translatePost } from "@/lib/blog/generate";
import { fetchAndStoreImage } from "@/lib/blog/stock";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // generation + 3 translations can take a bit

export async function GET(req: Request) {
  // Auth: cron secret OR admin session
  const auth = req.headers.get("authorization");
  const isCron = auth === `Bearer ${process.env.CRON_SECRET}`;
  const admin = isCron ? null : await getAdminUser();
  if (!isCron && !admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes("DUMMY")) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();

  // 1. Next queued topic
  const { data: topic } = await supabase
    .from("blog_topics")
    .select("id, keyword, brief, image_url")
    .eq("status", "queued")
    .order("sort", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!topic) {
    return NextResponse.json({ ok: false, reason: "no_queued_topics" });
  }

  try {
    // 2. German post
    const de = await generateGermanPost({ keyword: topic.keyword, brief: topic.brief ?? undefined });
    const summaryDe = de.metaDescription;

    // 3. Translations
    const tr = await translatePost(de, summaryDe);

    // 4. Hero image (nullable) — download the topic's curated URL, keyless.
    const slug = `${slugify(de.title)}-${Date.now().toString(36).slice(-4)}`;
    const heroUrl = await fetchAndStoreImage(topic.image_url, slug);

    // Assemble multilingual jsonb
    const title: Record<BlogLang, string> = { de: de.title, en: tr.en.title, fr: tr.fr.title, it: tr.it.title };
    const summary: Record<BlogLang, string> = { de: summaryDe, en: tr.en.summary, fr: tr.fr.summary, it: tr.it.summary };
    const metaDescription: Record<BlogLang, string> = {
      de: de.metaDescription, en: tr.en.metaDescription, fr: tr.fr.metaDescription, it: tr.it.metaDescription,
    };
    const body: Record<BlogLang, typeof de.sections> = {
      de: de.sections, en: tr.en.sections, fr: tr.fr.sections, it: tr.it.sections,
    };

    const reviewToken = crypto.randomUUID();

    // 5. Insert
    const { data: post, error } = await supabase
      .from("blog_posts")
      .insert({
        slug,
        status: "pending_review",
        source: "ai",
        category: de.category,
        hero_image: heroUrl,
        hero_credit: null,
        reading_minutes: de.readingMinutes,
        title, summary, meta_description: metaDescription, body,
        internal_links: de.internalLinks,
        review_token: reviewToken,
      })
      .select("id, slug")
      .single();

    if (error || !post) {
      console.error("[generate-blog] insert failed", error);
      return NextResponse.json({ error: "insert_failed", detail: error?.message }, { status: 500 });
    }

    // 6. Mark topic used
    await supabase.from("blog_topics").update({ status: "used", used_at: new Date().toISOString() }).eq("id", topic.id);

    // 7. Notify owner
    await notifyOwner(de.title, post.id);

    return NextResponse.json({ ok: true, id: post.id, slug: post.slug, hadImage: !!heroUrl });
  } catch (e) {
    console.error("[generate-blog] pipeline error", e);
    return NextResponse.json({ error: "pipeline_failed", detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

async function notifyOwner(title: string, postId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  // BLOG_REVIEW_EMAIL may be a comma-separated list — notify everyone.
  const to = (process.env.BLOG_REVIEW_EMAIL || "info@ceestudio.ch")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (!apiKey) return;
  const from = process.env.RESEND_FROM || "CEE Studio <bookings@ceestudio.ch>";
  const url = `https://www.ceestudio.ch/admin/blog/${postId}`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      subject: `📝 Neuer Blog-Entwurf: «${title}»`,
      html: `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2A1A1A">
          <h2 style="color:#661414">Neuer Blog-Entwurf bereit</h2>
          <p>Ein neuer Artikel wurde automatisch erstellt und wartet auf deine Prüfung:</p>
          <p style="font-size:18px;font-weight:bold">«${title}»</p>
          <p>Du kannst ihn prüfen, bearbeiten und veröffentlichen — oder verwerfen.</p>
          <p><a href="${url}" style="display:inline-block;background:#661414;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">Prüfen &amp; Veröffentlichen →</a></p>
          <p style="color:#7A6A6A;font-size:13px">Nichts wird ohne deine Freigabe veröffentlicht.</p>
        </div>`,
    });
  } catch (e) {
    console.error("[generate-blog] notify email failed (non-fatal)", e);
  }
}
