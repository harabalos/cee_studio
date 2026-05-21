-- Security fix: remove public read access from sensitive settings table
-- All app reads go through service_role (getSupabaseAdmin) — anon access is not needed
REVOKE SELECT ON public.settings FROM anon;
REVOKE SELECT ON public.settings FROM authenticated;
-- email_log is internal-only
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.email_log FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.email_log FROM authenticated;
