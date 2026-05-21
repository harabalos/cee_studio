# Technical SEO — Implementation Backlog

> Dev-side work only. Pure code changes the team can implement.
> Owner-side actions (GBP, reviews, citations) live in `SEO_PLAN.md`.

Status legend: 🔴 Critical · 🟡 High · 🟢 Medium · ⚪ Nice-to-have
Effort: S (≤1h) · M (1–4h) · L (4–8h) · XL (8h+)

---

## ✅ Already Done

- [x] JSON-LD `LocalBusiness` + `PhotographyBusiness` schema in root layout
- [x] `areaServed` includes Zürich + neighboring cities
- [x] `geo` coordinates set to studio location
- [x] `sitemap.ts` with priorities + hreflang alternates (de-CH, de, en, fr, it)
- [x] `robots.ts` allowing crawl, disallowing /api + /_next
- [x] Root metadata: title template, description, keywords (DE + EN + FR + IT)
- [x] Vercel Analytics installed
- [x] Mobile viewport meta + theme-color
- [x] OG image (`og-image.jpg`) referenced
- [x] HTTPS enforced (Vercel default)
- [x] Cookie consent banner

---

## 🔴 P0 — Critical (do this week)

### T-001 — Per-page `metadata` exports (M)
Every page currently inherits root metadata only. Each route needs **unique** `title` + `description` matched to the keyword cluster for that page.

**Files to touch:**
```
app/page.tsx            → "Fotostudio Zürich (Glattpark) — Studio mieten ab CHF 70/h"
app/studio/page.tsx     → "Studio Specifikationen + Preise — Fotostudio CEE Zürich"
app/equipment/page.tsx  → "Equipment & Galerie — Tageslichtstudio Zürich CEE"
app/space/page.tsx      → "Lifestyle & Content Studio Mieten Zürich — CEE"
app/booking/page.tsx    → "Studio buchen — CEE Fotostudio Glattpark Zürich"
app/contact/page.tsx    → "Kontakt — CEE Studio Glattpark | Thurgauerstrasse"
app/faq/page.tsx        → "FAQ Fotostudio Zürich — Häufige Fragen | CEE Studio"
app/about/page.tsx      → "Über uns — CEE Studio Konstantina | Fotostudio Zürich"
app/rules/page.tsx      → "Studio Hausregeln — CEE Photo Studio Zürich"
app/membership/signup/page.tsx → "Membership Fotostudio Zürich — Monatliches ABO"
```

**Implementation:**
For each `"use client"` page, add a sibling `page-metadata.ts` (re-export pattern), OR convert top of file to server component wrapper.

**Acceptance:**
- Each page has unique `<title>` and `<meta name="description">`
- Keyword density: primary keyword 1–2× in title, 1× in description
- Length: title ≤60 chars, description 140–160 chars
- Verify with `curl -s https://www.ceestudio.ch/<route> | grep -i '<title>\|description'`

---

### T-002 — FAQ Schema markup (S)
The `/faq` page has 15–20 Q&As but no schema. Add `FAQPage` JSON-LD to get rich results in Google (FAQ accordions inline in SERPs → 30%+ CTR boost).

**File:** `app/faq/page.tsx`

