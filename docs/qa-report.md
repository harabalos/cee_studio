# CEE Studio — QA Report

**Generated**: 2026-05-19T20:33:51.761Z
**Status**: ✅ ALL GREEN

## Summary

| Layer | Passed | Failed | Skipped | Duration |
|---|---:|---:|---:|---:|
| Layer 1 — Unit tests | 73 | 0 | 0 | 3.6s |
| Layer 2 — Integration tests | 65 | 0 | 0 | 14.1s |
| Layer 3 — E2E browser tests | 28 | 0 | 1 | 79.1s |
| **Total** | **166** | **0** | **1** | **96.8s** |

---

## Coverage map

This QA suite maps to the manual tests in `docs/TESTING_GUIDE.md`:

| TESTING_GUIDE Test | Auto-covered by | Status |
|---|---|---|
| 1 — Guest booking 1h | booking-flow.test.ts + booking-flow.spec.ts | ✅ |
| 2 — Cancellation rules (3 sub) | cancellation-extended.test.ts | ✅ |
| 3 — Late-night surcharge (4 sub) | pricing-extended.test.ts | ✅ |
| 4 — Slot conflict prevention | availability-extended.test.ts + availability.test.ts | ✅ |
| 5 — Admin login UI | login.spec.ts | ✅ |
| 6 — Manual booking | admin-api.test.ts (access control) | ⚠️ partial (needs admin session) |
| 7 — Edit/no-show | admin-api.test.ts | ⚠️ partial |
| 8 — Settings save | admin-api.test.ts | ⚠️ partial |
| 9 — Block date | admin-api.test.ts | ⚠️ partial |
| 10 — iCal feed | (not in QA — easy manual) | ❌ manual |
| 11 — Customer login + tabs | login.spec.ts + public-pages.spec.ts | ⚠️ partial |
| 12a-f — Membership flows | (requires real Stripe subscription) | ❌ manual |
| 13 — Cron jobs | crons.test.ts | ✅ |
| 14 — Email deliverability | email-rendering.test.ts | ⚠️ render-only |
| 15 — Refund | admin-api.test.ts | ⚠️ partial |
| 16 — Auth-aware Navbar | navbar-auth-aware.spec.ts | ✅ |
| 17 — Success page hint | (in booking E2E) | ⚠️ partial |
| 18 — Profile edit | me-api.test.ts | ✅ |

Also covered (beyond TESTING_GUIDE):
- All public pages return 200 (public-pages.test.ts)
- PDF generation in 4 languages (pdf-generation.test.ts)
- Dynamic icons (/icon, /apple-icon, /opengraph-image, /twitter-image)
- All 9 email templates render (email-rendering.test.ts)
- Manifest, sitemap, robots.txt

---

## Layer details

### Layer 1 — Unit tests

- Exit code: 0
- Tests: 73 passed, 0 failed, 0 skipped
- Duration: 3.6s



### Layer 2 — Integration tests

- Exit code: 0
- Tests: 65 passed, 0 failed, 0 skipped
- Duration: 14.1s



### Layer 3 — E2E browser tests

- Exit code: 0
- Tests: 28 passed, 0 failed, 1 skipped
- Duration: 79.1s




---

## Manual steps still required before deploy

Things this QA suite **cannot** auto-verify — please tick off manually:

- [ ] Real card payment goes through (Stripe TEST mode card 4242 4242 4242 4242)
- [ ] Confirmation email arrives in real Gmail inbox (not spam)
- [ ] PDFs attached to confirmation email open correctly
- [ ] Customer can sign in via real magic link click
- [ ] Admin (`babismetaxas000@gmail.com`) lands on /admin after magic link
- [ ] Custom domain (ceestudio.ch) DNS resolves and serves
- [ ] Stripe Webhook endpoint configured in Stripe Dashboard for production URL
- [ ] Mobile look-and-feel on real iPhone (iOS Safari)
- [ ] Mobile look-and-feel on real Android (Chrome)
- [ ] Membership subscription completes (CHF 220 charge — cancel right after)

---

_Run `npm run qa:all` to regenerate this report._
