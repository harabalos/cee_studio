/**
 * GET/PATCH /api/admin/settings — owner-side configuration.
 *
 * Persists in the singleton settings row (id=1).
 * Door code + WiFi password get embedded in confirmation emails.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const patchSchema = z.object({
  door_code: z.string().max(64).optional(),
  wifi_password: z.string().max(128).optional(),
  b2b_emails: z.array(z.string().email()).optional(),
  operating_hours: z
    .object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })
    .optional(),
  buffer_minutes: z.number().int().min(0).max(180).optional(),
  late_night_starts_at: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  late_night_surcharge_chf_per_hour: z.number().int().min(0).max(50000).optional(),
  prices: z.record(z.string(), z.number().int().min(0)).optional(),
  addon_prices: z.record(z.string(), z.number().int().min(0)).optional(),
});

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = patchSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "invalid_params", details: body.error.flatten() }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("settings").update(body.data).eq("id", 1).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
