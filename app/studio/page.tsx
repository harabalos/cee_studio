"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";
import { useLang } from "@/contexts/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const galleryImages = [
  "/images/studio-hero.jpg",
  "/images/lounge-alt.jpg",
  "/images/makeup-area.jpg",
  "/images/cyc-wall.jpg",
];

const specs = {
  en: [
    { title: "Total Area", value: "200m²", desc: "Open-plan studio floor" },
    { title: "Ceiling Height", value: "4.5m", desc: "Allows full-height lighting modifiers" },
    { title: "Base Equipment", value: "Included", desc: "C-Stands, Sandbags, & Apple Boxes" },
    { title: "Backdrops", value: "Available", desc: "Arctic White, Black, Grey & Colors" },
    { title: "Client Lounge", value: "Included", desc: "Wi-Fi, 4K Monitor, Espresso" },
    { title: "Access", value: "Smart PIN", desc: "24/7 keyless access for renters" },
  ],
  de: [
    { title: "Fläche", value: "200m²", desc: "Offener Grundriss" },
    { title: "Deckenhöhe", value: "4.5m", desc: "Für vollständige Lichtmodifikatoren" },
    { title: "Grundausstattung", value: "Inklusive", desc: "C-Stands, Sandsäcke & Apple Boxes" },
    { title: "Hintergründe", value: "Verfügbar", desc: "Arktikweiß, Schwarz, Grau & Farben" },
    { title: "Client Lounge", value: "Inklusive", desc: "Wi-Fi, 4K Monitor, Espresso" },
    { title: "Zugang", value: "Smart PIN", desc: "24/7 Schlüsselloser Zugang" },
  ],
  fr: [
    { title: "Surface", value: "200m²", desc: "Plan ouvert" },
    { title: "Hauteur Plafond", value: "4.5m", desc: "Pour modificateurs lumière pleine hauteur" },
    { title: "Équipement Base", value: "Inclus", desc: "C-Stands, sacs de sable & Apple Boxes" },
    { title: "Fonds", value: "Disponibles", desc: "Blanc, Noir, Gris & couleurs" },
    { title: "Salon Client", value: "Inclus", desc: "Wi-Fi, écran 4K, Espresso" },
    { title: "Accès", value: "Smart PIN", desc: "Accès sans clé 24/7" },
  ],
  it: [
    { title: "Superficie", value: "200m²", desc: "Pianta aperta" },
    { title: "Altezza Soffitto", value: "4.5m", desc: "Per modificatori luce a piena altezza" },
    { title: "Attrezzatura Base", value: "Inclusa", desc: "C-Stand, sacchi di sabbia & Apple Box" },
    { title: "Sfondi", value: "Disponibili", desc: "Bianco, Nero, Grigio & colori" },
    { title: "Client Lounge", value: "Inclusa", desc: "Wi-Fi, monitor 4K, Espresso" },
    { title: "Accesso", value: "Smart PIN", desc: "Accesso senza chiavi 24/7" },
  ],
};

