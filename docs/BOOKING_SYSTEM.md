# CEE Studio — Booking System Design & Implementation Plan

> Living document. Source of truth για το booking flow, data model και τα implementation steps.
> Τελευταίο update: 2026-05-06

---

## 0. Why custom build (vs SaaS)

Επιλέχθηκε custom αντί SimplyBook.me / Bookeo επειδή:

1. **TWINT απαιτείται** για Swiss conversions. Stripe Checkout το υποστηρίζει native μέσω `automatic_payment_methods` σε CHF Swiss account.
2. **ABO rollover** (unused hours carry 1 month) — κανένα SaaS δεν το κάνει σωστά. Είτε hack είτε μηχανικό αργότερα.
3. **Cancellation rules** — weekend non-cancellable, weekday >48h. Granular, δεν υποστηρίζεται από τα SaaS.
4. **Tier pricing** — 1h 70, 2h 120, 3h 165, 4h 250, 8h 490 (όχι γραμμικό × ώρες).
5. **Brand fidelity** — pixel-perfect matching με υπόλοιπο site (cream / brand-red / serif). No iframe seam.
6. **Late-night surcharge** (+CHF 10/h after 20:00) — conditional pricing, no SaaS native.
7. **B2B invoice flow** — επιλεγμένοι clients μπορούν να κρατάνε χωρίς πληρωμή, owner manually marks paid.

**Cost trade-off:** ~50h dev work upfront vs ~$60/mo SaaS forever. Break-even: ~12 months. Επιπλέον, ευελιξία και ownership.

---

## 1. Stack decisions

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | already in use |
| Hosting | Vercel | already in use |
| DB + Auth | **Supabase** (Postgres + Auth + RLS) | one tool, free tier covers this scale |
| Payments | **Stripe Checkout** + Subscriptions | TWINT auto-enabled in CHF Swiss account |
| Emails | **Resend** + React Email templates | best DX, multilingual, $0 up to 3k/mo |
| SMS | Twilio (Phase 4) | optional, not in v1 |
| Cron | Vercel Cron | rollover, reminders, summary |
| PDFs | `@react-pdf/renderer` | invoices server-side |
| Date/time | `date-fns` + `date-fns-tz` (`Europe/Zurich`) | DST-safe |
| Forms | `react-hook-form` + `zod` | server + client validation |

### Required env vars

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only

# Stripe (Switzerland account, CHF, TWINT enabled in dashboard)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM=bookings@ceestudio.ch

# Site
NEXT_PUBLIC_SITE_URL=https://ceestudio.ch
ADMIN_ALLOWED_EMAILS=info@ceestudio.ch,...   # comma-separated

# Cron protection
CRON_SECRET=                          # random string, used to authorize Vercel Cron calls
```

---

## 2. User types

| User | Πώς αναγνωρίζεται | Τι κάνει |
|---|---|---|
| **Visitor** | No login, email + name on form | Single bookings, full payment |
| **ABO Member** | Magic link login | Recurring plan, hour deduction |
| **Owner / Admin** | Email in `ADMIN_ALLOWED_EMAILS` | Full dashboard |

---

## 3. Customer flows

### 3.1 Visitor — single booking

```
/booking
  │
  ▼
[STEP 1] DURATION
   1h CHF 70 / 2h 120 / 3h 165 / 4h 250 (Best Value) / 8h 490
   "Already a member?" link → magic-link login
  │
  ▼
[STEP 2] DATE
   90-day calendar. Greyed: blocked / closed / fully booked.
  │
  ▼
[STEP 3] TIME SLOT
   Available start times για το επιλεγμένο duration & date.
   - Operating hours: 08:00–22:00
   - Buffer: 30min between bookings
   - Slot increments: 30min
   - Late-night badge (>20:00): "+CHF 10/h after 20:00"
  │
  ▼
[STEP 4] ADD-ONS
   ☐ Additional Lighting Setup +CHF 20
   ☐ All Backdrops Access +CHF 30
   ☐ Podcast Setup +CHF 40
   (Late-night surcharge auto-calculated)
  │
  ▼
[STEP 5] DETAILS
   Name · Email · Phone · Company (optional) · Type of shoot (optional)
   Language picker (default = current site lang)
   ☐ Agree to studio rules / AGB
  │
  ▼
