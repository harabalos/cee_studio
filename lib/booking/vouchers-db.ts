/**
 * Voucher DB access (server-only — takes the service-role client).
 *
 * Lifecycle of a one-use code:
 *   1. Guest applies it  → findRedeemableVoucher() validates, nothing is consumed.
 *   2. Guest starts the Stripe checkout → /api/booking/hold stores the voucher in
 *      the pending_holds payload. While that hold is open (30 min) it counts as a
 *      *reservation*, so two people can't both pay with the same single-use code.
 *   3. Stripe webhook confirms payment → redeemVoucher() bumps used_count.
 * An abandoned checkout just expires with its hold; nothing to roll back.
 */

import type { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  checkVoucher,
  normalizeVoucherCode,
  type Voucher,
  type VoucherRejection,
} from "./vouchers";

type Db = ReturnType<typeof getSupabaseAdmin>;

export type VoucherLookup =
  | { ok: true; voucher: Voucher }
  | { ok: false; reason: VoucherRejection };

/**
 * Look a code up and check it can be redeemed right now.
 *
 * `email` is the booker's address: their *own* open checkout doesn't count as a
 * reservation, so someone who bounces back from Stripe and retries isn't locked
 * out of their own code for 30 minutes.
 */
export async function findRedeemableVoucher(
  db: Db,
  rawCode: string,
  opts: { email?: string } = {}
): Promise<VoucherLookup> {
  const code = normalizeVoucherCode(rawCode);
  if (!code) return { ok: false, reason: "invalid" };

  const { data, error } = await db.from("vouchers").select("*").eq("code", code).maybeSingle();
  if (error) {
    console.error("[voucher] lookup failed", error);
    return { ok: false, reason: "error" };
  }
  const voucher = (data as Voucher | null) ?? null;

  // Only worth counting open checkouts for a code that could still be redeemed.
  let reservedUses = 0;
  if (voucher?.active && voucher.max_uses !== null) {
    let q = db
      .from("pending_holds")
      .select("id", { count: "exact", head: true })
      .gt("expires_at", new Date().toISOString())
      .eq("payload->voucher->>code", code);
    if (opts.email) q = q.neq("payload->guest->>email", opts.email.trim());
    const { count, error: holdsErr } = await q;
    if (holdsErr) {
      console.error("[voucher] reservation count failed", holdsErr);
      return { ok: false, reason: "error" };
    }
    reservedUses = count ?? 0;
  }

  const check = checkVoucher(voucher, { now: new Date(), reservedUses });
  if (!check.ok) return { ok: false, reason: check.reason };
  return { ok: true, voucher: voucher! };
}

/**
 * Record one redemption (called once the booking is paid). Compare-and-swap on
 * used_count so concurrent webhooks can't lose an increment. Deliberately does
 * NOT re-check max_uses: the customer has already paid the discounted price, so
 * the booking stands — an over-redeemed code just shows up as used > max in admin.
 */
export async function redeemVoucher(db: Db, voucherId: string): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await db.from("vouchers").select("used_count").eq("id", voucherId).maybeSingle();
    if (error || !data) throw new Error(`voucher ${voucherId} not readable: ${error?.message ?? "not found"}`);

    const { data: updated, error: updErr } = await db
      .from("vouchers")
      .update({ used_count: data.used_count + 1 })
      .eq("id", voucherId)
      .eq("used_count", data.used_count)
      .select("id");
    if (updErr) throw new Error(`voucher ${voucherId} update failed: ${updErr.message}`);
    if (updated && updated.length > 0) return;
  }
  throw new Error(`voucher ${voucherId} redemption lost the race 5 times`);
}
