"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Tag from "@/components/ui/Tag";
import { useLang } from "@/contexts/LanguageContext";
import { bookingT, type BookingLang } from "@/lib/lang/booking-strings";
import { formatChf } from "@/lib/booking/pricing";

type Cancellation =
  | { allowed: true; refundChf: number; chargeChf?: number; refundPercent?: 50 | 100; reason: string }
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [justCancelled, setJustCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function fetchBooking() {
    const r = await fetch(`/api/booking/${params.token}`, { cache: "no-store" });
    if (r.status === 404) {
      setNotFound(true);
      return;
    }
    const d = await r.json();
    setBooking(d.booking);
    setCancellation(d.cancellation);
  }

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  async function doCancel() {
    setCancelling(true);
    setError(null);
    setShowConfirm(false);
    try {
      const res = await fetch(`/api/booking/cancel/${params.token}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));

      // Treat already_cancelled as success — booking IS cancelled, that's the
      // user's intent. They likely double-submitted or hit a stale cache.
      if (res.ok || data.error === "already_cancelled") {
        setJustCancelled(true);
        await fetchBooking();
        return;
      }

      // Friendly errors
      const friendly = friendlyError(data.error, l);
      setError(friendly);
    } catch {
      setError(l === "de" ? "Netzwerkfehler. Bitte erneut versuchen." : "Network error. Please try again.");
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
  const refundedAmount = booking.refund_chf;

  return (
    <div className="pt-32 pb-32 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Tag>{tx.manage_title}</Tag>
          <h1 className={`font-seasons text-4xl md:text-5xl mt-4 ${cancelled ? "text-foreground/60" : "text-brand"}`}>
            {cancelled ? tx.manage_status_cancelled : tx.manage_status_confirmed}
          </h1>
        </motion.div>

        {/* Just-cancelled toast */}
        <AnimatePresence>
          {justCancelled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900"
            >
              ✓ {l === "de"
                ? `Stornierung erfolgreich. Rückerstattung von ${formatChf(refundedAmount)} wird in 5–7 Tagen auf deiner Karte erscheinen. Eine Bestätigung wurde an deine E-Mail gesendet.`
                : `Cancellation confirmed. A refund of ${formatChf(refundedAmount)} will appear on your card in 5–7 business days. We've emailed you a confirmation.`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking details */}
        <div className={`mt-10 border bg-background p-6 md:p-8 transition-opacity ${cancelled ? "opacity-70" : ""} border-accent/40`}>
          <div className="space-y-3 text-sm">
            <Row label={tx.summary_date} value={new Date(booking.start_time).toLocaleString(l, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Zurich" })} />
            <Row label={tx.summary_time} value={new Date(booking.start_time).toLocaleString(l, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" }) + " – " + new Date(booking.end_time).toLocaleString(l, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" })} />
            <Row label={tx.summary_duration} value={`${booking.duration_hours}h`} />
            {booking.booking_addons.length > 0 && (
              <Row label={tx.summary_addons} value={booking.booking_addons.map((a) => a.addon_key).join(", ")} />
            )}
            <Row label={tx.summary_total} value={formatChf(booking.total_chf)} />
            {refundedAmount > 0 && (
              <Row label={l === "de" ? "Rückerstattung" : "Refund"} value={formatChf(refundedAmount)} />
            )}
          </div>

          {/* Cancellation section */}
          {!cancelled && (
            <div className="mt-6 md:mt-8 pt-6 border-t border-accent/30">
              {cancellation && cancellation.allowed ? (
                <>
                  <p className="text-sm text-foreground/70 mb-3">
                    {cancellation.refundPercent === 50 && (
                      <span className="block text-xs text-amber-700 mb-1">
                        {l === "de"
                          ? "Stornierung im 24-48h-Fenster: 50% Rückerstattung."
                          : l === "fr"
                          ? "Annulation dans la fenêtre 24-48h : remboursement de 50%."
                          : l === "it"
                          ? "Cancellazione nella finestra 24-48h: rimborso del 50%."
                          : "Cancellation within 24-48h window: 50% refund."}
                      </span>
                    )}
                    {tx.manage_cancellation_refund}: <strong>{formatChf(cancellation.refundChf)}</strong>
                  </p>
                  {!showConfirm ? (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="px-6 py-3 text-xs uppercase tracking-widest border border-brand text-brand hover:bg-brand hover:text-background transition"
                    >
                      {tx.manage_cancel_btn}
                    </button>
                  ) : (
                    <div className="border border-brand/40 bg-brand/5 p-4">
                      <p className="text-sm font-medium mb-3">
                        {l === "de"
                          ? `Sicher? Du erhältst eine Rückerstattung von ${formatChf(cancellation.refundChf)}.`
                          : `Are you sure? You'll receive a refund of ${formatChf(cancellation.refundChf)}.`}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={doCancel}
                          disabled={cancelling}
                          className="px-5 py-2 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover transition disabled:opacity-50"
                        >
                          {cancelling ? "…" : l === "de" ? "Ja, stornieren" : "Yes, cancel"}
                        </button>
                        <button
                          onClick={() => setShowConfirm(false)}
                          disabled={cancelling}
                          className="px-5 py-2 text-xs uppercase tracking-widest border border-accent/40 hover:border-foreground/40 transition disabled:opacity-50"
                        >
                          {l === "de" ? "Behalten" : "Keep"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : cancellation && !cancellation.allowed ? (
                <p className="text-sm text-foreground/60 italic">
                  {cancellation.reason === "weekend"
                    ? tx.manage_cancellation_weekend
                    : tx.manage_cancellation_too_late}
                </p>
              ) : null}
              {error && (
                <p className="text-sm text-brand mt-3 border border-brand/30 bg-brand/5 p-3">{error}</p>
              )}
            </div>
          )}

          {cancelled && (
            <div className="mt-6 md:mt-8 pt-6 border-t border-accent/30">
              <p className="text-sm text-foreground/60 italic">
                {tx.manage_cancelled_msg}
                {booking.cancelled_at && (
                  <span className="block mt-1 text-xs text-foreground/40">
                    {new Date(booking.cancelled_at).toLocaleString(l, { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                )}
              </p>
              <Link
                href="/booking"
                className="inline-block mt-4 text-xs uppercase tracking-widest text-brand hover:underline"
              >
                {l === "de" ? "Neue Buchung →" : "Make a new booking →"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-3 border-b border-accent/30 pb-2 last:border-0">
      <span className="text-foreground/60 text-xs uppercase tracking-widest">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function friendlyError(code: string | undefined, l: string): string {
  const isDe = l === "de";
  const map: Record<string, { de: string; en: string }> = {
    weekend: {
      de: "Wochenend-Buchungen sind nicht stornierbar.",
      en: "Weekend bookings cannot be cancelled.",
    },
    less_than_24h: {
      de: "Stornierung ist weniger als 24 Stunden vor Beginn nicht möglich.",
      en: "Cancellation is not possible less than 24 hours before the booking.",
    },
    refund_failed: {
      de: "Rückerstattung fehlgeschlagen. Bitte kontaktiere uns.",
      en: "Refund failed. Please contact us.",
    },
    not_found: {
      de: "Diese Buchung wurde nicht gefunden.",
      en: "This booking was not found.",
    },
  };
  const e = code && map[code];
  if (e) return isDe ? e.de : e.en;
  return isDe ? "Etwas ist schiefgegangen. Bitte erneut versuchen." : "Something went wrong. Please try again.";
}
