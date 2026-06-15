"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import Breadcrumbs from "@/components/Breadcrumbs";
import { bc } from "@/lib/breadcrumb-labels";
import CtaBanner from "@/components/ui/CtaBanner";
import { useLang } from "@/contexts/LanguageContext";
import { IS_MARKETING_MODE } from "@/lib/launch-mode";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const specs = {
  en: [
    { title: "Total Area", value: "60m²", desc: "Photography studio in Glattpark" },
    { title: "Location", value: "5th Floor", desc: "Natural light & open city views" },
    { title: "WiFi", value: "High-Speed", desc: "For uploading & content creation" },
    { title: "Backdrops", value: "Paper Rolls", desc: "White, Black & Beige seamless · CHF 15 per used meter" },
    { title: "Lighting", value: "Included", desc: "Godox Flash + Octabox modifiers" },
    { title: "Amenities", value: "Full Setup", desc: "Coffee, makeup corner, ironing & more" },
  ],
  de: [
    { title: "Fläche", value: "60m²", desc: "Fotostudio in Glattpark" },
    { title: "Lage", value: "5. Stock", desc: "Tageslicht & offene Aussicht" },
    { title: "WLAN", value: "High-Speed", desc: "Für Upload & Content Creation" },
    { title: "Hintergründe", value: "Papierrollen", desc: "Weiss, Schwarz & Beige nahtlos · CHF 15 pro verbrauchtem Meter" },
    { title: "Beleuchtung", value: "Inklusive", desc: "Godox Flash + Octabox Lichtformer" },
    { title: "Ausstattung", value: "Komplett", desc: "Kaffee, Make-up, Bügelstation u.v.m." },
  ],
  fr: [
    { title: "Surface", value: "60m²", desc: "Studio photo à Glattpark" },
    { title: "Emplacement", value: "5ème étage", desc: "Lumière naturelle & vues ouvertes" },
    { title: "WiFi", value: "Haut Débit", desc: "Pour upload & création de contenu" },
    { title: "Fonds", value: "Rouleaux Papier", desc: "Blanc, Noir & Beige sans couture · CHF 15 par mètre utilisé" },
    { title: "Éclairage", value: "Inclus", desc: "Flash Godox + modificateurs Octabox" },
    { title: "Commodités", value: "Setup Complet", desc: "Café, maquillage, repassage & plus" },
  ],
  it: [
    { title: "Superficie", value: "60m²", desc: "Studio fotografico a Glattpark" },
    { title: "Posizione", value: "5° piano", desc: "Luce naturale & viste aperte" },
    { title: "WiFi", value: "Alta Velocità", desc: "Per upload & creazione contenuti" },
    { title: "Sfondi", value: "Rotoli Carta", desc: "Bianco, Nero & Beige senza giunte · CHF 15 per metro utilizzato" },
    { title: "Illuminazione", value: "Inclusa", desc: "Flash Godox + modificatori Octabox" },
    { title: "Comfort", value: "Setup Completo", desc: "Caffè, trucco, stiratura & altro" },
  ],
};

const hourlyRates = {
  en: [
    { name: "Studio Rental", duration: "1 Hour", price: "CHF 70", popular: false },
    { name: "Studio Rental", duration: "2 Hours", price: "CHF 120", popular: false },
    { name: "Studio Rental", duration: "3 Hours", price: "CHF 180", popular: false },
    { name: "Half Day", duration: "4 Hours", price: "CHF 250", popular: true },
    { name: "Full Day", duration: "8 Hours", price: "CHF 490", popular: false },
  ],
  de: [
    { name: "Studio Miete", duration: "1 Stunde", price: "CHF 70", popular: false },
    { name: "Studio Miete", duration: "2 Stunden", price: "CHF 120", popular: false },
    { name: "Studio Miete", duration: "3 Stunden", price: "CHF 180", popular: false },
    { name: "Halbtag", duration: "4 Stunden", price: "CHF 250", popular: true },
    { name: "Ganztag", duration: "8 Stunden", price: "CHF 490", popular: false },
  ],
  fr: [
    { name: "Location Studio", duration: "1 heure", price: "CHF 70", popular: false },
    { name: "Location Studio", duration: "2 heures", price: "CHF 120", popular: false },
    { name: "Location Studio", duration: "3 heures", price: "CHF 180", popular: false },
    { name: "Demi-Journée", duration: "4 heures", price: "CHF 250", popular: true },
    { name: "Journée Complète", duration: "8 heures", price: "CHF 490", popular: false },
  ],
  it: [
    { name: "Affitto Studio", duration: "1 ora", price: "CHF 70", popular: false },
    { name: "Affitto Studio", duration: "2 ore", price: "CHF 120", popular: false },
    { name: "Affitto Studio", duration: "3 ore", price: "CHF 180", popular: false },
    { name: "Mezza Giornata", duration: "4 ore", price: "CHF 250", popular: true },
    { name: "Giornata Intera", duration: "8 ore", price: "CHF 490", popular: false },
  ],
};

