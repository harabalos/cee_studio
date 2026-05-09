# CEE Studio — Local Testing Guide

> Πλήρης οδηγός testing για το booking system + memberships πριν deploy.
> Όλα τα tests τρέχουν σε `localhost:3000` με Stripe **LIVE keys** σε **TEST mode bookings** (CHF 1 prices είχαμε αλλά τα επαναφέραμε σε CHF 70/120/etc.).
>
> Updated: 2026-05-09

---

# 📦 Τι Έχουμε Χτίσει — Όλη η Εικόνα

## 🏗️ Οι Πέντε Φάσεις

```
Phase 1   ✅  Visitor booking flow base
              • 6-step wizard, Stripe Checkout, webhook
              • Schema, admin v1, iCal feed, 26 tests

Sprint A  ✅  Visitor v1 production polish
              • Settings page, polished email templates
              • 24h reminder cron, auto-complete cron
              • Edit booking, mark no-show
              • Better error states

Sprint B  ✅  Customer Account UX
              • Unified /login (customers + admin)
              • /auth/callback (smart redirect)
              • /account dashboard (My bookings)
              • Auto-link bookings to users by email

Sprint D  ✅  Memberships (Phase 2)
              • 3 plans (Starter / Pro / Unlimited)
              • Stripe Subscriptions με lazy product creation
              • Member booking με hour deduction
              • Webhook handlers (5 subscription events)
              • Customer Portal integration
              • Hour rollover + low-balance crons
              • 4 new email templates

Sprint G  ✅  UX cleanup
              • Auth-aware public Navbar (Sign in / user dropdown)
              • Booking success → "Create your account" hint
              • /login multilingual + email pre-fill + contextual copy
              • /account tabs (Bookings / Membership / Profile)
              • /account/profile (edit name / phone / lang)
              • BookingConfirmationCustomer → Sign-in CTA
              • Resend DNS verified → bookings@ceestudio.ch

Sprint E  ⏳  Production deploy (επόμενο)
```

## 📁 Όλες Οι Σελίδες

### 🌐 Public

| URL | Τι Είναι | Status |
|---|---|---|
| `/` | Homepage | Pre-existing |
| `/equipment`, `/space`, `/studio`, `/contact`, `/faq` | Marketing pages | Pre-existing |
| `/booking` | **6-step booking wizard** | ✅ Phase 1 |
| `/booking/success` | Landing μετά Stripe payment | ✅ Phase 1 |
| `/booking/manage/[token]` | Self-service για guest bookings | ✅ Phase 1 |
| `/login` | Magic-link login (customers + admin) | ✅ Sprint B |
| `/logout` | Sign out | ✅ Sprint B |
| `/membership/signup` | Plan picker + signup form | ✅ Sprint D |
| `/membership/success` | Landing μετά subscription | ✅ Sprint D |

### 👤 Customer (logged in)

| URL | Τι Είναι |
|---|---|
| `/account` | **Bookings** tab — upcoming + past + light membership banner |
| `/account/membership` | **Membership** tab — full ABO card + Customer Portal |
| `/account/profile` | **Profile** tab — edit name, phone, company, preferred language |

### 🔐 Admin (logged in με admin email)

| URL | Τι Είναι |
|---|---|
| `/admin` | Dashboard με stats, today's timeline |
| `/admin/bookings` | All bookings + refund actions |
| `/admin/bookings/[id]/edit` | Edit booking + mark no-show |
| `/admin/manual` | Manual booking entry (phone/walk-in) |
| `/admin/blocked` | Block dates |
| `/admin/settings` | Door code, WiFi, prices, B2B emails |

## ⚙️ API Endpoints

### Public
- `GET /api/availability?date=&duration=` — slot calculator
- `POST /api/booking/hold` — δημιουργεί 30min hold + Stripe Checkout
- `GET /api/booking/[token]` — fetch by manage token
- `POST /api/booking/cancel/[token]` — customer cancellation
- `GET /api/booking/by-session?session_id=` — polled by /success

