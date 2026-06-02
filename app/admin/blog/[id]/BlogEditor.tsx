"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DbBlogPost, BlogSection } from "@/lib/blog/db";

/**
 * German-primary blog editor. Konstantina edits the German content; the other
 * languages fall back to German on the public page until Phase-2 "re-translate"
 * fills them in. Actions: Save · Publish · Discard.
 */
export default function BlogEditor({ post }: { post: DbBlogPost }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title?.de ?? "");
  const [summary, setSummary] = useState(post.summary?.de ?? "");
  const [metaDesc, setMetaDesc] = useState(post.meta_description?.de ?? "");
  const [category, setCategory] = useState(post.category ?? "Guide");
  const [readingMin, setReadingMin] = useState(post.reading_minutes ?? 4);
  const [heroImage, setHeroImage] = useState(post.hero_image ?? "");
  const [sections, setSections] = useState<BlogSection[]>(post.body?.de ?? [{ heading: "", body: "" }]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const buildPatch = () => ({
    title: { ...post.title, de: title },
    summary: { ...post.summary, de: summary },
    meta_description: { ...post.meta_description, de: metaDesc },
    body: { ...post.body, de: sections },
    category,
    reading_minutes: Number(readingMin) || 4,
    hero_image: heroImage || null,
  });

  async function call(action: "save" | "publish" | "discard") {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, patch: buildPatch() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "failed");
      if (action === "discard") {
        router.push("/admin/blog");
        return;
      }
      setMsg(action === "publish" ? "Published ✓ — live now." : "Saved ✓");
      router.refresh();
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setBusy(false);
    }
  }

  const updateSection = (i: number, key: keyof BlogSection, val: string) =>
    setSections((s) => s.map((sec, idx) => (idx === i ? { ...sec, [key]: val } : sec)));
  const addSection = () => setSections((s) => [...s, { heading: "", body: "" }]);
  const removeSection = (i: number) => setSections((s) => s.filter((_, idx) => idx !== i));

  const inputCls =
    "w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand";

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/blog" className="text-xs uppercase tracking-widest text-foreground/50 hover:text-brand">
          ← All posts
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-foreground/50">
          {post.status.replace("_", " ")} · {post.source === "ai" ? "🤖 AI" : "✍️ manual"}
        </span>
      </div>

      <div>
        <h1 className="font-seasons text-3xl text-brand">Edit post (Deutsch)</h1>
        <p className="text-sm text-foreground/50 mt-1">
          Bearbeite den deutschen Text. EN/FR/IT folgen automatisch (oder per Re-Translate, bald).
        </p>
      </div>

      {/* Hero image preview */}
      {heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={heroImage} alt="" className="w-full aspect-[16/9] object-cover border border-accent/40" />
      )}

      <Field label="Hero-Bild URL">
        <input className={inputCls} value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://…" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Kategorie">
          <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} />
        </Field>
        <Field label="Lesezeit (Min.)">
          <input type="number" className={inputCls} value={readingMin} onChange={(e) => setReadingMin(Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Titel">
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>

      <Field label="Kurzbeschreibung (Karte)">
        <textarea className={`${inputCls} min-h-[70px]`} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </Field>

      <Field label="Meta-Description (SEO, 140–160 Zeichen)">
        <textarea className={`${inputCls} min-h-[60px]`} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} />
        <span className="text-[10px] text-foreground/40">{metaDesc.length} Zeichen</span>
      </Field>

      {/* Sections */}
      <div className="space-y-5">
        <p className="text-[10px] uppercase tracking-widest text-foreground/60">Abschnitte</p>
        {sections.map((sec, i) => (
          <div key={i} className="border border-accent/40 p-4 bg-background space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-foreground/40">Abschnitt {i + 1}</span>
              <button onClick={() => removeSection(i)} className="text-[10px] uppercase tracking-widest text-brand/70 hover:text-brand">
                Entfernen
              </button>
            </div>
            <input className={inputCls} placeholder="Überschrift (H2)" value={sec.heading} onChange={(e) => updateSection(i, "heading", e.target.value)} />
            <textarea className={`${inputCls} min-h-[120px]`} placeholder="Text… (Leerzeile = neuer Absatz)" value={sec.body} onChange={(e) => updateSection(i, "body", e.target.value)} />
          </div>
        ))}
        <button onClick={addSection} className="text-xs uppercase tracking-widest border border-accent/40 px-4 py-2 hover:border-brand transition-colors">
          + Abschnitt hinzufügen
        </button>
      </div>

      {msg && (
        <p className={`text-sm p-3 border ${msg.startsWith("Error") ? "text-brand border-brand/30 bg-brand/5" : "text-emerald-700 border-emerald-200 bg-emerald-50"}`}>
          {msg}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 sticky bottom-4 bg-background/80 backdrop-blur-sm p-3 border border-accent/40">
        <button onClick={() => call("save")} disabled={busy} className="px-6 py-3 text-xs uppercase tracking-widest border border-accent/40 hover:border-brand transition-colors disabled:opacity-40">
          Speichern
        </button>
        <button onClick={() => call("publish")} disabled={busy} className="px-6 py-3 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover transition-colors disabled:opacity-40">
          {post.status === "published" ? "Aktualisieren & live" : "Veröffentlichen"}
        </button>
        <button onClick={() => call("discard")} disabled={busy} className="px-6 py-3 text-xs uppercase tracking-widest text-foreground/50 hover:text-brand transition-colors disabled:opacity-40 ml-auto">
          Verwerfen
        </button>
      </div>

      {post.status === "published" && (
        <Link href={`/blog/${post.slug}`} target="_blank" className="inline-block text-xs uppercase tracking-widest text-brand hover:underline">
          Live ansehen → /blog/{post.slug}
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
