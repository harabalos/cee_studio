/**
 * Claude blog generation (server-only).
 *
 * generateGermanPost(topic) → structured German post.
 * translatePost(post) → { en, fr, it } translations of the same structure.
 *
 * Voice rules live in SYSTEM_DE below (draft — refine over time). Model is
 * configurable via ANTHROPIC_MODEL; falls back to a stable Sonnet alias.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { BlogLang, BlogSection } from "./db";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

export interface GeneratedPost {
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  readingMinutes: number;
  imageQuery: string;
  sections: BlogSection[];
  internalLinks: string[];
}

const STUDIO_FACTS = `
CEE Studio facts (only use what's true here — never invent features/prices):
- 60 m² daylight photo studio in Zürich (Glattpark / Opfikon), 5th floor, view over Zurich
- Self-service rental from CHF 70/hour (1h–8h); half day CHF 250, full day CHF 490
- Monthly memberships from CHF 220 (Starter 4h), Pro CHF 420 (9h), Unlimited CHF 780 (16h); 3-month minimum
- Equipment: paper backdrops & backdrop system, Godox lighting + softboxes, paper backdrops (white/black/beige),
  make-up area with Hollywood mirror, lounge, espresso, WiFi, free parking
- Payment: card or TWINT. Instant online booking with confirmation email.
- 4 languages: DE (primary), EN, FR, IT
- Pages to link to: /studio (the studio), /pricing (rates & memberships), /services (production support), /faq, /booking
`;

const SYSTEM_DE = `Du schreibst Blog-Artikel für CEE Studio, ein Fotostudio in Zürich.

STIMME & STIL:
- Schreibe auf Deutsch (Schweizer Schreibweise: "ss" statt "ß"). Per "du", informell.
- Warm, klar, hilfreich — wie eine kreative Freundin, die ein Studio führt.
- Selbstbewusst, aber nie werblich oder reisserisch. Keine Übertreibungen.
- Ruhig und editorial, passend zum minimalistischen Auftritt.

STRUKTUR:
- 3–5 Abschnitte, je mit Überschrift (H2) und 1–2 kurzen Absätzen.
- 600–900 Wörter. Letzter Abschnitt: sanfter Call-to-Action mit Link zu /booking oder /pricing.
- Absätze durch Leerzeile trennen ("\\n\\n").

REGELN (Anti-Slop):
- Keine erfundenen Statistiken, Preise, Zitate oder Testimonials.
- Keine Floskeln ("In der heutigen schnelllebigen Welt…"), keine Emojis im Text.
- Nur echte Studio-Features verwenden (siehe Fakten).
- Keine Meta-Hinweise ("als KI…"). Titel nicht im ersten Satz wiederholen.
- Keyword natürlich 2–4× einbauen.

SEO:
- metaTitle ≤ 60 Zeichen. metaDescription 140–160 Zeichen.
- imageQuery: 3–5 englische Wörter für die Stockfoto-Suche.

${STUDIO_FACTS}

Antworte AUSSCHLIESSLICH mit gültigem JSON in diesem Schema (keine Markdown-Fences):
{"title":"","metaTitle":"","metaDescription":"","category":"Guide|Tipps|Behind the Scenes|News","readingMinutes":4,"imageQuery":"","sections":[{"heading":"","body":""}],"internalLinks":["/pricing"]}`;

function client(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function extractJson(text: string): unknown {
  // Tolerate accidental code fences or leading prose.
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(raw);
}

export async function generateGermanPost(topic: {
  keyword: string;
  brief?: string;
}): Promise<GeneratedPost> {
  const userMsg = `Thema-Keyword: "${topic.keyword}"
${topic.brief ? `Kurzbeschreibung: ${topic.brief}` : ""}

Schreibe den Blog-Artikel.`;

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 2500,
    system: SYSTEM_DE,
    messages: [{ role: "user", content: userMsg }],
  });

  const text = res.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
  const parsed = extractJson(text) as GeneratedPost;
  // Minimal validation / defaults.
  parsed.readingMinutes = parsed.readingMinutes || 4;
  parsed.category = parsed.category || "Guide";
  parsed.sections = Array.isArray(parsed.sections) ? parsed.sections : [];
  parsed.internalLinks = Array.isArray(parsed.internalLinks) ? parsed.internalLinks : [];
  return parsed;
}

const TRANSLATE_LANGS: { code: Exclude<BlogLang, "de">; name: string }[] = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
];

export interface TranslatedFields {
  title: string;
  summary: string;
  metaDescription: string;
  sections: BlogSection[];
}

const LANG_NAME: Record<BlogLang, string> = {
  de: "German (Swiss, informal 'du', 'ss' not 'ß')",
  en: "English",
  fr: "French",
  it: "Italian",
};

/**
 * Translate a set of fields FROM one language INTO the given targets.
 * Used by the admin "Re-translate" action so an English edit can refresh
 * the German/French/Italian versions (or vice-versa).
 */
export async function retranslate(
  source: BlogLang,
  fields: TranslatedFields,
  targets: BlogLang[]
): Promise<Record<BlogLang, TranslatedFields>> {
  const out = {} as Record<BlogLang, TranslatedFields>;
  for (const target of targets) {
    if (target === source) continue;
    const res = await client().messages.create({
      model: MODEL,
      max_tokens: 2500,
      system: `You are a professional translator for a Zürich photo studio's blog. Translate the given JSON from ${LANG_NAME[source]} into ${LANG_NAME[target]}, keeping the warm, informal, non-salesy tone. Keep the same JSON structure and keys. Do not translate URLs or markdown link targets. Keep proper nouns (CEE Studio, Godox, TWINT, Zürich) as-is. Respond with ONLY the translated JSON, no fences.`,
      messages: [{ role: "user", content: JSON.stringify(fields) }],
    });
    const text = res.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
    out[target] = extractJson(text) as TranslatedFields;
  }
  return out;
}

/** Translate a German post into EN/FR/IT, preserving structure + voice. */
export async function translatePost(
  de: GeneratedPost,
  summaryDe: string
): Promise<Record<Exclude<BlogLang, "de">, TranslatedFields>> {
  const out = {} as Record<Exclude<BlogLang, "de">, TranslatedFields>;

  for (const lang of TRANSLATE_LANGS) {
    const payload = {
      title: de.title,
      summary: summaryDe,
      metaDescription: de.metaDescription,
      sections: de.sections,
    };
    const res = await client().messages.create({
      model: MODEL,
      max_tokens: 2500,
      system: `You are a professional translator for a Zürich photo studio's blog. Translate the given JSON from German into ${lang.name}, keeping the warm, informal, non-salesy tone. Keep the same JSON structure and keys. Do not translate URLs. Keep proper nouns (CEE Studio, Godox, TWINT, Zürich) as-is. Respond with ONLY the translated JSON, no fences.`,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
    });
    const text = res.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
    out[lang.code] = extractJson(text) as TranslatedFields;
  }

  return out;
}
