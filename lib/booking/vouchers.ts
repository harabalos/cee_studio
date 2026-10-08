/**
 * Voucher / discount-code logic. Pure functions (no DB / no I/O), safe to import
 * from client components — the booking UI uses the same discount maths as the
 * server so the summary matches what Stripe charges.
 *
 * All money is CHF cents. A 'percent' voucher stores a whole percent in
 * `discount_value` (10 = 10 %); a 'fixed' voucher stores CHF cents (1000 = CHF 10).
 * The DB side lives in `vouchers-db.ts`.
 */

import type { PriceBreakdown } from "@/types/booking";

export type VoucherType = "percent" | "fixed";

export interface Voucher {
  id: string;
  code: string;
  discount_type: VoucherType;
  discount_value: number;
  max_uses: number | null;   // null = unlimited
  used_count: number;
  expires_at: string | null; // ISO; null = never
  active: boolean;
  note: string | null;
  created_at: string;
}

/** Why a code can't be used. "invalid" covers unknown AND switched-off codes, so a code that isn't live yet can't be probed. */
export type VoucherRejection = "invalid" | "expired" | "used_up" | "error";

/** Stripe's minimum charge for CHF. A voucher never takes a booking below it. */
export const MIN_CHARGE_CHF = 50;

/** Upper-case and strip whitespace, so "giveaway 10" and "GIVEAWAY10" match. */
export function normalizeVoucherCode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

/**
 * Discount (CHF cents) a voucher gives on a booking whose pre-discount total is
 * `grossChf`. Capped so the remaining charge stays >= MIN_CHARGE_CHF — Stripe
 * can't charge less, and free bookings aren't supported.
 */
export function calcVoucherDiscount(
  voucher: Pick<Voucher, "discount_type" | "discount_value">,
  grossChf: number
): number {
  const raw =
    voucher.discount_type === "percent"
      ? Math.round((grossChf * voucher.discount_value) / 100)
      : voucher.discount_value;
  const cap = Math.max(0, grossChf - MIN_CHARGE_CHF);
  return Math.max(0, Math.min(raw, cap));
}

/** Returns the breakdown with the voucher applied: `discountChf` set, `totalChf` net. */
export function applyVoucher(
  breakdown: PriceBreakdown,
  voucher: Pick<Voucher, "discount_type" | "discount_value">
): PriceBreakdown {
  const discountChf = calcVoucherDiscount(voucher, breakdown.totalChf);
  return { ...breakdown, discountChf, totalChf: breakdown.totalChf - discountChf };
}

/**
 * Whether `voucher` can be redeemed right now. `reservedUses` = uses currently
 * held by other people's open checkouts (see vouchers-db.ts).
 */
export function checkVoucher(
  voucher: Voucher | null,
  opts: { now: Date; reservedUses: number }
): { ok: true } | { ok: false; reason: Exclude<VoucherRejection, "error"> } {
  if (!voucher || !voucher.active) return { ok: false, reason: "invalid" };
  if (voucher.expires_at && new Date(voucher.expires_at).getTime() <= opts.now.getTime()) {
    return { ok: false, reason: "expired" };
  }
  if (voucher.max_uses !== null && voucher.used_count + opts.reservedUses >= voucher.max_uses) {
    return { ok: false, reason: "used_up" };
  }
  return { ok: true };
}

/** Short human label for lists: "10 % off" / "CHF 10 off". */
export function describeVoucher(v: Pick<Voucher, "discount_type" | "discount_value">): string {
  return v.discount_type === "percent"
    ? `${v.discount_value} % off`
    : `CHF ${v.discount_value % 100 === 0 ? v.discount_value / 100 : (v.discount_value / 100).toFixed(2)} off`;
}
