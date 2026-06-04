"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DbBlogPost, BlogSection, BlogLang } from "@/lib/blog/db";

/**
 * Multilingual blog editor. Defaults to ENGLISH so the (English-speaking)
 * owner can read + review, while the site still publishes German-first.
 * Language tabs let you check each version; "Re-translate" regenerates the
 * other languages from whichever tab you edited.
 */

const LANGS: { code: BlogLang; label: string }[] = [
  { code: "en", label: "EN (review)" },
  { code: "de", label: "DE (published)" },
  { code: "fr", label: "FR" },
  { code: "it", label: "IT" },
];

type LangMap<T> = Record<BlogLang, T>;

export default function BlogEditor({ post }: { post: DbBlogPost }) {
  const router = useRouter();
  const [lang, setLang] = useState<BlogLang>("en");

  const [title, setTitle] = useState<LangMap<string>>({ ...post.title });
  const [summary, setSummary] = useState<LangMap<string>>({ ...post.summary });
  const [metaDesc, setMetaDesc] = useState<LangMap<string>>({ ...post.meta_description });
  const [bodyByLang, setBodyByLang] = useState<LangMap<BlogSection[]>>({
    de: post.body.de ?? [], en: post.body.en ?? [], fr: post.body.fr ?? [], it: post.body.it ?? [],
  });

  const [category, setCategory] = useState(post.category ?? "Guide");
  const [readingMin, setReadingMin] = useState(post.reading_minutes ?? 4);
  const [heroImage, setHeroImage] = useState(post.hero_image ?? "");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const sections = bodyByLang[lang] ?? [];

  const buildPatch = () => ({
    title, summary, meta_description: metaDesc, body: bodyByLang,
    category, reading_minutes: Number(readingMin) || 4, hero_image: heroImage || null,
  });

  async function call(action: "save" | "publish" | "discard") {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, patch: buildPatch() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "failed");
      if (action === "discard") { router.push("/admin/blog"); return; }
      setMsg(action === "publish" ? "Published ✓ — live now." : "Saved ✓");
      router.refresh();
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : "unknown"}`);
    } finally { setBusy(false); }
  }

  async function reTranslate() {
    if (!confirm(`Re-translate the other languages FROM ${lang.toUpperCase()}? This overwrites them. Save first if you edited.`)) return;
    setBusy(true); setMsg("Translating… (~30s)");
    try {
      // Save current edits first so the source language is up to date.
      await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "save", patch: buildPatch() }),
      });
      const res = await fetch(`/api/admin/blog/${post.id}/retranslate`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "failed");
      setMsg("Re-translated ✓ — reloading.");
      router.refresh();
      // Pull fresh values
      window.location.reload();
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : "unknown"}`);
    } finally { setBusy(false); }
  }

  const setLangField = (
    setter: React.Dispatch<React.SetStateAction<LangMap<string>>>,
    val: string
  ) => setter((m) => ({ ...m, [lang]: val }));

  const updateSection = (i: number, key: keyof BlogSection, val: string) =>
    setBodyByLang((m) => ({ ...m, [lang]: m[lang].map((sec, idx) => (idx === i ? { ...sec, [key]: val } : sec)) }));
  const addSection = () => setBodyByLang((m) => ({ ...m, [lang]: [...m[lang], { heading: "", body: "" }] }));
  const removeSection = (i: number) => setBodyByLang((m) => ({ ...m, [lang]: m[lang].filter((_, idx) => idx !== i) }));

  const inputCls = "w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/blog" className="text-xs uppercase tracking-widest text-foreground/50 hover:text-brand">← All posts</Link>
        <span className="text-[10px] uppercase tracking-widest text-foreground/50">
          {post.status.replace("_", " ")} · {post.source === "ai" ? "🤖 AI" : "✍️ manual"}
        </span>
      </div>

      <div>
        <h1 className="font-seasons text-3xl text-brand">Review & edit post</h1>
        <p className="text-sm text-foreground/50 mt-1">
          The site publishes <strong>German first</strong> (Zürich customers). Review in <strong>EN</strong>,
          edit any language, then <em>Re-translate</em> to sync the rest. Publish when happy.
        </p>
      </div>

      {/* Language tabs */}
      <div className="flex flex-wrap gap-2 border-b border-accent/30 pb-3">
        {LANGS.map((L) => (
          <button
            key={L.code}
            onClick={() => setLang(L.code)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-widest transition-colors ${
              lang === L.code ? "bg-brand text-background" : "border border-accent/40 text-foreground/60 hover:text-brand"
            }`}
          >
            {L.label}
          </button>
        ))}
        <button
          onClick={reTranslate}
          disabled={busy}
          className="ml-auto px-3 py-1.5 text-[11px] uppercase tracking-widest border border-accent/40 hover:border-brand disabled:opacity-40"
          title={`Regenerate the other languages from ${lang.toUpperCase()}`}
        >
          🔄 Re-translate from {lang.toUpperCase()}
        </button>
      </div>

      {/* Hero */}
      {heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={heroImage} alt="" className="w-full aspect-[16/9] object-cover border border-accent/40" />
      )}
      <Field label="Hero image URL (shared)">
        <input className={inputCls} value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://…" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category (shared)">
          <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} />
        </Field>
        <Field label="Reading time (min, shared)">
          <input type="number" className={inputCls} value={readingMin} onChange={(e) => setReadingMin(Number(e.target.value))} />
        </Field>
      </div>

      <Field label={`Title (${lang.toUpperCase()})`}>
        <input className={inputCls} value={title[lang] ?? ""} onChange={(e) => setLangField(setTitle, e.target.value)} />
      </Field>
      <Field label={`Card summary (${lang.toUpperCase()})`}>
        <textarea className={`${inputCls} min-h-[70px]`} value={summary[lang] ?? ""} onChange={(e) => setLangField(setSummary, e.target.value)} />
      </Field>
      <Field label={`Meta description — SEO (${lang.toUpperCase()})`}>
        <textarea className={`${inputCls} min-h-[60px]`} value={metaDesc[lang] ?? ""} onChange={(e) => setLangField(setMetaDesc, e.target.value)} />
        <span className="text-[10px] text-foreground/40">{(metaDesc[lang] ?? "").length} chars</span>
      </Field>

      <div className="space-y-5">
        <p className="text-[10px] uppercase tracking-widest text-foreground/60">Sections ({lang.toUpperCase()})</p>
        {sections.map((sec, i) => (
          <div key={i} className="border border-accent/40 p-4 bg-background space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40">Section {i + 1}</span>
              <button onClick={() => removeSection(i)} className="text-[10px] uppercase tracking-widest text-brand/70 hover:text-brand">Remove</button>
            </div>
            <input className={inputCls} placeholder="Heading (H2)" value={sec.heading} onChange={(e) => updateSection(i, "heading", e.target.value)} />
            <textarea className={`${inputCls} min-h-[120px]`} placeholder="Text… (blank line = new paragraph)" value={sec.body} onChange={(e) => updateSection(i, "body", e.target.value)} />
          </div>
        ))}
        <button onClick={addSection} className="text-xs uppercase tracking-widest border border-accent/40 px-4 py-2 hover:border-brand">+ Add section</button>
      </div>

      {msg && (
        <p className={`text-sm p-3 border ${msg.startsWith("Error") ? "text-brand border-brand/30 bg-brand/5" : "text-emerald-700 border-emerald-200 bg-emerald-50"}`}>{msg}</p>
      )}

      <div className="flex flex-wrap gap-3 sticky bottom-4 bg-background/80 backdrop-blur-sm p-3 border border-accent/40">
        <button onClick={() => call("save")} disabled={busy} className="px-6 py-3 text-xs uppercase tracking-widest border border-accent/40 hover:border-brand disabled:opacity-40">Save</button>
        <button onClick={() => call("publish")} disabled={busy} className="px-6 py-3 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover disabled:opacity-40">
          {post.status === "published" ? "Update (live)" : "Publish"}
        </button>
        <button onClick={() => call("discard")} disabled={busy} className="px-6 py-3 text-xs uppercase tracking-widest text-foreground/50 hover:text-brand disabled:opacity-40 ml-auto">Discard</button>
      </div>

      {post.status === "published" && (
        <Link href={`/blog/${post.slug}`} target="_blank" className="inline-block text-xs uppercase tracking-widest text-brand hover:underline">
          View live → /blog/{post.slug}
        </Link>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2">{label}</span>
      {children}
    </label>
  );
}
