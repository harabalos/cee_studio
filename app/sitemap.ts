import type { MetadataRoute } from "next";
import { IS_MARKETING_MODE } from "@/lib/launch-mode";
import { getAllPosts } from "@/lib/blog/posts";
import { getPublishedPosts } from "@/lib/blog/db";

const BASE = "https://ceestudio.ch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const dbPosts = await getPublishedPosts();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; lastModified?: Date }[] = [
    { path: "",          priority: 1.0, changeFrequency: "weekly" },
    { path: "/studio", priority: 0.9, changeFrequency: "monthly" },
    { path: "/pricing",    priority: 0.95, changeFrequency: "weekly" },
    // /booking is excluded in marketing mode — middleware redirects it to /coming-soon
    ...(IS_MARKETING_MODE
      ? []
      : [{ path: "/booking", priority: 0.95, changeFrequency: "weekly" as const }]),
    { path: "/services",     priority: 0.85, changeFrequency: "monthly" },
    { path: "/contact",   priority: 0.8,  changeFrequency: "monthly" },
    { path: "/about",     priority: 0.7,  changeFrequency: "monthly" },
    { path: "/faq",       priority: 0.7,  changeFrequency: "monthly" },
    // Blog index + posts — articles get higher priority than static pages
    // because fresh content signals topical relevance to search engines.
    { path: "/blog",      priority: 0.85, changeFrequency: "weekly" },
    ...getAllPosts().map((p) => ({
      path: `/blog/${p.slug}`,
      priority: 0.75,
      changeFrequency: "monthly" as const,
      lastModified: new Date(p.updatedAt ?? p.publishedAt),
    })),
    ...dbPosts.map((p) => ({
      path: `/blog/${p.slug}`,
      priority: 0.75,
      changeFrequency: "monthly" as const,
      lastModified: new Date(p.published_at ?? p.created_at),
    })),
    { path: "/rules",     priority: 0.4,  changeFrequency: "yearly" },
    { path: "/terms",     priority: 0.4,  changeFrequency: "yearly" },
    { path: "/privacy",   priority: 0.3,  changeFrequency: "yearly" },
    { path: "/impressum", priority: 0.3,  changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: r.lastModified ?? now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    alternates: {
      languages: {
        "de-CH": `${BASE}${r.path}`,
        de: `${BASE}${r.path}`,
        en: `${BASE}${r.path}`,
        fr: `${BASE}${r.path}`,
        it: `${BASE}${r.path}`,
      },
    },
  }));
}
