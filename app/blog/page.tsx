import { getAllPosts } from "@/lib/blog/posts";
import { getPublishedPosts } from "@/lib/blog/db";
import BlogIndexClient, { type BlogCard } from "./BlogIndexClient";

export const dynamic = "force-dynamic"; // reflect newly published posts instantly

export default async function BlogIndex() {
  // Static (hardcoded) posts — e.g. the original welcome guide.
  const staticCards: BlogCard[] = getAllPosts().map((p) => ({
    slug: p.slug,
    image: p.image,
    publishedAt: p.publishedAt,
    readingMinutes: p.readingMinutes,
    title: p.title,
    summary: p.summary,
    category: p.category,
  }));

  // DB-backed posts (manual + AI-generated, published only).
  const dbCards: BlogCard[] = (await getPublishedPosts()).map((p) => {
    const cat = p.category ?? "Blog";
    return {
      slug: p.slug,
      image: p.hero_image ?? "/images/lounge-cowhide-view.jpg",
      publishedAt: p.published_at ?? p.created_at,
      readingMinutes: p.reading_minutes,
      title: p.title,
      summary: p.summary,
      category: { de: cat, en: cat, fr: cat, it: cat },
      unoptimized: true, // stock/storage URLs aren't in next.config domains list
    };
  });

  // Merge + sort newest first.
  const posts = [...staticCards, ...dbCards].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return <BlogIndexClient posts={posts} />;
}
