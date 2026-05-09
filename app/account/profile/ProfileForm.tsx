"use client";

import { useState } from "react";

type Lang = "de" | "en" | "fr" | "it";

type Initial = {
  name: string;
  phone: string;
  company: string;
  preferred_lang: Lang | null;
};

const LANG_LABELS: Record<Lang, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
  it: "Italiano",
};

export default function ProfileForm({ initial }: { initial: Initial }) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [company, setCompany] = useState(initial.company);
  const [preferredLang, setPreferredLang] = useState<Lang | "">(initial.preferred_lang ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    setError(null);

    try {
      const r = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          phone: phone || null,
          company: company || null,
          preferred_lang: preferredLang || null,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setStatus("error");
        setError(d.error ?? "Could not save");
      } else {
        setStatus("saved");
        // Reset "Saved" badge after 2.5s
        setTimeout(() => setStatus("idle"), 2500);
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-5 border border-accent/40 bg-background p-6 md:p-8">
      <Field label="Name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className="w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand"
          placeholder="Anna Müller"
        />
      </Field>

      <Field label="Phone">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={40}
          className="w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand"
          placeholder="+41 79 123 45 67"
        />
      </Field>

      <Field label="Company (optional)">
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          maxLength={120}
          className="w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand"
          placeholder=""
        />
      </Field>

      <Field label="Preferred language" hint="Used for booking confirmation emails.">
        <select
          value={preferredLang}
          onChange={(e) => setPreferredLang(e.target.value as Lang | "")}
          className="w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand"
        >
          <option value="">— Auto-detect from browser —</option>
          {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
            <option key={l} value={l}>{LANG_LABELS[l]}</option>
          ))}
        </select>
      </Field>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-brand text-background text-xs uppercase tracking-widest hover:bg-brand-hover disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && (
          <span className="text-xs uppercase tracking-widest text-emerald-700">✓ Saved</span>
        )}
        {status === "error" && (
          <span className="text-xs text-brand">Error: {error}</span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-foreground/60">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-[11px] text-foreground/50 italic">{hint}</span>}
    </label>
  );
}
