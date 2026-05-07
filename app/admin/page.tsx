import { getSupabaseAdmin } from "@/lib/supabase/server";
import { formatChf } from "@/lib/booking/pricing";
import { formatZurich } from "@/lib/booking/availability";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const supabase = getSupabaseAdmin();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, duration_hours, total_chf, payment_method, payment_status, status, guest_name, guest_email, guest_phone")
    .order("start_time", { ascending: false })
    .limit(200);

  const upcoming = bookings?.filter((b) => new Date(b.start_time) > new Date() && b.status === "confirmed") ?? [];
  const past = bookings?.filter((b) => new Date(b.start_time) <= new Date() || b.status !== "confirmed") ?? [];

  return (
    <div>
      <h1 className="font-seasons text-3xl text-brand mb-8">Bookings</h1>

      <Section title={`Upcoming (${upcoming.length})`} bookings={upcoming} highlight />
      <Section title={`Past / Other (${past.length})`} bookings={past} />
    </div>
  );
}

type AdminBooking = {
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
};

function Section({ title, bookings, highlight = false }: { title: string; bookings: AdminBooking[]; highlight?: boolean }) {
  return (
    <section className="mb-12">
      <h2 className="font-seasons text-xl mb-4">{title}</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-foreground/50">No bookings.</p>
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
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className={`border-t border-accent/20 ${highlight && b.status === "confirmed" ? "" : ""}`}>
                  <Td>{formatZurich(b.start_time)}</Td>
                  <Td>{b.duration_hours}h</Td>
                  <Td>
                    <div>{b.guest_name}</div>
                    <div className="text-xs text-foreground/50">{b.guest_email} · {b.guest_phone}</div>
                  </Td>
                  <Td>{formatChf(b.total_chf)}</Td>
                  <Td>{b.payment_method}</Td>
                  <Td>
                    <span className={`px-2 py-0.5 text-xs uppercase tracking-widest ${
                      b.status === "confirmed" ? "bg-brand/10 text-brand" :
                      b.status === "cancelled" ? "bg-foreground/10 text-foreground/60" :
                      "bg-accent/20"
                    }`}>{b.status}</span>
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-[10px] uppercase tracking-widest font-semibold p-3 text-foreground/60">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 align-top">{children}</td>;
}