**Implementation:**
Add a `<Script type="application/ld+json">` block emitting:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Where is CEE Studio?",
      "acceptedAnswer": { "@type": "Answer", "text": "..." } },
    ...
  ]
}
```

Sources the same Q&A data array already used for rendering — no content duplication.

**Acceptance:**
- Validate at [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
- 0 errors, all questions detected

---

### T-003 — Google Search Console verification meta tag (S)
Add the verification meta tag once owner pulls it from GSC.

**File:** `app/layout.tsx`

```tsx
verification: {
  google: "<paste-token-here>",
  other: { "msvalidate.01": "<bing-token>" },
},
```

**Acceptance:**
- GSC shows "Verified" status
- Sitemap submitted successfully

---

## 🟡 P1 — High Priority (next 2 weeks)

### T-004 — Service / Offer schema for memberships + rates (M)
Right now JSON-LD has `hasOfferCatalog` but offers are loose. Add full `Service` + `Offer` schema with `priceSpecification`.

**File:** `app/layout.tsx` (extend existing `jsonLd`) OR per-page on `/studio`.

**Schema to add:**
```json
{
  "@type": "Service",
  "name": "Self-Service Studio Rental",
  "provider": { "@id": "https://ceestudio.ch/#business" },
  "areaServed": [...],
  "offers": [
    {
      "@type": "Offer",
      "name": "1-hour rental",
      "price": "70",
      "priceCurrency": "CHF",
      "availability": "https://schema.org/InStock",
      "url": "https://ceestudio.ch/booking"
    },
    // ... 2h, 3h, 4h, 8h
  ]
}
```

Plus a separate `Product` block per membership tier with `recurringFrequency`.

**Acceptance:** Rich results test passes; Google may show price snippets in SERPs.

---

### T-005 — Image alt-text audit + rewrite (M)
Many images currently have generic alts ("CEE Studio Hero", "Studio") which don't help SEO. Rewrite each to include keyword + geographic context.

**Standard pattern:**
> `Fotostudio Zürich Glattpark — <specific scene description>`

**Examples:**
- `studio-hero.jpg` → "Fotostudio Zürich Glattpark — Cyc Wall mit Tageslicht und Godox Beleuchtung"
- `lounge-cowhide-view.jpg` → "Lifestyle Fotostudio Zürich Glattpark — Lounge mit Aussicht und Cowhide-Teppich"
- `glam-station.jpg` → "Make-up Bereich CEE Fotostudio Zürich — Hollywood Spiegel und Director Chair"

**Files to scan:** all `app/**/*.tsx` containing `<Image src=`.

**Acceptance:**
- No alt = empty string or repeated text
- Each unique image has unique descriptive alt
- Primary alt of hero image contains "Fotostudio Zürich"

---

### T-006 — Geographic content block on homepage (S)
Add a short prominent text block highlighting proximity to Zürich landmarks. Google parses page text for local relevance.

**File:** `app/page.tsx`

**Block content:**
> "5 Min. von Zürich Oerlikon · 10 Min. von Zürich HB mit Tram 10 · 5 Min. vom Flughafen Zürich"

Plus a longer paragraph (semantic, not stuffed):
> "Unser Studio im Glattpark (Opfikon) liegt direkt an der Grenze zu Zürich-Seebach. Mit dem Tram 10 erreichst du uns in 10 Minuten vom Hauptbahnhof Zürich, mit dem Auto in 5 Minuten vom Flughafen Zürich. Parkplätze direkt vor dem Gebäude verfügbar."

**Placement:** Near "About / Intro" section, not the hero.

**Acceptance:** "Zürich" mentioned 3–5× across homepage in natural context. Don't keyword stuff.

---

### T-007 — Open Graph + Twitter Card per page (M)
Root has OG image but per-page OG is missing. Each page should have its own `og:title`, `og:description`, `og:image` matching the page content.

**Implementation:**
Extend the `metadata` exports from T-001 with `openGraph` and `twitter` fields.

**Acceptance:**
- Each page passes the [OpenGraph debugger](https://opengraph.xyz/)
- Twitter Card validator shows correct preview

---

### T-008 — WebP image conversion (M)
JPG → WebP cuts file size 40–60% at identical visual quality. Faster page = better Core Web Vitals = ranking signal.

**Implementation options:**
- **Option A (recommended):** Next.js `Image` already auto-serves WebP when supported. Just confirm `next.config.js` has no override blocking it. **No work needed if Image component is used everywhere.**
- **Option B:** Pre-convert source images:
  ```bash
  for f in public/images/*.jpg; do
    cwebp -q 82 "$f" -o "${f%.jpg}.webp"
  done
  ```

**Audit first:** check that all `<Image>` usages let Next.js handle format.

**Acceptance:**
- Lighthouse "Serve images in next-gen formats" check passes
- Confirm via `curl -I -H 'Accept: image/webp' https://www.ceestudio.ch/_next/image?url=/images/hero.jpg` returns `Content-Type: image/webp`

---

## 🟢 P2 — Medium Priority (this month)

### T-009 — Blog infrastructure (XL)
Build `/blog` section to host SEO content. Static MD/MDX-driven for simplicity.

**Tech choice:**
- Next.js App Router with file-based routing: `app/blog/[slug]/page.mdx`
- MDX for rich formatting + embedded components
- Sitemap auto-includes new posts

**Required features:**
- Article list page with categories
- Individual article page with: H1, breadcrumbs, author, date, reading time, social share, related posts
- Article JSON-LD (`Article` schema with author, datePublished, image)
- Auto sitemap injection
- Tag pages (`/blog/tag/[tag]`)

**Acceptance:** Can publish a new post by adding `.mdx` file + restart; appears in sitemap; valid Article schema.

---

### T-010 — Review acquisition + display flow (L)
After successful booking + scheduled date passes (cron `auto-complete`), send follow-up email asking for Google review with a deep-link.

**Implementation:**
- New cron route or extension of `auto-complete` to schedule a "review request" 24h after booking ends
- Email template `BookingReviewRequest.tsx` with single CTA: "Leave a review on Google" → `https://search.google.com/local/writereview?placeid=<placeid>`
- Optional: a token-protected `/review/<token>` page where customer rates and we capture testimonial text
- Display top reviews on homepage (manually curated to start, fetched from GBP API later)

**Acceptance:**
- Email arrives ~24h after booking ends
- Click rate measurable
- Reviews visible on homepage (testimonials carousel)

---

### T-011 — Internal linking audit (M)
Cross-link related pages with **descriptive anchor text** (not "click here"). Improves page authority distribution + topical relevance.

**Examples:**
- From `/studio` page: link to `/equipment` as "Sieh dir das komplette Equipment unseres Fotostudios in Zürich an"
- From `/blog/cyc-wall-vs-paper-backdrop` (when it exists): link to `/equipment#backdrops` as "Unsere Hintergründe im Detail"
- Footer: ensure all primary pages linked with target keywords in anchor text

**Acceptance:** Each page has 3–5 contextual internal links with keyword-rich anchors.

---

### T-012 — Breadcrumb schema + visual breadcrumbs (S)
Add `BreadcrumbList` JSON-LD + visual breadcrumbs on sub-pages. Google may show breadcrumb in SERP instead of URL → cleaner display.

**File:** new component `components/Breadcrumbs.tsx`

**Acceptance:** Breadcrumbs appear at top of /studio, /equipment, /space, /faq, /blog/*. Schema validates.

---

### T-013 — Canonical URLs (S)
Set `<link rel="canonical">` explicitly per page to avoid duplicate-content issues from query params or trailing slashes.

**Implementation:** Add `alternates.canonical` to each page metadata.

**Acceptance:** Every page's canonical points to itself; verified via curl.

---

### T-014 — `hreflang` per page (already in sitemap, verify in headers) (S)
Sitemap declares hreflang but each page should also emit `<link rel="alternate" hreflang="...">` headers.

Since we don't have separate URLs per language (one URL, client-side language switch), the proper schema is `x-default` only — confirm this is intentional, OR migrate to language-prefixed URLs (major refactor, defer to v2).

**Current behavior:** Single URL serves all languages via client-side React context. Google likely sees only one language. This is **suboptimal but acceptable** for now.

**Future fix (XL):** Migrate to `/de`, `/en`, `/fr`, `/it` URL prefixes with `next-intl` or middleware-based routing.

---

## ⚪ P3 — Nice-to-have

### T-015 — `Article` schema for future blog posts (S)
Once blog ships, every post needs `Article` JSON-LD.

### T-016 — `Review` schema integration with GBP API (L)
Pull reviews dynamically from Google Business Profile API → display on site → emit `Review` schema → stars appear in SERPs.

### T-017 — `LocalBusiness.aggregateRating` (S)
Once 10+ reviews exist, add aggregate rating to schema. Triggers star display in SERPs.

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.9",
  "reviewCount": "42"
}
```

⚠️ Only add when reviews ACTUALLY exist on the site — Google penalizes fake aggregate ratings.

### T-018 — `Event` schema for shoots/workshops (S)
If CEE hosts open studio days / workshops, add `Event` schema. May appear in Google Events.

### T-019 — Lighthouse CI in GitHub Actions (M)
Automate Core Web Vitals regression detection. Fail PRs that ship images >500KB or LCP >3s.

### T-020 — XML image sitemap (S)
Separate `image-sitemap.xml` listing all studio images with captions + geo. Helps Google Images ranking.

### T-021 — `speakable` schema for voice search (S)
Mark sections eligible for voice assistants. Future-looking, low impact today.

### T-022 — AMP version (XL, deprecated by Google in 2024)
Skip. AMP is no longer required for ranking.

---

## Implementation Order (suggested)

1. **Week 1**: T-001, T-002, T-003 → unique metadata + FAQ rich results + GSC verified
2. **Week 2**: T-004, T-005, T-006 → schema completeness + image alts + geo content
3. **Week 3**: T-007, T-008 → social previews + image performance
4. **Week 4–6**: T-009 → blog launches (1 article live)
5. **Week 6–8**: T-010 → review flow live
6. **Ongoing**: T-011, T-012, T-013 → polish + maintenance

---

## Acceptance — How We Know SEO is Live

After all P0 + P1 tasks ship:
- [ ] `https://search.google.com/test/rich-results` shows 5+ schemas detected, 0 errors
- [ ] `https://pagespeed.web.dev/` shows green Core Web Vitals on mobile + desktop
- [ ] Every page has unique title + description + OG image
- [ ] FAQ accordions appear in Google SERP for `site:ceestudio.ch faq`
- [ ] GBP profile claimed, 5+ reviews, 20+ photos
- [ ] GSC reports indexing on all sitemap URLs
- [ ] Lighthouse SEO score ≥ 95/100 on every page

---

## Code Patterns We'll Use

### Per-page metadata (T-001)
```tsx
// app/studio/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Specifikationen + Preise",
  description: "60 m² Tageslichtstudio in Zürich (Glattpark)...",
  alternates: { canonical: "https://ceestudio.ch/studio" },
  openGraph: {
    title: "Fotostudio Zürich — CEE Studio Spezifikationen",
    description: "60 m² Tageslichtstudio...",
    images: ["/images/studio-overview.jpg"],
    url: "https://ceestudio.ch/studio",
    type: "website",
    locale: "de_CH",
  },
};

export default function StudioPage() { ... }
```

⚠️ Pages currently start with `"use client"` — metadata exports require server components. Pattern: split into `app/studio/page.tsx` (server, exports metadata + renders client component) + `app/studio/StudioClient.tsx` (the existing client component).

### FAQ Schema (T-002)
```tsx
import Script from "next/script";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(f => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

<Script
  id="faq-schema"
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
/>
```

### Server/Client split pattern (for client-state pages)
```tsx
// app/studio/page.tsx  (SERVER component)
import type { Metadata } from "next";
import StudioClient from "./StudioClient";

export const metadata: Metadata = { ... };
export default function Page() { return <StudioClient />; }

// app/studio/StudioClient.tsx  (existing code, with "use client" at top)
"use client";
export default function StudioClient() { ... }
```

---

_Last updated: 2026-05-21. See `SEO_PLAN.md` for strategy. Update this file as tasks complete._
