"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import { useLang } from "@/contexts/LanguageContext";
import { bookingT, type BookingLang } from "@/lib/lang/booking-strings";
import { formatChf } from "@/lib/booking/pricing";

type Cancellation =
  | { allowed: true; refundChf: number; reason: string }
  | { allowed: false; reason: string; messageKey: string };

type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_chf: number;
  base_price_chf: number;
  addons_price_chf: number;
  late_night_surcharge_chf: number;
  payment_method: string;
  payment_status: string;
  status: "confirmed" | "cancelled" | "no_show" | "completed";
  guest_name: string | null;
  guest_email: string | null;
  preferred_lang: BookingLang;
  manage_token: string;
  cancelled_at: string | null;
  refund_chf: number;
  booking_addons: { addon_key: string; price_chf: number }[];
};

export default function ManageBookingPage({ params }: { params: { token: string } }) {
  const { lang } = useLang();
  const l = lang.toLowerCase() as BookingLang;
  const tx = bookingT[l];

  const [booking, setBooking] = useState<Booking | null>(null);
  const [cancellation, setCancellation] = useState<Cancellation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/booking/${params.token}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setBooking(d.booking);
          setCancellation(d.cancellation);
        }
      });
  }, [params.token]);

  async function doCancel() {
    if (!confirm(tx.manage_cancel_btn + "?")) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/booking/cancel/${params.token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error");
        return;
      }
      // Refresh
      window.location.reload();
    } catch {
      setError("Network error");
    } finally {
      setCancelling(false);
    }
  }

  if (notFound) {
    return (
      <div className="pt-40 pb-32 min-h-screen text-center">
        <p className="font-seasons text-2xl text-foreground/60">404 — Not found</p>
      </div>
    );
  }

  if (!booking) {
    return <div className="pt-40 pb-32 text-center text-foreground/50">Loading…</div>;
  }

  const cancelled = booking.status === "cancelled";

  return (
    <div className="pt-32 pb-32 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 md:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Tag>{tx.manage_title}</Tag>
          <h1 className="font-seasons text-4xl md:text-5xl mt-4">
            {cancelled ? tx.manage_status_cancelled : tx.manage_status_confirmed}
          </h1>
        </motion.div>

        <div className="mt-10 border border-accent/40 bg-background p-8">
          <div className="space-y-3 text-sm">
            <Row label={tx.summary_date} value={new Date(booking.start_time).toLocaleString(l, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Zurich" })} />
            <Row label={tx.summary_time} value={new Date(booking.start_time).toLocaleString(l, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" }) + " – " + new Date(booking.end_time).toLocaleString(l, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" })} />
            <Row label={tx.summary_duration} value={`${booking.duration_hours}h`} />
            {booking.booking_addons.length > 0 && (
              <Row label={tx.summary_addons} value={booking.booking_addons.map((a) => a.addon_key).join(", ")} />
            )}
            <Row label={tx.summary_total} value={formatChf(booking.total_chf)} />
            {booking.refund_chf > 0 && <Row label="Refund" value={formatChf(booking.refund_chf)} />}
          </div>

          {/* Cancellation section */}
          {!cancelled && (
            <div className="mt-8 pt-6 border-t border-accent/30">
              {cancellation && cancellation.allowed ? (
                <>
                  <p className="text-sm text-foreground/70 mb-3">
                    {tx.manage_cancellation_refund}: <strong>{formatChf(cancellation.refundChf)}</strong>
                  </p>
                  <button
                    onClick={doCancel}
                    disabled={cancelling}
                    className="px-6 py-3 text-xs uppercase tracking-widest border border-brand text-brand hover:bg-brand hover:text-background transition disabled:opacity-50"
                  >
                    {cancelling ? "…" : tx.manage_cancel_btn}
                  </button>
                </>
              ) : cancellation && !cancellation.allowed ? (
                <p className="text-sm text-foreground/60 italic">
                  {cancellation.reason === "weekend"
                    ? tx.manage_cancellation_weekend
                    : tx.manage_cancellation_too_late}
                </p>
              ) : null}
              {error && <p className="text-sm text-brand mt-3">{error}</p>}
            </div>
          )}

          {cancelled && (
            <p className="mt-8 pt-6 border-t border-accent/30 text-sm text-foreground/60 italic">
              {tx.manage_cancelled_msg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-3 border-b border-accent/30 pb-2">
      <span className="text-foreground/60 text-xs uppercase tracking-widest">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