const hourlyRates = {
  en: [
    {
      name: "A La Carte (Hourly)",
      price: "CHF 100",
      duration: "Per Hour",
      features: ["Minimum 2-hours booking", "Access to all 4 physical zones", "Basic grip equipment included", "On-site parking spot"],
      popular: false,
    },
    {
      name: "Full Day Lockout",
      price: "CHF 650",
      duration: "8 Hours",
      features: [
        "Access to all 4 physical zones",
        "Basic grip equipment included",
        "Priority load-in / load-out area",
        "Client lounge & espresso bar",
        "2x Parking spots included",
      ],
      popular: true,
    },
  ],
  de: [
    {
      name: "A La Carte (Stündlich)",
      price: "CHF 100",
      duration: "Pro Stunde",
      features: ["Mindestbuchung 2 Stunden", "Zugang zu allen 4 Zonen", "Grundausstattung inklusive", "Parkplatz vor Ort"],
      popular: false,
    },
    {
      name: "Ganztages-Buchung",
      price: "CHF 650",
      duration: "8 Stunden",
      features: [
        "Zugang zu allen 4 Zonen",
        "Grundausstattung inklusive",
        "Priorität beim Ein- und Ausladen",
        "Client Lounge & Espresso Bar",
        "2 Parkplätze inklusive",
      ],
      popular: true,
    },
  ],
  fr: [
    {
      name: "À la Carte (Horaire)",
      price: "CHF 100",
      duration: "Par heure",
      features: ["Réservation minimum 2 heures", "Accès aux 4 zones", "Équipement de base inclus", "Place de parking sur site"],
      popular: false,
    },
    {
      name: "Journée Complète",
      price: "CHF 650",
      duration: "8 heures",
      features: [
        "Accès aux 4 zones",
        "Équipement de base inclus",
        "Priorité chargement / déchargement",
        "Salon client & espresso bar",
        "2 places de parking incluses",
      ],
      popular: true,
    },
  ],
  it: [
    {
      name: "À la Carte (Orario)",
      price: "CHF 100",
      duration: "All'ora",
      features: ["Prenotazione minima 2 ore", "Accesso a tutte le 4 zone", "Attrezzatura base inclusa", "Posto auto sul posto"],
      popular: false,
    },
    {
      name: "Giornata Intera",
      price: "CHF 650",
      duration: "8 ore",
      features: [
        "Accesso a tutte le 4 zone",
        "Attrezzatura base inclusa",
        "Priorità carico / scarico",
        "Lounge clienti & espresso bar",
        "2 posti auto inclusi",
      ],
      popular: true,
    },
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

const addons = {
  en: [
    { label: "Extra Hour", price: "CHF 50" },
    { label: "Weekend Priority", price: "CHF 50 / month" },
    { label: "Lighting Setup", price: "incl. with Pro & Unlimited" },
  ],
  de: [
    { label: "Extra Stunde", price: "CHF 50" },
    { label: "Weekend Priority", price: "CHF 50 / Monat" },
    { label: "Zusatzlicht Setup", price: "inkl. bei Pro & Unlimited" },
  ],
  fr: [
    { label: "Heure Supplémentaire", price: "CHF 50" },
    { label: "Priorité Weekend", price: "CHF 50 / mois" },
    { label: "Setup Éclairage", price: "inclus avec Pro & Unlimited" },
  ],
  it: [
    { label: "Ora Extra", price: "CHF 50" },
    { label: "Priorità Weekend", price: "CHF 50 / mese" },
    { label: "Setup Luci", price: "incl. con Pro & Unlimited" },
  ],
};

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
    addonsH3: "Add-ons for Members",
    conditionsH3: "Membership Conditions",
    popular: "Most Popular",
    bestValue: "Best Value",
  },
  de: {
    tag: "Mietpreise",
    h1: "Preise & Mitgliedschaften",
    intro: "Wir bieten die professionelle Infrastruktur – Sie bringen die kreative Vision. Wählen Sie zwischen flexiblen Stundentarifen oder einem monatlichen ABO-Membership.",
    specsTag: "Studio Spezifikationen",
    specsH2: "Im Preis inbegriffen",
    hourlyTag: "Flexible Buchung",
    hourlyH2: "Stundentarife",
    membershipsTag: "ABO Memberships",
    membershipsH2: "Studio Mitgliedschaften",
    addonsTag: "Zusatzoptionen",
    addonsH3: "Add-ons für Members",
    conditionsH3: "Mitgliedschaftsbedingungen",
    popular: "Beliebteste Wahl",
    bestValue: "Bestes Angebot",
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
    addonsH3: "Options pour Membres",
    conditionsH3: "Conditions d'Abonnement",
    popular: "Plus Populaire",
    bestValue: "Meilleure Offre",
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
    addonsH3: "Extra per Membri",
    conditionsH3: "Condizioni Abbonamento",
    popular: "Più Popolare",
    bestValue: "Miglior Valore",
  },
};

export default function StudioPage() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as "en" | "de" | "fr" | "it";
  const tx = t[l];

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div {...fadeUp}>
          <Tag>{tx.tag}</Tag>
          <h1 className="font-seasons text-6xl md:text-7xl mt-4">{tx.h1}</h1>
          <p className="mt-6 text-foreground/60 max-w-lg leading-relaxed text-lg">{tx.intro}</p>
        </motion.div>

        {/* Horizontal Scroll Gallery */}
        <motion.div
          className="mt-16 -mx-6 md:-mx-10 px-6 md:px-10 overflow-x-auto"
          {...fadeUp}
        >
          <div className="flex gap-4 snap-x snap-mandatory pb-4" style={{ minWidth: "max-content" }}>
            {galleryImages.map((src, i) => (
              <div
                key={i}
                className="relative w-[80vw] md:w-[50vw] h-[50vh] flex-shrink-0 snap-center overflow-hidden grain-overlay"
              >
                <Image
                  src={src}
                  alt={`Studio space ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 80vw, 50vw"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Specs Grid */}
        <motion.div className="mt-24" {...fadeUp}>
          <Tag>{tx.specsTag}</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">{tx.specsH2}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
            {specs[l].map((spec, i) => (
              <motion.div
                key={i}
                className="border border-accent p-6 md:p-8 hover:border-brand transition-colors duration-500 bg-background"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-seasons text-brand">{spec.value}</p>
                <p className="text-sm uppercase tracking-widest mt-3 font-semibold">{spec.title}</p>
                <p className="text-xs text-foreground/70 mt-1">{spec.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hourly Rates */}
        <motion.div className="mt-32" {...fadeUp}>
          <Tag>{tx.hourlyTag}</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">{tx.hourlyH2}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-3xl">
            {hourlyRates[l].map((plan, i) => (
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
                    {tx.popular}
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
              </motion.div>
            ))}
          </div>
        </motion.div>

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
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Add-ons */}
        <motion.div className="mt-16 max-w-4xl" {...fadeUp}>
          <Tag>{tx.addonsTag}</Tag>
          <h3 className="font-seasons text-3xl mt-2 mb-8">{tx.addonsH3}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {addons[l].map((item, i) => (
              <div key={i} className="border border-accent/40 p-6 bg-background flex flex-col gap-2">
                <p className="text-sm uppercase tracking-widest text-foreground/50 font-semibold">{item.label}</p>
                <p className="font-seasons text-2xl text-brand">{item.price}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Conditions */}
        <motion.div
          className="mt-10 bg-brand/5 border border-brand/20 p-8 rounded-sm max-w-4xl"
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
      </div>

      <CtaBanner />
    </div>
  );
}
