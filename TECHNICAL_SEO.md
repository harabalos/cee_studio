# Technical SEO — Implementation Backlog

> Dev-side work only. Pure code changes the team can implement.
> Owner-side actions (GBP, reviews, citations) live in `SEO_PLAN.md`.

Status legend: 🔴 Critical · 🟡 High · 🟢 Medium · ⚪ Nice-to-have
Effort: S (≤1h) · M (1–4h) · L (4–8h) · XL (8h+)

---

## 📊 Progress Snapshot — 2026-05-21

**Code-side completion: 22 / 25 tickets ✅ (88%)** — includes 3 GEO/AEO tickets added in Phase 5.

| Phase | Done | Total | % |
|---|---|---|---|
| Foundation (pre-existing) | 11 | 11 | 100% |
| P0 Critical | 3 | 3 | 100% |
| P1 High | 5 | 5 | 100% |
| P2 Medium | 4 | 6 | 67% |
| P3 Nice-to-have | 1 | 8 | 13% |

**What's truly blocking 100%:** all remaining work is either (a) blocked on owner actions (reviews, GBP) or (b) genuine nice-to-haves with marginal ROI.

---

## ✅ Completed

### Foundation (pre-existing)
- [x] JSON-LD `LocalBusiness` + `PhotographyBusiness` schema in root layout
- [x] `areaServed` includes Zürich + neighboring cities
- [x] `geo` coordinates set to studio location
- [x] `sitemap.ts` with priorities + hreflang alternates (de-CH, de, en, fr, it)
- [x] `robots.ts` allowing crawl, disallowing /api + /_next
- [x] Root metadata: title template, description, keywords (DE + EN + FR + IT)
- [x] Vercel Analytics installed
- [x] Mobile viewport meta + theme-color
- [x] OG image referenced
- [x] HTTPS enforced (Vercel default)
- [x] Cookie consent banner
- [x] FAQ Schema (`FAQPage` JSON-LD on `/faq` — was already implemented)

### Phase 1 — P0 ✅ Completed 2026-05-21
- [x] **Positioning shift** → root title/description/keywords/OG/Twitter all lead
      with "Fotostudio Zürich". Glattpark/Opfikon demoted to secondary keyword tier.
- [x] **T-001 Per-page metadata** → 8 per-route `layout.tsx` server components
      wrap existing client pages with unique title + description + canonical +
      OG + Twitter (/studio, /equipment, /space, /contact, /faq, /about,
      /booking, /rules). No client refactor required.
- [x] **T-002 FAQ Schema** → `FAQPage` JSON-LD confirmed rendering from German
      Q&A list on `/faq`.
- [x] **T-003 GSC verification slot** → commented placeholder in
      `app/layout.tsx`. Owner pastes token after Search Console verification.

### Phase 2 — P1 ✅ Completed 2026-05-21
- [x] **T-004 Service/Offer schema** → full `hasOfferCatalog` rebuild:
      5 hourly offers (1h–8h) + 3 membership tiers (starter/pro/unlimited)
      each with `UnitPriceSpecification`, stable `@id`, `Service`/`itemOffered`
      links, `eligibleDuration` (3-month minimum), `billingDuration P1M`.
- [x] **T-005 Image alt audit** → key static images rewritten with keyword +
      scene pattern: `Fotostudio Zürich — <scene>`. Dynamic alts on /studio
      carousel + /equipment gallery already use semantic per-language labels.
- [x] **T-006 Geographic content** → sr-only block on homepage with Zurich
      landmarks + neighborhoods (Oerlikon, Seebach, Schwamendingen, Affoltern,
      Glattpark, Wallisellen, Kloten, Dübendorf). Visually hidden, crawlable.
- [x] **T-007 OG + Twitter per page** → included in T-001 layout exports.
- [x] **T-008 WebP confirmation** → production `curl -H "Accept: image/webp"`
      against `/_next/image` returns `Content-Type: image/webp` ✅.

### Phase 3 — P2 (partial) ✅ Completed 2026-05-21
- [x] **T-009 Blog infrastructure** → `lib/blog/posts.ts` central registry,
      `/blog` card-grid index, `/blog/[slug]` post pages with `Article`
      JSON-LD. Sitemap auto-includes posts with publishedAt dates. Footer
      Blog link in 4 langs. First post live:
      `/blog/willkommen-cee-studio-guide`.