[STEP 6] SUMMARY + PAYMENT
   Breakdown:
     4h × CHF 250                    250.00
     Backdrops Access                 30.00
     Late Night (1h after 20:00)      10.00
     ─────────────────────────────────────
     TOTAL                           290.00 CHF

   Payment method:
     💳 Card / 📱 TWINT  →  Stripe Checkout (full payment)
     🏢 Invoice (B2B)    →  only visible if email is whitelisted (manual approval)

   "Confirm & Pay" → POST /api/booking/hold → Stripe Checkout redirect
  │
  ▼
[STEP 7] STRIPE CHECKOUT
   - Hosted page
   - Card / TWINT / (potentially Apple Pay / Google Pay)
  │
  ▼
[STEP 8] CONFIRMATION
   /booking/success?session_id=cs_...
   - "Booking confirmed"
   - "Add to Calendar" (.ics)
   - "Get Directions" (Google Maps)
   - Manage link → /booking/manage/[token]
   - Confirmation email already sent to client + owner
```

**Hold mechanism (anti-double-booking):**
- Step 6 → POST creates a row in `pending_holds` with `expires_at = now + 10min`
- Stripe Checkout session created with `expires_at` matching
- Webhook on `checkout.session.completed` → upgrades hold → real `booking` row, deletes hold
- Webhook on `checkout.session.expired` or timeout → deletes hold
- `availability` query unions `bookings` + non-expired `pending_holds`

### 3.2 Visitor — manage / cancel

```
Email link → /booking/manage/[token]
  - View booking details
  - Cancel button (enabled only if rules allow):
      Weekend booking          → disabled, "Weekend bookings non-cancellable"
      Weekday >48h             → enabled, "Cancel & refund CHF X"
      Weekday <48h             → disabled, "<48h before — non-refundable"
  - Reschedule (Phase 4) — same rules
```

### 3.3 ABO member — signup

```
/studio (pricing) → "Become Member" button on plan card
  ▼
/membership/signup?plan=pro
  - Email · Name · Phone · Company (optional)
  - Card / TWINT (Stripe Checkout in `subscription` mode)
  ▼
Stripe Subscription created
  - metadata: { plan, hours_per_month, minimum_months: 3, signup_date }
  - First charge processes
  ▼
Webhook customer.subscription.created
  - Create user (if new) + membership row in DB
  - Allocate hours_balance = plan_hours
  - Send magic link to email
  ▼
User clicks magic link → /account dashboard
```

### 3.4 ABO member — book

```
/booking
  ▼
Banner: "Logged in as Maria · Pro plan · 6.5h remaining"
  ▼
