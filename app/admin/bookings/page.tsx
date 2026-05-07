import { getSupabaseAdmin } from "@/lib/supabase/server";
import { formatChf } from "@/lib/booking/pricing";
import { formatZurich } from "@/lib/booking/availability";
import RefundButton from "./RefundButton";

export const dynamic = "force-dynamic";

export default async function AllBookingsPage() {
  const supabase = getSupabaseAdmin();
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id, start_time, end_time, duration_hours, total_chf,
      payment_method, payment_status, status,
      guest_name, guest_email, guest_phone, guest_company,
      stripe_payment_intent_id, manage_token, refund_chf, created_at
    `)
    .order("start_time", { ascending: false })
    .limit(500);

  const upcoming = bookings?.filter((b) => new Date(b.start_time) > new Date() && b.status === "confirmed") ?? [];
  const past = bookings?.filter((b) => new Date(b.start_time) <= new Date() || b.status !== "confirmed") ?? [];

  return (
    <div className="space-y-10">
      <h1 className="font-seasons text-3xl text-brand">All bookings</h1>

      <Section title={`Upcoming (${upcoming.length})`} bookings={upcoming} />
      <Section title={`Past / cancelled / completed (${past.length})`} bookings={past} muted />
    </div>
  );
}

type B = {
  id: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_chf: number;
  payment_method: string;
  payment_status: string;
  status: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_company: string | null;
  stripe_payment_intent_id: string | null;
  manage_token: string;
  refund_chf: number;
};

function Section({ title, bookings, muted = false }: { title: string; bookings: B[]; muted?: boolean }) {
  return (
    <section>
      <h2 className="font-seasons text-xl mb-4">{title}</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-foreground/50 italic border border-accent/30 p-4 bg-background">No bookings.</p>
      ) : (
        <div className="border border-accent/40 bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/10">
              <tr className="text-left">
                <Th>When</Th>
                <Th>Dur.</Th>
                <Th>Customer</Th>
                <Th>Total</Th>
                <Th>Method</Th>
                <Th>Status</Th>
                <Th>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className={`border-t border-accent/20 ${muted ? "opacity-70" : ""}`}>
                  <Td>{formatZurich(b.start_time)}</Td>
                  <Td>{b.duration_hours}h</Td>
                  <Td>
                    <div className="font-medium">{b.guest_name ?? "—"}</div>
                    <div className="text-xs text-foreground/50">
                      {b.guest_email}
                      {b.guest_phone && <> · {b.guest_phone}</>}
                      {b.guest_company && <> · {b.guest_company}</>}
                    </div>
                  </Td>
                  <Td>
                    {formatChf(b.total_chf)}
                    {b.refund_chf > 0 && (
                      <div className="text-xs text-foreground/50">refunded {formatChf(b.refund_chf)}</div>
                    )}
                  </Td>
                  <Td>{b.payment_method}</Td>
                  <Td>
                    <StatusBadge status={b.status} paymentStatus={b.payment_status} />
                  </Td>
                  <Td>
                    {b.status === "confirmed" && b.payment_status === "paid" && b.stripe_payment_intent_id && (
                      <RefundButton id={b.id} totalChf={b.total_chf} />
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status, paymentStatus }: { status: string; paymentStatus: string }) {
  const color =
    status === "confirmed" && paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" :
    status === "cancelled" ? "bg-foreground/10 text-foreground/60" :
    status === "no_show" ? "bg-red-100 text-red-700" :
    paymentStatus === "invoice_pending" ? "bg-amber-100 text-amber-800" :
    paymentStatus === "refunded" ? "bg-foreground/10 text-foreground/60" :
    "bg-accent/30";
  return <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest ${color}`}>{status}</span>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-[10px] uppercase tracking-widest font-semibold p-3 text-foreground/60">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 align-top">{children}</td>;
}
