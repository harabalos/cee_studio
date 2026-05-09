"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Tag from "@/components/ui/Tag";
import { useLang } from "@/contexts/LanguageContext";
import { bookingT, type BookingLang } from "@/lib/lang/booking-strings";
import { formatChf } from "@/lib/booking/pricing";

type LookupResult = {
  ok: true;
  booking: {
    id: string;
    start_time: string;
    end_time: string;
    duration_hours: number;
    total_chf: number;
    manage_token: string;
    guest_name: string | null;
    guest_email: string | null;
    preferred_lang: BookingLang;
  };
} | { ok: false };

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="pt-40 text-center text-foreground/50">Loading…</div>}>
      <BookingSuccessInner />
    </Suspense>
  );
}

function BookingSuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { lang } = useLang();
  const l = lang.toLowerCase() as BookingLang;
  const tx = bookingT[l];

  const [data, setData] = useState<LookupResult | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  // Poll until webhook finalizes (typically <2s, occasionally up to ~10s)
  useEffect(() => {
    if (!sessionId) return;
    let attempts = 0;
    let stop = false;

    async function tick() {
      attempts++;
      try {
        const r = await fetch(`/api/booking/by-session?session_id=${sessionId}`);
        const d = await r.json();
        if (d.booking) {
          setData({ ok: true, booking: d.booking });
          return;
        }
      } catch { /* ignore */ }
      if (!stop && attempts < 15) setTimeout(tick, 1500);
      else if (!stop) setData({ ok: false });
    }
    tick();
    return () => { stop = true; };
  }, [sessionId]);

  // Check auth status to tailor the account hint
  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setLoggedIn(!!d?.user?.email))
      .catch(() => setLoggedIn(false));
  }, []);

  return (
    <div className="pt-32 pb-32 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Tag>✓</Tag>
          <h1 className="font-seasons text-5xl md:text-7xl text-brand mt-4">{tx.success_title}</h1>
          <p className="mt-4 text-foreground/70">{tx.success_subtitle}</p>
        </motion.div>

        {data === null && (
          <p className="text-center text-foreground/50 mt-16 text-sm">Finalizing…</p>
        )}

        {data && data.ok && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12 border border-accent/40 bg-background p-8"
          >
            <div className="space-y-3 text-sm">
              <Row label={tx.summary_date} value={new Date(data.booking.start_time).toLocaleString(l, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" })} />
              <Row label={tx.summary_duration} value={`${data.booking.duration_hours}h`} />
              <Row label={tx.summary_total} value={formatChf(data.booking.total_chf)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              <Link
                href={`/booking/manage/${data.booking.manage_token}`}
                className="block text-center py-3 text-xs uppercase tracking-widest border border-brand text-brand hover:bg-brand hover:text-background transition"
              >
                {tx.success_manage}
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Thurgauerstrasse+117,+8152+Glattpark"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover transition"
              >
                {tx.success_directions}
              </a>
            </div>

          </motion.div>
        )}

        {data && data.ok && loggedIn === false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 border border-brand/20 bg-brand/[0.04] p-6 sm:p-8 text-center"
          >
            <p className="font-seasons text-2xl text-brand">{tx.success_account_title}</p>
            <p className="mt-2 text-sm text-foreground/70 max-w-md mx-auto">{tx.success_account_body}</p>
            <Link
              href={`/login?email=${encodeURIComponent(data.booking.guest_email ?? "")}&next=/account`}
              className="inline-block mt-5 px-6 py-3 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover transition"
            >
              {tx.success_account_cta}
            </Link>
          </motion.div>
        )}

        {data && data.ok && loggedIn === true && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <Link
              href="/account"
              className="text-xs uppercase tracking-widest text-foreground/70 hover:text-brand border-b border-foreground/30 hover:border-brand pb-1 transition"
            >
              {tx.success_account_logged_in}
            </Link>
          </motion.div>
        )}

        {data && !data.ok && (
          <p className="text-center text-foreground/50 mt-16 text-sm">
            Your booking is being processed. Please check your email shortly.
          </p>
        )}
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