Same flow ως visitor, BUT:
  - Step 6 shows TWO options:
      ① Use member hours (deduct 4h from balance)          [primary]
      ② Pay extra CHF 250 (don't deduct)                   [secondary]
  - If balance < booking duration:
      "You have 2h. This is a 4h booking. Pay CHF 100 for extra 2h?" (CHF 50/extra hour)
  - Add-ons πάντα paid extra (TWINT/Card)
  ▼
On confirm: deduct hours, create booking, send email
```

### 3.5 ABO member — `/account` dashboard

```
/account
  ├─ Plan summary
  │    - Tier · Status · Next renewal · Hours balance · Rolled-over expires
  ├─ Upcoming bookings list (cancel / reschedule where allowed)
  ├─ Past bookings (history, download receipts)
  ├─ Manage subscription → Stripe Customer Portal (upgrade / pause / cancel / update payment)
  └─ Invoices (PDF download)
```

---

## 4. Owner / Admin flows

### 4.1 `/admin` — Dashboard tab

- Today's timeline (08:00–22:00, color-coded slots)
- This week's revenue (CHF + booking count)
- Members count + MRR + churn this month
- Quick actions: "Block date" · "Manual booking" · "Refund booking"

### 4.2 `/admin/calendar`

- Month / Week / Day views
- Click booking → side drawer with full info, refund/edit/cancel actions
- Drag date range → block (vacation, maintenance)

### 4.3 `/admin/bookings`

- Sortable table: Date · Customer · Duration · Total · Method · Status
- Filters: date range, status, payment method, member/visitor
- Row actions: refund, mark no-show, send email, view session

### 4.4 `/admin/members`

- All ABO members with status, plan, hours used, MRR
- Click → detail page with booking history, manual hour adjustment, message
- Pause / cancel subscription on behalf of member

### 4.5 `/admin/manual-booking`

For phone / walk-in clients:
- Owner enters: name, email (optional), phone, start time, duration, payment method (Cash / Pre-paid / Invoice sent)
- Skips Stripe — booking confirmed immediately
- Counts toward availability calculation

### 4.6 `/admin/settings`

- Operating hours (per weekday)
- Buffer time
- Pricing tiers (in case of changes)
- Add-on prices
- Late-night surcharge time + amount
- Blocked dates (recurring + one-time)
- Email template editor (per language)
- B2B-approved emails (whitelist)
- Door code rotation
- Data export (CSV)

---

## 5. Communications matrix

| Trigger | Recipient | Channel | Lang |
|---|---|---|---|
| Booking confirmed (paid) | Customer | Email + .ics | Customer's |
| Booking confirmed (paid) | Owner | Email | DE |
| Booking confirmed (invoice B2B) | Customer | Email + invoice PDF | Customer's |
| Manual booking (admin) | Customer | Email + .ics | Owner picks |
| 24h reminder | Customer | Email | Customer's |
| 1h reminder | Customer | SMS (Phase 4) | Customer's |
| Cancellation by customer | Customer | Email | Customer's |
| Cancellation by customer | Owner | Email | DE |
| Refund processed | Customer | Email | Customer's |
| ABO welcome | Member | Email + magic link | Member's |
| ABO renewed | Member | Email + invoice PDF | Member's |
| ABO payment failed | Member | Email + retry link | Member's |
| Hours running low (<2h, weekly) | Member | Email | Member's |
| Hours about to expire (rolled-over) | Member | Email | Member's |
| Monthly summary | Owner | Email (1st of month) | DE |

---

## 6. Business rules

### 6.1 Operating hours
- Daily 08:00–22:00 (Europe/Zurich)
- Last booking must end by 22:00 → max 8h booking start = 14:00
- Late-night = any hour where `start >= 20:00`, surcharge +CHF 10 per such hour

### 6.2 Cancellation
- Weekend booking (Sat/Sun): non-cancellable, no refund
- Weekday booking, ≥48h before: full refund minus Stripe fee (CHF 1.50) OR 100% store credit
- Weekday booking, <48h before: non-cancellable, no refund
- Member booking cancellation: same rules, hours auto-credited back to balance

### 6.3 No-show
- Visitor: full charge, no refund
- Member: hours deducted normally, no return

### 6.4 Buffer + conflicts
- 30min buffer between bookings (configurable in settings)
- DB constraint: no overlapping bookings on same resource
- Hold mechanism prevents race on Stripe Checkout

### 6.5 ABO hour balance

Plan allocations (per renewal):
- Starter: +4h
- Pro: +9h (8h + 1h bonus)
- Unlimited: +16h

Logic on monthly renewal cycle:
1. Webhook `invoice.paid` fires
2. Calculate `unused_this_cycle = hours_balance` (whatever is left)
3. New cycle:
   ```
   rolled_over = min(unused_this_cycle, plan_hours)        # max 1 month worth
   rolled_over_expires_at = now + 1 month
   hours_balance = plan_hours + rolled_over
   ```
4. Cron daily: expire rolled-over hours past `rolled_over_expires_at`
5. Deduction order: rolled-over first (FIFO), then current month

### 6.6 B2B invoice
- Customer email must be in whitelist (settings)
- "Pay by invoice" appears in checkout
- Booking marked `payment_status: invoice_pending`
- Invoice PDF auto-generated, emailed
- Owner manually marks paid in `/admin/bookings/[id]`

---

## 7. Data model

```sql
-- USERS (visitors stored here too, optional row)
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  phone text,
  company text,
  role text check (role in ('visitor','member','admin')) default 'visitor',
  stripe_customer_id text unique,
  preferred_lang text check (preferred_lang in ('de','en','fr','it')) default 'de',
  b2b_invoice_approved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MEMBERSHIPS
create table memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan text check (plan in ('starter','pro','unlimited')) not null,
  status text check (status in ('active','past_due','paused','cancelled')) default 'active',
  stripe_subscription_id text unique not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  hours_per_month numeric(4,1) not null,    -- 4 / 9 / 16
  hours_balance numeric(4,1) default 0,
  hours_rolled_over numeric(4,1) default 0,
  rolled_over_expires_at timestamptz,
  minimum_until timestamptz,                 -- 3 months from signup
  created_at timestamptz default now(),
  cancelled_at timestamptz
);

