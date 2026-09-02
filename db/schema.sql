-- =====================================================================
-- CEE Studio — Booking System Schema (Phase 1)
-- =====================================================================
-- Run this in the Supabase SQL Editor on first setup.
-- Idempotent: safe to re-run (uses if not exists / drop+create on policies).
-- =====================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "btree_gist";  -- for tstzrange exclude constraint

-- =====================================================================
-- USERS
-- (Supabase Auth manages auth.users; this table is our application-level
--  profile for both visitors and members.)
-- =====================================================================
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid unique references auth.users(id) on delete set null, -- null for guests
  email text unique not null,
  name text,
  phone text,
  company text,
  role text check (role in ('visitor', 'member', 'admin')) default 'visitor',
  stripe_customer_id text unique,
  preferred_lang text check (preferred_lang in ('de', 'en', 'fr', 'it')) default 'de',
  b2b_invoice_approved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_auth on public.users(auth_id);

-- =====================================================================
-- MEMBERSHIPS (Phase 2 — schema present but unused in Phase 1)
-- =====================================================================
create table if not exists public.memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text check (plan in ('starter', 'pro', 'unlimited')) not null,
  status text check (status in ('active', 'past_due', 'paused', 'cancelled')) default 'active',
  stripe_subscription_id text unique not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  hours_per_month numeric(4,1) not null,
  hours_balance numeric(4,1) default 0,
  hours_rolled_over numeric(4,1) default 0,
  rolled_over_expires_at timestamptz,
  minimum_until timestamptz,
  created_at timestamptz default now(),
  cancelled_at timestamptz
);

create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_memberships_status on public.memberships(status);

-- =====================================================================
-- BOOKINGS
-- =====================================================================
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete set null,

  -- Guest fields (for non-member visitors; redundant with users for non-guests)
  guest_email text,
  guest_name text,
  guest_phone text,
  guest_company text,
  shoot_type text,

  -- Standard-package gear check (migration 004). NULL = not asked
  -- (Premium booking, or a booking predating the field).
  camera_model text,
  has_godox_trigger boolean,

  -- Timing (UTC in DB; rendered in Europe/Zurich)
  start_time timestamptz not null,
  end_time timestamptz not null,
  duration_hours numeric(3,1) not null,

  -- Pricing (in CHF cents to avoid float issues — display divides by 100)
  base_price_chf integer not null,
  addons_price_chf integer default 0,
  late_night_surcharge_chf integer default 0,
  total_chf integer not null,

  -- Payment
  payment_method text check (payment_method in (
    'card', 'twint', 'invoice', 'membership_hours', 'admin_cash', 'admin_prepaid'
  )) not null,
  payment_status text check (payment_status in (
    'pending', 'paid', 'refunded', 'partially_refunded', 'invoice_pending', 'failed'
  )) default 'pending',
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  refund_chf integer default 0,

  -- Member booking
  hours_deducted numeric(3,1) default 0,

  -- Lifecycle
  status text check (status in ('confirmed', 'cancelled', 'no_show', 'completed')) default 'confirmed',
  cancelled_at timestamptz,
  cancelled_by text check (cancelled_by in ('customer', 'admin', 'system')),
  cancel_reason text,
  manage_token text unique not null default replace(uuid_generate_v4()::text, '-', ''),
  reminder_24h_sent boolean default false,
  preferred_lang text check (preferred_lang in ('de', 'en', 'fr', 'it')) default 'de',

  -- Meta
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  check (end_time > start_time),
  check (total_chf >= 0)
);

create index if not exists idx_bookings_start on public.bookings(start_time);
create index if not exists idx_bookings_user on public.bookings(user_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_token on public.bookings(manage_token);
create index if not exists idx_bookings_session on public.bookings(stripe_session_id);

-- Anti double-booking: confirmed bookings cannot overlap
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_no_overlap'
  ) then
    alter table public.bookings
      add constraint bookings_no_overlap
      exclude using gist (
        tstzrange(start_time, end_time, '[)') with &&
      ) where (status = 'confirmed');
  end if;
end$$;

-- =====================================================================
-- BOOKING ADD-ONS
-- =====================================================================
create table if not exists public.booking_addons (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  addon_key text check (addon_key in ('lighting', 'backdrops', 'podcast', 'late_night')) not null,
  price_chf integer not null,
  quantity numeric(3,1) default 1,
  created_at timestamptz default now()
);