### Auth
- `GET /auth/callback` — Supabase magic-link → session cookie + smart redirect

### Member (auth required)
- `GET /api/me` — user + membership info + isAdmin flag
- `POST /api/me/booking` — member booking με hour deduction
- `PATCH /api/me/profile` — update name / phone / company / preferred_lang

### Membership
- `POST /api/membership/checkout` — Stripe Subscription Checkout
- `POST /api/membership/portal` — Stripe Customer Portal URL
- `GET /api/membership/by-session?session_id=` — polled by /membership/success

### Admin (admin auth required)
- `GET/PATCH /api/admin/settings`
- `GET/PATCH /api/admin/bookings/[id]`
- `POST /api/admin/bookings/[id]/refund`
- `POST /api/admin/bookings/manual`
- `GET/POST /api/admin/blocked-dates`
- `DELETE /api/admin/blocked-dates/[id]`

### Webhooks
- `POST /api/webhooks/stripe` — handles 8 event types

### Crons (auth via CRON_SECRET)
- `GET /api/cron/expire-holds` (daily 03:00)
- `GET /api/cron/reminders-24h` (daily 09:00)
- `GET /api/cron/auto-complete` (daily 04:00)
- `GET /api/cron/expire-rolled-over` (daily 02:00)
- `GET /api/cron/low-balance` (daily 10:00)

### Calendar
- `GET /api/calendar/owner.ics?token=` — live ICS feed για owner

## 🗄️ Database Tables

| Table | Rows | Purpose |
|---|---|---|
| `users` | Customers + admins | Profile data, magic-link auth target |
| `memberships` | ABO subscriptions | Hour balance, plan, status |
| `bookings` | Every booking | Source of truth |
| `booking_addons` | Per-booking | lighting / backdrops / podcast |
| `pending_holds` | 30min temp | Anti-race during Stripe Checkout |
| `blocked_dates` | Admin-defined | Studio downtime |
| `settings` | Singleton (id=1) | Door code, prices, B2B whitelist, Stripe Price IDs |
| `email_log` | Every email sent | Debugging deliverability |

## 📧 Email Templates (multilingual DE/EN/FR/IT)

| Template | When | To |
|---|---|---|
| `BookingConfirmationCustomer` | Payment confirmed | Customer |
| `BookingConfirmationOwner` | Payment confirmed | Owner |
| `BookingCancellationCustomer` | Cancelled | Customer |
| `BookingCancellationOwner` | Cancelled | Owner |
| `BookingReminder24h` | 24h before booking | Customer |
| `MembershipWelcome` | Subscription created | Member (με magic link) |
| `MembershipRenewal` | Monthly renewal | Member |
| `MembershipPaymentFailed` | Renewal failed | Member |
| `MembershipLowBalance` | Balance < 2h | Member |

---

# 🧪 PRE-TEST CHECKLIST

## Πριν τρέξεις τα tests, βεβαιώσου:

### ☐ 1. Dev server τρέχει
```bash
npm run dev
```
→ http://localhost:3000 πρέπει να φορτώνει.

### ☐ 2. Stripe-cli forwards webhooks (νέο terminal)
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
→ Πρέπει να τυπώνει `Listening for events...`. **ΧΩΡΙΣ αυτό, οι πληρωμές ΔΕΝ ολοκληρώνονται σωστά.**

### ☐ 3. Supabase Auth Redirect URLs configured
Πρέπει να έχεις στο Supabase Dashboard → Authentication → URL Configuration:
```
http://localhost:3000/auth/callback
http://localhost:3000/admin
http://localhost:3000/account
```
👉 https://supabase.com/dashboard/project/vhsfdfaziafkibzpevsq/auth/url-configuration

