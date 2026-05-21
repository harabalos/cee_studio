import { getSupabaseAdmin } from "@/lib/supabase/server";
import { formatZurich } from "@/lib/booking/availability";

export const dynamic = "force-dynamic";

type Membership = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  hours_per_month: number;
  hours_balance: number;
  hours_rolled_over: number;
  rolled_over_expires_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  minimum_until: string | null;
  cancelled_at: string | null;
  created_at: string;
  stripe_subscription_id: string | null;
  email?: string;
};

export default async function MembersPage() {
  const supabase = getSupabaseAdmin();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("*")
    .order("created_at", { ascending: false });

  // Enrich with emails from auth.users
  const rows: Membership[] = [];
  for (const m of memberships ?? []) {
    const { data: { user } } = await supabase.auth.admin.getUserById(m.user_id);
    rows.push({ ...m, email: user?.email ?? `(deleted user)` });
  }

  const active = rows.filter((m) => m.status === "active");
  const inactive = rows.filter((m) => m.status !== "active");

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <h1 className="font-seasons text-3xl text-brand">Members</h1>
        <p className="text-sm text-foreground/50">{active.length} active · {inactive.length} inactive</p>
      </div>

      <Section title={`Active (${active.length})`} rows={active} />
      <Section title={`Inactive / Cancelled (${inactive.length})`} rows={inactive} muted />
    </div>
  );
}

function Section({ title, rows, muted = false }: { title: string; rows: Membership[]; muted?: boolean }) {
  return (
    <section>
      <h2 className="font-seasons text-xl mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-foreground/50 italic border border-accent/30 p-4 bg-background">No members.</p>
      ) : (
        <div className="border border-accent/40 bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/10">
              <tr className="text-left">
                <Th>Member</Th>
                <Th>Plan</Th>
                <Th>Hours left</Th>
                <Th>Period ends</Th>
                <Th>Can cancel from</Th>
                <Th>Status</Th>
                <Th>Since</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const hoursLeft = m.hours_balance ?? 0;
                const hoursTotal = m.hours_per_month ?? 0;
                const rolledOver = m.hours_rolled_over ?? 0;

                return (
                  <tr key={m.id} className={`border-t border-accent/20 ${muted ? "opacity-60" : ""}`}>
                    <Td>
                      <div className="font-medium">{m.email}</div>
                      {m.stripe_subscription_id && (
                        <a
                          href={`https://dashboard.stripe.com/subscriptions/${m.stripe_subscription_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-foreground/40 hover:text-brand"
                        >
                          {m.stripe_subscription_id}
                        </a>
                      )}
                    </Td>
                    <Td>
                      <span className="uppercase tracking-widest text-[11px]">{m.plan}</span>
                      <div className="text-xs text-foreground/50">{hoursTotal}h/month</div>
                    </Td>
                    <Td>
                      <div className="font-medium tabular-nums">{hoursLeft}h</div>
                      {rolledOver > 0 && (
                        <div className="text-xs text-foreground/50">
                          +{rolledOver}h rolled over
                          {m.rolled_over_expires_at && (
                            <> · expires {formatZurich(m.rolled_over_expires_at, "d MMM")}</>
                          )}
                        </div>
                      )}
                    </Td>
                    <Td>{m.current_period_end ? formatZurich(m.current_period_end, "d MMM yyyy") : "—"}</Td>
                    <Td>
                      {m.minimum_until
                        ? formatZurich(m.minimum_until, "d MMM yyyy")
                        : <span className="text-foreground/40">—</span>}
                    </Td>
                    <Td>
                      <StatusBadge status={m.status} cancelledAt={m.cancelled_at} />
                    </Td>
                    <Td className="text-foreground/50">{formatZurich(m.created_at, "d MMM yyyy")}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status, cancelledAt }: { status: string; cancelledAt: string | null }) {
  const color =
    status === "active" ? "bg-emerald-100 text-emerald-800" :
    status === "cancelled" ? "bg-foreground/10 text-foreground/60" :
    status === "past_due" ? "bg-red-100 text-red-700" :
    "bg-amber-100 text-amber-800";

  return (
    <div>
      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest ${color}`}>{status}</span>
      {cancelledAt && (
        <div className="text-[10px] text-foreground/40 mt-0.5">
          cancelled {formatZurich(cancelledAt, "d MMM yyyy")}
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-[10px] uppercase tracking-widest font-semibold p-3 text-foreground/60">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`p-3 align-top ${className ?? ""}`}>{children}</td>;
}
