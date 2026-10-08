import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Voucher } from "@/lib/booking/vouchers";
import VouchersManager, { type Redemption } from "./VouchersManager";

export const dynamic = "force-dynamic";

export default async function VouchersPage() {
  const supabase = getSupabaseAdmin();
  const [vouchersRes, redemptionsRes] = await Promise.all([
    supabase.from("vouchers").select("*").order("created_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("id, voucher_code, discount_chf, guest_name, guest_email, start_time, status, created_at")
      .not("voucher_code", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  // Table or columns missing → migration 006 hasn't been run on this database.
  if (vouchersRes.error || redemptionsRes.error) {
    return (
      <div className="max-w-2xl space-y-3">
        <h1 className="font-seasons text-3xl text-brand">Vouchers</h1>
        <p className="border border-brand/30 bg-brand/5 p-4 text-sm">
          Couldn&apos;t load vouchers: {(vouchersRes.error ?? redemptionsRes.error)?.message}. Run{" "}
          <code className="font-mono">db/migration_006_vouchers.sql</code> in the Supabase SQL Editor.
        </p>
      </div>
    );
  }

  return (
    <VouchersManager
      initial={(vouchersRes.data ?? []) as Voucher[]}
      redemptions={(redemptionsRes.data ?? []) as Redemption[]}
    />
  );
}
