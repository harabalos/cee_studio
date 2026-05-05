import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  await supabase.from("blocked_dates").delete().eq("id", params.id);
  return NextResponse.json({ ok: true });
}