create index if not exists idx_addons_booking on public.booking_addons(booking_id);

-- =====================================================================
-- PENDING HOLDS (anti-race during Stripe Checkout)
-- =====================================================================
create table if not exists public.pending_holds (
  id uuid primary key default uuid_generate_v4(),
  start_time timestamptz not null,
  end_time timestamptz not null,
  stripe_session_id text unique,
  expires_at timestamptz not null,
  payload jsonb,                              -- snapshot of booking data so we can finalize on webhook
  created_at timestamptz default now(),
  check (end_time > start_time)
);

create index if not exists idx_holds_expires on public.pending_holds(expires_at);
create index if not exists idx_holds_session on public.pending_holds(stripe_session_id);

-- =====================================================================
-- BLOCKED DATES (admin-controlled studio downtime)
-- =====================================================================
create table if not exists public.blocked_dates (
  id uuid primary key default uuid_generate_v4(),
  start_time timestamptz not null,
  end_time timestamptz not null,
  reason text,
  created_at timestamptz default now(),
  check (end_time > start_time)
);

create index if not exists idx_blocked_start on public.blocked_dates(start_time);

-- =====================================================================
-- SETTINGS (single-row config)
-- =====================================================================
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  operating_hours jsonb default '{"start":"08:00","end":"22:00"}'::jsonb,
  buffer_minutes integer default 30,
  late_night_starts_at text default '20:00',
  late_night_surcharge_chf_per_hour integer default 1000,  -- 10 CHF in cents
  prices jsonb default '{"1":7000,"2":12000,"3":16500,"4":25000,"8":49000}'::jsonb,
  addon_prices jsonb default '{"lighting":2000,"backdrops":3000,"podcast":4000}'::jsonb,
  door_code text,
  wifi_password text,
  b2b_emails text[] default array[]::text[],
  updated_at timestamptz default now()
);

-- Insert default row
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- =====================================================================
-- EMAIL LOG
-- =====================================================================
create table if not exists public.email_log (
  id uuid primary key default uuid_generate_v4(),
  recipient text not null,
  template text not null,
  lang text,
  subject text,
  resend_id text,
  status text check (status in ('sent', 'failed', 'bounced')),
  error text,
  metadata jsonb,
  sent_at timestamptz default now()
);

create index if not exists idx_email_recipient on public.email_log(recipient);
create index if not exists idx_email_template on public.email_log(template);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.users enable row level security;
alter table public.memberships enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_addons enable row level security;
alter table public.pending_holds enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.settings enable row level security;
alter table public.email_log enable row level security;

-- Service-role policies are implicit (service role bypasses RLS).
-- Authenticated user policies (Phase 2 will add member-specific reads)
drop policy if exists users_self_read on public.users;
create policy users_self_read on public.users
  for select to authenticated
  using (auth_id = auth.uid());

drop policy if exists bookings_self_read on public.bookings;
create policy bookings_self_read on public.bookings
  for select to authenticated
  using (user_id in (select id from public.users where auth_id = auth.uid()));

drop policy if exists memberships_self_read on public.memberships;
create policy memberships_self_read on public.memberships
  for select to authenticated
  using (user_id in (select id from public.users where auth_id = auth.uid()));

-- Settings: read-only for everyone (door code etc. excluded via API layer)
drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings
  for select using (true);

-- Blocked dates: public read (used in availability calc)
drop policy if exists blocked_public_read on public.blocked_dates;
create policy blocked_public_read on public.blocked_dates
  for select using (true);

-- =====================================================================
-- TRIGGERS — keep updated_at fresh
-- =====================================================================
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists tg_users_updated on public.users;
create trigger tg_users_updated before update on public.users
  for each row execute function public.tg_set_updated_at();

drop trigger if exists tg_bookings_updated on public.bookings;
create trigger tg_bookings_updated before update on public.bookings
  for each row execute function public.tg_set_updated_at();

drop trigger if exists tg_settings_updated on public.settings;
create trigger tg_settings_updated before update on public.settings
  for each row execute function public.tg_set_updated_at();

-- Done.
