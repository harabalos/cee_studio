# CEE Studio — QA Report

**Generated**: 2026-05-20 (Stage B complete)
**Status**: ✅ ALL GREEN

## Summary

| Layer | Passed | Failed | Skipped | Approx Duration |
|---|---:|---:|---:|---:|
| Layer 1 — Unit tests (lib/ + tests/unit/) | 73 | 0 | 0 | ~4s |
| Layer 2 — Integration tests | 119 | 0 | 0 | ~170s |
| Layer 3 — E2E browser tests | 41 | 0 | 1 | ~230s |
| **Total** | **233** | **0** | **1** | **~7min** |

Baseline → Stage A → Stage B progression:
- Pre-Stage A: 166 tests
- After Stage A: 190 (+24)
- After Stage B: **233 (+43 more)**

---

## Coverage map

This QA suite maps to the manual tests in `docs/TESTING_GUIDE.md`:

| TESTING_GUIDE Test | Auto-covered by | Status |
|---|---|---|
| 1 — Guest booking 1h | booking-flow.test.ts + booking-flow.spec.ts + stripe-payment.spec.ts | ✅ |
| 2 — Cancellation rules (3 sub) | cancellation-extended.test.ts + **refund-flow.test.ts** | ✅ |
| 3 — Late-night surcharge (4 sub) | pricing-extended.test.ts | ✅ |
| 4 — Slot conflict prevention | availability-extended.test.ts + availability.test.ts | ✅ |
| 5 — Admin login UI | login.spec.ts + auth-magic-link.spec.ts | ✅ |
| 6 — Manual booking (admin) | admin-api.test.ts | ⚠️ partial |
| 7 — Edit/no-show | admin-api.test.ts | ⚠️ partial |
| 8 — Settings save | admin-api.test.ts | ⚠️ partial |
| 9 — Block date | admin-api.test.ts | ⚠️ partial |
| 10 — iCal feed | **ical-feed.test.ts** | ✅ |
| 11 — Customer login + tabs | login.spec.ts + auth-magic-link.spec.ts | ✅ |
| 12a — Membership signup | **membership-flow.test.ts** | ✅ |
| 12b — Membership: customer.subscription.created webhook | **membership-flow.test.ts** | ✅ |
| 12c — Membership: subscription.deleted | **membership-flow.test.ts** | ✅ |
| 12d — Member booking partial coverage | **member-booking.test.ts** | ✅ |
| 12e — Member booking full coverage + addon | **member-booking.test.ts** | ✅ |
| 12f — FIFO rolled-over deduction | **member-booking.test.ts** | ✅ |
| 13 — Stripe webhook deliverability | stripe-config.test.ts + **webhook-events.test.ts** | ✅ |
| 14 — Email deliverability | email-rendering.test.ts + email-delivery.test.ts | ✅ |
| 15 — Refund (customer + admin) | **refund-flow.test.ts** + webhook-events.test.ts | ✅ |
| 16 — Auth-aware Navbar | navbar-auth-aware.spec.ts | ✅ |
| 17 — Success page hint | (in booking E2E) | ⚠️ partial |
| 18 — Profile edit | me-api.test.ts | ✅ |
| **Mobile responsiveness** | mobile-viewport.spec.ts | ✅ |
| **Cron jobs (expire-holds, auto-complete, expire-rolled-over)** | **cron-jobs.test.ts** | ✅ |
| **i18n key parity across DE/EN/FR/IT** | **i18n-parity.test.ts** | ✅ |

Also covered (beyond TESTING_GUIDE):
- All public pages return 200 (public-pages.test.ts)
- PDF generation in 4 languages (pdf-generation.test.ts)
- Dynamic icons (/icon, /apple-icon, /opengraph-image, /twitter-image)
- All 9 email templates render (email-rendering.test.ts)
- Real Resend send + delivery status (email-delivery.test.ts)
- Stripe webhook signature rejection (stripe-config.test.ts)
- Manifest, sitemap, robots.txt

---

## Stage B — what was added

### Stripe webhook E2E (`tests/integration/webhook-events.test.ts`) — 5 tests
- Construct properly-signed Stripe events with `stripe.webhooks.generateTestHeaderString()`
- `checkout.session.completed` → booking finalized, hold deleted, status=confirmed
- `checkout.session.expired` → hold deleted, no booking created
- `charge.refunded` (full) → marks payment_status=refunded with correct refund_chf
- `charge.refunded` (partial) → marks payment_status=partially_refunded
- Unknown event types accepted as no-op

