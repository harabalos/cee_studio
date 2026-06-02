# CEE Studio — Automated Blog Spec

> Goal: every 10 days, Claude writes a German-first blog post (translated to
> EN/FR/IT), pulls a themed stock photo, and queues it for Konstantina to
> review, edit, and publish from the admin dashboard. Nothing goes live
> without her approval.

Status: **BUILT (Phase 1 + Phase 2 shipped).** Voice rules are a living draft —
refine `SYSTEM_DE` in `lib/blog/generate.ts` over time.

## ✅ What's live
- DB-backed blog (blog_posts + blog_topics, 24 topics seeded)
- Public: /blog index + /blog/[slug] dynamic pages (4-lang, German fallback)
- Admin CMS: /admin/blog list + editor (Save/Publish/Discard), "New post"
- AI generator: /api/cron/generate-blog (Claude post + EN/FR/IT translations)
- Stock hero: Pexels search → sharp compress → Supabase Storage (graceful null)
- Owner email notification on each new draft (Resend)
- Vercel cron: days 1 / 11 / 21 at 08:00 (≈ every 10 days)
- "🤖 Generate now" button in admin to trigger manually

## 🔑 Owner setup to ACTIVATE (currently dormant on dummy keys)
Add these env vars in **Vercel → Settings → Environment Variables**, then redeploy:
- `ANTHROPIC_API_KEY` — from console.anthropic.com (real key; dummy = generator returns 503)
- `PEXELS_API_KEY` — from pexels.com/api (free; without it, posts get no hero image and you add one at review)
- `BLOG_REVIEW_EMAIL` — where draft notifications go (default info@ceestudio.ch)
- `ANTHROPIC_MODEL` — optional, defaults to claude-3-5-sonnet-latest

Until the real ANTHROPIC_API_KEY is set, everything else works (manual posts,
publishing) and the generator simply reports "not configured".


---

## 1. The architectural shift (why this is non-trivial)

Today the blog is **hardcoded** (`lib/blog/posts.ts` + `.tsx` files). Publishing
needs a developer commit + deploy. That's incompatible with "Konstantina
approves and publishes herself."

**We move the blog to data:**
- Posts live in a Supabase table `blog_posts`.
- `/blog` and `/blog/[slug]` render from the DB.
- Publishing = flipping `status` to `published`. **No deploy.**
- `sitemap.xml` + `image-sitemap.xml` query the DB so new posts auto-index.

Two hard constraints this forces:
1. **Images can't be written to `/public` at runtime** — Vercel's filesystem is
   read-only/ephemeral. So the stock photo is compressed and uploaded to
   **Supabase Storage** (`blog-images` public bucket); the post stores that URL.
2. **next/image** must allow the Supabase Storage + Pexels hostnames.

---

## 2. End-to-end flow

```
[Vercel Cron — every 10 days, Mon 08:00]
        ↓
[/api/cron/generate-blog]  (protected by CRON_SECRET)
   1. Pick next queued topic from blog_topics
   2. Claude API → German post (voice rules below) as structured JSON
   3. Claude API → translate to EN / FR / IT
   4. Take Claude's imageQuery → Pexels API → best landscape photo
   5. sharp: resize 1600px + compress (~q78) → upload to Supabase Storage
   6. Insert into blog_posts (status = "pending_review", unique token)
   7. Mark topic as "used"
        ↓
[Resend email → Konstantina]
   "📝 Neuer Blog-Entwurf bereit: «<Titel>» — Prüfen & Veröffentlichen"
   → button to /admin/blog
        ↓
[/admin/blog  — already auth-protected admin area]
   • List: Drafts (pending_review) + Published
   • Open a draft → live preview + editable form
        ↓
   Actions:
   ✅ Publish            status=published, published_at=now → live instantly
   ✏️  Edit + Save        tweak any field (German primary)
   🔄 Re-translate        regenerate EN/FR/IT from her edited German
   🖼️  Change image       swap the stock photo (new Pexels search or upload)
   🗑️  Discard            status=discarded
```

---

## 3. Voice & rules (the LLM system prompt) — **NEEDS YOUR SIGN-OFF**

This is the brand voice. Draft below — edit freely.

### Language & address
- **German is primary** (de-CH spelling: "ss" not "ß"). Informal **"du"** —
  matches the booking emails. Then translate to EN, FR, IT.

### Tone
- Warm, clear, helpful — like a creative friend who runs a studio.
- Confident but never salesy or hypey. No "game-changer", no "in der heutigen
  schnelllebigen Welt", no fake urgency.
- Editorial and calm, matching the minimal site aesthetic.

### Structure (per post)
- 1 H1 (the title)
- Short intro (2-3 sentences, hook + what the reader will get)
- 3-5 sections, each with an H2 and 1-2 short paragraphs
- A soft closing CTA paragraph linking to **/booking** or **/pricing**
- 600-900 words

### Must include
- The target keyword 2-4× **naturally** (no stuffing)
- 1-2 internal links to relevant pages (/studio, /pricing, /services, /faq)
- Concrete, useful info — real tips a Zürich creator/photographer can act on

### Must avoid (anti-slop rules)
- No fabricated statistics, prices, quotes, or testimonials
- No clichés / filler intros ("In today's world…")
- No emoji in the body, no exclamation spam
- No invented studio features — only what actually exists (see site facts)
- No "as an AI" / meta references
- Don't restate the title in the first sentence