const memberships = {
  en: [
    {
      name: "Starter Creator",
      price: "CHF 220",
      duration: "per month",
      features: [
        "4 hours / month",
        "Flexible use, subject to availability",
        "Basic studio access",
        "Extra hours bookable at CHF 50 / h",
      ],
      popular: false,
    },
    {
      name: "Pro Creator",
      price: "CHF 420",
      duration: "per month",
      features: [
        "9 hours / month (8h + 1h bonus)",
        "Priority booking",
        "Full equipment included",
        "Lighting setup included",
        "Extra hours bookable at CHF 50 / h",
      ],
      popular: true,
    },
    {
      name: "Studio Unlimited",
      price: "CHF 780",
      duration: "per month",
      features: [
        "16 hours / month",
        "Priority access",
        "Full equipment included",
        "Lighting setup included",
        "Flexible use",
      ],
      popular: false,
    },
  ],
  de: [
    {
      name: "Starter Creator",
      price: "CHF 220",
      duration: "pro Monat",
      features: [
        "4 Stunden / Monat",
        "Flexible Nutzung nach Verfügbarkeit",
        "Basic Studio Zugang",
        "Extra Stunden für CHF 50 / h zubuchbar",
      ],
      popular: false,
    },
    {
      name: "Pro Creator",
      price: "CHF 420",
      duration: "pro Monat",
      features: [
        "9 Stunden / Monat (8h + 1h Bonus)",
        "Prioritätsbuchung",
        "Komplettes Equipment inklusive",
        "Zusatzlicht Setup inklusive",
        "Extra Stunden für CHF 50 / h zubuchbar",
      ],
      popular: true,
    },
    {
      name: "Studio Unlimited",
      price: "CHF 780",
      duration: "pro Monat",
      features: [
        "16 Stunden / Monat",
        "Prioritätszugang",
        "Komplettes Equipment inklusive",
        "Zusatzlicht Setup inklusive",
        "Flexible Nutzung",
      ],
      popular: false,
    },
  ],
  fr: [
    {
      name: "Starter Creator",
      price: "CHF 220",
      duration: "par mois",
      features: [
        "4 heures / mois",
        "Utilisation flexible selon disponibilité",
        "Accès studio basique",
        "Heures supplémentaires à CHF 50 / h",
      ],
      popular: false,
    },
    {
      name: "Pro Creator",
      price: "CHF 420",
      duration: "par mois",
      features: [
        "9 heures / mois (8h + 1h bonus)",
        "Réservation prioritaire",
        "Équipement complet inclus",
        "Setup éclairage inclus",
        "Heures supplémentaires à CHF 50 / h",
      ],
      popular: true,
    },
    {
      name: "Studio Unlimited",
      price: "CHF 780",
      duration: "par mois",
      features: [
        "16 heures / mois",
        "Accès prioritaire",
        "Équipement complet inclus",
        "Setup éclairage inclus",
        "Utilisation flexible",
      ],
      popular: false,
    },
  ],
  it: [
    {
      name: "Starter Creator",
      price: "CHF 220",
      duration: "al mese",
      features: [
        "4 ore / mese",
        "Uso flessibile in base alla disponibilità",
        "Accesso studio base",
        "Ore extra a CHF 50 / h",
      ],
      popular: false,
    },
    {
      name: "Pro Creator",
      price: "CHF 420",
      duration: "al mese",
      features: [
        "9 ore / mese (8h + 1h bonus)",
        "Prenotazione prioritaria",
        "Attrezzatura completa inclusa",
        "Setup luci inclusi",
        "Ore extra a CHF 50 / h",
      ],
      popular: true,
    },
    {
      name: "Studio Unlimited",
      price: "CHF 780",
      duration: "al mese",
      features: [
        "16 ore / mese",
        "Accesso prioritario",
        "Attrezzatura completa inclusa",
        "Setup luci inclusi",
        "Uso flessibile",
      ],
      popular: false,
    },
  ],
};

// Add-ons data removed from this page — see booking flow for live pricing.

