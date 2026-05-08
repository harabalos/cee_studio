import Link from "next/link";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { formatChf } from "@/lib/booking/pricing";
import { formatZurich } from "@/lib/booking/availability";
import { evaluateCancellation } from "@/lib/booking/cancellation";
import { PLANS, type PlanKey } from "@/lib/memberships/plans";
import ManagePortalButton from "./ManagePortalButton";

export const dynamic = "force-dynamic";

type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_chf: number;
  refund_chf: number;
  payment_method: string;
  payment_status: string;
  status: string;
  manage_token: string;
  hours_deducted: number;
};

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

export default async function AccountPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = getSupabaseAdmin();
  const userEmail = user.email.toLowerCase();

  // Find user row
  const { data: dbUser } = await admin
    .from("users")
    .select("id, role")
    .eq("email", userEmail)
    .maybeSingle();

  // Find membership (latest active one if any)
  const { data: membership } = dbUser
    ? await admin
        .from("memberships")
        .select("id, plan, status, hours_balance, hours_per_month, hours_rolled_over, rolled_over_expires_at, current_period_end, minimum_until")
        .eq("user_id", dbUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  // Bookings linked to user OR using their email
  const { data: bookings } = await admin
    .from("bookings")
    .select("id, start_time, end_time, duration_hours, total_chf, refund_chf, payment_method, payment_status, status, manage_token, hours_deducted")
    .or(dbUser ? `user_id.eq.${dbUser.id},guest_email.eq.${userEmail}` : `guest_email.eq.${userEmail}`)
    .order("start_time", { ascending: false });

  const now = new Date();
  const upcoming = (bookings ?? []).filter(
    (b) => b.status === "confirmed" && new Date(b.start_time) > now
  );
  const past = (bookings ?? []).filter(
    (b) => !(b.status === "confirmed" && new Date(b.start_time) > now)
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-seasons text-4xl md:text-5xl text-brand">My account</h1>
        <p className="text-sm text-foreground/60 mt-2">
          Bookings, membership, and account settings — all in one place.
        </p>
      </div>

      {/* Membership card */}
      {membership ? (
        <MembershipCard m={membership as Membership} />
      ) : (
        <NoMembershipPrompt />
      )}

      {/* Upcoming bookings */}
      <Section title={`Upcoming bookings (${upcoming.length})`}>
        {upcoming.length === 0 ? (
          <Empty>
            No upcoming bookings.{" "}
            <Link href="/booking" className="text-brand underline">
              Book the studio →
            </Link>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((b) => (
              <UpcomingCard key={b.id} booking={b as Booking} />
            ))}
          </div>
        )}
      </Section>

      {/* Past */}
      {past.length > 0 && (
        <Section title={`Past · cancelled · completed (${past.length})`}>
          <div className="border border-accent/40 bg-background overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/10">
                <tr className="text-left">
                  <Th>Date</Th>
                  <Th>Duration</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>{""}</Th>
                </tr>
              </thead>
              <tbody>
                {past.map((b) => (
                  <tr key={b.id} className="border-t border-accent/20 hover:bg-accent/5">
                    <Td>{formatZurich(b.start_time)}</Td>
                    <Td>{b.duration_hours}h</Td>
                    <Td>
                      {b.payment_method === "membership_hours" ? (
                        <span className="text-foreground/60">{b.hours_deducted ?? b.duration_hours}h (member)</span>
                      ) : (
                        <>
                          {formatChf(b.total_chf)}
                          {b.refund_chf > 0 && <span className="text-xs text-foreground/50"> · refunded</span>}
                        </>
                      )}
                    </Td>
                    <Td>
                      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                        b.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                        b.status === "cancelled" ? "bg-foreground/10 text-foreground/60" :
                        b.status === "no_show" ? "bg-red-100 text-red-700" :
                        "bg-accent/30"
                      }`}>{b.status}</span>
                    </Td>
                    <Td>
                      <Link href={`/booking/manage/${b.manage_token}`} className="text-xs text-foreground/60 hover:text-brand">
                        View →
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}

// =========================================================================
// COMPONENTS
// =========================================================================

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

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Stat label="Hours balance" value={`${m.hours_balance}h`} primary />
        <Stat label="Allocation / month" value={`${m.hours_per_month}h`} />
        <Stat label="Rolled over" value={m.hours_rolled_over > 0 ? `${m.hours_rolled_over}h` : "—"} />
        <Stat label="Renews" value={nextRenewal ? nextRenewal.toLocaleDateString("en-CH", { day: "numeric", month: "short" }) : "—"} />
      </div>

      {/* Rolled-over warning */}
      {m.hours_rolled_over > 0 && m.rolled_over_expires_at && (
        <p className="mt-4 text-xs text-amber-800 italic">
          ⏰ {m.hours_rolled_over}h of rolled-over hours expire on{" "}
          {new Date(m.rolled_over_expires_at).toLocaleDateString("en-CH", { day: "numeric", month: "short" })}
          . Use them first.
        </p>
      )}

      {/* Past-due warning */}
      {m.status === "past_due" && (
        <p className="mt-4 text-xs text-amber-800 italic border border-amber-300 bg-amber-50 p-3">
          ⚠ Payment failed on the last renewal. Update your payment method to avoid service interruption.
        </p>
      )}

      {/* Min-term info */}
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

function UpcomingCard({ booking }: { booking: Booking }) {
  const cancel = evaluateCancellation({
    bookingStartUtc: booking.start_time,
    totalPaidChf: booking.total_chf,
  });

  return (
    <div className="border border-accent/40 bg-background p-6">
      <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-2">
        {formatZurich(booking.start_time, "EEEE")}
      </p>
      <p className="font-seasons text-2xl mb-1">{formatZurich(booking.start_time, "d MMM yyyy")}</p>
      <p className="text-sm text-foreground/70">
        {formatZurich(booking.start_time, "HH:mm")} – {formatZurich(booking.end_time, "HH:mm")}
        <span className="text-foreground/40"> · {booking.duration_hours}h</span>
      </p>
      <p className="font-seasons text-xl text-brand mt-3">
        {booking.payment_method === "membership_hours"
          ? `${booking.hours_deducted ?? booking.duration_hours}h from balance`
          : formatChf(booking.total_chf)}
      </p>

      <div className="border-t border-accent/30 mt-4 pt-4 flex items-center justify-between gap-3">
        <Link
          href={`/booking/manage/${booking.manage_token}`}
          className="text-xs uppercase tracking-widest text-brand hover:underline"
        >
          View / cancel →
        </Link>
        <span className="text-[10px] text-foreground/50 italic">
          {cancel.allowed
            ? booking.payment_method === "membership_hours"
              ? `Hours refunded on cancel`
              : `Refund ${formatChf(cancel.refundChf)}`
            : cancel.reason === "weekend"
            ? "Weekend (non-cancellable)"
            : "<48h (non-cancellable)"}
        </span>
      </div>
    </div>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-seasons text-2xl mb-4">{title}</h2>
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground/60 italic border border-accent/30 p-5 bg-background">{children}</p>;
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-[10px] uppercase tracking-widest font-semibold p-3 text-foreground/60">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 align-top">{children}</td>;
}