- [x] **T-012 Breadcrumbs** → `components/Breadcrumbs.tsx` + centralized
      labels in `lib/breadcrumb-labels.ts`. Mounted on /studio, /equipment,
      /space, /contact, /faq, /about, /booking, /rules, /blog, /blog/[slug].
      Emits `BreadcrumbList` JSON-LD + a11y nav with aria-label.
- [x] **T-013 Canonical URLs** → set per page via `alternates.canonical` in
      each route's `layout.tsx` metadata export.

### Phase 4 — P3 (partial)
- [x] **T-015 Article schema for blog** → fully implemented in welcome-guide
      post layout: publisher Organization, datePublished, dateModified,
      mainEntityOfPage, inLanguage de-CH.
- [x] **T-020 XML image sitemap** → `app/image-sitemap.xml/route.ts` emits
      Google Image Sitemap format with `image:caption`, `image:geo_location`,
      `image:license` for 18 studio images. Referenced from `robots.ts`.

### Phase 5 — GEO / AEO foundation ✅ Completed 2026-05-21
Generative Engine Optimization — get cited by ChatGPT, Perplexity, Claude,
Google AI Overviews when users ask about photo studios in Zurich.

- [x] **llms.txt** at `/public/llms.txt` — emerging standard for AI crawlers.
      Concise factual summary: location, pricing, equipment, use cases, how
      to book, cancellation policy, key pages.
- [x] **HowTo schema** in root JSON-LD — "How to book a photo studio in
      Zurich at CEE Studio" with 4 numbered steps. Primes generative engines
      to answer booking questions with explicit CEE Studio reference.
- [x] **Organization schema** (separate from LocalBusiness) with alternateName,
      contactPoint, sameAs — entity disambiguation for AI brand resolution.

---

## ⚠️ Deferred (decision logged)

### T-011 Internal linking — DEFERRED
The site's i18n architecture uses translatable string atoms in `de/en/fr/it`
objects (e.g. `tx.bookP1`). Inline `<Link>` inside those strings would
require either string templating with embedded React (complex) or a full
content refactor to MDX/structured content. Navigation density is already
high via navbar + footer + blog post internal links + breadcrumbs.

**Reassess when:** the site has 10+ blog posts and the content layer
benefits from structured content; revisit alongside T-014 URL migration.

### T-014 Hreflang per-URL — DEFERRED
Current setup serves one URL with client-side language switching. Sitemap
hreflang signals are present but Google effectively sees one language per
URL. Proper fix requires `/de`, `/en`, `/fr`, `/it` URL prefixes + middleware
routing — major refactor.

**Reassess when:** non-DE traffic becomes a meaningful share (>20% from
GSC). For now DE-CH primary market is properly addressed.

---

## 🟡 Remaining Work

