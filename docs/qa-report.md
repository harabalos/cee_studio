# CEE Studio — QA Report

**Generated**: 2026-05-21 (Stage C complete)
**Status**: ✅ ALL GREEN

## Summary

| Layer | Passed | Failed | Skipped | Approx Duration |
|---|---:|---:|---:|---:|
| Layer 1 — Unit tests (lib/ + tests/unit/) | 87 | 0 | 0 | ~3s |
| Layer 2 — Integration tests | 119 | 0 | 0 | ~115s |
| Layer 3 — E2E browser tests | 58 | 0 | 1 | ~230s |
| **Total** | **264** | **0** | **1** | **~6min** |

Test count progression:
- Pre-Stage A: 166
- After Stage A: 190 (+24)
- After Stage B: 233 (+43)
- **After Stage C: 264 (+31 more)**

---

## Coverage map

This QA suite maps to the manual tests in `docs/TESTING_GUIDE.md`:

| TESTING_GUIDE Test | Auto-covered by | Status |
|---|---|---|
| 1 — Guest booking 1h | booking-flow.test.ts + booking-flow.spec.ts + stripe-payment.spec.ts | ✅ |
| 2 — Cancellation rules (3 sub) | cancellation-extended.test.ts + refund-flow.test.ts | ✅ |
| 3 — Late-night surcharge (4 sub) | pricing-extended.test.ts | ✅ |
| 4 — Slot conflict prevention | availability-extended.test.ts + availability.test.ts | ✅ |
| 5 — Admin login UI | login.spec.ts + auth-magic-link.spec.ts | ✅ |
| 6 — Manual booking (admin) | admin-api.test.ts | ⚠️ partial |
| 7 — Edit/no-show | admin-api.test.ts | ⚠️ partial |
| 8 — Settings save | admin-api.test.ts | ⚠️ partial |
| 9 — Block date | admin-api.test.ts | ⚠️ partial |
| 10 — iCal feed | ical-feed.test.ts | ✅ |
| 11 — Customer login + tabs | login.spec.ts + auth-magic-link.spec.ts | ✅ |
| 12a — Membership signup | membership-flow.test.ts | ✅ |
| 12b — customer.subscription.created webhook | membership-flow.test.ts | ✅ |
| 12c — subscription.deleted | membership-flow.test.ts | ✅ |
| 12d — Member booking partial coverage | member-booking.test.ts | ✅ |
| 12e — Member booking full coverage + addon | member-booking.test.ts | ✅ |
| 12f — FIFO rolled-over deduction | member-booking.test.ts | ✅ |
| 13 — Stripe webhook deliverability | stripe-config.test.ts + webhook-events.test.ts | ✅ |
| 14 — Email deliverability | email-rendering.test.ts + email-delivery.test.ts | ✅ |
| 15 — Refund (customer + admin) | refund-flow.test.ts + webhook-events.test.ts | ✅ |
| 16 — Auth-aware Navbar | navbar-auth-aware.spec.ts | ✅ |
| 17 — Success page hint | (in booking E2E) | ⚠️ partial |
| 18 — Profile edit | me-api.test.ts | ✅ |
| **Mobile responsiveness** | mobile-viewport.spec.ts | ✅ |
| **Cron jobs** | cron-jobs.test.ts | ✅ |
| **i18n key parity (DE/EN/FR/IT)** | i18n-parity.test.ts | ✅ |
| **🆕 Accessibility (WCAG AA, Swiss BehiG/LHand)** | **accessibility.spec.ts** | ✅ |
| **🆕 404 + error boundary pages** | **error-pages.spec.ts** | ✅ |
| **🆕 3-month minimum membership commitment** | **lib/memberships/cancellation.test.ts** | ✅ |

---

## Stage C — what was added

