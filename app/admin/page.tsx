import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { formatChf } from "@/lib/booking/pricing";
import { formatZurich } from "@/lib/booking/availability";
import { getDashboardStats } from "@/lib/booking/stats";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  // Most recent confirmed bookings (last 8) for quick reference
  const supabase = getSupabaseAdmin();
  const { data: recent } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, duration_hours, total_chf, payment_method, payment_status, status, guest_name, guest_email, guest_phone, manage_token")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-seasons text-3xl text-brand">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/bookings" className="text-xs uppercase tracking-widest border border-accent/40 hover:border-brand px-4 py-2">
            All bookings
          </Link>
          <Link href="/admin/manual" className="text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover px-4 py-2">
            + Manual booking
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Today"
          primary={`${stats.today.count} bookings`}
          secondary={formatChf(stats.today.revenue)}
        />
        <StatCard
          label="This week"
          primary={`${stats.week.count} bookings`}
          secondary={formatChf(stats.week.revenue)}
        />
        <StatCard
          label="This month"
          primary={`${stats.month.count} bookings`}
          secondary={formatChf(stats.month.revenue)}
          delta={stats.month.deltaPct}
        />
        <StatCard
          label="Next 7 days"
          primary={`${stats.next7Days.count} upcoming`}
          secondary="confirmed"
        />
      </div>

      {/* Today's schedule */}
      <Section title="Today">
        {stats.today.bookings.length === 0 ? (
          <Empty>No bookings today.</Empty>
        ) : (
          <Timeline bookings={stats.today.bookings} />
        )}
      </Section>

      {/* Upcoming this week */}
      <Section title="Upcoming this week" right={<Link href="/admin/bookings" className="text-xs text-foreground/50 hover:text-brand">View all →</Link>}>
        {stats.upcomingThisWeek.length === 0 ? (
          <Empty>Nothing this week yet.</Empty>
        ) : (
          <BookingsTable bookings={stats.upcomingThisWeek} />
        )}
      </Section>

      {/* Recent activity */}
      <Section title="Recent activity">
        {!recent || recent.length === 0 ? (
          <Empty>No bookings yet.</Empty>
        ) : (
          <BookingsTable bookings={recent} showStatus />
        )}
      </Section>
    </div>
  );
}

// =========================================================================
// COMPONENTS
// =========================================================================

function StatCard({ label, primary, secondary, delta }: { label: string; primary: string; secondary: string; delta?: number | null }) {
  return (
    <div className="border border-accent/40 bg-background p-5">
      <p className="text-[10px] uppercase tracking-widest text-foreground/50">{label}</p>
      <p className="font-seasons text-2xl mt-2">{primary}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-sm text-brand font-medium">{secondary}</p>
        {delta !== null && delta !== undefined && (
          <span className={`text-[10px] ${delta >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {delta >= 0 ? "+" : ""}{delta}% vs prev month
          </span>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-seasons text-xl">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground/50 italic border border-accent/30 p-4 bg-background">{children}</p>;
}

type AnyBooking = {
  id: string;
  start_time: string;
  end_time?: string;
  duration_hours: number;
  total_chf: number;
  payment_method?: string;
  payment_status?: string;
  status?: string;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  manage_token?: string;
};

function BookingsTable({ bookings, showStatus }: { bookings: AnyBooking[]; showStatus?: boolean }) {
  return (
    <div className="border border-accent/40 bg-background overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-accent/10">
          <tr className="text-left">
            <Th>When</Th>
            <Th>Dur.</Th>
            <Th>Customer</Th>
            <Th>Total</Th>
            {showStatus && <Th>Status</Th>}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t border-accent/20 hover:bg-accent/5">
              <Td>{formatZurich(b.start_time)}</Td>
              <Td>{b.duration_hours}h</Td>
              <Td>
                <div className="font-medium">{b.guest_name ?? "—"}</div>
                <div className="text-xs text-foreground/50">{b.guest_email}</div>
              </Td>
              <Td>{formatChf(b.total_chf)}</Td>
              {showStatus && (
                <Td>
                  <StatusBadge status={b.status ?? "—"} paymentStatus={b.payment_status} />
                </Td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Timeline({ bookings }: { bookings: AnyBooking[] }) {
  // Render a horizontal time bar 8:00–22:00 with booking blocks
  const startHour = 8;
  const endHour = 22;
  const totalHours = endHour - startHour;

  return (
    <div className="border border-accent/40 bg-background p-5">
      <div className="relative">
        {/* Hour ticks */}
        <div className="grid grid-cols-14 text-[9px] uppercase tracking-widest text-foreground/40 mb-2" style={{ gridTemplateColumns: `repeat(${totalHours}, 1fr)` }}>
          {Array.from({ length: totalHours }, (_, i) => (
            <div key={i} className="text-left">{String(startHour + i).padStart(2, "0")}</div>
          ))}
        </div>
        {/* Track */}
        <div className="relative h-12 bg-accent/10 border border-accent/30">
          {bookings.map((b) => {
            const start = new Date(b.start_time);
            // Convert UTC to Zurich local hour
            const zHour = parseInt(new Intl.DateTimeFormat("en-CH", { hour: "numeric", timeZone: "Europe/Zurich", hour12: false }).format(start), 10);
            const left = ((zHour - startHour) / totalHours) * 100;
            const width = (b.duration_hours / totalHours) * 100;
            return (
              <div
                key={b.id}
                className="absolute top-0 bottom-0 bg-brand text-background flex items-center justify-center text-xs px-2 truncate"
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${b.guest_name} · ${b.duration_hours}h · ${formatChf(b.total_chf)}`}
              >
                {b.guest_name ?? "Booking"}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail list below */}
      <ul className="mt-5 space-y-2">
        {bookings.map((b) => (
          <li key={b.id} className="flex items-center justify-between text-sm border-b border-accent/20 last:border-0 pb-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-foreground/50 w-24">{formatZurich(b.start_time, "HH:mm")}–{formatZurich(b.end_time ?? "", "HH:mm")}</span>
              <span className="font-medium">{b.guest_name}</span>
              <span className="text-foreground/50 text-xs">{b.guest_phone}</span>
            </div>
            <span className="text-brand font-medium">{formatChf(b.total_chf)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusBadge({ status, paymentStatus }: { status: string; paymentStatus?: string }) {
  const color =
    status === "confirmed" && paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" :
    status === "cancelled" ? "bg-foreground/10 text-foreground/60" :
    status === "no_show" ? "bg-red-100 text-red-700" :
    paymentStatus === "invoice_pending" ? "bg-amber-100 text-amber-800" :
    "bg-accent/30";
  return <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest ${color}`}>{status}</span>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-[10px] uppercase tracking-widest font-semibold p-3 text-foreground/60">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3 align-top">{children}</td>;
}