const conditions = {
  en: [
    { label: "Minimum term", value: "3 months" },
    { label: "Hour rollover", value: "Unused hours carry over for max. 1 month" },
    { label: "Availability", value: "Subject to availability (priority depends on plan)" },
  ],
  de: [
    { label: "Mindestlaufzeit", value: "3 Monate" },
    { label: "Stundenübertrag", value: "Nicht genutzte Stunden sind max. 1 Monat übertragbar" },
    { label: "Nutzung", value: "Nach Verfügbarkeit (Priorität je nach Plan)" },
  ],
  fr: [
    { label: "Durée minimum", value: "3 mois" },
    { label: "Report d'heures", value: "Les heures non utilisées sont reportables max. 1 mois" },
    { label: "Utilisation", value: "Selon disponibilité (priorité selon le forfait)" },
  ],
  it: [
    { label: "Durata minima", value: "3 mesi" },
    { label: "Riporto ore", value: "Le ore non utilizzate sono riportabili max. 1 mese" },
    { label: "Utilizzo", value: "In base alla disponibilità (priorità secondo il piano)" },
  ],
};

const t = {
  en: {
    tag: "Rental Rates",
    h1: "Pricing & Memberships",
    intro: "We provide the premium infrastructure, you provide the vision. Choose between flexible hourly rates or join our ABO subscription tiers for recurring monthly value.",
    specsTag: "Studio Specifications",
    specsH2: "What's included in every rental",
    hourlyTag: "Flexible Booking",
    hourlyH2: "Hourly Rates",
    membershipsTag: "ABO Memberships",
    membershipsH2: "Studio Memberships",
    addonsTag: "Add-ons",
    addonsH3: "Optional Add-ons",
    conditionsH3: "Membership Conditions",
    popular: "Most Popular",
    bestValue: "Best Value",
    galleryTag: "Gallery",
    galleryH2: "Inside the Studio",
  },
  de: {
    tag: "Mietpreise",
    h1: "Preise & ABO",
    intro: "Wir bieten die professionelle Infrastruktur – Sie bringen die kreative Vision. Wählen Sie zwischen flexiblen Stundentarifen oder einem monatlichen ABO-Membership.",
    specsTag: "Studio Spezifikationen",
    specsH2: "Im Preis inbegriffen",
    hourlyTag: "Flexible Buchung",
    hourlyH2: "Stundentarife",
    membershipsTag: "ABO Memberships",
    membershipsH2: "Studio Mitgliedschaften",
    addonsTag: "Zusatzoptionen",
    addonsH3: "Optionale Add-ons",
    conditionsH3: "Mitgliedschaftsbedingungen",
    popular: "Beliebteste Wahl",
    bestValue: "Bestes Angebot",
    galleryTag: "Galerie",
    galleryH2: "Im Studio",
  },
  fr: {
    tag: "Tarifs Location",
    h1: "Tarifs & Forfaits",
    intro: "Nous fournissons l'infrastructure premium, vous apportez la vision. Choisissez entre des tarifs horaires flexibles ou rejoignez nos forfaits d'abonnement mensuel.",
    specsTag: "Spécifications Studio",
    specsH2: "Inclus dans chaque location",
    hourlyTag: "Réservation Flexible",
    hourlyH2: "Tarifs Horaires",
    membershipsTag: "Forfaits ABO",
    membershipsH2: "Forfaits Studio",
    addonsTag: "Options",
    addonsH3: "Options Supplémentaires",
    conditionsH3: "Conditions d'Abonnement",
    popular: "Plus Populaire",
    bestValue: "Meilleure Offre",
    galleryTag: "Galerie",
    galleryH2: "À l'intérieur du studio",
  },
  it: {
    tag: "Tariffe Affitto",
    h1: "Tariffe & Abbonamenti",
    intro: "Offriamo l'infrastruttura premium, voi portate la visione. Scegli tra tariffe orarie flessibili o un abbonamento mensile ABO.",
    specsTag: "Specifiche Studio",
    specsH2: "Incluso in ogni prenotazione",
    hourlyTag: "Prenotazione Flessibile",
    hourlyH2: "Tariffe Orarie",
    membershipsTag: "Abbonamenti ABO",
    membershipsH2: "Abbonamenti Studio",
    addonsTag: "Extra",
    addonsH3: "Extra Opzionali",
    conditionsH3: "Condizioni Abbonamento",
    popular: "Più Popolare",
    bestValue: "Miglior Valore",
    galleryTag: "Galleria",
    galleryH2: "Dentro lo Studio",
  },
};

