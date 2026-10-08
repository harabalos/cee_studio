/**
 * POST /api/booking/voucher
 *
 * Body: { code, email? }
 *
 * Checks a voucher code for the booking UI ("Apply" button) and returns what the
 * client needs to show the discount: { valid: true, code, discountType, discountValue }.
 * Nothing is consumed here — /api/booking/hold re-validates authoritatively and
 * the Stripe webhook records the redemption.
 *
 * Unknown and switched-off codes both answer "invalid", so a code that isn't
 * live yet can't be told apart from one that doesn't exist.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { findRedeemableVoucher } from "@/lib/booking/vouchers-db";

const bodySchema = z.object({
  code: z.string().max(64),
  email: z.string().max(254).optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ valid: false, reason: "invalid" }, { status: 400 });
  }

  const result = await findRedeemableVoucher(getSupabaseAdmin(), parsed.data.code, {
    email: parsed.data.email,
  });

  if (!result.ok) {
    return NextResponse.json(
      { valid: false, reason: result.reason },
      { status: result.reason === "error" ? 500 : 200 }
    );
  }

  return NextResponse.json({
    valid: true,
    code: result.voucher.code,
    discountType: result.voucher.discount_type,
    discountValue: result.voucher.discount_value,
  });
}
