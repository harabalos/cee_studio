import Link from "next/link";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { PLANS, type PlanKey } from "@/lib/memberships/plans";
import ManagePortalButton from "../ManagePortalButton";

export const dynamic = "force-dynamic";

type Membership = {
  id: string;
  plan: string;
  status: string;
  hours_balance: number;
  hours_per_month: number;
  hours_rolled_over: number;
  rolled_over_expires_at: string | null;
  current_period_end: string | null;
  minimum_until: string | null;
};

export default async function AccountMembershipPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = getSupabaseAdmin();
  const userEmail = user.email.toLowerCase();

  const { data: dbUser } = await admin
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .maybeSingle();

  const { data: membership } = dbUser
    ? await admin
        .from("memberships")
        .select("id, plan, status, hours_balance, hours_per_month, hours_rolled_over, rolled_over_expires_at, current_period_end, minimum_until")
        .eq("user_id", dbUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-seasons text-4xl text-brand">Membership</h1>
        <p className="text-sm text-foreground/60 mt-2">
          Your ABO plan, hours balance, and renewal info.
        </p>
      </div>
      {membership ? <MembershipCard m={membership as Membership} /> : <NoMembershipPrompt />}
    </div>
  );
}

function MembershipCard({ m }: { m: Membership }) {
  const planDef = PLANS[m.plan as PlanKey];
  if (!planDef) return null;

  const nextRenewal = m.current_period_end ? new Date(m.current_period_end) : null;
  const minUntil = m.minimum_until ? new Date(m.minimum_until) : null;
  const canCancelNow = !minUntil || minUntil <= new Date();

  return (
    <section className="bg-gradient-to-br from-brand/5 to-accent/10 border border-brand/30 p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-1">Membership</p>
          <h2 className="font-seasons text-3xl text-brand">{planDef.nameEn}</h2>
          <p className="text-xs text-foreground/60 mt-1">{planDef.taglineEn}</p>
        </div>
        <span className={`px-3 py-1 text-[10px] uppercase tracking-widest ${
          m.status === "active" ? "bg-emerald-100 text-emerald-800" :
          m.status === "past_due" ? "bg-amber-100 text-amber-800" :
          m.status === "paused" ? "bg-foreground/10 text-foreground/60" :
          "bg-foreground/10 text-foreground/60"
        }`}>{m.status}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Stat label="Hours balance" value={`${m.hours_balance}h`} primary />
        <Stat label="Allocation / month" value={`${m.hours_per_month}h`} />
        <Stat label="Rolled over" value={m.hours_rolled_over > 0 ? `${m.hours_rolled_over}h` : "—"} />
        <Stat label="Renews" value={nextRenewal ? nextRenewal.toLocaleDateString("en-CH", { day: "numeric", month: "short" }) : "—"} />
      </div>

      {m.hours_rolled_over > 0 && m.rolled_over_expires_at && (
        <p className="mt-4 text-xs text-amber-800 italic">
          ⏰ {m.hours_rolled_over}h of rolled-over hours expire on{" "}
          {new Date(m.rolled_over_expires_at).toLocaleDateString("en-CH", { day: "numeric", month: "short" })}
          . Use them first.
        </p>
      )}

      {m.status === "past_due" && (
        <p className="mt-4 text-xs text-amber-800 italic border border-amber-300 bg-amber-50 p-3">
          ⚠ Payment failed on the last renewal. Update your payment method to avoid service interruption.
        </p>
      )}

      {!canCancelNow && minUntil && (
        <p className="mt-4 text-[11px] text-foreground/50">
          Subscription is in its 3-month minimum term. You can cancel after{" "}
          {minUntil.toLocaleDateString("en-CH", { day: "numeric", month: "short", year: "numeric" })}.
        </p>
      )}

      <div className="mt-6 flex gap-3 flex-wrap">
        <Link
          href="/booking"
          className="text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover px-5 py-2.5 transition"
        >
          + Book using my hours
        </Link>
        <ManagePortalButton />
      </div>
    </section>
  );
}

function NoMembershipPrompt() {
  return (
    <section className="border border-accent/40 bg-background p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-1">No active membership</p>
          <h2 className="font-seasons text-2xl">Save with an ABO</h2>
          <p className="text-sm text-foreground/60 mt-2 max-w-md">
            Book regularly? Lock in monthly hours at a discount and get priority booking.
            Plans from CHF 220/mo.
          </p>
        </div>
        <Link
          href="/membership/signup"
          className="text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover px-5 py-2.5 transition whitespace-nowrap"
        >
          See plans →
        </Link>
      </div>
    </section>
  );
}

function Stat({ label, value, primary = false }: { label: string; value: string; primary?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-foreground/60">{label}</p>
      <p className={`font-seasons mt-1 ${primary ? "text-3xl text-brand" : "text-xl"}`}>{value}</p>
    </div>
  );
}
