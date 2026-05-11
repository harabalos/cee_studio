# CEE Studio — Πλήρης Οδηγός Testing

> Comprehensive end-to-end testing guide. Κάθε test έχει precondition, steps, expected results (UI + DB + email + Stripe), edge cases και troubleshooting.
>
> Last updated: 2026-05-11 (Sprint G + G.10 partial member booking)

---

# 📦 Τι έχουμε χτίσει — Πλήρης εικόνα

## Sprint roadmap

```
Phase 1   ✅  Visitor booking flow base
              • 6-step wizard, Stripe Checkout, webhook, schema
              • Admin v1, iCal feed, 26 unit tests

Sprint A  ✅  Visitor v1 production polish
              • Settings page, polished email templates
              • 24h reminder cron, auto-complete cron
              • Edit booking, mark no-show
              • Improved error states

Sprint B  ✅  Customer Account UX
              • Unified /login (customers + admin)
              • /auth/callback (smart redirect by role)
              • /account dashboard
              • Auto-link guest bookings → users by email

Sprint D  ✅  Memberships (Phase 2)
              • 3 plans (Starter / Pro / Unlimited)
              • Stripe Subscriptions, lazy product creation
              • Member booking με hour deduction
              • Webhook handlers (5 subscription events)
              • Customer Portal integration
              • Hour rollover + low-balance crons
              • 4 new email templates

Sprint G  ✅  UX cleanup
              • Auth-aware public Navbar
              • Booking success → "Create account" hint
              • /login multilingual + email pre-fill
              • /account tabs (Bookings / Membership / Profile)
              • /account/profile editing
              • BookingConfirmationCustomer Sign-in CTA
              • Resend DNS verified → bookings@ceestudio.ch

Sprint G.10 ✅  Partial member booking
              • Member με balance < duration → Stripe Checkout για overage
              • Overage rate: extra_hours × CHF 50 (per plan benefits)
              • Add-ons + late-night charged separately
              • Hour deduction via webhook (atomic με booking creation)

Sprint E  ⏳  Production deploy (επόμενο)
```

## Όλες οι σελίδες

### 🌐 Public

| URL | Τι Είναι |
|---|---|
| `/` | Homepage |
| `/equipment`, `/space`, `/studio`, `/contact`, `/faq` | Marketing pages |
| `/booking` | 6-step booking wizard |
| `/booking/success?session_id=` | Landing μετά Stripe payment |
| `/booking/manage/[token]` | Self-service για guest bookings |
| `/login?email=&next=` | Magic-link login (customers + admin) |
| `/logout` | Sign out |
| `/membership/signup?plan=` | Plan picker + signup form |
| `/membership/success?session_id=` | Landing μετά subscription |

### 👤 Customer (logged in)

| URL | Τι Είναι |
|---|---|
| `/account` | **Bookings** tab — upcoming + past + membership banner |
| `/account/membership` | **Membership** tab — ABO card + Customer Portal |
| `/account/profile` | **Profile** tab — edit name/phone/company/lang |

### 🔐 Admin (logged in με admin email)

| URL | Τι Είναι |
|---|---|
| `/admin` | Dashboard με stats, today's timeline |
| `/admin/bookings` | All bookings + refund actions |
| `/admin/bookings/[id]/edit` | Edit booking + mark no-show |
| `/admin/manual` | Manual booking entry (phone/walk-in) |
| `/admin/blocked` | Block dates |
| `/admin/settings` | Door code, WiFi, prices, B2B emails |

## API Endpoints

### Public
- `GET /api/availability?date=&duration=` — slot calculator
- `POST /api/booking/hold` — 30min hold + Stripe Checkout
- `GET /api/booking/[token]` — fetch by manage token
- `POST /api/booking/cancel/[token]` — customer cancellation
- `GET /api/booking/by-session?session_id=` — polled by /success

### Auth
- `GET /auth/callback` — Supabase magic-link → session + smart redirect

### Member (auth required)
- `GET /api/me` — user + membership info + isAdmin flag
- `POST /api/me/booking` — member booking (FULL or PARTIAL coverage)
- `PATCH /api/me/profile` — update name / phone / company / preferred_lang

### Membership
- `POST /api/membership/checkout` — Stripe Subscription Checkout
- `POST /api/membership/portal` — Stripe Customer Portal URL
- `GET /api/membership/by-session?session_id=` — polled by /success

### Admin (admin auth required)
- `GET/PATCH /api/admin/settings`
- `GET/PATCH /api/admin/bookings/[id]`
- `POST /api/admin/bookings/[id]/refund`
- `POST /api/admin/bookings/manual`
- `GET/POST /api/admin/blocked-dates`
- `DELETE /api/admin/blocked-dates/[id]`

### Webhooks
- `POST /api/webhooks/stripe` — 8 event types

### Crons (auth via CRON_SECRET)
- `GET /api/cron/expire-holds`
- `GET /api/cron/reminders-24h`
- `GET /api/cron/auto-complete`
- `GET /api/cron/expire-rolled-over`
- `GET /api/cron/low-balance`

### Calendar
- `GET /api/calendar/owner.ics?token=` — live owner ICS feed

## Database Tables

| Table | Purpose |
|---|---|
| `users` | Customers + admins. Profile data, magic-link auth target |
| `memberships` | ABO subscriptions. Hour balance, plan, status |
| `bookings` | Every booking. **Source of truth** |
| `booking_addons` | Per-booking lighting/backdrops/podcast lines |
| `pending_holds` | 30-min temp locks during Stripe Checkout |
| `blocked_dates` | Admin-defined studio downtime |
| `settings` | Singleton (id=1). Door code, prices, B2B whitelist, Stripe price IDs |
| `email_log` | Every email sent (debugging deliverability) |

## Email Templates (DE/EN/FR/IT)

| Template | Sent when | To |
|---|---|---|
| `BookingConfirmationCustomer` | Payment confirmed | Customer (με Sign-in CTA) |
| `BookingConfirmationOwner` | Payment confirmed | Owner |
| `BookingCancellationCustomer` | Booking cancelled | Customer |
| `BookingCancellationOwner` | Booking cancelled | Owner |
| `BookingReminder24h` | 24h before booking | Customer |
| `MembershipWelcome` | Subscription created | Member (με magic link) |
| `MembershipRenewal` | Monthly renewal | Member |
| `MembershipPaymentFailed` | Renewal failed | Member |
| `MembershipLowBalance` | Balance < 2h | Member |

---

# 🛠 TEST 0 — Environment Setup (πριν ξεκινήσεις)

> Πρέπει να γίνουν ΟΛΑ τα 7 βήματα πριν αρχίσεις testing. Διαφορετικά τα tests θα σπάνε με μυστήρια error.

## 0.1 — Dev server

```bash
cd /Users/harabalos/Desktop/AMOX/websites/cee_studio
# Αν node_modules λείπει ή έχει σπάσει: npm install
./node_modules/.bin/next dev
# ή απλά: npm run dev (αν το PATH έχει .bin)
```

✅ Verify: http://localhost:3000 φορτώνει την homepage.

⚠️ **Αν δεν τρέχει**: check για `next: command not found` → reinstall με `npm install`.

## 0.2 — Stripe CLI webhooks forwarding (ΚΡΙΣΙΜΟ)

Σε **νέο terminal tab/window**:

```bash
cd /Users/harabalos/Desktop/AMOX/websites/cee_studio
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Τυπώνει:
```
> Ready! You are using Stripe API Version [...]. Your webhook signing secret is whsec_eebb...
```

✅ **Verify**: `Listening for events...` εμφανίζεται.

⚠️ **ΚΡΙΣΙΜΟ**: το `whsec_...` που τυπώνει ΠΡΕΠΕΙ να ταιριάζει με το `STRIPE_WEBHOOK_SECRET` στο `.env.local`:

```bash
grep STRIPE_WEBHOOK_SECRET .env.local
# STRIPE_WEBHOOK_SECRET=whsec_eebb7117cbbc64a314cbafef8c48e3f19a11b6ad4c024b550ce24d0545e93243
```

Αν είναι **διαφορετικά** → ενημέρωσε το `.env.local` με το νέο secret + restart dev server.

⚠️ **ΧΩΡΙΣ stripe-cli**: bookings που πληρώνεις δεν θα ολοκληρώνονται (μένουν ως pending_holds), δεν στέλνεται email, η success page εμφανίζει fallback "Your booking is being processed".

## 0.3 — Supabase Auth Redirect URLs

Πρέπει να υπάρχουν στο Supabase Dashboard:
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/admin`
- `http://localhost:3000/account`

👉 https://supabase.com/dashboard/project/vhsfdfaziafkibzpevsq/auth/url-configuration

## 0.4 — Database migrations