### ☐ 4. Migration run στο Supabase
Το `db/migration_002_memberships.sql` πρέπει να έχει τρέξει (μία φορά). Έλεγχος:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'settings';
-- Πρέπει να υπάρχει η στήλη: stripe_membership_prices
```

### ☐ 5. Stripe Customer Portal activated
👉 https://dashboard.stripe.com/settings/billing/portal → click **Activate**.

### ☐ 6. Door code + WiFi στα settings
http://localhost:3000/admin/settings → βάλε δοκιμαστικά π.χ. `4892` και `cee-studio-test`.

---

# 🎯 TEST SCENARIOS

> Όλα τα tests χρησιμοποιούν **πραγματικές κάρτες**. Για test mode card numbers δεν δουλεύει με live Stripe keys. Θα χρεωθείς πραγματικά (CHF 70+) και θα κάνουμε refund μετά.
>
> Εναλλακτικά: αλλάξτε προσωρινά τιμές σε CHF 1 από `/admin/settings` πριν τα tests.

---

## TEST 1 — Guest booking (no login) ✅
**Στόχος**: Verify το βασικό flow δουλεύει για visitor.

1. Άνοιξε http://localhost:3000/booking (incognito για να μη φαίνεσαι logged-in)
2. **Step 1 — Duration**: διάλεξε `1h CHF 70`
3. **Step 2 — Date**: διάλεξε **weekday** σε 5+ μέρες (για να μπορούμε να testάρουμε cancel αργότερα)
4. **Step 3 — Time**: διάλεξε π.χ. 14:00. **Verify**: αν διαλέξεις >19:00, εμφανίζεται late-night badge
5. **Step 4 — Add-ons**: προσθέστε **All Backdrops Access (+CHF 30)**. Verify: total γίνεται CHF 100
6. **Step 5 — Details**: γέμισε email = `babismetaxas000@gmail.com`, name, phone, accept terms
7. **Step 6 — Summary**: verify breakdown σωστό. Click **Pay & Book**
8. → Stripe Checkout. **Πέρασε δικιά σου κάρτα** → CHF 100 charge

### Expected:
- ✅ Redirect στο `/booking/success?session_id=...`
- ✅ "Booking confirmed" + "Add to Calendar" + "Get Directions"
- ✅ Email στο Gmail σου με branded confirmation, .ics attachment, door code
- ✅ Stripe-cli terminal: log `checkout.session.completed`
- ✅ Owner email στο `babismetaxas000@gmail.com` (γιατί είσαι ADMIN_ALLOWED)
- ✅ /admin → δες το booking στο "Today" / "Upcoming"

### Verify in DB:
```bash
node --env-file=.env.local -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('bookings').select('start_time, total_chf, payment_status, status').order('created_at', { ascending: false }).limit(1).then(r => console.log(r.data));
"
```

---

## TEST 2 — Cancellation rules ⚠️
**Στόχος**: Verify ότι οι 3 cancellation rules εφαρμόζονται.

### 2a — Weekday >48h ✅ (refund allowed)
1. Πάρε το manage URL από το test 1 (από email ή `/admin/bookings/[id]/edit`)
2. Άνοιξε `/booking/manage/[token]` 
3. Verify: εμφανίζεται "Cancellable · Refund CHF X"
4. Click "Cancel booking"
5. Confirm

### Expected:
- ✅ Stripe refund created (μείον CHF 1.50 fee)
- ✅ DB: status='cancelled', payment_status='refunded'
- ✅ Cancellation email στον customer
- ✅ Slot ξανά διαθέσιμο στο /booking calendar

### 2b — Weekday <48h ❌ (blocked)
1. Φτιάξε booking για **αύριο** (less than 48h away)
2. Πήγαινε στο manage page
3. Verify: button disabled με μήνυμα "Cancellation not possible less than 48h before"

### 2c — Weekend ❌ (blocked)
1. Φτιάξε booking για **Σάββατο ή Κυριακή**
2. Verify: button disabled με μήνυμα "Weekend bookings cannot be cancelled"

---

## TEST 3 — Late-night surcharge 💰
**Στόχος**: Verify ότι ώρες >20:00 χρεώνονται +CHF 10/h.

1. http://localhost:3000/booking
2. Duration: 4h
3. Time: 19:00 (booking 19:00–23:00, late-night = 3 hours)
4. Step 6: total πρέπει να είναι:
   - Base 4h: CHF 250
   - Late-night 3h × 10: +CHF 30
   - **Total: CHF 280**

---

## TEST 4 — Slot conflict prevention 🔒
**Στόχος**: Verify ότι το hold σύστημα προστατεύει από double-booking.

1. Άνοιξε 2 παράλληλα browser windows
2. Σε **Window A**: ξεκίνα booking για ίδια ώρα/μέρα. Φτάσε Step 6 αλλά **ΜΗΝ πατάς Pay**
3. Σε **Window B**: δοκίμασε να κάνεις booking στην ίδια ώρα
4. Verify: στο Step 3 (time picker) η ώρα **ΔΕΝ είναι διαθέσιμη** (επειδή Window A την κρατάει)
5. Σε Window A: άκυρο/κλείσε → 30min αργότερα η ώρα ξανάγινει διαθέσιμη (ή direct: refresh)

---

## TEST 5 — Admin login + dashboard 🔐
**Στόχος**: Verify admin auth + stats display.

1. http://localhost:3000/login
2. Email: `babismetaxas000@gmail.com`
3. Click "Send magic link"
4. Check Gmail → click link
5. → πάει στο /admin (επειδή είσαι admin email)

### Expected:
- ✅ Header: "CEE Studio · Admin · babismetaxas000@gmail.com"
- ✅ Dashboard με 4 stat cards (Today / Week / Month / Next 7 days)
- ✅ Today's timeline horizontal bar 08:00–22:00
- ✅ Today's bookings list με ώρες + customer info
- ✅ Recent activity table

---

## TEST 6 — Admin manual booking 📞
**Στόχος**: Verify owner μπορεί να κάνει booking για phone/walk-in clients.

1. http://localhost:3000/admin/manual
2. Duration 2h, date άλλη εβδομάδα, time 10:00
3. Customer: name + phone (email optional)
4. Payment method: **"Prepaid (already received)"**
5. Send email = ☐ (off για να μη στείλει)
6. Notes: "Test phone booking"
7. Click "Create booking"

### Expected:
- ✅ Redirect στο /admin/bookings
- ✅ Νέο booking εμφανίζεται με payment method = "admin_prepaid"
- ✅ Status = confirmed, payment_status = paid
- ✅ Δεν έγινε καμία Stripe charge

---

## TEST 7 — Admin edit + mark no-show ✏️
**Στόχος**: Verify admin μπορεί να editάρει + μαρκάρει.

1. /admin/bookings → click "Edit →" σε ένα booking
2. Άλλαξε customer name (π.χ. typo fix)
3. Click έξω → "Saved"
4. Verify η αλλαγή έμεινε
5. Click **"Mark no-show"** → confirm
6. Verify: status badge γίνεται κόκκινο "no_show"

---

## TEST 8 — Settings save 🔧
**Στόχος**: Verify owner μπορεί να αλλάξει door code, WiFi, prices.

1. /admin/settings
2. Door code: άλλαξε από `4892` σε `1234` → click έξω
3. Verify: "Saved at HH:MM" εμφανίζεται
4. Refresh page → η αλλαγή υπάρχει
5. Πρόσθεσε B2B email: `clientco@example.com` → save
6. Verify: επόμενο booking με αυτό το email θα έχει "Pay by invoice" option (Phase 4 — TBD)

---

## TEST 9 — Block date 🚫
**Στόχος**: Verify owner μπορεί να μπλοκάρει ολόκληρες ημέρες.

1. /admin/blocked
2. Block ένα range, π.χ. **next Friday all day** (00:00–23:59)
3. Verify: εμφανίζεται στη λίστα
4. Πήγαινε /booking → διάλεξε αυτή τη Friday → no slots available
5. Διαγραφή: click "Delete" στο /admin/blocked
6. Verify: ο slot ξανάγινε διαθέσιμος

---

## TEST 10 — iCal feed για owner 📅
**Στόχος**: Verify ότι το ημερολόγιο της αδερφής σου θα ενημερώνεται.

1. Πάρε το token: `grep OWNER_ICS_TOKEN .env.local`
2. Άνοιξε http://localhost:3000/api/calendar/owner.ics?token=ΕΚΕΙΝΟ_ΤΟ_TOKEN
3. Browser θα κατεβάσει `.ics` αρχείο
4. Άνοιξέ το με Apple Calendar / Google Calendar
5. Verify: όλα τα confirmed bookings είναι μέσα

### Permanent setup (subscription):
- Apple Calendar → File → New Calendar Subscription → paste URL
- Refresh hourly automatically

---

## TEST 11 — Customer login + /account tabs 👤
**Στόχος**: Verify ότι μη-admin email πάει στο /account και τα 3 tabs δουλεύουν.

1. **Logout** πρώτα: http://localhost:3000/logout
2. Φτιάξε booking με DIFFERENT email (π.χ. ή με δεύτερο Gmail σου)
3. Logout, και πήγαινε /login
4. Πέρασε αυτό το διαφορετικό email
5. Magic link → click

### Expected:
- ✅ Redirect στο /account (όχι /admin)
- ✅ Header: "CEE Studio · Account · διαφορετικό_email"
- ✅ **Tab strip** εμφανίζει: **Bookings** (active) · Membership · Profile
- ✅ **Bookings tab** (default): "Upcoming bookings" με το booking σου, "View / cancel →" link
- ✅ Click **Membership** tab → εμφανίζεται "No active membership" + "See plans →" CTA (αν δεν είσαι member)
- ✅ Click **Profile** tab → form με name / phone / company / preferred language
- ✅ Email field στο Profile εμφανίζεται read-only με note "can't be changed here"

---

## TEST 12 — Membership signup (το μεγάλο test) 🎯
**Στόχος**: Verify πλήρες member flow — signup, billing, hour balance.

⚠️ **Real money**: αυτό θα χρεώσει CHF 220 (Starter) πραγματικά τον μήνα. Χρησιμοποίησε δικιά σου κάρτα και cancel αμέσως μετά.

### 12a — Signup
1. Logout
2. http://localhost:3000/studio
3. Scroll στα ABO Memberships → click **"Become a member →"** στο **Starter** (φθηνότερο)
4. → /membership/signup?plan=starter
5. Verify: Starter pre-selected, summary δεξιά CHF 220/μήνα
6. Γέμισε στοιχεία (διαφορετικό email πάλι), accept terms
7. **Subscribe now** → Stripe Checkout

### 12b — Payment
1. Stripe Checkout: subscription mode (CHF 220 monthly)
2. Πέρασε κάρτα → confirm
3. → /membership/success
4. Πες "Setting up your account…" → ~5–10s → "All set ✓"

### Expected:
- ✅ Email στο τη customer's email "Welcome to Starter Creator" με magic link
- ✅ Stripe-cli logs: `customer.subscription.created`, `invoice.paid`
- ✅ Owner notification email
- ✅ DB:
  - users row με `role = 'member'`
  - memberships row με plan='starter', hours_balance=4, status='active'

### 12c — First member booking με hours
1. Click magic link από email → /account
2. Verify: Membership card εμφανίζεται:
   - Plan: Starter Creator
   - Hours balance: **4h**
   - Allocation/month: 4h
   - Renews: επόμενος μήνας
3. Click **"+ Book using my hours"** → /booking
4. Banner: "Member · starter · 4h available / 4h monthly"
5. Step 1: Duration 2h
6. Banner ενημερώνεται: "✓ Will be paid with hours"
7. Σύμβαση: γέμισε τα Steps 2-5
8. Step 6: payment options τώρα **3 buttons**:
   - ⏱ Use hours (2h) ← preselected
   - 💳 Card or TWINT
   - 🏢 Invoice (disabled)
9. Click **Pay & Book**

### Expected:
- ✅ ΧΩΡΙΣ Stripe Checkout (no charge)
- ✅ Redirect στο /booking/manage/[token]?member_booked=1
- ✅ Email confirmation (looks normal, no $ amount)
- ✅ /account → membership card → balance έπεσε σε **2h**
- ✅ Booking στο /admin με payment_method = "membership_hours"

### 12d — Insufficient hours
1. /account → balance 2h
2. /booking → 4h booking
3. Step 6: "Use hours" button disabled με tooltip "Need 4h, have 2h"

### 12e — Manage subscription (Stripe Portal)
1. /account → click "Manage subscription"
2. → Stripe Customer Portal
3. Δες invoices, update payment method
4. Click "Cancel plan" → δες ότι θα cancel-ed at period end
5. Verify: στο /account, status badge γίνεται "active" αλλά cancelled_at filled (still has hours until period end)

⚠️ **MUST DO**: μετά το test, cancel το subscription στο Stripe ώστε να μη χρεωθείς ξανά μήνα μετά.

---

## TEST 13 — Cron jobs (manual triggers)

```bash
SECRET=$(grep CRON_SECRET .env.local | cut -d= -f2)

