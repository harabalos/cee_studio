/**
 * GET / PATCH / DELETE /api/admin/bookings/[id]
 *
 * Admin-only booking management. Used by /admin/bookings/[id]/edit page.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select(`*, booking_addons(addon_key, price_chf)`)
    .eq("id", params.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ booking: data });
}

const patchSchema = z.object({
  guest_name: z.string().min(1).optional(),
  guest_email: z.string().email().nullable().optional(),
  guest_phone: z.string().min(1).optional(),
  guest_company: z.string().nullable().optional(),
  shoot_type: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(["confirmed", "cancelled", "no_show", "completed"]).optional(),
  payment_status: z.enum(["pending", "paid", "refunded", "partially_refunded", "invoice_pending", "failed"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = patchSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "invalid_params", details: body.error.flatten() }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const updates: Record<string, unknown> = { ...body.data };

  // Auto-track timestamps for status changes
  if (body.data.status === "cancelled" || body.data.status === "no_show") {
    updates.cancelled_at = new Date().toISOString();
    updates.cancelled_by = "admin";
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ booking: data });
}