Στο Supabase SQL Editor (https://supabase.com/dashboard/project/vhsfdfaziafkibzpevsq/sql/new) verify ότι έχουν τρέξει:

```sql
-- Verify migration_002_memberships
select column_name from information_schema.columns
 where table_schema = 'public' and table_name = 'bookings' and column_name = 'membership_id';
-- Expected: returns 1 row (membership_id)

select column_name from information_schema.columns
 where table_schema = 'public' and table_name = 'settings' and column_name = 'stripe_membership_prices';
-- Expected: returns 1 row (stripe_membership_prices)
```

Αν είτε λείπει → τρέξε `db/migration_002_memberships.sql` στο SQL editor.

## 0.5 — Stripe Customer Portal activated

👉 https://dashboard.stripe.com/settings/billing/portal → click **Activate** (one-time).

## 0.6 — Studio settings (door code + WiFi)

http://localhost:3000/admin/settings:
- Door code: π.χ. `4892`
- WiFi password: π.χ. `cee-studio-test`
- B2B whitelist: leave empty για τώρα

## 0.7 — Email config (Resend)

```bash
grep RESEND .env.local
# RESEND_API_KEY=re_...
# RESEND_FROM=CEE Studio <bookings@ceestudio.ch>
```

✅ DNS verified — τα emails θα φτάνουν στους πραγματικούς customers (όχι μόνο σε δικό σου mailbox).

## 0.8 — Clean DB state (optional)

Για clean start, διαγραφή των test bookings:

```bash
node --env-file=.env.local -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  // Delete test bookings (CAREFUL — όλα διαγράφονται)
  // await sb.from('bookings').delete().neq('id', 0);
  // await sb.from('pending_holds').delete().neq('id', 0);

  // Just inspect first:
  const { data } = await sb.from('bookings').select('count');
  console.log('Bookings:', data);
})();
"
```

⚠️ ΠΡΟΣΟΧΗ: το delete είναι commented out. Αν θες clean DB, uncomment **μόνο σε test environment**.

---

# 🧪 GUEST FLOWS

## TEST 1 — Basic guest booking (1h) 🎯

**Στόχος**: Verify το βασικό end-to-end booking flow για visitor (χωρίς account).

### Preconditions
- Dev server τρέχει (`localhost:3000`)
- **stripe-cli τρέχει** (κρίσιμο!)
- Καθαρό incognito window (όχι logged in)

### Steps

1. Άνοιξε **incognito** στο http://localhost:3000/booking
2. **Step 1 — Duration**: click `1h — CHF 70`
3. **Step 2 — Date**: click weekday σε **5+ μέρες μπροστά** (για να testάρουμε cancellation αργότερα). Καλύτερα Tue/Wed/Thu.
4. **Step 3 — Time**: click `14:00` (μη late-night, για clean test)
5. **Step 4 — Add-ons**: skip (click Continue χωρίς επιλογή)
6. **Step 5 — Details**:
   - Name: `Test User 1`
   - Email: `babismetaxas000+test1@gmail.com`
   - Phone: `+41 79 000 0001`
   - Company: leave empty
   - Shoot type: leave empty
   - Confirmation language: English (or your preference)
   - ✅ Accept terms
7. **Step 6 — Summary**: verify breakdown
   - Duration: 1h
   - Total: CHF 70
8. Click **PAY & BOOK** → ανοίγει Stripe Checkout
9. Πέρασε **τη δικιά σου κάρτα** (όχι test card — έχουμε LIVE keys σε test mode bookings)
10. Confirm payment

### Expected Results

#### UI
- ✅ Redirect στο `/booking/success?session_id=cs_test_...`
- ✅ Tag "✓" + "Booking confirmed" headline (`success_title`)
- ✅ Booking summary card εμφανίζεται μέσα σε <10 seconds (polling)
- ✅ **"Create your account — no password needed"** card εμφανίζεται από κάτω (επειδή είσαι σε incognito = logged out)
- ✅ Click "Sign in with magic link" → `/login?email=babismetaxas000%2Btest1%40gmail.com&next=/account` με email **pre-filled**

#### Stripe CLI log
```
2026-05-11 12:34:56 --> checkout.session.completed [evt_...]
2026-05-11 12:34:56 <-- [200] POST http://localhost:3000/api/webhooks/stripe [evt_...]
```

#### Email στο Gmail
- **Sender**: `CEE Studio <bookings@ceestudio.ch>`
- **Subject**: `Booking confirmed — CEE Studio`
- **Inbox** (όχι spam)
- HTML brand colors (cream + burgundy + accent gold)
- Date/time σε Europe/Zurich
- Door code (αν setup στα settings)
- WiFi password (αν setup)
- **"Manage booking"** button → /booking/manage/[token]
- **"Get directions →"** button → Google Maps
- 🆕 **"Create your account"** section + **"Sign in →"** CTA → /login pre-filled
- **.ics attachment** που ανοίγει σε Apple Calendar / Google Calendar

#### Owner email (στο admin)
- Subject: `New booking — Wed, 13 May 2026 14:00 · CHF 70`
- Customer name + phone + email
- Manage link

#### DB verification
```bash
node --env-file=.env.local -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data } = await sb.from('bookings').select('id, guest_email, start_time, total_chf, payment_status, status, stripe_session_id').order('created_at', { ascending: false }).limit(1);
  console.table(data);
})();
"
```
Expected:
- `payment_status = 'paid'`
- `status = 'confirmed'`
- `stripe_session_id` populated
- `total_chf = 7000` (= CHF 70.00 in cents)

### Edge cases to verify

- **A**: Refresh `/booking/success` after 30s → idempotent, summary still loads
- **B**: Try το same date/time σε άλλο incognito → slot NOT available
- **C**: Email arrives within 60 seconds; checkbox passed (not spam) — αν spam, check Resend dashboard logs
- **D**: .ics file opens cleanly σε Apple Calendar AND Google Calendar
- **E**: "Manage booking" link works χωρίς authentication (manage_token-based)
- **F**: Logged-in version of success page → δεν εμφανίζει το "Create account" card. Αντί αυτού, δείχνει μικρό "Open my account →" link.

### Common failures

| Σύμπτωμα | Αιτία | Fix |
|---|---|---|
| Success page stuck σε "Your booking is being processed" | stripe-cli δεν τρέχει | Start stripe-cli, replay event ή manual recovery |
| Email in spam | New domain warming up | Use mail-tester.com to verify DNS records |
| "Something went wrong" στο step 6 | Webhook secret mismatch | Match `.env.local` με stripe-cli output |
| Slot showed up busy though clean | Stale pending_hold | Wait 30min ή delete from DB |

---

## TEST 2 — Cancellation rules ⚠️

**Στόχος**: Verify τους 3 cancellation policies (weekday >48h, weekday <48h, weekend).

### 2a — Weekday >48h ✅ (refund allowed)

#### Steps
1. Πήγαινε στο email του Test 1 → click "Manage booking"
   (ή `/admin/bookings` → click "Edit →" → πάρε το manage_token)
2. /booking/manage/[token]
3. Verify κίτρινο banner: **"Cancellable · Refund CHF X"** (X = total minus Stripe fee 1.50)
4. Click **"Cancel booking"**
5. Inline confirm dialog appears → click **"Yes, cancel"**

#### Expected
- ✅ Page shows "This booking has been cancelled"
- ✅ Stripe refund created (visible στο Stripe Dashboard)
- ✅ Cancellation email στον customer
- ✅ DB:
  ```sql
  status = 'cancelled', payment_status = 'refunded', refund_chf = 6850  -- CHF 68.50 (CHF 70 - 1.50 fee)
  ```
- ✅ Slot ξανά available στο /booking calendar

#### Edge cases
- **Cancellation email**: same brand styling, refund amount displayed
- **Double-cancel attempt**: API returns "already_cancelled" gracefully
- **Slot reappears**: refresh /booking → date no longer shows that slot as booked

### 2b — Weekday <48h ❌ (blocked)

#### Steps
1. Φτιάξε **νέο booking** για αύριο (less than 48h away)
2. Click manage link → /booking/manage/[token]
3. Verify κόκκινο banner: **"Cancellation not possible less than 48h before."**
4. Verify button **"Cancel booking" is disabled** (greyed out)

#### Edge cases
- Try direct POST στο `/api/booking/cancel/[token]` → returns `{ error: "too_late" }`

### 2c — Weekend ❌ (blocked)

#### Steps
1. Φτιάξε νέο booking για **Σάββατο ή Κυριακή** (any future weekend)
2. /booking/manage/[token]
3. Verify κόκκινο banner: **"Weekend bookings cannot be cancelled."**
4. Button disabled

#### Edge cases
- Try direct POST → `{ error: "weekend" }`

---

## TEST 3 — Late-night surcharge 💰

**Στόχος**: Verify late-night calculation (+CHF 10/h after 20:00 Zürich time).

### 3a — All evening before 20:00 (no surcharge)
1. Duration 2h, time **17:00** (booking 17:00–19:00)
2. Step 6: total = CHF 120 (no late-night line)

### 3b — Partially late-night
1. Duration 4h, time **19:00** (booking 19:00–23:00)
2. Late-night hours = 3 (20:00, 21:00, 22:00)
3. Step 6: 
   - Base 4h: CHF 250
   - Late-night surcharge (3h): +CHF 30
   - **Total: CHF 280**

### 3c — Fully late-night
1. Duration 2h, time **21:00** (booking 21:00–23:00)
2. Late-night hours = 2
3. Total: CHF 120 + CHF 20 = **CHF 140**

### 3d — Exactly at cutoff
1. Duration 1h, time **20:00**
2. Late-night hours = 1
3. Total: CHF 70 + CHF 10 = **CHF 80**

### Edge cases
- **Custom late-night cutoff**: change in `/admin/settings` (e.g., 21:00) → recalculate
- **Surcharge per hour**: change to CHF 15 in settings → verify Step 6 shows new amount
- **Booking spans midnight**: not allowed currently — verify availability blocks it

---

## TEST 4 — Slot conflict prevention 🔒

**Στόχος**: Verify ότι το hold system προστατεύει double-booking.

### Steps
1. **Browser A** (Chrome incognito): start booking για π.χ. Wed 14:00, 2h. Πέτα Step 1-5 αλλά **ΣΤΑΜΑΤΑ** στο Step 6 (μη πατάς Pay)
2. **Browser B** (Safari ή άλλο profile): πάει /booking, διαλέγει ίδια Wed
3. Step 3 — Time picker: verify **14:00 ΔΕΝ είναι διαθέσιμη** (γκριζάρει)
4. Σε Browser A: clear browser tab (abandon booking)
5. Wait 30 minutes (or manually expire the hold in DB):
   ```sql
   delete from pending_holds where expires_at < now();
   ```
6. Σε Browser B: refresh /booking → 14:00 ξανά available

### Edge cases
- **A**: Both browsers reach Step 6 simultaneously → first to click "Pay" wins, second gets `slot_unavailable` 409 error στο API
- **B**: Hold for cancelled session → Stripe webhook `checkout.session.expired` → hold auto-deleted
- **C**: User abandons Stripe Checkout (closes tab) → hold lives 30 minutes, then auto-deleted by `expire-holds` cron

---

## TEST 17 — /booking/success "Create account" hint 🎫

**Στόχος**: Verify ότι μετά από guest booking, το success page εμφανίζει context-aware account CTA.

### 17a — Guest (logged out)
1. Incognito → make booking με NEW email (`babismetaxas000+test2@gmail.com`)
2. Stripe Checkout → return to `/booking/success?session_id=...`
3. Verify:
   - ✅ Booking summary card
   - ✅ **"Create your account — no password needed"** card εμφανίζεται κάτω από το summary
   - ✅ Body: "See your bookings, manage your membership and book faster next time."
   - ✅ **"Sign in with magic link"** button
4. Click button → πάει στο `/login?email=babismetaxas000%2Btest2%40gmail.com&next=/account`
5. Verify: email **pre-filled** στο input field
6. Submit → magic link sent → click → /account → δες το booking στο "Upcoming" tab

### 17b — Already logged in
1. Stay logged in
2. Κάνε άλλο booking
3. Στη success page:
   - ❌ "Create your account" card **NOT shown**
   - ✅ Αντί αυτού: μικρό **"Open my account →"** link

### 17c — Multilingual
1. Allow language to FR στο navbar
2. Repeat 17a
3. Verify:
   - Card title: "Crée ton compte — sans mot de passe"
   - Button: "Connexion par lien magique"

### Edge cases
- **A**: Email pre-fill works με special chars (+test) → encoded σωστά στο URL
- **B**: Slow network → polling shows "Finalizing…" then success card
- **C**: Total polling failure (15 attempts) → fallback "Your booking is being processed"

---

# 🔐 AUTH FLOWS

## TEST 5 — Admin login (νέο /login UI) 🔑

**Στόχος**: Verify admin login flow με τη νέα multilingual UI.

### Steps
1. Logout (αν είσαι logged in)
2. Open http://localhost:3000/login
3. Verify UI:
   - **Tag**: "Sign in" (or current language)
   - **Title**: "Welcome back"
   - **Helper text**: "Enter your email — we'll send you a magic link. No password needed."
   - **Hint** στο bottom: "New customer? Just enter your email — we'll create your account automatically. Existing customer? Sign in to see all your bookings."
4. Email: `babismetaxas000@gmail.com` (admin email)
5. Click **"Send magic link"**
6. Verify: success screen "Check your inbox" + email shown
7. Open Gmail → click magic link στο email
8. → redirect στο /admin (not /account, because admin email)

### Expected DB state
- `auth.users` has session created
- `users` table has row με `email = babismetaxas000@gmail.com` (created on first signin)

### Edge cases

#### 5a — Contextual subtitle
Open `/login?next=/account`:
- Helper: "Sign in to manage your bookings and membership."

Open `/login?next=/admin`:
- Helper: "Admin sign-in. Access restricted to authorized emails."

#### 5b — Email pre-fill
Open `/login?email=test%40example.com`:
- Email field pre-populated

#### 5c — Expired magic link
1. Request magic link
2. Wait > 1h (or modify token in URL)
3. Click → /login?error=otp_expired
4. Verify friendly message: **"The link has expired. Request a fresh one below."** (NOT raw "otp_expired")

#### 5d — PKCE cross-browser
1. Request link στο Chrome
2. Open link σε Safari
3. Verify: friendly message **"Magic links must be opened in the same browser that requested them."**

#### 5e — Multilingual
- DE: "Willkommen zurück" / "Magic Link senden"
- FR: "Bon retour" / "Envoyer le lien magique"
- IT: "Bentornato" / "Invia magic link"

#### 5f — Invalid email
- Input "abc" + Submit → browser validates (HTML5 type=email)

---

## TEST 11 — Customer login + /account tabs 👤

**Στόχος**: Verify το tabbed /account dashboard λειτουργεί σωστά.

### Preconditions
- Δεν είσαι admin (use a different email, π.χ. `+test`)
- Έχεις τουλάχιστον 1 booking με αυτό το email

### Steps
1. Logout αν είσαι logged in
2. /login → email `babismetaxas000+test@gmail.com`
3. Magic link → click → redirect στο `/account` (όχι /admin)

### Expected on /account

#### Header
- "CEE Studio · Account · babismetaxas000+test@gmail.com"
- Nav links: "+ New booking" · "Logout" (NO Admin link, since not admin)

#### Tab strip (right under header)
- **Bookings** (active by default)
- **Membership**
- **Profile**

#### Bookings tab content
- Heading: "My bookings"
- Subhelper: "Past, upcoming, and cancelled bookings — all in one place."
- **Membership banner** (if active membership exists):
  - "Active membership" badge
  - Plan + hours balance
  - "Manage →" link → /account/membership
- **"Upcoming (N)"** section:
  - Cards για κάθε upcoming booking
  - "View / cancel →" links
  - Cancellation status (Refund / Weekend / <48h)
- **"Past · cancelled · completed (M)"** table:
  - Sorted descending by date
  - Status badges with colors

### 11a — Click Membership tab
- URL: /account/membership
- Tab "Membership" highlighted
- If member: full membership card με:
  - Plan name + status
  - Hours balance / monthly allocation
  - Rolled-over hours warning (if any)
  - Past-due warning (if any)
  - "+ Book using my hours" CTA
  - "Manage subscription" → Stripe Customer Portal
- If NOT member: "Save with an ABO" prompt + "See plans →" CTA

### 11b — Click Profile tab
- URL: /account/profile
- Tab "Profile" highlighted
- Email field (read-only, displayed with note "can't be changed here")
- Form fields:
  - Name (text)
  - Phone (tel)
  - Company (text, marked optional)
  - Preferred language (select dropdown με DE/EN/FR/IT)
- "Save changes" button

### Edge cases

#### 11c — Direct URL access
- Visit `/account/membership` direct (logged out) → redirect to `/login?next=/account`
- After login → land on /account/membership (correct redirect)

#### 11d — Tab persistence
- Refresh on /account/membership → still on Membership tab (URL-based)

#### 11e — Mobile responsive
- Resize browser < 768px
- Tab strip should scroll horizontally if needed
- Tabs remain accessible

---

## TEST 16 — Auth-aware Navbar 🧭

**Στόχος**: Navbar reflects auth state σε desktop + mobile + multilingual.

### 16a — Logged out (anonymous visitor)
1. Logout / incognito
2. Open http://localhost:3000
3. Verify desktop navbar (right side, after nav links):
   - Instagram icon
   - Language switcher (EN/DE/FR/IT dropdown)
   - **"SIGN IN"** link (text)
   - **"BOOK NOW"** CTA button (burgundy)
4. Click "SIGN IN" → /login

### 16b — Logged in as customer
1. Sign in με customer email (όχι admin)
2. Verify navbar:
   - Avatar circle (initial of name or email) + name (lg+ screens only, hidden on smaller)
   - Click avatar → dropdown με:
     - Email header
     - **"My account"** link → /account
     - **"Sign out"** link → /logout
     - ❌ **NO "Admin →" link** (customer is not admin)
3. Click "My account" → /account

### 16c — Logged in as admin
1. Sign in με admin email (`babismetaxas000@gmail.com`)
2. Verify dropdown has BOTH:
   - "My account" → /account
   - **"Admin →"** → /admin (with arrow, slight brand color)
   - "Sign out" → /logout

### 16d — Mobile menu
1. Resize browser < 768px (or use device mode)
2. Open hamburger menu (3 lines top right)
3. Verify large serif menu items appear
4. Below "BOOK NOW" CTA:
   - **If logged in**: avatar + email + "MY ACCOUNT" + "ADMIN →" (if admin) + "SIGN OUT" links
   - **If logged out**: big "Sign in" link in serif font

### 16e — Multilingual labels
Switch language στο header switcher → verify dropdown labels:
- EN: "Sign in" / "My account" / "Admin" / "Sign out"
- DE: "Anmelden" / "Mein Konto" / "Admin" / "Abmelden"
- FR: "Connexion" / "Mon compte" / "Admin" / "Déconnexion"
- IT: "Accedi" / "Il mio account" / "Admin" / "Esci"

### Edge cases

#### 16f — Slow API response
- /api/me πολύ αργό → AccountMenu renders nothing (no flash of unstyled content)

#### 16g — API error
- /api/me returns 500 → AccountMenu treats as logged out → shows "Sign in"

#### 16h — Sign out cleanly
- Click "Sign out" → cookie cleared → navbar back to "Sign in" link instantly

---

## TEST 18 — Profile edit 👨‍💼

**Στόχος**: /account/profile saves changes σωστά + side-effects.

### Steps
1. Logged in as customer/member
2. /account → click **Profile** tab
3. Form loads με existing data (or empty fields για new user)
4. Edit fields:
   - Name: `Anna Müller`
   - Phone: `+41 79 123 45 67`
   - Company: `My Studio AG`
   - Preferred language: select **Deutsch**
5. Click **"Save changes"**
6. Verify: **✓ Saved** badge appears next to button (green, fades after 2.5s)
7. Refresh page → values persist

### DB verification
```bash
node --env-file=.env.local -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data } = await sb.from('users').select('email, name, phone, company, preferred_lang').eq('email', 'YOUR_EMAIL').single();
  console.log(data);
})();
"
```
Expected: all 4 fields updated.

### 18a — Side effect: pre-fill next booking
1. After saving, click "+ New booking" στο header
2. Reach Step 5 — Details
3. Verify: name + phone + company **pre-filled**
4. "Confirmation language" defaults στο preferred_lang που έσωσες

### 18b — Server validation
1. DevTools → Network tab
2. Submit profile form με body `{ preferred_lang: "xx" }` (intercept the PATCH request)
3. Expected response: **400 με `{"error":"invalid_lang"}`**
4. Other validations:
   - Name > 120 chars → truncated at 120
   - Phone > 40 chars → truncated at 40

### 18c — Clear field
1. Set name to empty string + Save
2. Verify DB: `name = NULL`

### 18d — Unauthenticated
1. /api/me/profile PATCH without session cookie
2. Expected: 401 `{"error":"unauthorized"}`

### Edge cases

- **Concurrent edit**: open Profile in two tabs, save different values → last write wins
- **User row doesn't exist yet**: API creates the row via insert path
- **Email change**: not allowed (read-only field) — endpoint ignores email field if sent

---

# 💎 MEMBER FLOWS (most complex)

## TEST 12a — Membership signup 🎯

**Στόχος**: Complete subscription signup flow.

⚠️ **Real money**: αυτό θα χρεώσει CHF 220 (Starter) πραγματικά τον μήνα. Cancel αμέσως μετά το test.

### Steps
1. Logout (clean state)
2. http://localhost:3000/studio
3. Scroll στα ABO Memberships
4. Click **"Become a member →"** στο **Starter** card
5. → /membership/signup?plan=starter
6. Verify:
   - Starter pre-selected
   - Summary δεξιά: CHF 220/μήνα
   - Plan benefits list (4h/month, etc.)
7. Form fields:
   - Email: NEW email (π.χ. `babismetaxas000+member1@gmail.com`)
   - Name: `Test Member`
   - Phone: `+41 79 000 0010`
   - Accept terms
8. Click **"Subscribe now"** → Stripe Checkout (mode=subscription)
9. Πέρασε δικιά σου κάρτα → confirm

### Expected (12b — payment + activation)

#### UI
- → /membership/success?session_id=...
- "Setting up your account…" → ~5-10s polling → "All set ✓"

#### Stripe CLI log
```
--> customer.subscription.created [evt_...]
--> invoice.created
--> invoice.paid
--> customer.subscription.updated
```

#### Email "Welcome to Starter Creator"
- Subject: `Welcome to Starter — CEE Studio`
- Magic link inside
- Brand styling

#### DB
```bash
node --env-file=.env.local -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data: u } = await sb.from('users').select('id, email, role, stripe_customer_id').eq('email', 'babismetaxas000+member1@gmail.com').single();
  console.log('User:', u);
  const { data: m } = await sb.from('memberships').select('plan, status, hours_balance, hours_per_month, stripe_subscription_id, current_period_end').eq('user_id', u.id);
  console.log('Membership:', m);
})();
"
```
Expected:
- `user.role = 'member'`
- `user.stripe_customer_id` populated
- `membership.plan = 'starter'`
- `membership.status = 'active'`
- `membership.hours_balance = 4`
- `membership.hours_per_month = 4`
- `membership.current_period_end` ~30 days από τώρα

### Edge cases
- **Webhook race**: success page polls /api/membership/by-session — if webhook slow, shows "Setting up..." up to 15 attempts
- **Duplicate signup**: same email tries again → existing subscription error from Stripe
- **Failed payment**: card declined → webhook `invoice.payment_failed` → email "MembershipPaymentFailed" sent

---

## TEST 12c — Member booking, FULL coverage (balance >= duration)

**Στόχος**: Verify member booking when hours cover the full duration.

⚠️ **Important pricing rule**: Hours cover **only** the studio base rental. Add-ons + late-night surcharge are **always charged separately** at regular price, even with full coverage. This means full coverage may still trigger Stripe Checkout when extras are selected.

### Preconditions
- Member account active με `hours_balance >= duration_to_book`
- E.g., Starter member με 4h balance

### 12c.1 — Full coverage, NO extras (direct flow, CHF 0)

#### Steps
1. Login ως member → /account
2. Verify Membership banner shows "4h available / 4h monthly"
3. Click **"+ Book using my hours"** → /booking
4. **Member banner**: "MEMBER · STARTER 4h available · ✓ Will be paid with hours"
5. Step 1: Duration **2h** (less than balance)
6. Step 2-3: pick date + time **avoiding late-night** (e.g., next Tue 14:00–16:00)
7. Step 4: **SKIP add-ons**
8. Step 5: details pre-filled. Accept terms.
9. Step 6:
   - 3 payment buttons: **Use hours (2h)** (preselected) · Card or TWINT · Invoice (disabled)
   - Sidebar Total: **CHF 0**
10. Click **PAY & BOOK**

#### Expected
- ✅ **NO Stripe Checkout** (direct flow)
- ✅ Redirect στο `/booking/manage/[token]?member_booked=1`
- ✅ Email confirmation (no $ amount)
- ✅ /account → balance **4h → 2h**
- ✅ DB: `payment_method = 'membership_hours'`, `total_chf = 0`, `hours_deducted = 2`, `membership_id` populated

### 12c.2 — Full coverage + add-on (Stripe Checkout for extras)

#### Steps
1. Same as above, but Step 4: select **Podcast Setup (+CHF 40)**
2. Step 6:
   - Sidebar Total: **CHF 40** (only the add-on)
   - Banner: "✓ 2h from plan + CHF 40 for extras"
3. Click PAY & BOOK
4. → **Stripe Checkout** opens

#### Stripe Checkout shows
- Line 1: "Studio Rental — 2h (covered by plan)" — CHF 0
- Line 2: "Add-on: Podcast Setup" — CHF 40
- Total: CHF 40

#### After payment + webhook
- ✅ Booking created με `total_chf = 4000`, `hours_deducted = 2`, `payment_method = 'card'` (or twint), `membership_id` set
- ✅ Balance: 4h → 2h
- ✅ Email confirmation με booking details

### 12c.3 — Full coverage + late-night

#### Setup
- 4h booking at 19:00 (3h late-night), no add-ons
- Late-night charge: 3 × CHF 10 = CHF 30

#### Expected
- Sidebar Total: **CHF 30**
- Stripe Checkout shows late-night line item
- After payment: hours deducted, total_chf = 3000

### 12c.4 — Full coverage + add-on + late-night

#### Setup
- 4h booking at 19:00 με Podcast + Lighting
- Charge: 0 base + 40 + 20 + 30 = CHF 90

#### Expected
- Sidebar Total: **CHF 90**
- Stripe Checkout shows 4 line items (base, podcast, lighting, late-night)

### Edge cases for full coverage
- **Already paid full coverage with extras + cancellation**: refund the EXTRAS amount, restore the hours
- **Browser back from Stripe**: pending_hold still active, can retry

---

## TEST 12d — Member booking, PARTIAL coverage 🆕 (Sprint G.10)

**Στόχος**: Verify ο member που έχει LESS hours than booking πληρώνει σωστά τη διαφορά + extras.

### Unified pricing formula (works for partial AND full+extras)
```
charged = (duration - hours_balance, floored to 0) × CHF 50    [overage base]
        + add-ons cost                                          [regular price]
        + late-night surcharge                                  [regular price]
```

If `charged === 0` → direct booking, no Stripe.
Otherwise → Stripe Checkout for `charged`.

### Preconditions
- Member account active
- `hours_balance < duration` AND `hours_balance > 0`

### 12d.1 — Pure overage (no add-ons, no late-night)

#### Setup
- Balance: 2h available
- Booking: 4h, weekday 14:00 (no late-night)

#### Steps
1. /booking → 4h duration → pick date/time avoiding late-night → no add-ons → Step 6

#### Expected (Step 6 UI)
- **Member banner**: "✓ 2h from plan + CHF 100 for 2h extra"
- **"Use hours" button label**: "2h + CHF 100" (with sub-text "2h extra × CHF 50")
- **Sidebar Total**: **CHF 100** (όχι CHF 0, όχι CHF 250)
- Italic note: "2h from plan · 2h × CHF 50"

#### Action
2. Click PAY & BOOK
3. **Stripe Checkout** opens (αντί για direct booking)
4. Line items στο Stripe page:
   - "Studio Rental — 2h extra @ CHF 50/h" — CHF 100
5. Pay → return to /booking/success

#### Expected after webhook
- ✅ Booking created
- ✅ Hours deducted: balance 2h → 0h
- ✅ Email confirmation
- DB:
  - `payment_method = 'card'` (or 'twint')
  - `total_chf = 10000` (CHF 100)
  - `hours_deducted = 2`
  - `membership_id` populated

### 12d.2 — Overage + add-on

#### Setup
- Balance: 2h
- Booking: 4h, no late-night, **+ Podcast Setup (CHF 40)**

#### Expected
- Sidebar Total: **CHF 140** (100 + 40)
- Stripe line items:
  - "Studio Rental — 2h extra @ CHF 50/h" — CHF 100
  - "Add-on: Podcast Setup" — CHF 40

### 12d.3 — Overage + late-night

#### Setup
- Balance: 2h
- Booking: 4h starting at **19:00** (3 hours of late-night: 20-23h)
- Wait — careful: 4h starting 19:00 = 19-23h, late-night hours = 3 (20, 21, 22)
- Late-night charge: 3 × CHF 10 = CHF 30

#### Expected
- Sidebar Total: **CHF 130** (100 overage + 30 late-night)
- Stripe line items:
  - "Studio Rental — 2h extra @ CHF 50/h" — CHF 100
  - "Late-night surcharge (3h)" — CHF 30

### 12d.4 — Overage + add-on + late-night (συνδυασμός)

#### Setup
- Balance: 2h
- Booking: 4h at 19:00, + Podcast (40), + Lighting (20)

#### Calculation
- Overage: 2 × 50 = CHF 100
- Add-ons: 40 + 20 = CHF 60
- Late-night: 3 × 10 = CHF 30
- **Total: CHF 190**

#### Verify Stripe Checkout shows 4 line items

### 12d.5 — Exactly at boundary

#### Setup
- Balance: 1h
- Booking: 2h

#### Expected
- Overage: 1 × 50 = CHF 50
- **Total: CHF 50** (just the overage)

### Edge cases

#### 12d.6 — Slot lost during Stripe Checkout
1. Reach Stripe Checkout (CHF 100 charge)
2. Have another window book the same slot
3. Original user clicks "Pay" → webhook tries to insert booking → fails (conflict)
   - Actually no: pending_hold protects the slot for 30 minutes
   - Other window's booking would FAIL at availability check
4. Verify pending_hold prevents the race

#### 12d.7 — User abandons Stripe Checkout
1. Reach Stripe Checkout
2. Close browser tab
3. After 30 minutes:
   - `expire-holds` cron deletes the pending_hold
   - Or Stripe webhook `checkout.session.expired` fires (depending on timing)
4. Hours NOT deducted (because no booking was finalized)
5. Slot becomes available again

#### 12d.8 — Webhook fires twice (idempotency)
1. Stripe might retry webhook delivery
2. Second delivery tries to finalize already-finalized booking
3. Verify: no double insert (stripe_session_id is UNIQUE in DB)
4. Verify: hours NOT double-deducted (pending_hold already deleted by first webhook)

---

## TEST 12e — Member booking, ZERO balance (fallback) 🆕

**Στόχος**: Member με 0 hours πρέπει να μπορεί να κάνει regular booking με κάρτα.

### Setup
- Member account με `hours_balance = 0` (used up all hours)

### Steps
1. /booking → Step 6
2. Member banner: "0h available · No hours left — card will be used"
3. **Use hours** button → disabled (greyed) με tooltip "Need 2h, have 0h"
4. **Card or TWINT** → auto-selected
5. Click PAY & BOOK
6. → Regular guest booking flow (/api/booking/hold + Stripe Checkout για FULL price)
7. Pay → booking confirmed

### Expected
- Booking created με `payment_method = 'card'`
- `membership_id` NOT set (regular booking, not member)
- `hours_deducted = 0`
- Hours balance unchanged (still 0)

### Edge cases
- **Member with negative balance**: shouldn't happen (we guard against it), but if it does → same fallback behavior

---

## TEST 12f — Customer Portal (Stripe) 💳

**Στόχος**: Verify subscription management via Stripe Portal.

### Steps
1. /account/membership
2. Click **"Manage subscription"** button
3. → redirect to Stripe Customer Portal (hosted στο Stripe)
4. Verify available actions:
   - View invoices
   - Update payment method
   - Cancel plan
5. Click "Cancel plan" → confirm
6. Portal shows: "Subscription scheduled to cancel on [period_end]"
7. Return στο /account
8. Verify: status badge still **"active"** (cancelled at period end)

### Expected DB
- `memberships.cancelled_at` populated
- `memberships.status` still 'active' (until period_end)
- `memberships.minimum_until` (if not passed yet) → warning shown

### Edge cases
- **Try to cancel during minimum term (3 months)**:
  - Cancellation goes through (Stripe allows it)
  - But `minimum_until` is respected — billing continues until that date
- **Re-subscribe after cancellation**: new subscription via /membership/signup → new row in memberships

⚠️ **MUST DO**: After test 12, **cancel το subscription στο Stripe** ώστε να μη χρεωθείς ξανά μήνα μετά.

---

# 🔧 ADMIN FLOWS

## TEST 6 — Admin manual booking 📞

**Στόχος**: Owner κλείνει booking για phone/walk-in client.

### Steps
1. /admin/manual
2. Duration: 2h, date: next week, time: pick from dropdown (only available slots shown)
3. Customer:
   - Name: `Phone Client`
   - Phone: `+41 79 999 9999`
   - Email: leave empty (optional)
4. Payment method: **"Prepaid (already received)"**
5. Send email = ☐ (off)
6. Notes: "Test phone booking — paid cash"
7. Click "Create booking"

### Expected
- Redirect στο /admin/bookings
- Νέο booking με:
  - `payment_method = 'admin_prepaid'`
  - `payment_status = 'paid'`
  - `status = 'confirmed'`
  - No `stripe_session_id`
- No Stripe charge created
- No customer email (toggle off)

### 6a — Time picker shows only available slots
- Open the time `<select>` dropdown
- Verify: only slots NOT conflicting με existing bookings appear
- Conflicts: from `bookings` (confirmed/completed/no_show) + `pending_holds` + `blocked_dates`

### Edge cases
- **6b**: Try to book past date → blocked at UI (date picker disables past)
- **6c**: Try same slot as existing booking → time dropdown excludes it
- **6d**: Toggle "Send email" ON → confirmation email sent to client (if email provided)
- **6e**: B2B invoice option for whitelisted emails

---

## TEST 7 — Admin edit + mark no-show ✏️

### 7a — Inline edit
1. /admin/bookings → click "Edit →" σε ένα booking
2. Edit customer name (e.g., fix typo)
3. Click outside / Save → "Saved at HH:MM" confirmation
4. Refresh → change persists

### 7b — Mark no-show (past booking)
1. Find a past booking with `status = 'confirmed'`
2. Click **"Mark no-show"** button → confirm
3. Status badge changes to red **"no_show"**

### 7c — Mark completed (past booking)
1. Find a past booking
2. Click **"Mark completed"** → status: **"completed"**

### 7d — Future booking guard
1. Find a future booking (start_time > now)
2. Click "Mark completed"
3. Verify: BLOCKED → toast "Cannot mark a future booking as completed"
4. API returns 400 `{ error: "future_booking" }`

### 7e — Refund from edit
1. Open paid booking
2. Click "Refund" → confirm CHF amount
3. Stripe refund processed
4. Status: cancelled, payment_status: refunded

---

## TEST 8 — Settings save 🔧

### Steps
1. /admin/settings
2. Change door code from `4892` → `1234`
3. Click outside → "Saved at HH:MM"
4. Refresh → persists
5. Make new booking → confirmation email shows `1234`

### 8a — Prices
1. Change 1h price from 70 → 80 CHF
2. /booking → 1h shows CHF 80

### 8b — Late-night settings
1. Change cutoff to 21:00 + surcharge to CHF 15/h
2. 4h booking at 19:00 → late-night hours = 2 (21, 22) × 15 = CHF 30

### 8c — B2B whitelist
1. Add `client@bigco.ch`
2. Login as that client → at Step 6, Invoice option enabled
3. Click → invoice booking created με `payment_status = 'invoice_pending'`

### 8d — Membership prices
- Stripe price IDs lazily created on first signup
- Settings → `stripe_membership_prices` jsonb populated

---

## TEST 9 — Block date 🚫

### Steps
1. /admin/blocked
2. Add block: next Friday 00:00 - 23:59, reason "Owner away"
3. /booking → pick that Friday → "No slots available" message

### 9a — Partial block
1. Block Saturday 14:00-18:00
2. /booking → 14:00-18:00 slots greyed out, 08:00-14:00 and 18:00-22:00 available

### 9b — Delete block
1. Delete the block
2. /booking → slots ξανά available

### Edge cases
- **9c**: Existing bookings during blocked range still show in /admin/bookings (just prevents NEW bookings)
- **9d**: Cancellation of blocked-time-overlap-booking handled normally

---

## TEST 10 — iCal feed 📅

### Steps
1. Get token: `grep OWNER_ICS_TOKEN .env.local`
2. Open: http://localhost:3000/api/calendar/owner.ics?token=YOUR_TOKEN
3. Browser downloads `.ics` file
4. Open με Apple Calendar / Google Calendar
5. Verify: all confirmed bookings appear

### 10a — Setup subscription
- Apple Calendar: File → New Calendar Subscription → paste URL
- Auto-refresh hourly

### Edge cases
- **10b**: Invalid token → 401
- **10c**: Cancelled/no-show bookings NOT in feed
- **10d**: ICS includes manage_token URL for owner reference

---

## TEST 15 — Refund flow 💸

### Steps
1. /admin/bookings → click "Refund" σε paid booking
2. Confirm dialog "Refund CHF X?"
3. Wait for Stripe response

### Expected
- ✅ Stripe Dashboard: refund visible
- ✅ Customer email: cancellation με refund amount
- ✅ DB:
  - `status = 'cancelled'`
  - `payment_status = 'refunded'`
  - `refund_chf` populated
- ✅ Slot ξανά available

### 15a — Partial refund
- Not currently supported in UI (full refund only)
- Webhook handles partial refunds correctly if done via Stripe Dashboard

### 15b — Refund non-Stripe booking
- For admin_cash/admin_prepaid bookings, refund is recorded but NO Stripe call
- Owner handles cash refund manually

### Edge cases
- **15c**: Cancellation fees: refund is `total_chf - 150` (Stripe fee CHF 1.50 in cents)
- **15d**: Membership-hours bookings: cancellation refunds the hours (not money) — verify balance increases

---

# 🔄 MAINTENANCE

## TEST 13 — Cron jobs

### Manual triggers

```bash
SECRET=$(grep CRON_SECRET .env.local | cut -d= -f2)
BASE=http://localhost:3000

# 1. Expire old pending_holds
curl -H "Authorization: Bearer $SECRET" $BASE/api/cron/expire-holds
# Expected: { ok: true, deleted: N }

# 2. 24h reminders
curl -H "Authorization: Bearer $SECRET" $BASE/api/cron/reminders-24h
# Expected: { ok: true, sent: N }

# 3. Auto-complete past bookings (>2h after end)
curl -H "Authorization: Bearer $SECRET" $BASE/api/cron/auto-complete
# Expected: { ok: true, completed: N }

# 4. Expire rolled-over hours
curl -H "Authorization: Bearer $SECRET" $BASE/api/cron/expire-rolled-over
# Expected: { ok: true, expired: N }

# 5. Low-balance alert
curl -H "Authorization: Bearer $SECRET" $BASE/api/cron/low-balance
# Expected: { ok: true, sent: N }
```

### Edge cases
- **No secret**: returns 401
- **Wrong secret**: returns 401
- **Empty database**: returns `{ ok: true, sent: 0 }` (no error)

---

## TEST 14 — Email deliverability 📧 (DNS verified ✓)

**Στόχος**: Verify production-quality email delivery to real customers.

### Preconditions
- Resend DNS verified (SPF/DKIM/DMARC pass)
- `RESEND_FROM=CEE Studio <bookings@ceestudio.ch>` in .env.local
- stripe-cli running

### Steps
1. Make a test booking με real email (a friend's Gmail or +tag alias)
2. Verify:
   - ✅ Email lands in **inbox**, not spam folder
   - ✅ Sender shows as **`CEE Studio <bookings@ceestudio.ch>`**
   - ✅ Reply-to works (replies go to monitored inbox)
   - ✅ HTML renders με brand colors
   - ✅ .ics opens cleanly σε Apple Calendar
   - ✅ "Manage booking" + "Get directions" + "Sign in →" all link correctly
   - ✅ Door code shown (if settings populated)

### 14a — Cancellation email
1. Cancel a booking
2. Verify cancellation email arrives
3. Refund amount shown (or "—" for membership-hour bookings)

### 14b — Reminder email (24h before)
1. Wait for cron to trigger (or manually run)
2. Verify reminder arrives
3. Door code + WiFi shown

### 14c — Member welcome email
1. Sign up new member
2. Verify welcome email με magic link
3. Click magic link → /account

### 14d — Multilingual emails
- Make booking με `preferred_lang = "de"` → email in German
- Repeat για EN, FR, IT
- Verify date format, currency, all text strings

### Edge cases

#### 14e — Spam check
- Run https://www.mail-tester.com → score ≥ 8/10
- If lower: check DNS records, send a few warm-up emails first

#### 14f — Bounced email
- Use invalid email like `nonexistent@nowhere.invalid`
- Resend dashboard → see bounce
- Booking still created (email delivery is best-effort, not blocking)

#### 14g — Domain warming
- New domain may have low reputation
- Send 10-20 emails per day for first week
- Avoid bursts that look like spam

---

# 🐛 TROUBLESHOOTING

## Stripe webhook issues

### Symptom: "Booking is being processed" stuck on success page

**Cause**: stripe-cli not running.

**Fix**:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Recovery script** (manually finalize a paid booking):
```bash
# 1. Find the pending_hold for the session
node --env-file=.env.local -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('pending_holds').select('*').order('created_at', { ascending: false }).limit(1).then(r => console.log(JSON.stringify(r.data, null, 2)));
"

# 2. Resend the event via stripe-cli (once it's running):
stripe events resend evt_XXX_FROM_DASHBOARD
```

### Symptom: "no_signature" error in webhook logs

**Cause**: `STRIPE_WEBHOOK_SECRET` mismatch between `.env.local` και stripe-cli output.

**Fix**: copy the `whsec_...` printed by stripe-cli at startup → `.env.local` → restart dev server.

---

## Email issues

### Symptom: emails in spam folder

**Possible causes**:
1. DNS records not fully propagated (wait 30min)
2. Domain reputation low (new domain — warm it up)
3. Content triggers spam filter

**Fix**:
- Run mail-tester.com → fix any flags
- Send a few real emails to your own inbox (mark as not spam)
- Check Resend dashboard for delivery rate

### Symptom: emails not sent at all

**Check**:
1. `RESEND_API_KEY` set in `.env.local`
2. `RESEND_FROM` format: `"Name <email@domain.ch>"`
3. Resend dashboard → check API logs for failures

---

## Auth issues

### Symptom: magic link redirects back to /login

**Cause**: Supabase Auth Redirect URLs missing `/auth/callback`.

**Fix**: https://supabase.com/dashboard/project/vhsfdfaziafkibzpevsq/auth/url-configuration

Add: `http://localhost:3000/auth/callback`

### Symptom: "PKCE code verifier not found" error

**Cause**: Cross-browser magic link click (Chrome request, Safari open).

**Fix**: Updated email templates use `{{ .TokenHash }}` instead of `{{ .ConfirmationURL }}`. If you see this error:
1. Check Supabase Dashboard → Email Templates
2. Replace `{{ .ConfirmationURL }}` με `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email` σε ALL templates
3. Reference template: `docs/SUPABASE_EMAIL_TEMPLATES.md`

---

## Database issues

### Symptom: "column bookings.membership_id does not exist"

**Cause**: migration_002_memberships.sql not applied.

**Fix**: Run στο Supabase SQL Editor:
```sql
alter table public.settings
  add column if not exists stripe_membership_prices jsonb default '{}'::jsonb;

alter table public.bookings
  add column if not exists membership_id uuid references public.memberships(id) on delete set null;

create index if not exists idx_bookings_membership on public.bookings(membership_id);

drop policy if exists memberships_self_read on public.memberships;
create policy memberships_self_read on public.memberships
  for select to authenticated
  using (user_id in (select id from public.users where auth_id = auth.uid()));
```

### Symptom: stale pending_holds blocking slots

**Fix**:
```sql
delete from pending_holds where expires_at < now();
```

Or run the cron manually:
```bash
SECRET=$(grep CRON_SECRET .env.local | cut -d= -f2)
curl -H "Authorization: Bearer $SECRET" http://localhost:3000/api/cron/expire-holds
```

---

## Next.js dev mode issues

### Symptom: random 500 errors or stale code

**Cause**: Known Next.js 14 dev mode cache corruption.

**Fix**:
```bash
npm run dev:reset
# Or manually:
lsof -ti:3000 | xargs kill -9 2>/dev/null
rm -rf .next node_modules/.cache
npx next dev
```

### Symptom: "next: command not found"

**Cause**: node_modules incomplete.

**Fix**:
```bash
npm install
./node_modules/.bin/next dev  # Use absolute path if PATH not set
```

---

# ✅ Test Completion Checklist

Όταν τρέξεις τα tests, mark κάθε ένα:

```
ENVIRONMENT
☐ Test 0    — Setup (dev, stripe-cli, migrations, settings, DNS, env vars)

GUEST FLOWS
☐ Test 1    — Guest booking (1h)
☐ Test 2a   — Cancel weekday >48h (refund)
☐ Test 2b   — Cancel weekday <48h (blocked)
☐ Test 2c   — Cancel weekend (blocked)
☐ Test 3a   — Late-night: no surcharge before 20:00
☐ Test 3b   — Late-night: partially overlap
☐ Test 3c   — Late-night: fully evening
☐ Test 3d   — Late-night: at cutoff
☐ Test 4    — Slot conflict prevention
☐ Test 17a  — Success → account hint (logged out)
☐ Test 17b  — Success → small link (logged in)
☐ Test 17c  — Success card multilingual

AUTH FLOWS
☐ Test 5a   — Admin login basic
☐ Test 5b   — Login contextual subtitle
☐ Test 5c   — Login email pre-fill
☐ Test 5d   — Expired link error
☐ Test 5e   — Multilingual login
☐ Test 11   — Customer login + /account tabs
☐ Test 11a  — Membership tab
☐ Test 11b  — Profile tab
☐ Test 16a  — Navbar logged out
☐ Test 16b  — Navbar logged in customer
☐ Test 16c  — Navbar logged in admin
☐ Test 16d  — Navbar mobile menu
☐ Test 16e  — Navbar multilingual
☐ Test 18   — Profile edit basic
☐ Test 18a  — Profile → next booking pre-fill
☐ Test 18b  — Profile server validation

MEMBER FLOWS
☐ Test 12a   — Membership signup
☐ Test 12b   — Payment + activation
☐ Test 12c.1 — FULL: no extras (direct CHF 0)
☐ Test 12c.2 — FULL: + add-on (Stripe checkout)
☐ Test 12c.3 — FULL: + late-night
☐ Test 12c.4 — FULL: + everything
☐ Test 12d.1 — PARTIAL: pure overage
☐ Test 12d.2 — PARTIAL: + add-on
☐ Test 12d.3 — PARTIAL: + late-night
☐ Test 12d.4 — PARTIAL: + everything
☐ Test 12d.5 — PARTIAL: boundary case
☐ Test 12e   — Member ZERO balance fallback
☐ Test 12f   — Customer Portal

ADMIN FLOWS
☐ Test 6    — Manual booking
☐ Test 6a   — Time picker available slots only
☐ Test 7a   — Edit inline
☐ Test 7b   — Mark no-show
☐ Test 7c   — Mark completed (past)
☐ Test 7d   — Future booking guard
☐ Test 7e   — Refund from edit
☐ Test 8    — Settings save (door code)
☐ Test 8a   — Prices change
☐ Test 8b   — Late-night settings
☐ Test 8c   — B2B whitelist
☐ Test 9    — Block date full day
☐ Test 9a   — Partial block
☐ Test 9b   — Delete block
☐ Test 10   — iCal feed download
☐ Test 10a  — iCal subscription
☐ Test 15   — Refund full
☐ Test 15b  — Refund non-Stripe

MAINTENANCE
☐ Test 13   — All 5 cron triggers
☐ Test 14   — Email deliverability (real customer)
☐ Test 14a  — Cancellation email
☐ Test 14d  — Multilingual emails
☐ Test 14e  — Spam score (mail-tester)
```

---

# 📌 Quick tips για testing

1. **Browser strategy**:
   - Chrome incognito → guest flows
   - Firefox → admin flows
   - Safari → customer flows
   - Avoids session conflicts

2. **Email aliases** for testing multiple roles:
   - `babismetaxas000@gmail.com` — admin
   - `babismetaxas000+test1@gmail.com` — guest
   - `babismetaxas000+member1@gmail.com` — member
   - All arrive σε ίδιο inbox, but auth treats as separate users

3. **Real money mode**:
   - Stripe LIVE keys + test bookings
   - Use δικιά σου κάρτα, refund μετά
   - Or temporarily set prices to CHF 1 σε /admin/settings πριν τα tests

4. **DB queries**:
   - Always use service role key (`SUPABASE_SERVICE_ROLE_KEY`)
   - Snippets included σε κάθε test
   - Or use Supabase SQL editor για interactive queries

5. **Time travel**:
   - For cancellation tests, υπολογίστε ώρες σε future dates
   - Weekend test: pick any Sat/Sun
   - <48h test: tomorrow
   - >48h test: 5+ days ahead

---

# 🎬 Όταν τελειώσεις τα tests

Πες μου:
1. Ποια tests **πέρασαν** ✓
2. Σε ποιο test **κόλλησες** (αν κάποιο) ❌ — με screenshot/error
3. Είναι ready για **production deploy**?

Μετά → **Sprint E**: production deploy με κατάλληλα precautions.