### Membership flows (`tests/integration/membership-flow.test.ts`) — 6 tests
- POST `/api/membership/checkout` (starter + pro) returns valid Stripe URL
- Invalid plan → 400
- `customer.subscription.created` webhook → creates users + memberships row with role=member
- Starter plan → 4 hours/month allocated, pro plan → 9 hours/month
- `customer.subscription.deleted` → marks membership status=cancelled

### Member booking flow (`tests/integration/member-booking.test.ts`) — 3 tests
- Partial coverage (4h booking, 2h balance) → 2h deducted, booking has membership_id
- Full coverage with add-ons → hours deducted, add-on row created at full price
- Rolled-over hours deducted FIFO before fresh hours

### iCal feed (`tests/integration/ical-feed.test.ts`) — 6 tests
- GET without token → 401
- GET with wrong token → 401
- GET with valid token → 200, Content-Type: text/calendar, valid VCALENDAR shape
- Confirmed bookings appear as VEVENT blocks with summary + location
- Cancelled bookings excluded
- Bookings >30 days in past excluded

### Cron jobs (`tests/integration/cron-jobs.test.ts`) — 16 tests
- All 5 cron endpoints reject unauthenticated + bogus auth → 401
- `expire-holds` deletes expired holds, leaves non-expired untouched
- `auto-complete` flips past confirmed → completed, leaves future alone
- `expire-rolled-over` zeros rolled hours, reduces balance correctly
- `reminders-24h` authorized request returns 200

### Refund + cancel flow (`tests/integration/refund-flow.test.ts`) — 6 tests
- Customer cancel: invalid token → 404, >48h weekday → success, already-cancelled → 409, <24h → 403
- Admin cancel + refund: unauthenticated → 401

### i18n parity (`tests/integration/i18n-parity.test.ts`) — 1 test
- Scans every `.tsx`/`.ts` file in app/ + components/
- Finds all inline `const t = { en, de, fr, it }` translation blocks
- Verifies all 4 languages have the same top-level keys
- Currently 0 violations across entire codebase

---

## Bugs found (unresolved at time of Stage B)

### 🐛 1. Mobile hamburger menu button is 24×24px
**Location**: `components/Navbar.tsx` line ~181
**Severity**: real mobile usability issue
**Status**: STILL UNFIXED — spawned task chip exists but hasn't been actioned

### 🐛 2. `/admin` Timeline crashes on invalid date
**Location**: `app/admin/page.tsx:559` calls `formatZurich()` (`lib/booking/availability.ts:82`)
**Status**: STILL UNFIXED — spawned task chip exists

### ⚠️ 3. No Stripe webhook endpoint configured in Stripe Dashboard
**Detected by**: `stripe-config.test.ts` — warning logged
**Action needed**: Before deploy, register `https://ceestudio.ch/api/webhooks/stripe` in Stripe Dashboard (PROD) with 8 events:
  `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`

---

## Manual steps still required before deploy

Things this QA suite **cannot** auto-verify — please tick off manually:

### 🔴 BLOCKERS (must do before launch)
- [ ] Real card payment 4242 4242 4242 4242 (TEST mode click-through)
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
- [ ] Real Stripe subscription click-through (test card 4242, cancel right after to avoid CHF 220 charge)
- [ ] Vercel cron schedule actually fires at expected intervals (only checkable in Vercel dashboard logs)
- [ ] Stripe CLI E2E trigger: `stripe trigger checkout.session.completed` against deployed URL

### 🟢 NICE TO HAVE (Stage C if you want to keep going)
- [ ] Lighthouse CI performance budgets
- [ ] axe-core accessibility scan (WCAG AA)
- [ ] Visual regression — screenshot diffs on key pages
- [ ] 404 + 500 error pages render correctly
- [ ] Load test: 50 simultaneous users grabbing the same Saturday slot
- [ ] DB backup + restore drill
- [ ] Real Stripe Customer Portal (manage subscription, update card)
- [ ] 3-month minimum commitment policy unit test (extract from membership cancel handler)

---

_Run `npm run qa:all` to regenerate this report._
