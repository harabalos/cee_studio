-- Phase 2 Memberships migration

alter table public.settings
  add column if not exists stripe_membership_prices jsonb default '{}'::jsonb;

alter table public.bookings
  add column if not exists membership_id uuid references public.memberships(id) on delete set null;

-- Index for fast lookup of bookings by membership
create index if not exists idx_bookings_membership on public.bookings(membership_id);

-- Add policy: members can read own memberships (already in schema, ensure exists)
drop policy if exists memberships_self_read on public.memberships;
create policy memberships_self_read on public.memberships
  for select to authenticated
  using (user_id in (select id from public.users where auth_id = auth.uid()));