-- BOOKINGS
create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  -- guest fields (for non-member visitors)
  guest_email text,
  guest_name text,
  guest_phone text,
  guest_company text,
  shoot_type text,
  -- timing
  start_time timestamptz not null,
  end_time timestamptz not null,
  duration_hours numeric(3,1) not null,     -- 1 / 2 / 3 / 4 / 8
  -- pricing
  base_price_chf integer not null,           -- in cents (cleaner for stripe)
  addons_price_chf integer default 0,
  late_night_surcharge_chf integer default 0,
  total_chf integer not null,
  -- payment
  payment_method text check (payment_method in ('card','twint','invoice','membership_hours','admin_cash','admin_prepaid')) not null,
  payment_status text check (payment_status in ('pending','paid','refunded','partially_refunded','invoice_pending','failed')) default 'pending',
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  -- if member: hours deducted from balance
  hours_deducted numeric(3,1) default 0,
  -- lifecycle
  status text check (status in ('confirmed','cancelled','no_show','completed')) default 'confirmed',
  cancelled_at timestamptz,
  cancelled_by text check (cancelled_by in ('customer','admin','system')),
  cancel_reason text,
  manage_token text unique,                  -- random string for /booking/manage/[token]
  preferred_lang text default 'de',
  -- meta
  notes text,                                -- admin notes
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- constraint: no double-booking
  exclude using gist (
    tstzrange(start_time, end_time) with &&
  ) where (status = 'confirmed')
);

create index idx_bookings_start ON bookings(start_time);
create index idx_bookings_user ON bookings(user_id);
create index idx_bookings_status ON bookings(status);

-- BOOKING ADD-ONS
create table booking_addons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  addon_key text check (addon_key in ('lighting','backdrops','podcast','late_night')),
  price_chf integer not null,
  quantity numeric(3,1) default 1
);

