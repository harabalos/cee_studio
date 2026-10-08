/**
 * Manage voucher codes. POST /api/admin/vouchers
 *
 * body: { action: "create",     ...fields }
 *       { action: "update",     id, ...fields }
 *       { action: "set_active", id, active }
 *       { action: "delete",     id }            (only while the code is unused)
 *
 * fields: code, discount_type ("percent" | "fixed"), discount_value
 *         (whole percent, or CHF cents), max_uses (null = unlimited),
 *         expires_on ("YYYY-MM-DD", Zurich — valid through the end of that day,
 *         null = never), active, note.
 *
 * used_count is never writable here: it only moves when a paid booking redeems
 * the code (Stripe webhook).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { normalizeVoucherCode } from "@/lib/booking/vouchers";

const ZURICH_TZ = "Europe/Zurich";

const fields = z.object({
  code: z
    .string()
    .transform(normalizeVoucherCode)
    .pipe(z.string().min(3, "Code needs at least 3 characters").max(32).regex(/^[A-Z0-9_-]+$/, "Letters, digits, - and _ only")),
  discount_type: z.enum(["percent", "fixed"]),
  discount_value: z.number().int().positive(),
  max_uses: z.number().int().positive().nullable(),
  expires_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  active: z.boolean(),
  note: z.string().max(200).nullable(),
});

const bodySchema = z.discriminatedUnion("action", [
  fields.extend({ action: z.literal("create") }),
  fields.extend({ action: z.literal("update"), id: z.string().uuid() }),
  z.object({ action: z.literal("set_active"), id: z.string().uuid(), active: z.boolean() }),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }),
]);

type Fields = z.infer<typeof fields>;

function toRow(f: Fields) {
  return {
    code: f.code,
    discount_type: f.discount_type,
    discount_value: f.discount_value,
    max_uses: f.max_uses,
    expires_at: f.expires_on ? fromZonedTime(`${f.expires_on}T23:59:59`, ZURICH_TZ).toISOString() : null,
    active: f.active,
    note: f.note?.trim() || null,
  };
}

/** Business rules the DB check also enforces, with a readable message. */
function validateValue(f: Fields): string | null {
  if (f.discount_type === "percent" && (f.discount_value < 1 || f.discount_value > 99)) {
    return "A percentage discount must be between 1 and 99.";
  }
  return null;
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: "invalid_params", message: first ? `${first.path.join(".") || "request"}: ${first.message}` : "Invalid request" },
      { status: 400 }
    );
  }
  const body = parsed.data;
  const supabase = getSupabaseAdmin();

  if (body.action === "create" || body.action === "update") {
    const valueError = validateValue(body);
    if (valueError) return NextResponse.json({ error: "invalid_params", message: valueError }, { status: 400 });

    const row = toRow(body);
    const query =
      body.action === "create"
        ? supabase.from("vouchers").insert(row).select("id").single()
        : supabase.from("vouchers").update(row).eq("id", body.id).select("id").single();
    const { data, error } = await query;
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "code_exists", message: `The code ${row.code} already exists.` }, { status: 409 });
      }
      console.error("[admin/vouchers] save failed", error);
      return NextResponse.json({ error: "save_failed", message: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: data.id });
  }

  if (body.action === "set_active") {
    const { error } = await supabase.from("vouchers").update({ active: body.active }).eq("id", body.id);
    if (error) return NextResponse.json({ error: "save_failed", message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // delete — only unused codes; a redeemed one stays so the history keeps adding up
  const { data: deleted, error } = await supabase
    .from("vouchers")
    .delete()
    .eq("id", body.id)
    .eq("used_count", 0)
    .select("id");
  if (error) return NextResponse.json({ error: "delete_failed", message: error.message }, { status: 500 });
  if (!deleted || deleted.length === 0) {
    return NextResponse.json(
      { error: "has_redemptions", message: "This code has been redeemed — deactivate it instead of deleting." },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}
