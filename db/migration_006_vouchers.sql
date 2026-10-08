-- Migration 006 — voucher / discount codes
--
-- Why: CEE Studio is running a giveaway and needs redeemable discount codes
-- (GIVEAWAY10, GIVEAWAY20). The owner creates and switches them on/off from
-- /admin/vouchers; guests enter a code on the last booking step and the
-- discount is applied to the Stripe charge.
--
--   discount_type  'percent' → discount_value is a whole percent (10 = 10 %)
--                  'fixed'   → discount_value is CHF cents      (1000 = CHF 10)
--   max_uses       NULL = unlimited; 1 = a single winner can use it
--   used_count     bumped by the Stripe webhook once the booking is paid
--   active         codes are only redeemable while this is true
--
-- The two giveaway codes are seeded INACTIVE on purpose — the giveaway has not
-- happened yet. Flip them on in /admin/vouchers when it does.
--
-- bookings gets voucher_code + discount_chf so invoices/admin can show what was
-- applied; total_chf stays the amount actually charged (already net).
--
-- Safe to re-run.

create table if not exists public.vouchers (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique check (code = upper(code) and length(code) between 3 and 32),
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0,
  expires_at timestamptz,
  active boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  check (discount_type <> 'percent' or discount_value between 1 and 99)
);

-- Service-role only: the app reads/writes through getSupabaseAdmin(). No RLS
-- policies are defined, so anon/authenticated get nothing.
alter table public.vouchers enable row level security;
revoke all on public.vouchers from anon, authenticated;

alter table public.bookings
  add column if not exists voucher_code text,
  add column if not exists discount_chf integer not null default 0;

comment on column public.bookings.voucher_code is
  'Voucher code redeemed on this booking (NULL = none).';
comment on column public.bookings.discount_chf is
  'Discount applied by the voucher, CHF cents. total_chf is already net of it.';

create index if not exists idx_bookings_voucher on public.bookings(voucher_code)
  where voucher_code is not null;

insert into public.vouchers (code, discount_type, discount_value, max_uses, active, note)
values
  ('GIVEAWAY10', 'percent', 10, 1, false, 'Giveaway code — single use. Activate once the giveaway goes live.'),
  ('GIVEAWAY20', 'percent', 20, 1, false, 'Giveaway code — single use. Activate once the giveaway goes live.')
on conflict (code) do nothing;
