-- Phase 3 — Auto-generated invoicing
--
-- Adds the configuration needed for automated Nutzungsvertrag + Rechnung
-- PDF generation. These columns are read at booking time to fill in the
-- invoice header, bank info, and to allocate a monotonic invoice number.

alter table public.settings
  add column if not exists bank_iban text default 'CH3000700114902030289',
  add column if not exists twint_number text default '076 240 20 56',
  add column if not exists next_invoice_number integer default 1010,
  add column if not exists invoice_prefix text default '',
  add column if not exists vat_rate_bps integer default 0; -- basis points; 810 = 8.1% Swiss VAT

-- Optional: link generated PDFs back to bookings for retrieval / audit.
alter table public.bookings
  add column if not exists invoice_number text,
  add column if not exists usage_agreement_pdf_url text,
  add column if not exists invoice_pdf_url text;

create index if not exists idx_bookings_invoice_number on public.bookings(invoice_number);
