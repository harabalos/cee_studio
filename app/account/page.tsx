import Link from "next/link";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { formatChf } from "@/lib/booking/pricing";
import { formatZurich } from "@/lib/booking/availability";
import { evaluateCancellation } from "@/lib/booking/cancellation";

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
};

export default async function AccountPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null; // layout handles redirect

  // Use admin client to query bookings — RLS-bypass is safe because we filter by
  // authenticated user's email.
  const admin = getSupabaseAdmin();
  const { data: bookings } = await admin
    .from("bookings")
    .select("id, start_time, end_time, duration_hours, total_chf, refund_chf, payment_method, payment_status, status, manage_token")
    .or(`user_id.eq.${user.id},guest_email.eq.${user.email}`)
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
        <h1 className="font-seasons text-4xl md:text-5xl text-brand">My bookings</h1>
        <p className="text-sm text-foreground/60 mt-2">All bookings you&apos;ve made with this email.</p>
      </div>

      {/* Upcoming */}
      <Section title={`Upcoming (${upcoming.length})`}>
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
                      {formatChf(b.total_chf)}
                      {b.refund_chf > 0 && <span className="text-xs text-foreground/50"> · refunded {formatChf(b.refund_chf)}</span>}
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
                      <Link
                        href={`/booking/manage/${b.manage_token}`}
                        className="text-xs text-foreground/60 hover:text-brand"
                      >
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
      <p className="font-seasons text-xl text-brand mt-3">{formatChf(booking.total_chf)}</p>

      <div className="border-t border-accent/30 mt-4 pt-4 flex items-center justify-between gap-3">
        <Link
          href={`/booking/manage/${booking.manage_token}`}
          className="text-xs uppercase tracking-widest text-brand hover:underline"
        >
          View / cancel →
        </Link>
        <span className="text-[10px] text-foreground/50 italic">
          {cancel.allowed
            ? `Cancellable · refund ${formatChf(cancel.refundChf)}`
            : cancel.reason === "weekend"
            ? "Non-cancellable (weekend)"
            : "Non-cancellable (<48h)"}
        </span>
      </div>
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
