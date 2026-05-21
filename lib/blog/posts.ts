/**
 * Blog post registry — central source of truth for /blog index, sitemap,
 * and per-post metadata. Each post lives in app/blog/<slug>/page.tsx with
 * its own server layout.tsx exporting page-specific metadata.
 *
 * To add a new post:
 *   1. Add an entry here (slug + dates + image + summary in 4 langs)
 *   2. Create app/blog/<slug>/page.tsx with the React content
 *   3. Create app/blog/<slug>/layout.tsx with Article metadata
 *   4. Sitemap auto-picks it up
 */

export type BlogLang = "de" | "en" | "fr" | "it";

export interface BlogPost {
  slug: string;
  /** ISO 8601 date — used for sitemap lastmod + Article schema datePublished */
  publishedAt: string;
  /** Optional update date — used for Article schema dateModified */
  updatedAt?: string;
  /** Hero image (public path, e.g. "/images/studio-overview.jpg") */
  image: string;
  /** Per-language title (shows in index card + meta title) */
  title: Record<BlogLang, string>;
  /** Per-language one-line summary (shows in index card + meta description) */
  summary: Record<BlogLang, string>;
  /** Per-language category label (shows as Tag chip on cards) */
  category: Record<BlogLang, string>;
  /** Estimated reading time in minutes — purely cosmetic */
  readingMinutes: number;
}

export const POSTS: BlogPost[] = [
  {
    slug: "willkommen-cee-studio-guide",
    publishedAt: "2026-05-21",
    image: "/images/lounge-cowhide-view.jpg",
    title: {
      de: "Willkommen bei CEE Studio — Dein Guide zur Website",
      en: "Welcome to CEE Studio — Your Guide to the Website",
      fr: "Bienvenue chez CEE Studio — Ton guide du site",
      it: "Benvenuto in CEE Studio — La tua guida al sito",
    },
    summary: {
      de: "Ein kurzer Spaziergang durch unser Fotostudio in Zürich und alles, was du auf unserer Website tun kannst — Studio buchen, ABO werden, Equipment ansehen.",
      en: "A quick walk through our photo studio in Zurich and everything you can do on our website — book the studio, join the membership, explore equipment.",
      fr: "Une promenade rapide dans notre studio photo à Zurich et tout ce que tu peux faire sur notre site — réserver, devenir membre, découvrir l'équipement.",
      it: "Una breve passeggiata nel nostro studio fotografico a Zurigo e tutto ciò che puoi fare sul nostro sito — prenotare, diventare membro, esplorare l'attrezzatura.",
    },
    category: {
      de: "Willkommen",
      en: "Welcome",
      fr: "Bienvenue",
      it: "Benvenuto",
    },
    readingMinutes: 4,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
