"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import { useLang } from "@/contexts/LanguageContext";
import { PLANS, PLAN_KEYS, MINIMUM_MONTHS, type PlanKey } from "@/lib/memberships/plans";
import { formatChf } from "@/lib/booking/pricing";

export default function MembershipSignupPage() {
  return (
    <Suspense fallback={<div className="pt-40 text-center text-foreground/50">Loading…</div>}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const params = useSearchParams();
  const planFromUrl = params.get("plan") as PlanKey | null;
  const { lang } = useLang();
  const isDe = lang.toLowerCase() === "de";

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(
    planFromUrl && PLAN_KEYS.includes(planFromUrl) ? planFromUrl : "pro"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [terms, setTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = useMemo(() => PLANS[selectedPlan], [selectedPlan]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) {
      setError(isDe ? "Bitte AGB akzeptieren." : "Please accept the terms.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/membership/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          guest: { name: name.trim(), email: email.trim(), phone: phone.trim(), company: company.trim() || undefined },
          lang: lang.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? (isDe ? "Etwas ging schief." : "Something went wrong."));
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(isDe ? "Netzwerkfehler." : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pt-32 pb-32 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <Tag>{isDe ? "Mitgliedschaft" : "Membership"}</Tag>
          <h1 className="font-seasons text-4xl md:text-6xl mt-4">
            {isDe ? "Werde Mitglied" : "Become a member"}
          </h1>
          <p className="mt-3 text-foreground/60 max-w-md mx-auto">
            {isDe
              ? "Monatliches ABO mit Studiozeit und Profi-Equipment. Mindestlaufzeit 3 Monate."
              : "Monthly subscription with studio time and pro equipment. 3-month minimum."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16">
          {/* Plan picker */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-foreground/60 mb-2">
              {isDe ? "1. Plan auswählen" : "1. Pick a plan"}
            </p>
            {PLAN_KEYS.map((k) => {
              const p = PLANS[k];
              const active = selectedPlan === k;
              const features = isDe ? p.featuresDe : p.featuresEn;
              return (
                <motion.button
                  key={k}
                  type="button"
                  onClick={() => setSelectedPlan(k)}
                  className={`relative w-full text-left border p-6 transition-all ${
                    active ? "border-brand bg-brand/5" : "border-accent/40 hover:border-brand/60"
                  }`}
                  whileTap={{ scale: 0.99 }}
                >
                  {p.popular && (
                    <span className="absolute -top-2 right-6 bg-brand text-background text-[9px] uppercase tracking-widest px-2 py-0.5 font-semibold">
                      {isDe ? "Beliebteste Wahl" : "Most popular"}
                    </span>
                  )}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-seasons text-2xl">{isDe ? p.nameDe : p.nameEn}</h3>
                      <p className="text-xs uppercase tracking-widest text-foreground/50 mt-1">
                        {isDe ? p.taglineDe : p.taglineEn}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-seasons text-2xl text-brand">{formatChf(p.priceChfPerMonth)}</p>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/50">
                        / {isDe ? "Monat" : "month"}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-sm text-foreground/75">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-brand mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}

            <div className="border border-accent/30 bg-accent/10 p-4 text-xs text-foreground/70 mt-4">
              {isDe
                ? `Mindestlaufzeit ${MINIMUM_MONTHS} Monate. Stornierung danach jederzeit über das Kunden-Portal. Nicht genutzte Stunden übertragbar 1 Monat.`
                : `${MINIMUM_MONTHS}-month minimum term. Cancel anytime after that via the customer portal. Unused hours roll over 1 month.`}
            </div>
          </div>

          {/* Signup form */}
          <form onSubmit={submit} className="space-y-4 lg:sticky lg:top-32 self-start">
            <p className="text-[10px] uppercase tracking-widest text-foreground/60">
              {isDe ? "2. Deine Daten" : "2. Your details"}
            </p>

            <div className="border border-accent/40 bg-background p-6 space-y-4">
              <Field label={isDe ? "Name" : "Name"} required value={name} onChange={setName} />
              <Field label={isDe ? "E-Mail" : "Email"} type="email" required value={email} onChange={setEmail} />
              <Field label={isDe ? "Telefon" : "Phone"} required type="tel" value={phone} onChange={setPhone} />
              <Field label={isDe ? "Firma (optional)" : "Company (optional)"} value={company} onChange={setCompany} />

              <label className="flex items-start gap-3 mt-2 cursor-pointer pt-2 border-t border-accent/30">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-brand"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                <span className="text-xs text-foreground/70">
                  {isDe ? "Ich akzeptiere die" : "I agree to the"}{" "}
                  <a href="/terms" target="_blank" className="text-brand underline">
                    {isDe ? "AGB & Mitgliedschaftsbedingungen" : "Studio Rules & Membership Terms"}
                  </a>{" "}
                  {isDe ? "(inkl. Mindestlaufzeit 3 Monate)." : `(incl. ${MINIMUM_MONTHS}-month minimum).`}
                </span>
              </label>
            </div>

            {/* Total summary */}
            <div className="border border-brand/40 bg-background p-5">
              <div className="flex justify-between items-baseline">
                <p className="text-xs uppercase tracking-widest text-foreground/60">
                  {isDe ? plan.nameDe : plan.nameEn}
                </p>
                <p className="font-seasons text-2xl text-brand">{formatChf(plan.priceChfPerMonth)}</p>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-foreground/40 mt-1">
                {isDe ? "/ Monat (jederzeit nach 3 Monaten kündbar)" : `/ month (cancel after ${MINIMUM_MONTHS} months)`}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand text-background text-xs uppercase tracking-widest hover:bg-brand-hover disabled:opacity-50 transition"
            >
              {submitting ? "…" : isDe ? "Jetzt abonnieren" : "Subscribe now"}
            </button>

            {error && (
              <p className="text-sm text-brand border border-brand/30 bg-brand/5 p-3">{error}</p>
            )}

            <p className="text-[10px] text-foreground/50 text-center">
              {isDe ? "Schon Mitglied? " : "Already a member? "}
              <Link href="/login?next=/account" className="text-brand underline">
                {isDe ? "Anmelden" : "Sign in"}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand"
      />
    </div>
  );
}
