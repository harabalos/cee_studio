-- Add guest postal address fields to bookings.
-- Required by Swiss tax law for invoice issuance (rechtsverbindliche Rechnung
-- requires customer address). Also appears on the Nutzungsvertrag PDF.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS guest_street      text,
  ADD COLUMN IF NOT EXISTS guest_postal_code text,
  ADD COLUMN IF NOT EXISTS guest_city        text;

COMMENT ON COLUMN public.bookings.guest_street      IS 'Customer billing address — street and number';
COMMENT ON COLUMN public.bookings.guest_postal_code IS 'Customer billing address — postal code (PLZ / CAP / ZIP)';
COMMENT ON COLUMN public.bookings.guest_city        IS 'Customer billing address — city';