### Accessibility (`tests/e2e/accessibility.spec.ts`) — 12 tests
Uses `@axe-core/playwright` to scan every public page for WCAG 2.1 AA
violations (Switzerland's BehiG/LHand legal standard). Fails on
`critical` + `serious` severity (moderate/minor are warnings only).

Pages scanned: `/`, `/studio`, `/equipment`, `/space`, `/contact`, `/faq`,
`/coming-soon`, `/login`, `/privacy`, `/terms`, `/rules`, `/impressum`.

Bug found + fixed during Stage C:
- 🐛 `/contact` Google Maps iframe was missing a `title` attribute — fixed in
  `app/contact/page.tsx` (added `title="CEE Studio location map …"`)

Implementation notes:
- Emulates `prefers-reduced-motion: reduce` so Framer Motion shortcuts
  fade-ins (without this, axe scans mid-animation when text is mid-opacity
  and false-positives on color-contrast)
- Injects animation-disabling CSS for belt-and-braces

### 404 + error boundary pages (`tests/e2e/error-pages.spec.ts`) — 5 tests
- Nonsense paths return HTTP 404 (not the default Next.js error)
- Custom `not-found.tsx` renders with brand styling + "Return Home" link
- "Return Home" link actually navigates to `/`
- Static check: `app/error.tsx` + `app/global-error.tsx` exist, are Client
  Components, take `{ error, reset }` props, and include a "Try Again" CTA

Files added during Stage C:
- `app/error.tsx` — route-segment error boundary with branded fallback
- `app/global-error.tsx` — root-layout error boundary (extreme cases)

### Membership cancellation policy (`lib/memberships/cancellation.test.ts`) — 14 tests
Extracts the "can the member cancel now?" logic into a pure function
(`canCancelMembership`) so the UI and tests share one source of truth.

Covers:
- `null`/`undefined` minimum_until → allowed (legacy memberships)
- Invalid date input → defensively allowed (don't trap users)
- Past minimum_until → allowed (term passed)
- Exact match → allowed (boundary case)
- Future minimum_until → blocked, returns the `availableAt` date
- Just-signed-up scenario (3 months ahead) → blocked
- Mid-term scenarios → blocked
- ISO string + Date inputs both work
- Real-world signup → cancellation timeline (March signup → blocked May 31 → allowed June 1)

The component `app/account/membership/page.tsx` was updated to use the
shared function so future bugs in the policy show up immediately in tests.

### Legal pages test stabilization (`tests/e2e/legal-pages.spec.ts`)
Fixed pre-existing strict-mode violation: `page.locator("h1")` was matching
both the LoadingScreen splash h1 ("CEE") and the page's own h1. Updated to
`.last()` so the page-specific h1 is targeted.

---

## Bugs found + FIXED during Stage C

### ✅ 1. Google Maps iframe on `/contact` missing accessible title
**Was:** Serious WCAG violation (`frame-title` rule)
**Now:** `title="CEE Studio location map — Thurgauerstrasse 117, 8152 Glattpark"` added

### ✅ 2. No custom error boundary
**Was:** Next.js default "Application error: a client-side exception" page on any uncaught throw
**Now:** Branded 500 page with "Try Again" + "Return Home" + error digest for support

---

## Bugs still unfixed (carried from Stage A)

### 🐛 1. Mobile hamburger menu button is 24×24px
**Location:** `components/Navbar.tsx` line ~181
**Severity:** real mobile usability issue (below iOS HIG 44pt / Material 48dp)
**Status:** chip task spawned but not actioned

### 🐛 2. `/admin` Timeline crashes on invalid date
**Location:** `app/admin/page.tsx:559` → `formatZurich()` in `lib/booking/availability.ts:82`
**Status:** chip task spawned but not actioned

### ⚠️ 3. No Stripe webhook endpoint configured in Stripe Dashboard
**Status:** must be done in Stripe Dashboard before going live

---

## Manual steps still required before deploy

### 🔴 BLOCKERS (must do before launch)
- [ ] Real card payment 4242 4242 4242 4242 (TEST mode click-through on PROD URL)
- [ ] TWINT payment flow (Swiss market essential)
- [ ] Confirmation email arrives in **real Gmail inbox** (not spam) — DKIM/SPF/DMARC check
- [ ] PDFs (Nutzungsvertrag + Rechnung) attached to email open correctly
- [ ] Customer can sign in via **real magic-link click** from inbox
- [ ] Admin (`babismetaxas000@gmail.com`, `info@ceestudio.ch`) lands on `/admin` after magic link
- [ ] Custom domain `ceestudio.ch` DNS resolves and serves
- [ ] **Stripe webhook endpoint registered in PROD Dashboard** (8 events)
- [ ] Real iPhone Safari — touch interactions feel right, no layout breaks
- [ ] Real Android Chrome — same
- [ ] Vercel env vars correctly set for PROD (LIVE Stripe keys, prod Supabase, Resend, ADMIN_ALLOWED_EMAILS)
- [ ] `NEXT_PUBLIC_LAUNCH_MODE=full` on main branch deployment

### 🟡 HIGH-RISK paths that can't be fully auto-tested
- [ ] Real Stripe subscription click-through (test card 4242, cancel right after)
- [ ] Vercel cron schedule actually fires at expected intervals (Vercel dashboard logs)
- [ ] Stripe CLI E2E trigger: `stripe trigger checkout.session.completed` against deployed URL

### 🟢 Future Stage D (if you want to keep going)
- [ ] Lighthouse CI performance budgets
- [ ] Visual regression — screenshot diffs on key pages
- [ ] Load test: 50 simultaneous users grabbing the same Saturday slot
- [ ] Real Stripe Customer Portal flow (manage subscription, update card)
- [ ] CSRF / rate limit tests

---

_Run `npm run qa:all` to regenerate this report._
