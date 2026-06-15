"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { de, enUS, fr, it } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Tag from "@/components/ui/Tag";
import Breadcrumbs from "@/components/Breadcrumbs";
import { bc } from "@/lib/breadcrumb-labels";
import { useLang } from "@/contexts/LanguageContext";
import { bookingT, type BookingLang } from "@/lib/lang/booking-strings";
import { calcPrice, formatChf, DEFAULT_PRICES } from "@/lib/booking/pricing";
import type { AddonKey, Duration } from "@/types/booking";

type Step = 1 | 2 | 3 | 4 | 5;

const DURATIONS: { value: Duration; labelKey: keyof typeof bookingT.de; subKey?: keyof typeof bookingT.de; popular?: boolean }[] = [
  { value: 1, labelKey: "duration_1h" },
  { value: 2, labelKey: "duration_2h" },
  { value: 3, labelKey: "duration_3h" },
  { value: 4, labelKey: "duration_4h", subKey: "duration_4h_label", popular: true },
  { value: 8, labelKey: "duration_8h", subKey: "duration_8h_label" },
];

// Add-ons removed 2026-06-15. Equipment is now contact-only (premium gear shown
// on /studio) and backdrop paper is billed on-site per used meter. The booking
// charges the base studio rate only. A stable module-level empty array keeps the
// existing price/API plumbing (calcPrice, /api/booking/hold) working unchanged.
const NO_ADDONS: AddonKey[] = [];

const dfnsLocale = { de, en: enUS, fr, it };

