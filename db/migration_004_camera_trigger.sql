-- Migration 004 — camera + Godox trigger (Standard package)
--
-- Why: guests booking the Standard package need their own Godox-compatible
-- trigger to fire the studio strobes. Without knowing in advance, the owner
-- can't prepare — one guest called an hour into their session unable to sync
-- the lights, and never managed to. These two fields are collected at booking
-- time so the owner can reach out (or lend the Sony trigger) beforehand.
--
-- Safe to re-run.

alter table public.bookings
  add column if not exists camera_model text,
  add column if not exists has_godox_trigger boolean;

comment on column public.bookings.camera_model is
  'Free-text camera brand + model the guest entered at booking (Standard package).';
comment on column public.bookings.has_godox_trigger is
  'Whether the guest owns a Godox-compatible trigger. NULL = not asked (Premium package / legacy booking).';
