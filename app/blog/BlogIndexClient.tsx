"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import Breadcrumbs from "@/components/Breadcrumbs";
import { bc } from "@/lib/breadcrumb-labels";
import { useLang } from "@/contexts/LanguageContext";

type Lang = "en" | "de" | "fr" | "it";

export interface BlogCard {
  slug: string;
  image: string;
  publishedAt: string;
  readingMinutes: number;
  title: Record<Lang, string>;
  summary: Record<Lang, string>;
  category: Record<Lang, string>;
  unoptimized?: boolean; // DB/stock images bypass next/image optimizer
}

const t: Record<Lang, {
  tag: string;
  title: string;
  intro: string;
  readMin: (n: number) => string;
  readMore: string;
}> = {
  de: {
    tag: "Blog",
    title: "Tipps, Guides & News",
    intro: "Alles rund um unser Fotostudio in Zürich — von Buchungs-Guides bis Insights für deinen nächsten Shoot.",
    readMin: (n) => `${n} Min. Lesezeit`,
    readMore: "Weiterlesen →",
  },
  en: {
    tag: "Blog",
    title: "Tips, Guides & News",
    intro: "Everything around our photo studio in Zurich — from booking guides to insights for your next shoot.",
    readMin: (n) => `${n} min read`,
    readMore: "Read more →",
  },
  fr: {
    tag: "Blog",
    title: "Conseils, Guides & Actus",
    intro: "Tout sur notre studio photo à Zurich — guides de réservation et conseils pour ton prochain shooting.",
    readMin: (n) => `${n} min de lecture`,
    readMore: "Lire la suite →",
  },
  it: {
    tag: "Blog",
    title: "Consigli, Guide & News",
    intro: "Tutto sul nostro studio fotografico a Zurigo — dalle guide alla prenotazione ai consigli per il tuo prossimo shooting.",
    readMin: (n) => `${n} min di lettura`,
    readMore: "Leggi di più →",
  },
};

export default function BlogIndexClient({ posts }: { posts: BlogCard[] }) {
  const { lang } = useLang();
  const l = lang.toLowerCase() as Lang;
  const tx = t[l] ?? t.de;

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-6xl mx-auto min-h-screen">
      <Breadcrumbs items={bc(l, "blog")} className="mb-8" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Tag>{tx.tag}</Tag>
        <h1 className="font-seasons text-5xl md:text-7xl text-brand mt-4">{tx.title}</h1>
        <p className="mt-6 text-foreground/70 max-w-2xl leading-relaxed text-lg">{tx.intro}</p>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {posts.map((post, i) => {
          const date = new Date(post.publishedAt);
          const dateStr = date.toLocaleDateString(l === "de" ? "de-CH" : l, {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          return (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
              className="group"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-accent/10">
                  <Image
                    src={post.image}
                    alt={post.title[l] ?? post.title.de}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized={post.unoptimized}
                  />
                </div>
                <div className="mt-5">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-foreground/50">
                    <span>{post.category[l] ?? post.category.de}</span>
                    <span>·</span>
                    <span>{dateStr}</span>
                    <span>·</span>
                    <span>{tx.readMin(post.readingMinutes)}</span>
                  </div>
                  <h2 className="font-seasons text-2xl md:text-3xl text-foreground mt-3 group-hover:text-brand transition-colors leading-tight">
                    {post.title[l] ?? post.title.de}
                  </h2>
                  <p className="mt-3 text-sm text-foreground/65 leading-relaxed">
                    {post.summary[l] ?? post.summary.de}
                  </p>
                  <span className="inline-block mt-4 text-xs uppercase tracking-widest text-brand">
                    {tx.readMore}
                  </span>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
