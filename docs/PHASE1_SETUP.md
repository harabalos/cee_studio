# Phase 1 — Setup checklist

> What YOU (the human) need to do before testing on localhost.
> All code is already written. This walks you through wiring the 3 external services.

## 1. Supabase (DB + Auth)  ⏱️ ~5 min

1. Go to **https://supabase.com** → New Project
   - Region: **Frankfurt** (lowest latency to Switzerland)
   - DB password: save it somewhere safe
2. Once created, go to **Project Settings → API**
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
3. Go to **SQL Editor → New query**
   - Open `db/schema.sql` from this repo
   - Paste entire content → Run
   - You should see "Success. No rows returned." ✓
4. Go to **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: add `http://localhost:3000/admin` and (later) `https://ceestudio.ch/admin`

## 2. Stripe (Payments)  ⏱️ ~10 min

> ⚠️ Real Stripe TWINT requires a Switzerland-registered business.
> For NOW (localhost testing): test mode works for cards but not TWINT.
> When you have your Swiss account ready, replace test keys with live keys.

1. Go to **https://dashboard.stripe.com** → sign up
   - Country: **Switzerland**
   - Default currency: **CHF**
2. **Settings → Payment methods**
   - Enable **TWINT** (will auto-enable once Switzerland account is verified)
   - Enable **Card** (always on by default)
3. **Developers → API keys** (test mode toggle on)
   - Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Reveal & copy `Secret key` → `STRIPE_SECRET_KEY`
4. **Developers → Webhooks → Add endpoint** (do this AFTER `npm run dev` is running)
   - For local testing: install Stripe CLI then run:
     ```bash
     brew install stripe/stripe-cli/stripe
     stripe login
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```
   - The CLI will print a `whsec_...` value → put it in `STRIPE_WEBHOOK_SECRET`
   - Keep the `stripe listen` terminal running while you test

## 3. Resend (Emails)  ⏱️ ~5 min

1. Go to **https://resend.com** → sign up
2. **Domains → Add Domain** → enter `ceestudio.ch`
3. Resend gives you 3 DNS records (SPF, DKIM, DMARC) — add these to your domain DNS provider
   - Domain verification can take a few minutes
4. **API Keys → Create API Key**
   - Name: "CEE Studio production"
   - Copy → `RESEND_API_KEY`
5. Set `RESEND_FROM` → `"CEE Studio <bookings@ceestudio.ch>"`

> **Localhost shortcut:** Resend allows sending from `onboarding@resend.dev` to your verified-account email without domain setup. Useful for first tests.
> Set `RESEND_FROM="CEE Studio <onboarding@resend.dev>"` until your domain is verified.

## 4. Local env file  ⏱️ ~2 min

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and paste in all the values you collected above.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
RESEND_FROM="CEE Studio <onboarding@resend.dev>"

ADMIN_ALLOWED_EMAILS=youremail@example.com

CRON_SECRET=any-random-string-here
```

## 5. Run it locally  ⏱️ 1 min

Terminal 1:
```bash
npm run dev
```
→ http://localhost:3000

Terminal 2 (Stripe webhook forwarding):
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 6. Test flow

### Test booking
1. Visit http://localhost:3000/booking
2. Step through: Duration → Date → Time → Add-ons → Details → Summary
3. Click "Pay & Book" → redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
5. Should land on `/booking/success`
6. Check the "stripe listen" terminal — should see `checkout.session.completed`
7. Check your email for confirmation
8. Check `/admin` (after logging in) for the booking

### Test cancellation
1. Click "Manage booking" link from success page
2. Try to cancel:
   - Weekend booking → button disabled
   - Weekday <48h → button disabled
   - Weekday ≥48h → button enabled, click → refund processed

### Test admin
1. Visit http://localhost:3000/admin/login
2. Enter your email (must match `ADMIN_ALLOWED_EMAILS`)
3. Click magic link in your inbox
4. Should land on `/admin` with the bookings list
5. Try `/admin/blocked` — block a date and verify it disappears from `/booking` calendar

## 7. Common issues

- **"slot_unavailable" on hold creation**: someone else (or you) just booked it; the page should auto-refresh slot list
- **No confirmation email**: check Resend dashboard → Logs; usually domain not verified
- **Webhook not received**: ensure `stripe listen` is running and `STRIPE_WEBHOOK_SECRET` matches
- **Admin login redirects to /admin/login forever**: your email isn't in `ADMIN_ALLOWED_EMAILS`
- **DB constraint violations**: `btree_gist` extension not enabled — re-run `db/schema.sql`

## 8. When it's all working → tell me

Then we deploy to production:
- Add all `.env.local` values to Vercel project env
- Switch Stripe keys from test → live
- Verify `ceestudio.ch` domain in Resend
- Configure Stripe webhook endpoint to point at `https://ceestudio.ch/api/webhooks/stripe`
- I'll handle the deploy command
