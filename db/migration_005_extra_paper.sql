-- Migration 005 — extra backdrop paper (every booking)
--
-- Why: guests now answer a required "extra backdrop paper?" question at
-- booking; "yes" adds a flat CHF 20, charged through Stripe with the rest.
-- The owner needs to see the answer to have paper ready, and invoices need the
-- amount as its own line so they reconcile with total_chf.
--
-- Kept separate from addons_price_chf on purpose: "addons_price_chf > 0" is how
-- the site recognises a Premium booking (reminders, invoices, emails).
--
-- Safe to re-run.

alter table public.bookings
  add column if not exists extra_paper boolean,
  add column if not exists extra_paper_chf integer not null default 0;

comment on column public.bookings.extra_paper is
  'Guest''s answer to "extra backdrop paper?". NULL = not asked (admin/manual or legacy booking).';
comment on column public.bookings.extra_paper_chf is
  'Amount charged for extra paper, CHF cents (0 = none). Included in total_chf.';
