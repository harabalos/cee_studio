# CEE Studio — Go-Live Plan

> Από το committed code → πραγματικά bookings που χτυπάνε στο Stripe.
> Συνολική προσπάθεια: ~5–7h δουλειά κατανεμημένη σε 4–7 μέρες
> (το μεγαλύτερο μέρος είναι waiting time για verifications).

---

## TL;DR — sequence

```
Day 1   Phase A  Sister opens Stripe + Resend accounts (initiates verification)
                 You open Supabase + Google Cloud projects
Day 1-3 Phase B  WAITING ROOM — build what doesn't need live keys (see §B.1)
Day 3   Phase C  Local test — full booking + refund + cancel flows
Day 3   Phase D  Calendar integration build (iCal feed for owner)  ✅ done
Day 4   Phase E  Production deploy + domain switch + smoke test
Day 4   Phase F  Real-money smoke test (1 CHF TWINT booking, refund)
Day 5   Phase G  Hand-off to sister
Day 5+  Phase H  Monitor first 10 bookings, fix what breaks
```

---

## PHASE A — Account Setup (Day 1, ~2 hours active work)

### A.1  Sister: Stripe Switzerland account  ⏱️ 30 min + 1–3 days verification

She does this on **her own laptop**, with **her own ID + IBAN**.

1. Go to https://dashboard.stripe.com/register
2. Sign up:
   - Email: όχι generic — δικιά της  
   - Country: **Switzerland**
   - Default currency: **CHF**
3. After signup → activate account:
   - Business type: **Individual / Sole proprietor (Einzelunternehmen)**
   - Personal name + DOB + nationality
   - Swiss address (όπου μένει)
   - Swiss IBAN (προσωπικό λογαριασμό)
   - Upload Swiss ID (passport ή ID card) — both sides
   - Website URL: `https://ceestudio.ch`
   - Description: `Photo and video studio rental in Zurich (Glattpark)`
   - Statement descriptor: `CEE STUDIO ZRH` (max 22 chars που εμφανίζεται στο card statement)
4. Wait for KYC verification (typical 1–3 business days)
5. Once verified, go to **Settings → Payment methods**:
   - Enable **TWINT** (έπρεπε να εμφανίστηκε αυτόματα μετά verification)
   - Confirm **Card** is on