### SEO output fields
- `metaTitle` ≤ 60 chars · `metaDescription` 140-160 chars
- `imageQuery`: 3-5 word English stock-photo search (e.g. "minimal photography
  studio natural light")

### Grounding facts (given to the model every time)
60 m² daylight studio in Zürich (Glattpark), self-service from CHF 70/h,
memberships from CHF 220/mo (3-month min), cyc wall, Godox lighting, makeup
area, lounge, card/TWINT payment, instant online booking. 4 languages.

### Output contract (JSON)
```json
{
  "title": "…", "metaTitle": "…", "metaDescription": "…",
  "category": "Guide | Tips | Behind the Scenes | News",
  "readingMinutes": 4,
  "imageQuery": "…",
  "sections": [{ "heading": "…", "body": "…" }, …],
  "internalLinks": ["/pricing", "/studio"]
}
```
German generated first; the same schema is produced for en/fr/it by translation.

---

## 4. Topics — **NEEDS YOUR SIGN-OFF**

Topics are **predefined by us** and seeded into a `blog_topics` table. The cron
takes the next `queued` topic each run. You can add/edit/reorder topics in the
DB (or a small admin screen later).

Each topic row: `{ keyword, brief, status: queued|used }`.

### Proposed seed list (24 — ~8 months at 1/10 days)
1. Self-Service Fotostudio Zürich — wie es funktioniert (kw: self-service fotostudio zürich)
2. Cyc Wall vs Papierhintergrund — welcher passt zu deinem Shoot
3. Tageslicht vs Studioblitz — wann was nehmen
4. Wie viele Stunden brauchst du wirklich für ein Shoot
5. Studio mieten in Zürich — was kostet es wirklich
6. Die 7 besten Locations für Lifestyle-Shoots in Zürich (link-bait)
7. Content Creation fürs eigene Business — Setup-Guide
8. Produktfotografie zuhause vs im Studio
9. Vorbereitung: dein erstes Studio-Shoot Schritt für Schritt
10. Beauty- & Makeup-Shoots — was du mitbringen solltest
11. Wie du als Creator Zeit & Geld mit einem Studio-ABO sparst
12. Moodboards: warum sie jeden Shoot besser machen
13. Die wichtigste Studio-Ausrüstung erklärt (für Einsteiger)
14. Posing-Basics für Portraits — einfache Tipps
15. Farbige Gels & kreatives Licht — Ideen
16. E-Commerce-Fotos die verkaufen — Grundlagen
17. Behind the Scenes: ein typischer Shoot-Tag im CEE Studio
18. Für Agenturen: Studio + Produktion an einem Ort
19. Reels & TikToks im Studio drehen — Setup-Tipps
20. Herbst/Winter-Shoots: Licht & Stimmung
21. Geschenkidee: Studio-Zeit für Kreative
22. Naturlicht im 5. Stock — warum die Aussicht zählt
23. Häufige Fehler beim Studio-Shoot (und wie du sie vermeidest)
24. Markenfotografie: konsistenter Look über alle Kanäle

---

## 5. Data model

### Table `blog_posts`
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| slug | text unique | auto from title |
| status | text | draft / pending_review / published / discarded |
| category | text | |
| hero_image | text | Supabase Storage public URL |
| hero_credit | text | Pexels photographer (stored even if not shown) |
| reading_minutes | int | |
| title | jsonb | {de,en,fr,it} |
| summary | jsonb | {de,en,fr,it} |
| meta_description | jsonb | {de,en,fr,it} |
| body | jsonb | {de:[{heading,body}],en:…,…} |
| internal_links | text[] | |
| review_token | text | for the email deep-link |
| created_at / published_at | timestamptz | |

### Table `blog_topics`
| col | type |
|---|---|
| id | uuid pk |
| keyword | text |
| brief | text |
| status | text (queued/used) |
| sort | int |

---

## 6. Stock photos — Pexels (recommended)

- **Pexels API**: free, 200 req/hour, **commercial use OK, no attribution
  required** — cleanest licensing for an automated system.
- (Unsplash is already in next.config but its guidelines "require" attribution
  + hotlinking — messier for automation. Pexels is the safer pick.)
- Flow: `imageQuery` → Pexels search → first landscape result → download →
  `sharp` resize 1600px + q78 → upload to Supabase Storage `blog-images`.
- We store `hero_credit` (photographer) even though Pexels doesn't require it.
- ⚠️ Note the slight irony (a photo studio using stock) — acceptable for blog
  illustration, and Konstantina can swap any image at review.

---

## 7. Build phases

**Phase 1 — CMS foundation (no AI yet)**
- `blog_posts` + `blog_topics` tables + migration
- Migrate /blog + /blog/[slug] to read from DB (keep the existing welcome post
  by seeding it into the table)
- sitemap + image-sitemap query the DB
- Admin `/admin/blog`: list + create/edit/preview/publish/discard
- Supabase Storage `blog-images` bucket + next.config hostname
→ Outcome: a working blog CMS Konstantina can use by hand.

**Phase 2 — AI generation layer**
- Anthropic SDK + `ANTHROPIC_API_KEY`
- `/api/cron/generate-blog` (Claude post + translations)
- Pexels integration + sharp compress + Storage upload
- Resend "draft ready" notification
- Vercel cron schedule (every 10 days)
- Admin: "Re-translate from German" + "Change image" buttons
→ Outcome: full automation with human approval gate.

---

## 8. New env vars needed
- `ANTHROPIC_API_KEY` — Claude generation
- `PEXELS_API_KEY` — stock photos
(both free to obtain; you'll create the accounts)

---

## 9. Open decisions (confirm to start)
1. Voice & rules in §3 — OK as drafted, or changes?
2. Topic seed list in §4 — OK, or add/remove/reorder?
3. Pexels for stock (vs Unsplash) — OK?
4. German uses informal "du" (matches booking emails) — OK?
5. Build Phase 1 first (CMS), then Phase 2 (AI) — OK?

---

_Created 2026-05-31. Sign off §3 + §4, then we build Phase 1._