### T-010 — Review acquisition + display flow (L)
🟡 Blocked on owner actions (reviews don't exist yet) but the dev work
can ship now so it's ready when reviews start arriving.

**Implementation:**
- Extend `auto-complete` cron (or new cron) to schedule "review request"
  ~24h after booking ends
- New email template `BookingReviewRequest.tsx` with single CTA
- `https://search.google.com/local/writereview?placeid=<placeid>` deep-link
  (owner pastes the placeid once GBP is live)
- Optional: token-protected `/review/<token>` to capture testimonial text
- Display top reviews on homepage (manually curated to start, GBP API later)

**Acceptance:**
- Email arrives ~24h after booking ends
- Click rate measurable via Vercel Analytics
- Reviews carousel visible on homepage

**Why deferred:** Without a GBP profile + placeid, the email links go
nowhere. Best done right after owner sets up GBP.

---

### T-019 — Lighthouse CI (M) ⚪
Add Lighthouse CI to GitHub Actions to fail PRs that ship images >500KB
or LCP >3s. Regression guard, not a ranking win directly.

### ~~T-020 — XML image sitemap~~ ✅ DONE 2026-05-21
Implemented at `app/image-sitemap.xml/route.ts` with 18 images, geo
location, captions, license. Referenced from robots.ts.

### T-016 — `Review` schema with GBP API (L) ⚪
Pull reviews dynamically from GBP API → display on site → emit `Review`
JSON-LD → stars appear in SERPs.
**Blocked on:** GBP profile + reviews.

### T-017 — `LocalBusiness.aggregateRating` (S) ⚪
Add aggregate rating once 10+ reviews exist.
**Blocked on:** reviews. ⚠️ Do not fake.

### T-018 — `Event` schema (S) ⚪
If CEE hosts open-studio days/workshops, add `Event` schema for Google
Events surface. Currently no events.

### T-021 — `speakable` schema (S) ⚪
Voice assistant eligibility. Future-looking, low impact today.

### T-022 — AMP ❌ SKIP
Deprecated by Google in 2024. Not needed.

---

## 🎯 100% Complete Definition

To hit 100% **code-side** (assuming infinite time):
- [ ] T-010 Review email flow
- [ ] T-019 Lighthouse CI
- [ ] T-020 Image sitemap

To hit 100% **production-ready ranking**:
- [ ] All P0 + P1 ✅ DONE
- [ ] Owner: Google Business Profile claimed + 5+ reviews + 20+ photos
- [ ] Owner: Search Console verified, sitemap submitted, no errors
- [ ] Owner: 5+ citations (yelp.ch, local.ch, search.ch, etc.)
- [ ] Lighthouse SEO score ≥ 95 on every page
- [ ] Rich Results Test → 0 errors

**Recommendation:** Skip T-016/T-017 until reviews actually exist. Skip
T-018/T-021 unless events/voice become priority. Build T-010 + T-020 now
since they're cheap and well-positioned for when GBP lands.

---

## 📅 Owner Action Items (not dev)

See `SEO_PLAN.md` for full strategy. The short list:

1. 🔴 Claim Google Business Profile at [business.google.com](https://business.google.com)
2. 🔴 Verify domain in [Search Console](https://search.google.com/search-console) → paste token into `app/layout.tsx` (commented stub already there)
3. 🔴 Submit `https://ceestudio.ch/sitemap.xml` in GSC
4. 🟡 Acquire 5 Google reviews from early customers
5. 🟡 List on yelp.ch, local.ch, search.ch, tripadvisor, foursquare
6. 🟢 Reach out to 5 photographers + 3 MUAs in Zurich for cross-link partnerships

---

## Code Patterns Used

### Per-route metadata via layout.tsx
```tsx
// app/studio/layout.tsx (SERVER component)
export const metadata: Metadata = {
  title: "...",
  description: "...",
  alternates: { canonical: "/studio" },
  openGraph: { ... },
  twitter: { ... },
};
export default function StudioLayout({ children }) { return children; }
```
This wraps the existing `"use client"` `page.tsx` without refactoring.

### Breadcrumbs (T-012)
```tsx
import Breadcrumbs from "@/components/Breadcrumbs";
import { bc } from "@/lib/breadcrumb-labels";

<Breadcrumbs items={bc(l, "studio")} className="mb-8" />
```

### sr-only hidden geo content (T-006)
```tsx
<p className="sr-only">
  CEE Studio — Fotostudio in Zürich. 5 Minuten von Zürich Oerlikon...
</p>
```

### Article schema (T-015)
See `app/blog/willkommen-cee-studio-guide/page.tsx` for the full
`Article` JSON-LD example.

---

## Verification Commands

```bash
# Title + description per page
curl -s https://www.ceestudio.ch/studio | grep -i '<title>\|description"'

# WebP serving
curl -I -H 'Accept: image/webp' \
  "https://www.ceestudio.ch/_next/image?url=/images/lounge-cowhide-view.jpg&w=1920&q=75"

# Sitemap valid
curl -s https://ceestudio.ch/sitemap.xml | head -30

# Schema validation
open "https://search.google.com/test/rich-results?url=https://www.ceestudio.ch"

# Pagespeed
open "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.ceestudio.ch"
```

---

_Last updated: 2026-05-21. See `SEO_PLAN.md` for strategy._
_Update this file as tasks complete._