6. **Settings → Branding**: upload CEE Studio logo (square + brand color #661414)
7. **Settings → Customer emails**: enable receipts (Stripe στέλνει αυτόματα)

→ Παίρνει: account access + θα χρειαστεί τα keys στο **Phase C**

### A.2  Sister: Resend account  ⏱️ 15 min + 30 min DNS propagation

1. Go to https://resend.com/signup → sign up με δικό της email
2. **Domains → Add Domain** → `ceestudio.ch`
3. Resend δίνει 3 DNS records (SPF, DKIM, DMARC). Κάποιος πρέπει να τα προσθέσει στον DNS provider (όπου είναι registered το ceestudio.ch — Namecheap / Cloudflare / κλπ.). Τα records μοιάζουν:
   - TXT @ → `v=spf1 include:_spf.resend.com ~all`
   - CNAME resend._domainkey → ...
   - TXT _dmarc → ...
4. Status will go to **Verified** within 30 min (συνήθως)
5. **API Keys → Create**: name "CEE Studio production" → save → πάει στο `RESEND_API_KEY`

→ Παίρνει: ικανότητα να στέλνει email από `bookings@ceestudio.ch`

### A.3  You: Supabase project  ⏱️ 15 min

1. https://supabase.com → New Project
   - Org: `ceestudio` (αν δεν υπάρχει)
   - Name: `cee-studio-prod`
   - Region: **Frankfurt (eu-central-1)** — closest to CH
   - DB password: γενναιόδωρος random string, save it
2. Wait ~2 min για provisioning
3. **SQL Editor → New query** → paste όλο το `db/schema.sql` → Run → "Success"
4. **Project Settings → API** → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
5. **Authentication → URL Configuration**:
   - Site URL: `https://ceestudio.ch`
   - Redirect URLs: add `https://ceestudio.ch/admin`, `http://localhost:3000/admin`

### A.4  You: Local dev environment  ⏱️ 5 min

```bash
cp .env.local.example .env.local
# Fill in all the keys collected above
npm install            # already done, verify
npm run dev
```

---

## PHASE B — Waiting room (Day 1–3, ACTIVE work that doesn't need live keys)

> Stripe verification + Resend DNS verification are out of our control.
> Don't waste the time — there's a lot we can build that's testable with
> just Supabase + Stripe TEST keys.

### B.1  Things we CAN build NOW (no live keys needed)

Ranked by impact for sister's day-to-day:

| # | Item | Effort | Why |
|---|---|---|---|
| 1 | **Admin dashboard with stats** (today / this week / this month revenue + bookings counts) | 2h | Sister's first thing every morning |
| 2 | **Admin manual booking entry** (for phone / walk-in clients) | 2h | Day 1 utility — books even before client uses /booking online |
| 3 | **Admin calendar grid view** (month / week, click → details drawer) | 3h | Easier than table view to plan around bookings |
| 4 | **Email template visual polish** (proper React Email design with brand styling) | 2h | First impression, customer trust |
| 5 | **Phase 2 prep — Memberships UI scaffolding** (signup form + /account dashboard, schema-only without live Stripe) | 6h | Big upcoming feature, can pre-build |
| 6 | **Unit tests for pricing/availability/cancellation** | 2h | Boring, important — prevents regressions when Phase 2 lands |
| 7 | **Better error states** in /booking flow (network errors, Stripe down, slot grabbed mid-checkout) | 2h | Polish |
| 8 | **Pre-test using Stripe TEST keys** (you can do this YOURSELF without sister) | 1h | Validates everything works before going live |

### B.2  How you can start TEST mode locally without sister

You can open YOUR OWN Stripe test-mode account (no KYC verification needed —
test mode works without it) and run the entire booking flow locally with fake
cards. When sister's account is verified, just swap the keys.

```bash
# 1. Sign up your own Stripe at https://dashboard.stripe.com/register
#    (no KYC needed for test mode — just an email)
# 2. Test mode is on by default. Get the test keys from:
#    https://dashboard.stripe.com/test/apikeys
# 3. Use those in .env.local as STRIPE_SECRET_KEY=sk_test_... etc.
# 4. For email: use Resend's onboarding@resend.dev shortcut (no domain
#    verification needed, but only sends to your own verified email).
# 5. Run npm run dev + stripe listen, test full flow.
```

→ This validates the whole system. When sister returns, swap keys and we're
live in minutes.

### B.3  Sister's parallel tasks

While she waits for verifications:
- Get familiar με το Stripe Dashboard mobile app (iOS / Android — δωρεάν).
  Push notifications για κάθε booking.
- Read `docs/GO_LIVE_PLAN.md` Phase G ("operational hand-off") so she knows
  what daily admin will look like.
- Decide if she wants extra `ADMIN_ALLOWED_EMAILS` (e.g. + assistant later).

---

## PHASE C — Local end-to-end test (Day 3, ~1.5 hours)

> Στόχος: όλα δουλεύουν σε `localhost:3000` με Stripe **test mode**.
> Test mode = ψεύτικα keys, ψεύτικες κάρτες (`4242 4242 4242 4242`), real Stripe webhooks via CLI.

1. `.env.local` is filled with **TEST** keys (`sk_test_...`, `pk_test_...`)
2. Terminal 1: `npm run dev`
3. Terminal 2:
   ```bash
   brew install stripe/stripe-cli/stripe   # μία φορά
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   → Copies a `whsec_...` value → put in `.env.local` as `STRIPE_WEBHOOK_SECRET` → restart dev server.
4. Test scenarios:
   - [ ] **Visitor booking**: 4h Saturday afternoon, all 3 add-ons → Stripe Checkout (test card) → confirmation page → email arrives
   - [ ] **Same slot blocked after booking**: try to book same slot again → "slot unavailable"
   - [ ] **Hold expires**: start booking, abandon at Stripe Checkout → wait 11 min → slot becomes available again
   - [ ] **Late-night surcharge**: book 4h starting 19:00 → total includes CHF 30 surcharge (3h × 10)
   - [ ] **Weekend booking → cancel**: try to cancel → button disabled with weekend message
   - [ ] **Weekday >48h booking → cancel**: refund CHF total – CHF 1.50, status changes to cancelled, email sent
   - [ ] **Weekday <48h booking → cancel**: button disabled with too-late message
   - [ ] **Admin login**: magic link → see bookings list → block a date → date disabled in /booking calendar
   - [ ] **Admin refund**: refund a confirmed booking → check Stripe Dashboard test mode → refund visible

5. If everything ✓ → ready to deploy.

---

## PHASE D — Calendar Integration (Day 3, ~1.5 hours dev work — covered below in this commit)

> Approach: **iCal subscription feed** for the studio owner. One-way (booking → calendar). Works in Apple Calendar, Google Calendar, Outlook, anything.

### Why iCal feed (not Google OAuth)
- No Google Cloud setup, no OAuth consent screen review
- Read-only by design (calendar can't push back to bookings — exactly what we want)
- One URL, copy-paste into any calendar app, auto-refreshes every few hours
- Customer side already covered by .ics attachment

### How it works
- Endpoint `/api/calendar/owner.ics?token=<secret>` returns a live ICS feed of all confirmed bookings
- Token is `OWNER_ICS_TOKEN` env var (random string)
- Owner subscribes once: in Apple/Google Calendar → "Subscribe to URL" → paste link
- Calendar auto-refreshes every ~hour

### Setup steps for sister (after deploy)
1. Generate token: `openssl rand -hex 32` → put in Vercel env as `OWNER_ICS_TOKEN`
2. Owner subscribes to: `https://ceestudio.ch/api/calendar/owner.ics?token=<that token>`
3. Done — every booking appears in her calendar within ~1h

---

## PHASE E — Production deploy (Day 4, ~45 min)

### E.1  Add all env vars to Vercel
Project → Settings → Environment Variables. Same keys as `.env.local` but with **LIVE** Stripe keys (`sk_live_...`, `pk_live_...`).

| Key | Source |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://ceestudio.ch` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project (same as local) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase |
| `STRIPE_SECRET_KEY` | **Stripe LIVE** keys (toggle off "View test data") |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe LIVE |
| `STRIPE_WEBHOOK_SECRET` | from E.2 below |
| `RESEND_API_KEY` | Resend (same as local) |
| `RESEND_FROM` | `"CEE Studio <bookings@ceestudio.ch>"` |
| `ADMIN_ALLOWED_EMAILS` | sister's email (comma-separated for multiple) |
| `CRON_SECRET` | random — `openssl rand -hex 32` |
| `OWNER_ICS_TOKEN` | random — `openssl rand -hex 32` |

### E.2  Configure Stripe production webhook
1. Stripe Dashboard (LIVE mode) → **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://ceestudio.ch/api/webhooks/stripe`
3. Events to listen to (select these):
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
4. Save → Stripe gives you `whsec_...` → put in Vercel `STRIPE_WEBHOOK_SECRET` → redeploy.

### E.3  Domain switch
The current ceestudio.ch points to "coming-soon" deployment. Switch to live app:

1. Vercel → cee-studio project → **Settings → Domains** → add `ceestudio.ch` and `www.ceestudio.ch`
2. Update DNS at the domain registrar:
   - A @ → 76.76.21.21 (Vercel)
   - CNAME www → cname.vercel-dns.com
3. Vercel auto-issues SSL — wait ~5 min για propagation
4. Visit https://ceestudio.ch — should serve the live app

### E.4  Final deploy
```bash
vercel --prod
```

→ Production live.

---

## PHASE F — Real-money smoke test (Day 4, 30 min)

> Στόχος: μία πραγματική booking με πραγματικά franc, μετά refund.

1. **Sister or you book** μια 1h slot από `https://ceestudio.ch/booking`
2. Πληρώνει με **TWINT** (CHF 70). Real charge στην real card/TWINT.
3. Verify:
   - [ ] Stripe Dashboard (LIVE) δείχνει το payment + balance
   - [ ] Email confirmation arrived με .ics
   - [ ] /admin shows the booking
   - [ ] Owner iCal feed updates (subscribe από iPhone Apple Calendar — booking εμφανίζεται)
4. **Refund the booking** από /admin → click refund button
5. Verify:
   - [ ] Stripe shows refund (CHF 70 back, minus Stripe fee CHF 1.50)
   - [ ] Sister gets refund στο banking app within 5–7 days
   - [ ] Cancellation email arrived
   - [ ] /admin shows status "cancelled, refunded"

If everything ✓ → **system is live and tested with real money**.

---

## PHASE G — Hand-off to sister (Day 5, ~45 min)

### Admin walkthrough (do this on a video call or screen-share)

1. **Login**: ceestudio.ch/admin/login → email → magic link → /admin
2. **Daily flow**:
   - Νέα booking? Παίρνει email + Stripe push notification.
   - Δεν χρειάζεται να κάνει τίποτα — όλα αυτόματα.
3. **Manage existing booking**:
   - /admin → δες λίστα → όνομα/τηλέφωνο/ώρα/τιμή/status
   - Click refund button → confirms → done (Stripe refund + email)
4. **Block a date** (διακοπές, maintenance):
   - /admin/blocked → set start/end → save
   - Το slot εξαφανίζεται από το /booking calendar
5. **Phone calls / walk-ins**:
   - Phase 1 δεν έχει manual booking entry. Λέει ο πελάτης να κάνει online.
   - Phase 3 (μελλοντικά) θα έχει "manual booking" form.
6. **Emergencies**:
   - Stripe Dashboard mobile app → see all charges, refund manually if needed
   - Resend Dashboard → see if emails delivered/bounced
   - Supabase Dashboard → direct DB access if χρειαστεί
7. **Monthly**:
   - Export bookings CSV (Phase 3 — για τώρα από Supabase Dashboard)
   - Reconcile Stripe payouts με τη bookkeeping της

### Cheatsheet she should bookmark
- Admin: https://ceestudio.ch/admin
- Stripe Dashboard: https://dashboard.stripe.com
- Resend Dashboard: https://resend.com/emails
- Supabase Dashboard: link προς το project

---

## PHASE H — Monitor + iterate (Day 5+, ongoing)

### First 10 bookings — watch closely
- Are confirmation emails reaching customers? (check Resend deliverability)
- Are TWINT payments processing? (check Stripe success rate)
- Any 404s on the manage page? (check Vercel logs)
- Any double-booking attempts? (check pending_holds table)

### Things to add later (Phase 2+)
- ABO memberships flow (recurring billing)
- Member portal (`/account`)
- Admin manual-booking entry
- 24h reminder cron emails
- SMS reminders (Twilio, Phase 4)
- Promo codes
- Monthly summary email to owner

---

## Decisions made (locked in)

| Decision | Choice |
|---|---|
| DB | Supabase (Postgres + Auth + RLS) |
| Payments | Stripe Checkout + Subscriptions, TWINT enabled |
| Emails | Resend with React Email templates |
| Calendar sync | iCal feed (one-way) for owner |
| Customer calendar | .ics attachment in confirmation email |
| Multi-day bookings | skip v1 |
| Waitlist | skip v1 |
| 3-month minimum (ABO) | hard-block |
| Pricing display | CHF only |
| Add-on member discount | full price (no discount) |
| Door code | in confirmation email immediately |
| Deposit | full payment, no deposit |
| B2B invoice | Phase 4 |
| SMS reminders | Phase 4 |

---

## Risk / fallback notes

- **Stripe KYC delay**: if verification > 5 days, contact Stripe support. They occasionally need extra docs (proof of address). Sister should respond quickly to any email from Stripe.
- **Resend domain not verifying**: usually a DNS typo. Use Resend's "Recheck" button. As fallback, can send from `onboarding@resend.dev` (works only to verified-account email — useful for testing).
- **Webhook missed**: hold cleanup cron (daily 03:00) covers it. Check pending_holds table if a booking seems stuck.
- **TWINT refunds**: take 5–7 business days, longer than card refunds. Set customer expectations in cancellation email.
- **Domain DNS propagation**: occasional 30–60 min delay. If site doesn't load after switch, wait, then check `dig ceestudio.ch` on terminal.

---

## Checklist — print this before going live

### Pre-deploy
- [ ] Stripe KYC verified, TWINT enabled
- [ ] Resend domain verified, sending test email works
- [ ] Supabase production project + schema applied
- [ ] All Phase C tests passed locally
- [ ] Cancellation rules confirmed (matched to AGB text)

### Deploy
- [ ] All env vars in Vercel set with LIVE values
- [ ] Stripe webhook endpoint configured
- [ ] DNS A record + CNAME pointed to Vercel
- [ ] SSL active
- [ ] vercel --prod success

### Post-deploy
- [ ] Phase F real-money test passed
- [ ] Owner iCal feed subscribed in Apple/Google Calendar
- [ ] Stripe mobile app installed on sister's phone
- [ ] Admin walkthrough done with sister
- [ ] First marketing post can go up

---

**Document version**: 1.0 — 2026-05-07. Update as decisions evolve.
