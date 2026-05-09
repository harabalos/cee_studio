"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatChf } from "@/lib/booking/pricing";
import { formatZurich } from "@/lib/booking/availability";

type Booking = {
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
  shoot_type: string | null;
  notes: string | null;
  created_at: string;
  manage_token: string;
};

export default function EditBookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/bookings/${params.id}`)
      .then((r) => r.json())
      .then((d) => setBooking(d.booking));
  }, [params.id]);

  async function patch(updates: Partial<Booking>) {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/bookings/${params.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updates),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Save failed");
      } else {
        setBooking(d.booking);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setBusy(false);
    }
  }

  async function markNoShow() {
    if (!confirm("Mark this booking as no-show? This is final.")) return;
    await patch({ status: "no_show" });
  }

  async function markCompleted() {
    await patch({ status: "completed" });
  }

  async function reactivate() {
    if (!confirm("Reactivate? Status → confirmed. Refund must be reverted manually in Stripe.")) return;
    await patch({ status: "confirmed" });
  }

  async function cancelBooking() {
    if (!booking) return;
    const isStripePaid = !!booking.guest_email && booking.payment_method !== "admin_cash" && booking.payment_method !== "admin_prepaid" && booking.payment_method !== "invoice" && booking.payment_method !== "membership_hours";
    const msg = isStripePaid
      ? `Cancel + refund this booking?\n\nStripe will refund ${formatChf(booking.total_chf)} (minus fees).`
      : booking.payment_method === "membership_hours"
      ? "Cancel this member booking?\n\nHours will be returned to the member's balance."
      : "Cancel this booking?\n\nNo refund will be processed (admin handles cash/invoice settlement).";
    if (!confirm(msg)) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/bookings/${params.id}/cancel`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Cancel failed");
        return;
      }
      // Reload booking
      const fresh = await fetch(`/api/admin/bookings/${params.id}`).then((res) => res.json());
      setBooking(fresh.booking);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setBusy(false);
    }
  }

  if (!booking) return <p className="text-sm text-foreground/50">Loading…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <button onClick={() => router.back()} className="text-xs text-foreground/50 hover:text-brand mb-2">← Back</button>
          <h1 className="font-seasons text-3xl text-brand">Booking · {formatZurich(booking.start_time, "d MMM · HH:mm")}</h1>
          <p className="text-xs text-foreground/50 mt-1">ID {booking.id.slice(0, 8)}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {booking.status === "confirmed" && (
            <>
              {/* Mark completed: only meaningful AFTER the booking has actually happened.
                  System auto-marks completed via daily cron — this button is just for edge cases. */}
              {new Date(booking.end_time) <= new Date() ? (
                <button onClick={markCompleted} disabled={busy} className="text-xs uppercase tracking-widest border border-accent/40 hover:border-brand px-3 py-2">
                  Mark completed
                </button>
              ) : (
                <button
                  disabled
                  title="Booking is in the future — system auto-marks completed after it happens"
                  className="text-xs uppercase tracking-widest border border-accent/30 text-foreground/40 px-3 py-2 cursor-not-allowed"
                >
                  Mark completed
                </button>
              )}
              <button onClick={markNoShow} disabled={busy} className="text-xs uppercase tracking-widest border border-amber-500 text-amber-700 hover:bg-amber-50 px-3 py-2">
                Mark no-show
              </button>
              <button onClick={cancelBooking} disabled={busy} className="text-xs uppercase tracking-widest border border-red-500 text-red-700 hover:bg-red-50 px-3 py-2">
                Cancel
              </button>
            </>
          )}
          {(booking.status === "cancelled" || booking.status === "no_show") && (
            <button onClick={reactivate} disabled={busy} className="text-xs uppercase tracking-widest border border-accent/40 hover:border-brand px-3 py-2">
              Reactivate
            </button>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div className={`p-4 border ${
        booking.status === "confirmed" ? "border-emerald-300 bg-emerald-50" :
        booking.status === "cancelled" ? "border-foreground/20 bg-foreground/5" :
        booking.status === "no_show" ? "border-red-300 bg-red-50" :
        "border-accent/30 bg-accent/10"
      }`}>
        <p className="text-xs uppercase tracking-widest">Status</p>
        <p className="font-seasons text-xl mt-1">{booking.status} · {booking.payment_status}</p>
      </div>

      {/* Read-only booking info */}
      <Section title="Booking">
        <Row label="When">{formatZurich(booking.start_time)} – {formatZurich(booking.end_time, "HH:mm")}</Row>
        <Row label="Duration">{booking.duration_hours}h</Row>
        <Row label="Total">{formatChf(booking.total_chf)}</Row>
        <Row label="Payment">{booking.payment_method}</Row>
      </Section>

      {/* Editable customer */}
      <Section title="Customer (editable)">
        <Field label="Name" defaultValue={booking.guest_name ?? ""} onCommit={(v) => patch({ guest_name: v || null })} />
        <Field label="Email" type="email" defaultValue={booking.guest_email ?? ""} onCommit={(v) => patch({ guest_email: v || null })} />
        <Field label="Phone" defaultValue={booking.guest_phone ?? ""} onCommit={(v) => patch({ guest_phone: v || null })} />
        <Field label="Company" defaultValue={booking.guest_company ?? ""} onCommit={(v) => patch({ guest_company: v || null })} />
        <Field label="Shoot type" defaultValue={booking.shoot_type ?? ""} onCommit={(v) => patch({ shoot_type: v || null })} />
      </Section>

      {/* Internal notes */}
      <Section title="Internal notes">
        <textarea
          defaultValue={booking.notes ?? ""}
          onBlur={(e) => patch({ notes: e.target.value || null })}
          rows={3}
          placeholder="Anything you want to remember about this booking…"
          className="w-full p-3 border border-accent/40 bg-background text-sm"
        />
      </Section>

      {error && <p className="text-sm text-brand border border-brand/30 bg-brand/5 p-3">{error}</p>}
      {saved && <p className="text-xs text-emerald-700">✓ Saved</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-accent/40 bg-background p-5">
      <h2 className="font-seasons text-lg mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-baseline py-2 border-b border-accent/20 last:border-0">
      <span className="text-[10px] uppercase tracking-widest text-foreground/60">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

function Field({ label, defaultValue, type = "text", onCommit }: { label: string; defaultValue: string; type?: string; onCommit: (v: string) => void }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        onBlur={(e) => {
          if (e.target.value !== defaultValue) onCommit(e.target.value);
        }}
        className="w-full p-2 border border-accent/40 bg-background text-sm"
      />
    </div>
  );
}
