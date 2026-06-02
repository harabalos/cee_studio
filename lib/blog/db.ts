/**
 * DB-backed blog data layer (server-only — uses service_role).
 *
 * Posts live in the `blog_posts` table so the AI cron can create them and the
 * owner can publish them from /admin/blog without a deploy. The original
 * hardcoded "welcome" post still lives in lib/blog/posts.ts and is merged into
 * the index + sitemap alongside DB posts.
 */

import { getSupabaseAdmin } from "@/lib/supabase/server";

export type BlogLang = "de" | "en" | "fr" | "it";
export type BlogStatus = "draft" | "pending_review" | "published" | "discarded";

export interface BlogSection {
  heading: string;
  body: string;
}

export interface DbBlogPost {
  id: string;
  slug: string;
  status: BlogStatus;
  category: string | null;
  hero_image: string | null;
  hero_credit: string | null;
  reading_minutes: number;
  title: Record<BlogLang, string>;
  summary: Record<BlogLang, string>;
  meta_description: Record<BlogLang, string>;
  body: Record<BlogLang, BlogSection[]>;
  internal_links: string[];
  review_token: string | null;
  source: string;
  created_at: string;
  published_at: string | null;
}

const SELECT =
  "id, slug, status, category, hero_image, hero_credit, reading_minutes, title, summary, meta_description, body, internal_links, review_token, source, created_at, published_at";

/** All published posts, newest first — for the public /blog index + sitemap. */
export async function getPublishedPosts(): Promise<DbBlogPost[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data ?? []) as DbBlogPost[];
}

/** A single published post by slug — for the public post page. */
export async function getPublishedPost(slug: string): Promise<DbBlogPost | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as DbBlogPost) ?? null;
}

/** Admin: every post regardless of status, newest first. */
export async function getAllPostsAdmin(): Promise<DbBlogPost[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .order("created_at", { ascending: false });
  return (data ?? []) as DbBlogPost[];
}

/** Admin: a single post by id (any status). */
export async function getPostByIdAdmin(id: string): Promise<DbBlogPost | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data as DbBlogPost) ?? null;
}

/** Slugify a German title into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