export default function BookingPage() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as BookingLang;
  const tx = bookingT[l];

  const [step, setStep] = useState<Step>(1);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const addons = NO_ADDONS;
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    street: "",
    postalCode: "",
    city: "",
    shootType: "",
    confirmationLang: l,
    terms: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<"card_or_twint" | "invoice" | "membership_hours">("card_or_twint");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Logged-in member detection
  type MeData = {
    user?: { name?: string | null; email?: string | null; phone?: string | null; company?: string | null };
    membership?: { id: string; plan: string; status: string; hours_balance: number; hours_per_month: number } | null;
  };
  const [me, setMe] = useState<MeData | null>(null);
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        setMe(d);
        // Pre-fill details if member is logged in
        if (d?.user?.email) {
          setDetails((prev) => ({
            ...prev,
            name: d.user.name ?? prev.name,
            email: d.user.email ?? prev.email,
            phone: d.user.phone ?? prev.phone,
            company: d.user.company ?? prev.company,
          }));
          // Default to hours payment if member with sufficient balance
          if (d.membership?.status === "active") {
            setPaymentMethod("membership_hours");
          }
        }
      })
      .catch(() => setMe(null));
  }, []);
  const activeMembership = me?.membership?.status === "active" ? me.membership : null;
  const hasEnoughHours = !!activeMembership && !!duration && activeMembership.hours_balance >= duration;
  // Partial coverage: some hours but not all. The user pays for extra hours at the
  // documented member overage rate: CHF 50/hour.
  const hasPartialHours = !!activeMembership && !!duration &&
    activeMembership.hours_balance > 0 &&
    activeMembership.hours_balance < duration;
  const MEMBER_EXTRA_HOUR_RATE_CHF = 5000; // CHF 50 / extra hour (per plan benefits)
  const memberExtraHours = activeMembership && duration
    ? Math.max(0, duration - activeMembership.hours_balance)
    : 0;
  const memberHoursFromBalance = activeMembership && duration
    ? Math.min(activeMembership.hours_balance, duration)
    : 0;
  const memberOverageBaseChf = memberExtraHours * MEMBER_EXTRA_HOUR_RATE_CHF;
  // Aliases kept for backwards-compat with existing JSX
  const partialExtraHours = memberExtraHours;
  const partialHoursFromBalance = hasPartialHours ? memberHoursFromBalance : 0;

  // Reset slots when date or duration changes
  useEffect(() => {
    if (!date || !duration) {
      setSlots([]);
      setTime(null);
      return;
    }
    const dateStr = format(date, "yyyy-MM-dd");
    setSlotsLoading(true);
    fetch(`/api/availability?date=${dateStr}&duration=${duration}`)
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots ?? []);
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [date, duration]);

  // Compute price breakdown live
  const breakdown = useMemo(() => {
    if (!duration) return null;
    const startHour = time ? parseInt(time.split(":")[0], 10) : 0;
    return calcPrice({ duration, startHour, addons });
  }, [duration, time, addons]);

  // Total charged when paying with hours:
  //   = overage_base (extra hours × CHF 50)
  //   + add-ons (regular price)
  //   + late-night surcharge (regular)
  // For full coverage with NO extras, this is 0.
  const memberChargedChf = (activeMembership && duration)
    ? memberOverageBaseChf + (breakdown?.addonsChf ?? 0) + (breakdown?.lateNightChf ?? 0)
    : 0;
  // Backwards-compat alias
  const partialChargedChf = memberChargedChf;

  function next() {
    setStep((s) => (s < 5 ? ((s + 1) as Step) : s));
  }
  function back() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  function validateStep4(): boolean {
    const errs: Record<string, string> = {};
    if (details.name.trim().length < 2) errs.name = tx.error_required;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) errs.email = tx.error_email;
    if (details.phone.trim().length < 6) errs.phone = tx.error_phone;
    if (details.street.trim().length < 3) errs.street = tx.error_required;
    if (details.postalCode.trim().length < 3) errs.postalCode = tx.error_required;
    if (details.city.trim().length < 2) errs.city = tx.error_required;
    if (!details.terms) errs.terms = tx.terms_required;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submitMemberBooking() {
    if (!duration || !date || !time) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/me/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          duration,
          date: format(date, "yyyy-MM-dd"),
          time,
          addons,
          shootType: details.shootType.trim() || undefined,
          termsAccepted: true,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setServerError(tx.error_slot_taken);
        setTime(null);
        setStep(3);
        return;
      }
      if (!res.ok) {
        if (data.error === "no_balance") {
          setServerError(
            l === "de"
              ? "Keine verbleibenden Stunden im ABO. Bitte mit Karte bezahlen."
              : "No hours left in your plan. Please pay with card."
          );
          setPaymentMethod("card_or_twint");
          return;
        }
        setServerError(tx.error_generic);
        return;
      }
      // Stripe Checkout (partial coverage OR full+extras)
      if (data.mode === "stripe_checkout" && data.url) {
        window.location.href = data.url;
        return;
      }
      // Full coverage, no extras → direct booking
      if (data.booking?.manage_token) {
        window.location.href = `/booking/manage/${data.booking.manage_token}?member_booked=1`;
      }
    } catch {
      setServerError(tx.error_generic);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitBooking() {
    if (!duration || !date || !time) return;

    // Member with hours (full OR partial)? Use member endpoint.
    // - Full: instant booking, no Stripe.
    // - Partial: member endpoint returns Stripe Checkout URL for the overage.
    if (paymentMethod === "membership_hours" && (hasEnoughHours || hasPartialHours)) {
      await submitMemberBooking();
      return;
    }

    setSubmitting(true);
    setServerError(null);

    // Helper: refresh slots and bounce user back to step 3 with explanation
    async function refreshSlotsAndBounce(message: string) {
      setServerError(message);
      setTime(null);
      try {
        const dateStr = format(date!, "yyyy-MM-dd");
        const r = await fetch(`/api/availability?date=${dateStr}&duration=${duration}`);
        const d = await r.json();
        setSlots(d.slots ?? []);
      } catch {
        /* ignore */
      }
      setStep(3);
    }

    try {
      const res = await fetch("/api/booking/hold", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          duration,
          date: format(date, "yyyy-MM-dd"),
          time,
          addons,
          guest: {
            name: details.name.trim(),
            email: details.email.trim(),
            phone: details.phone.trim(),
            company: details.company.trim() || undefined,
            street: details.street.trim(),
            postalCode: details.postalCode.trim(),
            city: details.city.trim(),
            shootType: details.shootType.trim() || undefined,
          },
          lang: details.confirmationLang,
          termsAccepted: true,
        }),
      });

      // 409 = slot taken (race with another customer). Refresh + bounce.
      if (res.status === 409) {
        await refreshSlotsAndBounce(tx.error_slot_taken);
        return;
      }

      // Try to parse JSON, but tolerate non-JSON 5xx (e.g. Stripe outage)
      let data: { error?: string; url?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* server may have returned non-JSON */
      }

      if (!res.ok) {
        if (data.error === "slot_unavailable" || data.error === "slot_conflict") {
          await refreshSlotsAndBounce(tx.error_slot_taken);
          return;
        }
        if (data.error === "stripe_error") {
          setServerError(
            l === "de"
              ? "Zahlungsdienst momentan nicht erreichbar. Bitte in 1–2 Minuten erneut versuchen."
              : l === "fr"
              ? "Le service de paiement est momentanément indisponible. Réessaie dans 1–2 minutes."
              : l === "it"
              ? "Servizio di pagamento momentaneamente non disponibile. Riprova tra 1–2 minuti."
              : "Payment service is temporarily unavailable. Please try again in 1–2 minutes."
          );
          return;
        }
        setServerError(tx.error_generic);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setServerError(tx.error_generic);
    } catch {
      // Network failure, offline, fetch aborted
      setServerError(
        l === "de"
          ? "Netzwerkfehler. Prüfe deine Verbindung und versuche es erneut."
          : l === "fr"
          ? "Erreur réseau. Vérifie ta connexion et réessaie."
          : l === "it"
          ? "Errore di rete. Verifica la connessione e riprova."
          : "Network error. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="pt-32 pb-32 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Breadcrumbs items={bc(lang.toLowerCase(), "booking")} className="mb-8" />
        <div className="text-center mb-12">
          <Tag>{tx.page_title}</Tag>
          <h1 className="font-seasons text-4xl md:text-6xl mt-4">{tx.page_title}</h1>
          <p className="mt-3 text-foreground/60 max-w-md mx-auto">{tx.page_intro}</p>
        </div>

        {/* Member banner */}
        {activeMembership && (
          <div className="mb-8 border border-brand/30 bg-brand/5 p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-foreground/60">
                {l === "de" ? "Mitglied" : "Member"} · {activeMembership.plan}
              </p>
              <p className="font-seasons text-xl text-brand mt-1">
                {activeMembership.hours_balance}h {l === "de" ? "verfügbar" : "available"}
                <span className="text-sm text-foreground/60 ml-2">
                  / {activeMembership.hours_per_month}h {l === "de" ? "monatlich" : "monthly"}
                </span>
              </p>
            </div>
            {duration && (
              <p className="text-sm">
                {hasEnoughHours && memberChargedChf === 0 ? (
                  <span className="text-emerald-700">
                    ✓ {l === "de" ? "Wird mit Stunden bezahlt" : "Will be paid with hours"}
                  </span>
                ) : hasEnoughHours && memberChargedChf > 0 ? (
                  <span className="text-emerald-700">
                    ✓ {l === "de"
                      ? `${duration}h aus ABO + CHF ${(memberChargedChf / 100).toFixed(0)} für Extras`
                      : `${duration}h from plan + CHF ${(memberChargedChf / 100).toFixed(0)} for extras`}
                  </span>
                ) : hasPartialHours ? (
                  <span className="text-emerald-700">
                    ✓ {l === "de"
                      ? `${memberHoursFromBalance}h aus ABO + CHF ${(memberChargedChf / 100).toFixed(0)}`
                      : `${memberHoursFromBalance}h from plan + CHF ${(memberChargedChf / 100).toFixed(0)}`}
                  </span>
                ) : (
                  <span className="text-amber-700">
                    {l === "de" ? "Keine Stunden — Karte wird verwendet" : "No hours left — card will be used"}
                  </span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Stepper */}
        <Stepper step={step} tx={tx} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-16 mt-10">
          {/* LEFT: step content */}
          <div className="min-h-[420px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <StepShell key="s1" title={tx.step_duration} helper={tx.duration_helper}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DURATIONS.map((d) => {
                      const active = duration === d.value;
                      const subLabel = d.subKey ? tx[d.subKey] : null;
                      return (
                        <button
                          key={d.value}
                          onClick={() => setDuration(d.value)}
                          className={`relative text-left p-5 border transition-all ${
                            active ? "border-brand bg-brand/5" : "border-accent/40 hover:border-brand/60"
                          }`}
                        >
                          {d.popular && (
                            <span className="absolute -top-2 right-4 bg-brand text-background text-[9px] uppercase tracking-widest px-2 py-0.5 font-semibold">
                              {tx.best_value}
                            </span>
                          )}
                          <div className="flex justify-between items-baseline">
                            <div>
                              <p className="font-seasons text-xl">{tx[d.labelKey]}</p>
                              {subLabel && <p className="text-[10px] uppercase tracking-widest text-foreground/50 mt-1">{subLabel}</p>}
                            </div>
                            <p className="font-seasons text-2xl text-brand">{formatChf(DEFAULT_PRICES[d.value])}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Good to know — premium gear is contact-only (link to the
                      equipment list PDF) and backdrop paper is billed on-site.
                      Replaces the removed add-ons step. */}
                  <div className="mt-6 border border-accent/40 bg-brand/5 p-4 text-sm">
                    <p className="text-[10px] uppercase tracking-widest text-foreground/60 mb-2">{tx.goodtoknow_title}</p>
                    <ul className="space-y-1.5 text-foreground/70">
                      <li className="flex items-start gap-2">
                        <span className="text-brand mt-0.5">•</span>
                        <span>
                          {tx.premium_note}{" "}
                          <a
                            href="/premium-equipment.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand underline whitespace-nowrap"
                          >
                            {tx.premium_link} →
                          </a>
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand mt-0.5">•</span>
                        <span>{tx.paper_note}</span>
                      </li>
                    </ul>
                  </div>
                </StepShell>
              )}

              {step === 2 && (
                <StepShell key="s2" title={tx.step_date} helper={tx.date_helper}>
                  <div className="bg-background border border-accent/40 p-4 rdp-wrapper">
                    <DayPicker
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={dfnsLocale[l]}
                      fromDate={new Date()}
                      toDate={addMonths(new Date(), 3)}
                      // Explicit disabled rule — fromDate restricts navigation
                      // but some react-day-picker versions still allow clicking
                      // a past day in the current month view. Adding the
                      // before:today disabled modifier hard-blocks selection
                      // (greys out + ignores clicks).
                      disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                      modifiersClassNames={{
                        selected: "bg-brand text-background rounded-none",
                        today: "font-bold underline",
                      }}
                    />
                  </div>
                </StepShell>
              )}

              {step === 3 && (
                <StepShell key="s3" title={tx.step_time} helper={tx.time_helper}>
                  {slotsLoading ? (
                    <p className="text-sm text-foreground/50">Loading…</p>
                  ) : slots.length === 0 ? (
                    <div className="border border-accent/40 p-8 text-center">
                      <p className="font-seasons text-xl">{tx.time_no_slots}</p>
                      <p className="text-sm text-foreground/60 mt-2">{tx.time_pick_other_day}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {slots.map((s) => {
                          const startHour = parseInt(s.split(":")[0], 10);
                          const isLateNight = duration && startHour + duration > 20;
                          return (
                            <button
                              key={s}
                              onClick={() => setTime(s)}
                              className={`relative py-3 border text-sm transition-all ${
                                time === s ? "bg-brand text-background border-brand" : "border-accent/40 hover:border-brand/60"
                              }`}
                            >
                              {s}
                              {isLateNight && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full" title={tx.time_late_night} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {slots.some((s) => duration && parseInt(s.split(":")[0], 10) + duration > 20) && (
                        <p className="text-[11px] text-foreground/50 mt-3 italic">• {tx.time_late_night}</p>
                      )}
                    </div>
                  )}
                </StepShell>
              )}

              {step === 4 && (
                <StepShell key="s5" title={tx.step_details} helper={tx.details_helper}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={tx.field_name} required value={details.name} onChange={(v) => setDetails((d) => ({ ...d, name: v }))} error={errors.name} />
                    <Field label={tx.field_email} type="email" required value={details.email} onChange={(v) => setDetails((d) => ({ ...d, email: v }))} error={errors.email} />
                    <Field label={tx.field_phone} type="tel" required value={details.phone} onChange={(v) => setDetails((d) => ({ ...d, phone: v }))} error={errors.phone} />
                    <Field label={tx.field_company} value={details.company} onChange={(v) => setDetails((d) => ({ ...d, company: v }))} />
                    <div className="sm:col-span-2">
                      <Field label={tx.field_street} required value={details.street} onChange={(v) => setDetails((d) => ({ ...d, street: v }))} error={errors.street} />
                    </div>
                    <Field label={tx.field_postal_code} required value={details.postalCode} onChange={(v) => setDetails((d) => ({ ...d, postalCode: v }))} error={errors.postalCode} />
                    <Field label={tx.field_city} required value={details.city} onChange={(v) => setDetails((d) => ({ ...d, city: v }))} error={errors.city} />
                    <div className="sm:col-span-2">
                      <Field label={tx.field_shoot_type} value={details.shootType} onChange={(v) => setDetails((d) => ({ ...d, shootType: v }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2">{tx.field_lang}</label>
                      <select
                        value={details.confirmationLang}
                        onChange={(e) => setDetails((d) => ({ ...d, confirmationLang: e.target.value as BookingLang }))}
                        className="w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand"
                      >
                        <option value="de">Deutsch</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="it">Italiano</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-start gap-3 mt-6 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-4 h-4 accent-brand" checked={details.terms} onChange={(e) => setDetails((d) => ({ ...d, terms: e.target.checked }))} />
                    <span className="text-sm text-foreground/70">
                      {tx.terms_text}{" "}
                      <a href="/terms" target="_blank" className="text-brand underline">
                        {tx.terms_link}
                      </a>
                    </span>
                  </label>
                  {errors.terms && <p className="text-xs text-brand mt-2">{errors.terms}</p>}
                </StepShell>
              )}

              {step === 5 && (
                <StepShell key="s6" title={tx.summary_title} helper={undefined}>
                  <div className="border border-accent/40 p-6 bg-background">
                    <SummaryRow label={tx.summary_duration} value={`${duration}h`} />
                    <SummaryRow label={tx.summary_date} value={date ? format(date, "EEEE, d MMM yyyy", { locale: dfnsLocale[l] }) : "—"} />
                    <SummaryRow label={tx.summary_time} value={time ?? "—"} />
                    {breakdown && breakdown.lateNightChf > 0 && (
                      <SummaryRow label={`${tx.summary_late_night} (${breakdown.lateNightHours}h)`} value={`+${formatChf(breakdown.lateNightChf)}`} />
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-[10px] uppercase tracking-widest text-foreground/60 mb-3">{tx.payment_helper}</p>
                    <div className={`grid gap-2 ${activeMembership ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
                      {activeMembership && (
                        <button
                          onClick={() => (hasEnoughHours || hasPartialHours) && setPaymentMethod("membership_hours")}
                          disabled={!hasEnoughHours && !hasPartialHours}
                          className={`p-3 border text-sm transition-all text-left ${
                            paymentMethod === "membership_hours"
                              ? "border-brand bg-brand/5"
                              : (hasEnoughHours || hasPartialHours)
                              ? "border-accent/40"
                              : "border-accent/30 text-foreground/40 cursor-not-allowed"
                          }`}
                          title={
                            !hasEnoughHours && !hasPartialHours
                              ? `Need ${duration}h, have ${activeMembership.hours_balance}h`
                              : undefined
                          }
                        >
                          {hasEnoughHours ? (
                            <span>⏱ {l === "de" ? "Mit Stunden" : "Use hours"} ({duration}h)</span>
                          ) : hasPartialHours ? (
                            <span className="block leading-tight">
                              ⏱ {l === "de"
                                ? `${partialHoursFromBalance}h + CHF ${(partialChargedChf / 100).toFixed(0)}`
                                : `${partialHoursFromBalance}h + CHF ${(partialChargedChf / 100).toFixed(0)}`}
                              <span className="block text-[10px] text-foreground/60 mt-0.5">
                                {l === "de"
                                  ? `${partialExtraHours}h × CHF 50`
                                  : `${partialExtraHours}h extra × CHF 50`}
                              </span>
                            </span>
                          ) : (
                            <span>⏱ {l === "de" ? "Mit Stunden" : "Use hours"} ({duration}h)</span>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setPaymentMethod("card_or_twint")}
                        className={`p-3 border text-sm transition-all ${paymentMethod === "card_or_twint" ? "border-brand bg-brand/5" : "border-accent/40"}`}
                      >
                        💳 {tx.payment_card_twint}
                      </button>
                      {/* Invoice (B2B) button removed 2026-05-22 — not offered
                          yet; will be re-enabled once business-customer flow
                          is rolled out. */}
                    </div>
                  </div>

                  {serverError && <p className="text-sm text-brand mt-4 border border-brand/30 bg-brand/5 p-3">{serverError}</p>}
                </StepShell>
              )}
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={back}
                disabled={step === 1}
                className="px-6 py-3 text-xs uppercase tracking-widest border border-accent/40 hover:border-brand transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← {tx.btn_back}
              </button>
              {step < 5 ? (
                <button
                  onClick={() => {
                    if (step === 4 && !validateStep4()) return;
                    next();
                  }}
                  disabled={(step === 1 && !duration) || (step === 2 && !date) || (step === 3 && !time)}
                  className="px-8 py-3 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover transition disabled:bg-accent/30 disabled:cursor-not-allowed"
                >
                  {tx.btn_next} →
                </button>
              ) : (
                <button
                  onClick={submitBooking}
                  disabled={submitting}
                  className="px-8 py-3 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "…" : tx.btn_pay}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: sticky summary */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-brand/40 bg-background p-6">
              <h3 className="font-seasons text-2xl text-brand mb-5">{tx.summary_title}</h3>
              <div className="space-y-2 text-sm">
                <SummaryRow label={tx.summary_duration} value={duration ? `${duration}h` : "—"} compact />
                <SummaryRow label={tx.summary_date} value={date ? format(date, "d MMM yyyy", { locale: dfnsLocale[l] }) : "—"} compact />
                <SummaryRow label={tx.summary_time} value={time ?? "—"} compact />
                {breakdown && breakdown.lateNightChf > 0 && (
                  <SummaryRow label={tx.summary_late_night} value={`+${formatChf(breakdown.lateNightChf)}`} compact />
                )}
              </div>
              <div className="border-t border-brand/40 mt-5 pt-5 flex justify-between items-end">
                <span className="text-sm font-seasons">{tx.summary_total}</span>
                <span className="text-3xl font-seasons text-brand">
                  {paymentMethod === "membership_hours" && (hasEnoughHours || hasPartialHours)
                    ? `CHF ${(memberChargedChf / 100).toFixed(0)}`
                    : breakdown ? formatChf(breakdown.totalChf) : "—"}
                </span>
              </div>
              {paymentMethod === "membership_hours" && (hasEnoughHours || hasPartialHours) && memberChargedChf > 0 && (
                <p className="mt-1 text-[11px] text-foreground/60 text-right italic">
                  {hasPartialHours ? (
                    l === "de"
                      ? `${memberHoursFromBalance}h aus ABO · ${memberExtraHours}h × CHF 50 + Extras`
                      : `${memberHoursFromBalance}h from plan · ${memberExtraHours}h × CHF 50 + extras`
                  ) : (
                    l === "de"
                      ? `${duration}h aus ABO · nur Extras`
                      : `${duration}h from plan · extras only`
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom DayPicker styling overrides */}
      <style jsx global>{`
        .rdp-wrapper .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #661414; --rdp-background-color: rgba(102, 20, 20, 0.08); margin: 0; }
        .rdp-wrapper .rdp-button:hover:not([disabled]) { background-color: rgba(102, 20, 20, 0.08); border-radius: 0; }
      `}</style>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function Stepper({ step, tx }: { step: Step; tx: (typeof bookingT)[BookingLang] }) {
  const labels = [tx.step_duration, tx.step_date, tx.step_time, tx.step_details, tx.step_summary];
  return (
    <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto">
      {labels.map((l, i) => {
        const idx = (i + 1) as Step;
        const active = step === idx;
        const done = step > idx;
        return (
          <div key={l} className="flex-1 flex items-center gap-2">
            <div className={`flex flex-col items-center gap-1 flex-1 ${active ? "text-brand" : done ? "text-foreground/60" : "text-foreground/30"}`}>
              <div
                className={`w-8 h-8 flex items-center justify-center text-xs font-semibold border ${
                  active ? "border-brand bg-brand text-background" : done ? "border-brand/60 text-brand" : "border-accent/40"
                }`}
              >
                {idx}
              </div>
              <span className="text-[9px] uppercase tracking-widest hidden sm:block">{l}</span>
            </div>
            {i < labels.length - 1 && <div className={`h-px flex-1 ${done ? "bg-brand/40" : "bg-accent/30"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function StepShell({ title, helper, children }: { title: string; helper?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="font-seasons text-2xl md:text-3xl mb-1">{title}</h2>
      {helper && <p className="text-sm text-foreground/60 mb-6">{helper}</p>}
      {children}
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 border bg-background text-sm focus:outline-none focus:border-brand ${error ? "border-brand" : "border-accent/40"}`}
      />
      {error && <p className="text-xs text-brand mt-1">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`flex justify-between items-baseline gap-3 ${compact ? "" : "py-1.5"}`}>
      <span className={`text-foreground/60 ${compact ? "text-xs" : "text-sm"}`}>{label}</span>
      <span className={`font-medium text-right ${compact ? "text-xs" : "text-sm"}`}>{value}</span>
    </div>
  );
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}