# 24h reminder
curl -H "Authorization: Bearer $SECRET" http://localhost:3000/api/cron/reminders-24h

# Auto-complete past bookings
curl -H "Authorization: Bearer $SECRET" http://localhost:3000/api/cron/auto-complete

# Expire rolled-over hours
curl -H "Authorization: Bearer $SECRET" http://localhost:3000/api/cron/expire-rolled-over

# Low balance alert
curl -H "Authorization: Bearer $SECRET" http://localhost:3000/api/cron/low-balance
```

Each should return JSON like `{ "ok": true, "sent": N }`.

---

## TEST 14 — Email deliverability 📧 (DNS verified ✓)

> ✅ Resend domain `ceestudio.ch` is now **verified** (SPF/DKIM/DMARC live).
> `RESEND_FROM=CEE Studio <bookings@ceestudio.ch>` is set in `.env.local`.

### Production-ready check:
1. **Make a test booking** with a real customer email (e.g. a friend's Gmail or a `+tag` alias).
2. Verify:
   - ✅ Email lands in **inbox**, not spam
   - ✅ Sender shows as `CEE Studio <bookings@ceestudio.ch>`
   - ✅ Reply-to works (replying goes to a monitored inbox)
   - ✅ HTML renders correctly with brand colors (cream / burgundy / accent)
   - ✅ `.ics` calendar attachment opens cleanly in Apple Calendar / Google Calendar
   - ✅ "Manage booking" + "Get directions" + new "Sign in →" CTAs all link correctly
   - ✅ Door code + WiFi password show (or "we'll send 24h before" if blank)

### If emails go to spam:
- Check Resend dashboard → Logs for delivery status
- Verify SPF/DKIM/DMARC records still pass on https://www.mail-tester.com/
- Send a few welcome emails first to warm up the domain reputation

### Cancellation email check:
1. Cancel a booking from `/booking/manage/[token]`
2. Verify cancellation email arrives in inbox
3. Refund amount displayed correctly (or "—" for membership-hour bookings)

---

## TEST 15 — Refund flow 💸

1. /admin/bookings
2. Click "Refund" σε ένα paid booking
3. Confirm "Refund CHF X?"
4. Verify:
   - Stripe Dashboard → refund created
   - Email cancellation στον customer
   - Booking status = cancelled, payment_status = refunded
   - Slot ξανα διαθέσιμο

---

## TEST 16 — Public Navbar (auth-aware) 🧭
**Στόχος**: Verify ότι το navbar reflects auth state σε desktop + mobile.

### 16a — Logged out (anonymous visitor)
1. Logout / open incognito
2. Πήγαινε στο `/` (homepage)
3. Verify desktop nav δεξιά:
   - ✅ Nav links → IG icon → Lang switcher → **"Sign in"** link → "Book Now" CTA
4. Click **Sign in** → πάει στο `/login` (όχι /admin)
5. Resize σε mobile (< 768px) → click hamburger
6. Verify mobile menu:
   - ✅ Στη μέση κάτω: **"Sign in"** link με σερίφικο font (3xl)
   - Click → πάει στο `/login`

### 16b — Logged in as customer
1. Sign in με customer email
2. Verify desktop navbar:
   - ✅ Avatar circle (initial του ονόματος ή email) + name (lg+ screens)
   - ✅ Click → dropdown με **"My account"** + **"Sign out"**
   - ❌ **No "Admin" link** (όχι admin)
3. Click "My account" → /account

### 16c — Logged in as admin
1. Sign in με admin email (`babismetaxas000@gmail.com`)
2. Verify desktop dropdown έχει **και** "My account" **και** **"Admin →"** link
3. Mobile: open hamburger → εμφανίζεται avatar + email + "My account" + "Admin →" + "Sign out"

### 16d — Multilingual labels
1. Logged in, allaξε language στο top right (DE → FR)
2. Verify dropdown labels: "Mein Konto" / "Mon compte" / "Il mio account" κτλ

---

## TEST 17 — Booking success "Create your account" hint 🎫
**Στόχος**: Verify ότι μετά από guest booking, εμφανίζεται hint για account creation.

### 17a — Guest (logged out)
1. Logout
2. Κάνε ένα booking με DIFFERENT email (π.χ. `babismetaxas000+test1@gmail.com`)
3. Stripe Checkout → επιστροφή στο `/booking/success?session_id=...`
4. Verify:
   - ✅ Booking summary card με Date / Duration / Total
   - ✅ "Manage booking" + "Get Directions" buttons
   - ✅ **"Create your account — no password needed"** card εμφανίζεται **κάτω**
   - ✅ Body: "See your bookings, manage your membership and book faster next time."
   - ✅ Button: **"Sign in with magic link"**
5. Click button → πάει στο `/login?email=babismetaxas000%2Btest1%40gmail.com&next=/account`
6. Verify: email **pre-filled** στο login form
7. Send magic link → click → /account → δες το νέο booking στο "Upcoming"

### 17b — Already logged in
1. Stay logged in
2. Make another booking with same email
3. Verify success page:
   - ❌ "Create your account" card **NOT shown** (σε πάει στο)
   - ✅ Αντί gia auto εμφανίζεται μικρό **"Open my account →"** link

### 17c — Multilingual
1. Allaξe language σε FR, repeat 17a
2. Verify card title: "Crée ton compte — sans mot de passe" + button "Connexion par lien magique"

---

## TEST 18 — Profile editing (name / phone / lang) 👨‍💼
**Στόχος**: Verify ότι /account/profile saves changes correctly.

1. Logged in as customer / member
2. /account → click **Profile** tab
3. Verify φόρμα load-εται με existing data (ή empty αν first time)
4. Edit:
   - Name: `Anna Müller`
   - Phone: `+41 79 123 45 67`
   - Company: `My Studio AG`
   - Preferred language: `Deutsch`
5. Click **Save changes**
6. Verify: εμφανίζεται **✓ Saved** badge δεξιά
7. Refresh page → η αλλαγή έμεινε στο form
8. Verify in DB:
   ```bash
   node --env-file=.env.local -e "
   const { createClient } = require('@supabase/supabase-js');
   const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
   sb.from('users').select('email, name, phone, company, preferred_lang').eq('email', 'YOUR_EMAIL').then(r => console.log(r.data));
   "
   ```

### 18a — Side effect: next booking pre-fills
1. After saving profile, click "+ New booking" στο header
2. Step 5 (Details): verify name / phone / company **pre-filled**
3. Confirmation language defaults στο preferred_lang που έσωσες

### 18b — Server validation
1. Try saving with `preferred_lang = "xx"` (Browser DevTools → Network → modify body)
2. Verify: 400 response με `{"error":"invalid_lang"}`

---

# 🐛 Common Issues / Troubleshooting

## "Something went wrong" στο /booking step 6
- Stripe-cli δεν τρέχει → start it
- ή webhook secret mismatch → restart dev server μετά τη βάλεις `STRIPE_WEBHOOK_SECRET`

## /admin/login redirect loop
- Πάει σε /login (όχι /admin/login). Bookmark fix.

## Booking πληρώθηκε αλλά δεν εμφανίζεται στο /admin
- Webhook δεν έφτασε στον server → check stripe-cli terminal
- Αν χάθηκε: `node --env-file=.env.local <<< 'recover script'` (βλ. προηγούμενα logs)

## Magic link redirects back to /login
- Supabase Auth redirect URLs δεν περιλαμβάνουν `/auth/callback`
- Add στο dashboard: https://supabase.com/dashboard/project/vhsfdfaziafkibzpevsq/auth/url-configuration

## Member subscription δεν εμφανίζεται μετά payment
- Migration_002 δεν έχει τρέξει → run `db/migration_002_memberships.sql` στο SQL editor
- Webhook handler crashed → check dev terminal logs

## Resend "Domain not verified"
- Χρησιμοποιείς custom domain στο `RESEND_FROM` αλλά domain δεν verified
- Switch σε `onboarding@resend.dev` για localhost testing

---

# ✅ Test Completion Checklist

```
GUEST FLOWS
☐ Test 1   — Guest booking 1h
☐ Test 2a  — Cancel weekday >48h (refund)
☐ Test 2b  — Cancel weekday <48h (blocked)
☐ Test 2c  — Cancel weekend (blocked)
☐ Test 3   — Late-night surcharge calculation
☐ Test 4   — Slot conflict prevention
☐ Test 17  — Booking success → "Create account" hint