export default function StudioPage() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as "en" | "de" | "fr" | "it";
  const tx = t[l];

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Breadcrumbs items={bc(l, "pricing")} className="mb-8" />
        {/* Header */}
        <motion.div {...fadeUp}>
          <Tag>{tx.tag}</Tag>
          <h1 className="font-seasons text-6xl md:text-7xl mt-4">{tx.h1}</h1>
          <p className="mt-6 text-foreground/60 max-w-lg leading-relaxed text-lg">{tx.intro}</p>
        </motion.div>


        {/* Hourly Rates (now the first content section after the gallery —
            users see pricing first, then memberships, then add-ons, then
            policy, with the specs/inclusions appearing at the very bottom
            as a reference rather than a buy-decision input). */}
        <motion.div className="mt-24" {...fadeUp}>
          <Tag>{tx.hourlyTag}</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">{tx.hourlyH2}</h2>
          <div className="mt-12 max-w-3xl border border-accent/40 bg-background">
            {hourlyRates[l].map((row, i) => (
              <motion.div
                key={i}
                className={`grid grid-cols-[1fr_auto_auto] gap-3 md:gap-8 items-center px-5 md:px-8 py-5 md:py-6 transition-colors ${
                  i !== hourlyRates[l].length - 1 ? "border-b border-accent/30" : ""
                } ${row.popular ? "bg-brand/5" : "hover:bg-brand/5"}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.06 }}
              >
                <div>
                  <p className="font-seasons text-base md:text-xl">{row.name}</p>
                  {row.popular && (
                    <span className="inline-block mt-0.5 text-[9px] md:text-[10px] uppercase tracking-widest text-brand font-bold">
                      {tx.bestValue}
                    </span>
                  )}
                </div>
                <div className="text-[10px] md:text-sm uppercase tracking-widest text-foreground/60 whitespace-nowrap">
                  {row.duration}
                </div>
                <div className="font-seasons text-lg md:text-2xl text-brand whitespace-nowrap text-right min-w-[72px]">
                  {row.price}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Add-ons section removed from this page on 2026-05-22 — the live
            pricing for lighting/backdrops/late-night is shown inside the
            booking flow (step 4) where it matters. Keeping it on /studio
            duplicated info and risked drift if prices change. */}

        {/* ABO Memberships */}
        <motion.div className="mt-24" {...fadeUp}>
          <Tag>{tx.membershipsTag}</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">{tx.membershipsH2}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {memberships[l].map((plan, i) => (
              <motion.div
                key={i}
                className={`relative border p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-lg bg-background ${
                  plan.popular ? "border-brand border-2" : "border-accent/40"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-8 bg-brand text-background text-[10px] md:text-xs uppercase tracking-widest px-3 py-1 font-bold">
                    {tx.bestValue}
                  </span>
                )}
                <h3 className="font-seasons text-2xl font-semibold">{plan.name}</h3>
                <p className="text-3xl lg:text-4xl font-seasons text-brand mt-4">{plan.price}</p>
                <p className="text-xs uppercase tracking-widest text-foreground/50 mt-2 pb-6 border-b border-accent/30">{plan.duration}</p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-foreground/70 flex items-start gap-3">
                      <span className="text-brand font-bold mt-0.5">•</span>
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={
                    IS_MARKETING_MODE
                      ? "/coming-soon"
                      : `/membership/signup?plan=${
                          i === 0 ? "starter" : i === 1 ? "pro" : "unlimited"
                        }`
                  }
                  className={`mt-8 block text-center py-3 text-xs uppercase tracking-widest transition ${
                    plan.popular
                      ? "bg-brand text-background hover:bg-brand-hover"
                      : "border border-brand text-brand hover:bg-brand hover:text-background"
                  }`}
                >
                  {IS_MARKETING_MODE
                    ? l === "de" ? "Bald verfügbar" : l === "fr" ? "Bientôt disponible" : l === "it" ? "Presto disponibile" : "Coming Soon"
                    : l === "de" ? "Mitglied werden" : l === "fr" ? "Devenir membre" : l === "it" ? "Diventa membro" : "Become a member"} →
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Conditions */}
        <motion.div
          className="mt-10 bg-brand/5 border border-brand/20 p-8 rounded-sm max-w-7xl"
          {...fadeUp}
        >
          <h3 className="font-seasons text-xl text-brand mb-4">{tx.conditionsH3}</h3>
          <ul className="text-sm text-foreground/70 space-y-2 font-sans">
            {conditions[l].map((c, i) => (
              <li key={i}>
                <span className="font-semibold text-foreground">{c.label}:</span> {c.value}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Specs Grid — now at the bottom as a reference section. The
            "What's included" subheading is removed so the Tag alone
            ("Studio Specifications") leads in. */}
        <motion.div className="mt-24" {...fadeUp}>
          <Tag>{tx.specsTag}</Tag>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {specs[l].map((spec, i) => (
              <motion.div
                key={i}
                className="border border-accent p-5 sm:p-6 md:p-8 hover:border-brand transition-colors duration-500 bg-background"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              >
                <p className="text-2xl sm:text-3xl md:text-4xl font-seasons text-brand break-words hyphens-auto" lang={l}>
                  {spec.value}
                </p>
                <p className="text-xs sm:text-sm uppercase tracking-widest mt-3 font-semibold break-words" lang={l}>
                  {spec.title}
                </p>
                <p className="text-xs text-foreground/70 mt-1">{spec.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <CtaBanner />
    </div>
  );
}