-- PENDING HOLDS (anti-race during Stripe Checkout)
create table pending_holds (
  id uuid primary key default gen_random_uuid(),
  start_time timestamptz not null,
  end_time timestamptz not null,
  stripe_session_id text unique,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- BLOCKED DATES (admin-controlled)
create table blocked_dates (
  id uuid primary key default gen_random_uuid(),
  start_time timestamptz not null,
  end_time timestamptz not null,
  reason text,
  created_at timestamptz default now()
);

-- SETTINGS (single-row config)
create table settings (
  id integer primary key default 1 check (id = 1),
  operating_hours jsonb default '{"start":"08:00","end":"22:00"}',
  buffer_minutes integer default 30,
  late_night_starts_at text default '20:00',
  late_night_surcharge_chf_per_hour integer default 10,
  prices jsonb default '...',                 -- mirrors current tiers
  addon_prices jsonb default '...',
  door_code text,
  wifi_password text,
  b2b_emails text[],
  updated_at timestamptz default now()
);

-- EMAIL LOG (debugging deliverability)
create table email_log (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  template text not null,
  lang text,
  resend_id text,
  status text check (status in ('sent','failed','bounced')),
  error text,
  sent_at timestamptz default now()
);
```

### Row-Level Security (Supabase RLS)

- `bookings`: members can read own; admins read all; anonymous can insert via service role only
- `users`, `memberships`: members read own; admins all
- `settings`: admin only
- `email_log`: admin only

---

## 8. API routes

### Public (no auth)
```
GET   /api/availability?date=2026-05-12&duration=4
        → { slots: ["08:00","09:00",...,"14:00"], blocked_reason?: string }

POST  /api/booking/hold
        body: { duration, start, addons[], guest:{name,email,phone,company,lang}, terms_accepted }
        → { stripe_session_url, hold_id }

POST  /api/booking/cancel/[token]
        → { refund_chf, status }

GET   /api/booking/[token]   (manage page data)
        → { booking, can_cancel, refund_amount }
```

### Member (auth required)
```
GET   /api/me
GET   /api/me/bookings
POST  /api/me/booking          (member booking, deducts hours)
POST  /api/me/booking/cancel/[id]
GET   /api/me/portal           → Stripe Customer Portal URL
```

### Auth (Supabase magic link)
```
POST  /api/auth/magic-link     body: { email }
GET   /api/auth/callback       (Supabase redirect)
```

### Webhooks
```
POST  /api/webhooks/stripe
        - checkout.session.completed     → confirm booking from hold
        - checkout.session.expired       → delete hold
        - charge.refunded                → mark booking refunded
        - customer.subscription.created  → create membership
        - customer.subscription.updated  → update membership status
        - invoice.paid                   → renewal: rollover + allocate hours
        - invoice.payment_failed         → mark past_due, email member
```

### Admin (auth + role=admin)
```
GET    /api/admin/bookings
POST   /api/admin/bookings/manual         (manual entry)
POST   /api/admin/bookings/[id]/refund
POST   /api/admin/bookings/[id]/cancel
PATCH  /api/admin/bookings/[id]
GET    /api/admin/members
PATCH  /api/admin/members/[id]
POST   /api/admin/members/[id]/adjust-hours
GET    /api/admin/blocked-dates
POST   /api/admin/blocked-dates
DELETE /api/admin/blocked-dates/[id]
GET    /api/admin/settings
PATCH  /api/admin/settings
GET    /api/admin/export.csv
```

### Cron (Vercel, protected by `CRON_SECRET`)
```
GET   /api/cron/reminders-24h            (every hour)
GET   /api/cron/reminders-1h             (every 15min, Phase 4)
GET   /api/cron/expire-rolled-over       (daily at 03:00)
GET   /api/cron/monthly-summary          (1st of month, 09:00)
GET   /api/cron/expire-holds             (every 5min — fallback to webhook)
GET   /api/cron/low-hours-alert          (weekly, Wed 10:00)
```

---

## 9. Implementation roadmap

> 4 phases, ~50h total. Each step is commit-sized.

### PHASE 1 — Visitor booking (target: ~15h)

Goal: A non-member can book + pay + receive confirmation. Owner sees bookings on a basic admin page.

1. **Setup Supabase project**
   - Create project at supabase.com (region: Frankfurt for low latency to CH)
   - Run schema SQL (above) in SQL editor
   - Add env vars to `.env.local` and Vercel
   - Install: `@supabase/supabase-js`, `@supabase/ssr`
   - Create `lib/supabase/server.ts` and `lib/supabase/client.ts`

2. **Setup Stripe**
   - Create Switzerland Stripe account if not yet (CHF default currency)
   - Enable TWINT in Dashboard → Settings → Payment Methods
   - Get test keys, add to env
   - Install: `stripe`, `@stripe/stripe-js`
   - Create `lib/stripe/server.ts` (Stripe SDK wrapper)
   - Test: create a test product, run a test charge

3. **Setup Resend**
   - Verify `ceestudio.ch` domain in Resend dashboard (SPF + DKIM records added to DNS)
   - Get API key, add to env
   - Install: `resend`, `react-email`, `@react-email/components`
   - Create `lib/email/send.ts` wrapper

4. **Build `/booking` 5-step UI**
   - Stepper component (progress indicator 1/5 → 5/5)
   - Step 1: Duration selector (5 cards)
   - Step 2: Date picker (use `react-day-picker`, disabled days from API)
   - Step 3: Time slot grid (fetched per date+duration)
   - Step 4: Add-ons checkboxes
   - Step 5: Form (name/email/phone/company/notes/terms)
   - Step 6: Summary + payment buttons
   - State management: `react-hook-form` + Zustand for stepper state

5. **API: GET `/api/availability`**
   - Input: date, duration
   - Read `bookings` (status=confirmed) + `pending_holds` (not expired) + `blocked_dates`
   - Compute available start times honoring buffer + operating hours + late-night cap
   - Return as ISO time array

6. **API: POST `/api/booking/hold`**
   - Validate input with Zod
   - Re-check availability server-side (no trust client)
   - Create `pending_holds` row, expires_at = now + 10min
   - Compute total (base + addons + late-night)
   - Create Stripe Checkout session (`mode=payment`, `payment_method_types: ['card']` + `automatic_payment_methods.enabled: true` so TWINT shows)
   - Pass `success_url`, `cancel_url`, metadata (hold_id, lang, etc.)
   - Return `{ url }` to redirect

7. **API: POST `/api/webhooks/stripe`**
   - Signature verification with `STRIPE_WEBHOOK_SECRET`
   - Switch on event type
   - On `checkout.session.completed`:
     - Find hold via metadata
     - Insert booking, delete hold
     - Generate `manage_token`
     - Send confirmation emails (customer + owner)
   - On `checkout.session.expired`: delete hold

8. **`/booking/success` page**
   - Read `?session_id=` from URL
   - Fetch booking via Supabase
   - Show details + Add-to-Calendar (.ics generated server-side via `ical-generator`)

9. **Email templates (React Email)**
   - `BookingConfirmationCustomer.tsx` (multilingual via prop)
   - `BookingConfirmationOwner.tsx` (DE)
   - Test render with `react-email dev` locally

10. **`/booking/manage/[token]` page**
    - Display booking details
    - Cancel button (server check rules)
    - On cancel: Stripe refund + DB update + email notifications

11. **Basic admin auth**
    - Middleware checking `ADMIN_ALLOWED_EMAILS` against magic-link session
    - Block `/admin/*` for non-admins

12. **`/admin` minimal page**
    - List of upcoming bookings
    - Status badges
    - Refund button (calls `/api/admin/bookings/[id]/refund`)
    - Block-date form

13. **Cron: expire holds**
    - `vercel.json` cron config: `*/5 * * * *` → `/api/cron/expire-holds`
    - Delete rows where `expires_at < now()`

14. **Test full flow end-to-end**
    - Test card payment in Stripe test mode
    - Test TWINT (must use real Switzerland Stripe account, can't test in test mode for TWINT)
    - Verify confirmation emails arrive
    - Verify .ics opens in Calendar
    - Verify cancel + refund works

15. **Deploy + manual smoke test on production**

✅ End of Phase 1: Visitors can book the studio and pay online.

---

### PHASE 2 — ABO Members (target: ~15h)

Goal: Recurring memberships work. Members can log in, see their balance, book using hours.

1. **Auth flow**
   - Supabase Auth: email magic link
   - `/login` page (single email input)
   - Session middleware
   - `lib/auth/getUser.ts` server helper

2. **`/membership/signup` flow**
   - Plan picker (Starter/Pro/Unlimited)
   - Form (email, name, phone, company)
   - Create Stripe Customer + Checkout in `subscription` mode
   - On `customer.subscription.created` webhook: create user + membership rows
   - Send welcome email with magic link

3. **`/account` dashboard**
   - Plan card (status, balance, next renewal)
   - Upcoming bookings list with cancel button
   - Past bookings list with receipts download
   - Stripe Customer Portal link (manage payment / cancel sub)

4. **Member booking flow**
   - When logged-in member visits `/booking`:
     - Banner shows balance
     - Step 6 shows "Use hours" option (no Stripe needed)
     - If balance < duration: option to pay extras
   - API: `/api/me/booking` (auth-only) creates booking, deducts hours

5. **Webhook: subscription renewal**
   - `invoice.paid` → calculate rollover, allocate next month's hours, store new period dates
   - Email member with renewal receipt + invoice PDF

6. **Webhook: subscription cancel/update**
   - `customer.subscription.updated` → update status field, possibly change plan
   - `customer.subscription.deleted` → status='cancelled'

7. **Cron: expire rolled-over hours**
   - Daily 03:00: `update memberships set hours_balance = greatest(hours_balance - hours_rolled_over, 0), hours_rolled_over = 0 where rolled_over_expires_at < now()`

8. **Cron: low-hours alert**
   - Weekly Wed 10:00: query members with `hours_balance < 2`, send email

9. **Member cancellation: hours refund**
   - On valid cancel of member booking → add hours back to balance

10. **Test end-to-end**
    - Sign up Starter → book 4h → balance 0 → renew next month → 4h again
    - Sign up Pro → book 5h → cancel weekday >48h → 5h back

✅ End of Phase 2: Memberships work fully.

---

### PHASE 3 — Owner admin polish (target: ~10h)

Goal: Owner has a real dashboard.

1. **`/admin` redesign**
   - Today's timeline component (08:00–22:00 visualization)
   - This-week revenue widget
   - Members count + MRR
   - Quick actions sidebar

2. **`/admin/calendar`**
   - FullCalendar.io component (or custom) — month/week/day
   - Click → drawer with details, refund/cancel/edit actions

3. **`/admin/bookings`**
   - Sortable, filterable table
   - Bulk actions: export CSV

4. **`/admin/members`**
   - All members table with metrics
   - Detail page with adjust-hours form

5. **`/admin/manual-booking`**
   - Form for phone/walk-in bookings
   - Skip Stripe — payment_method = 'admin_cash' or 'admin_prepaid' or 'invoice'

6. **`/admin/settings`**
   - Operating hours editor
   - Pricing tiers editor (writes to settings.prices)
   - Add-on prices
   - Late-night surcharge
   - Blocked dates UI
   - B2B emails whitelist
   - Door code rotation
   - Email templates editor (per-language Markdown)

7. **`/admin/export`**
   - CSV export of bookings (all-time or date range) for accounting

✅ End of Phase 3: Owner has full operational tool.

---

### PHASE 4 — Polish + edge cases (target: ~10h)

1. **Cancellation rule enforcement (UI + server)**
   - Client-side disabled buttons with tooltip explaining rule
   - Server re-check before allowing — never trust client

2. **Reschedule (member feature)**
   - One free reschedule per member booking, same rules as cancel

3. **B2B invoice flow**
   - Email whitelist check at checkout
   - "Pay by invoice" option in checkout UI
   - PDF invoice generation (`@react-pdf/renderer`)
   - Email invoice to client + admin notification
   - Admin marks paid in `/admin/bookings/[id]`

4. **PDF receipts**
   - Generate on-demand for any paid booking
   - Available from manage page + `/account`

5. **24h reminder cron**
   - Hourly: find bookings starting in 24h ± 30min, send reminder email if not already sent (`reminders_sent` flag)

6. **Monthly summary cron**
   - 1st of month 09:00: aggregate prev month's revenue, bookings, members, send to owner

7. **SMS reminders (optional)**
   - Twilio integration
   - 1h-before reminder
   - Member opt-in flag

8. **Promo codes (nice-to-have)**
   - `promo_codes` table
   - Validate during checkout, apply discount

9. **Waitlist (nice-to-have)**
   - `waitlist` table
   - When booking cancels, notify next waitlist user via email

10. **Analytics events**
    - Booking funnel tracking (Plausible / Vercel Analytics)
    - Conversion rate per step

✅ End of Phase 4: Production-grade system.

---

## 10. Testing strategy

- **Unit tests**: pricing calculator, slot availability calculator, hour balance logic — `vitest`
- **Integration tests**: API routes with Supabase test DB — `vitest` + `supabase test db`
- **E2E**: critical flows (book + pay + cancel) — `playwright`
- **Manual checklist** before each deploy (see Phase 1 step 14)

---

## 11. Pre-launch checklist

- [ ] Stripe account verified, TWINT enabled in Dashboard, webhook endpoint configured
- [ ] Resend domain verified (SPF, DKIM, DMARC in DNS)
- [ ] Supabase production project provisioned, RLS policies enabled, backups configured
- [ ] Privacy Policy updated to mention payment processor + email service
- [ ] AGB updated with new cancellation rules (matching code)
- [ ] Operating hours and prices in `settings` match website copy
- [ ] Vercel Cron jobs configured + tested (CRON_SECRET set)
- [ ] Owner email + phone in `ADMIN_ALLOWED_EMAILS`
- [ ] One real test booking with TWINT on a Swiss phone, end-to-end
- [ ] Confirmation emails verified in DE/EN/FR/IT
- [ ] iCal export tested in Apple Calendar + Google Calendar
- [ ] Refund tested
- [ ] Blocked-dates and manual-booking tested
- [ ] ABO signup + renewal tested with a real card (immediately refunded after)

---

## 12. Open questions / decisions still needed

- [ ] **Door code delivery**: in confirmation email at booking time, or only the morning of? (security tradeoff)
- [ ] **Deposit option**: do we need 50% deposit + 50% on day, or always full payment? Default = full payment.
- [ ] **Group bookings / multi-day**: out of scope for v1?
- [ ] **Waitlist for full days**: Phase 4 or skip?
- [ ] **Localized pricing display**: CHF only, or also EUR for cross-border? Default = CHF only.
- [ ] **Member discount on add-ons**: do members get a % off add-ons, or pay full? Default = full.
- [ ] **3-month minimum enforcement**: hard-block cancel button until 3 months pass, or allow with cancellation fee? Default = hard-block via `minimum_until` field.

---

## 13. Reference

- Stripe TWINT docs: https://docs.stripe.com/payments/twint
- Stripe Switzerland setup: https://stripe.com/docs/connect/cross-border-payouts
- Supabase Auth (magic link): https://supabase.com/docs/guides/auth/auth-email-passwordless
- React Email: https://react.email/docs
- Vercel Cron: https://vercel.com/docs/cron-jobs
- date-fns-tz: https://date-fns.org/v3.0.0/docs/Time-Zones
