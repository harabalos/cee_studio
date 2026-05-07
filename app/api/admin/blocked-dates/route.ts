import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const bodySchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
  reason: z.string().optional(),
});

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("blocked_dates").select("*").order("start_time", { ascending: true });
  return NextResponse.json({ blocked: data ?? [] });
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = bodySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "invalid_params" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("blocked_dates").insert({
    start_time: body.data.start_time,
    end_time: body.data.end_time,
    reason: body.data.reason ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
