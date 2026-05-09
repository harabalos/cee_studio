"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calcPrice, formatChf, DEFAULT_PRICES } from "@/lib/booking/pricing";
import type { AddonKey, Duration } from "@/types/booking";

const DURATIONS: { v: Duration; label: string }[] = [
  { v: 1, label: "1h" },
  { v: 2, label: "2h" },
  { v: 3, label: "3h" },
  { v: 4, label: "4h (Half Day)" },
  { v: 8, label: "8h (Full Day)" },
];

const ADDONS: { key: AddonKey; label: string }[] = [
  { key: "lighting", label: "Additional Lighting Setup (+CHF 20)" },
  { key: "backdrops", label: "All Backdrops Access (+CHF 30)" },
  { key: "podcast", label: "Podcast Setup (+CHF 40)" },
];

const PAYMENT_METHODS = [
  { value: "admin_cash", label: "Cash" },
  { value: "admin_prepaid", label: "Prepaid (already received)" },
  { value: "invoice", label: "Invoice (B2B, mark unpaid)" },
];

export default function ManualBookingPage() {
  const router = useRouter();
  const [duration, setDuration] = useState<Duration>(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [shootType, setShootType] = useState("");
  const [addons, setAddons] = useState<AddonKey[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("admin_prepaid");
  const [lang, setLang] = useState<"de" | "en" | "fr" | "it">("de");
  const [sendEmail, setSendEmail] = useState(true);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Live availability check
  useEffect(() => {
    if (!date || !duration) {
      setConflicts([]);
      return;
    }
    fetch(`/api/availability?date=${date}&duration=${duration}`)
      .then((r) => r.json())
      .then((d) => setConflicts(d.slots ?? []))
      .catch(() => setConflicts([]));
  }, [date, duration]);

  const startHour = time ? parseInt(time.split(":")[0], 10) : 0;
  const breakdown = useMemo(
    () => calcPrice({ duration, startHour, addons }),
    [duration, startHour, addons]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/bookings/manual", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          duration, date, time,
          guest: { name, email: email || null, phone, company, shoot_type: shootType },
          addons,
          paymentMethod,
          lang,
          sendEmail,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error");
      } else {
        router.push(`/admin/bookings`);
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-seasons text-3xl text-brand mb-2">Manual booking</h1>
      <p className="text-sm text-foreground/60 mb-8">For phone, email or walk-in clients. Skips Stripe — booking is confirmed immediately.</p>

      <form onSubmit={submit} className="space-y-6">
        {/* Duration + Date + Time row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Duration *">
            <select required value={duration} onChange={(e) => setDuration(Number(e.target.value) as Duration)} className="w-full p-2 border border-accent/40 bg-background text-sm">
              {DURATIONS.map((d) => (
                <option key={d.v} value={d.v}>{d.label} — {formatChf(DEFAULT_PRICES[d.v])}</option>
              ))}
            </select>
          </Field>
          <Field label="Date *">
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border border-accent/40 bg-background text-sm" />
          </Field>
          <Field label="Start time *">
            <select
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!date || conflicts.length === 0}
              className="w-full p-2 border border-accent/40 bg-background text-sm disabled:opacity-50"
            >
              <option value="">
                {!date
                  ? "Pick a date first"
                  : conflicts.length === 0
                  ? "No slots available this day"
                  : "Choose a time…"}
              </option>
              {conflicts.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {date && conflicts.length === 0 && (
              <p className="text-[10px] text-brand mt-1">
                ⚠ Studio is fully booked this day for {duration}h. Try a different date or duration, or cancel an existing booking.
              </p>
            )}
            {date && conflicts.length > 0 && (
              <p className="text-[10px] text-foreground/50 mt-1">
                {conflicts.length} time{conflicts.length === 1 ? "" : "s"} available
              </p>
            )}
          </Field>
        </div>

        {/* Customer info */}
        <fieldset className="border border-accent/40 p-5">
          <legend className="text-[10px] uppercase tracking-widest text-foreground/60 px-2">Customer</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name *">
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-accent/40 bg-background text-sm" />
            </Field>
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-accent/40 bg-background text-sm" />
            </Field>
            <Field label="Phone *">
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border border-accent/40 bg-background text-sm" />
            </Field>
            <Field label="Company">
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full p-2 border border-accent/40 bg-background text-sm" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Shoot type / notes">
                <input value={shootType} onChange={(e) => setShootType(e.target.value)} className="w-full p-2 border border-accent/40 bg-background text-sm" />
              </Field>
            </div>
          </div>
        </fieldset>

        {/* Add-ons */}
        <fieldset className="border border-accent/40 p-5">
          <legend className="text-[10px] uppercase tracking-widest text-foreground/60 px-2">Add-ons</legend>
          <div className="space-y-2">
            {ADDONS.map((a) => (
              <label key={a.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-brand"
                  checked={addons.includes(a.key)}
                  onChange={(e) =>
                    setAddons((prev) => e.target.checked ? [...prev, a.key] : prev.filter((x) => x !== a.key))
                  }
                />
                <span className="text-sm">{a.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Payment + email */}
        <fieldset className="border border-accent/40 p-5">
          <legend className="text-[10px] uppercase tracking-widest text-foreground/60 px-2">Payment & confirmation</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Payment method *">
              <select required value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-2 border border-accent/40 bg-background text-sm">
                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Confirmation email lang">
              <select value={lang} onChange={(e) => setLang(e.target.value as "de" | "en" | "fr" | "it")} className="w-full p-2 border border-accent/40 bg-background text-sm">
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
              </select>
            </Field>
            <Field label="Send email?">
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="w-4 h-4 accent-brand" />
                <span className="text-sm">Yes, email customer</span>
              </label>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Internal notes (admin only)">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full p-2 border border-accent/40 bg-background text-sm" />
            </Field>
          </div>
        </fieldset>

        {/* Live total */}
        <div className="border border-brand/40 bg-brand/5 p-5 flex items-center justify-between">
          <div className="text-sm">
            <p className="text-foreground/60">Total</p>
            <p className="text-xs text-foreground/50">
              Base {formatChf(breakdown.baseChf)}
              {breakdown.addonsChf > 0 && ` + add-ons ${formatChf(breakdown.addonsChf)}`}
              {breakdown.lateNightChf > 0 && ` + late-night ${formatChf(breakdown.lateNightChf)}`}
            </p>
          </div>
          <p className="font-seasons text-3xl text-brand">{formatChf(breakdown.totalChf)}</p>
        </div>

        {error && <p className="text-sm text-brand border border-brand/30 bg-brand/5 p-3">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="px-5 py-2 text-xs uppercase tracking-widest border border-accent/40 hover:border-brand">Cancel</button>
          <button type="submit" disabled={submitting} className="px-5 py-2 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover disabled:opacity-50">
            {submitting ? "Creating…" : "Create booking"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">{label}</label>
      {children}
    </div>
  );
}