ADMIN FLOWS
☐ Test 5   — Admin login + dashboard
☐ Test 6   — Manual booking
☐ Test 7   — Edit booking + mark no-show
☐ Test 8   — Settings save
☐ Test 9   — Block date
☐ Test 10  — iCal feed
☐ Test 15  — Refund

CUSTOMER FLOWS
☐ Test 11  — Customer login + /account tabs
☐ Test 16  — Auth-aware Navbar (desktop + mobile)
☐ Test 18  — Profile edit (name / phone / lang)

MEMBER FLOWS
☐ Test 12a — Membership signup
☐ Test 12b — Payment + activation
☐ Test 12c — First member booking με hours
☐ Test 12d — Insufficient hours UX
☐ Test 12e — Customer Portal
☐ Test 14  — Email deliverability (DNS verified ✓)
☐ Test 13  — Cron jobs
```

---

# 📌 Tips για το testing

1. **Browser**: χρησιμοποίησε Chrome incognito για guest flows. Διαφορετικό browser για customer flow. Έτσι αποφεύγεις session conflict.
2. **Different emails**: για να testάρεις διαφορετικά roles, χρησιμοποίησε email aliases:
   - `babismetaxas000@gmail.com` — admin
   - `babismetaxas000+customer1@gmail.com` — customer 1
   - `babismetaxas000+member1@gmail.com` — member 1
   Όλα έρχονται στο ίδιο inbox αλλά είναι διαφορετικά για το system.
3. **Stripe test cards** δεν δουλεύουν με LIVE keys. Χρησιμοποίησε δικιά σου κάρτα για τώρα και cancel/refund αμέσως μετά.
4. **DB queries** για επιβεβαίωση: χρησιμοποίησε snippets από κάθε test ή Supabase SQL editor.

---

# Όταν τελειώσεις τα tests

Πες μου:
1. Ποια tests πέρασαν ✓
2. Σε ποιο test κόλλησες (αν κάποιο) ❌
3. Είναι ready για production deploy?

Μετά → **Sprint E**: production deploy με τα κατάλληλα precautions.
