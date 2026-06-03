"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import Divider from "@/components/ui/Divider";
import Breadcrumbs from "@/components/Breadcrumbs";
import { bcBlogPost } from "@/lib/breadcrumb-labels";
import { useLang } from "@/contexts/LanguageContext";
import type { DbBlogPost, BlogLang } from "@/lib/blog/db";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

/**
 * Render a paragraph with light Markdown: [text](url) → link, **bold** → <strong>.
 * The AI naturally emits these; without parsing they'd show as raw syntax.
 */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      const href = m[2];
      const internal = href.startsWith("/");
      nodes.push(
        <Link
          key={k++}
          href={href}
          {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          className="text-brand underline hover:opacity-70 transition"
        >
          {m[1]}
        </Link>
      );
    } else if (m[3]) {
      nodes.push(<strong key={k++}>{m[3]}</strong>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const readMin: Record<BlogLang, (n: number) => string> = {
  de: (n) => `${n} Min. Lesezeit`,
  en: (n) => `${n} min read`,
  fr: (n) => `${n} min de lecture`,
  it: (n) => `${n} min di lettura`,
};

const ctaLabel: Record<BlogLang, { title: string; btn: string }> = {
  de: { title: "Jetzt buchen — Fotostudio Zürich", btn: "Studio buchen →" },
  en: { title: "Book now — photo studio Zurich", btn: "Book the studio →" },
  fr: { title: "Réserve — studio photo Zurich", btn: "Réserver →" },
  it: { title: "Prenota — studio fotografico Zurigo", btn: "Prenota lo studio →" },
};

export default function BlogPostClient({ post }: { post: DbBlogPost }) {
  const { lang } = useLang();
  const l = (lang.toLowerCase() as BlogLang) ?? "de";

  // Fall back to German if a translation is missing for the active language.
  const pick = <T,>(map: Record<BlogLang, T>): T => map[l] ?? map.de;

  const title = pick(post.title);
  const sections = pick(post.body) ?? [];
  const category = post.category ?? "Blog";
  const date = new Date(post.published_at ?? post.created_at);
  const dateStr = date.toLocaleDateString(l === "de" ? "de-CH" : l, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const cta = ctaLabel[l] ?? ctaLabel.de;

  return (
    <article className="pt-32 pb-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-10 mb-8">
        <Breadcrumbs items={bcBlogPost(l, title)} />
      </div>

      <header className="max-w-3xl mx-auto px-6 md:px-10">
        <motion.div {...fadeUp}>
          <Tag>{category}</Tag>
          <h1 className="font-seasons text-4xl md:text-6xl text-brand mt-4 leading-tight">
            {title}
          </h1>
          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-foreground/50">
            <span>{dateStr}</span>
            <span>·</span>
            <span>{readMin[l](post.reading_minutes)}</span>
            <span>·</span>
            <span>CEE Studio</span>
          </div>
        </motion.div>
      </header>

      {post.hero_image && (
        <motion.div
          className="mt-12 relative aspect-[16/9] max-w-5xl mx-auto px-0 md:px-10"
          {...fadeUp}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <div className="relative w-full h-full">
            <Image
              src={post.hero_image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
              unoptimized
            />
          </div>
        </motion.div>
      )}

      <div className="max-w-3xl mx-auto px-6 md:px-10 mt-16 space-y-10">
        {sections.map((s, i) => (
          <motion.section key={i} {...fadeUp}>
            {s.heading && (
              <h2 className="font-seasons text-2xl md:text-3xl text-foreground mb-4">
                {s.heading}
              </h2>
            )}
            {s.body.split("\n\n").map((para, j) => (
              <p key={j} className="text-foreground/75 leading-relaxed mb-4">
                {renderInline(para)}
              </p>
            ))}
          </motion.section>
        ))}

        <Divider />

        <motion.div
          {...fadeUp}
          className="border border-accent bg-background p-8 md:p-10 text-center"
        >
          <p className="text-[10px] uppercase tracking-widest text-foreground/50">CEE Studio</p>
          <h3 className="font-seasons text-3xl md:text-4xl text-brand mt-3">{cta.title}</h3>
          <Link
            href="/booking"
            className="inline-block mt-6 px-8 py-3 bg-brand text-background text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            {cta.btn}
          </Link>
        </motion.div>
      </div>
    </article>
  );
}
