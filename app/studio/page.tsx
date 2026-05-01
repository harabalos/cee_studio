"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";
import { useLang } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

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

function StudioCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % images.length);
    }, 5500);
    return () => clearInterval(id);
  }, [images.length]);

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden bg-foreground/5">
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={index}
          className="absolute inset-0"
          custom={direction}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <Image
            src={images[index]}
            alt={`Studio space ${index + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-background/80 hover:bg-background backdrop-blur-md text-brand flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-background/80 hover:bg-background backdrop-blur-md text-brand flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-10 bg-background" : "w-1.5 bg-background/50 hover:bg-background/80"
            }`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute top-6 right-6 z-10 text-background text-xs font-sans tracking-widest uppercase font-semibold drop-shadow-lg">
        {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
      </div>
    </div>
  );
}

const specs = {
  en: [
    { title: "Total Area", value: "60m²", desc: "Photography studio in Glattpark" },
    { title: "Location", value: "5th Floor", desc: "Natural light & open city views" },
    { title: "WiFi", value: "High-Speed", desc: "For uploading & content creation" },
    { title: "Backdrops", value: "Paper Rolls", desc: "White, Black & Beige seamless" },
    { title: "Lighting", value: "Included", desc: "Godox Flash + Octabox modifiers" },
    { title: "Amenities", value: "Full Setup", desc: "Coffee, makeup corner, ironing & more" },
  ],
  de: [
    { title: "Fläche", value: "60m²", desc: "Fotostudio in Glattpark" },
    { title: "Lage", value: "5. Stock", desc: "Tageslicht & offene Aussicht" },
    { title: "WLAN", value: "High-Speed", desc: "Für Upload & Content Creation" },
    { title: "Hintergründe", value: "Papierrollen", desc: "Weiss, Schwarz & Beige nahtlos" },
    { title: "Beleuchtung", value: "Inklusive", desc: "Godox Flash + Octabox Lichtformer" },
    { title: "Ausstattung", value: "Komplett", desc: "Kaffee, Make-up, Bügelstation u.v.m." },
  ],
  fr: [
    { title: "Surface", value: "60m²", desc: "Studio photo à Glattpark" },
    { title: "Emplacement", value: "5ème étage", desc: "Lumière naturelle & vues ouvertes" },
    { title: "WiFi", value: "Haut Débit", desc: "Pour upload & création de contenu" },
    { title: "Fonds", value: "Rouleaux Papier", desc: "Blanc, Noir & Beige sans couture" },
    { title: "Éclairage", value: "Inclus", desc: "Flash Godox + modificateurs Octabox" },
    { title: "Commodités", value: "Setup Complet", desc: "Café, maquillage, repassage & plus" },
  ],
  it: [
    { title: "Superficie", value: "60m²", desc: "Studio fotografico a Glattpark" },
    { title: "Posizione", value: "5° piano", desc: "Luce naturale & viste aperte" },
    { title: "WiFi", value: "Alta Velocità", desc: "Per upload & creazione contenuti" },
    { title: "Sfondi", value: "Rotoli Carta", desc: "Bianco, Nero & Beige senza giunte" },
    { title: "Illuminazione", value: "Inclusa", desc: "Flash Godox + modificatori Octabox" },
    { title: "Comfort", value: "Setup Completo", desc: "Caffè, trucco, stiratura & altro" },
  ],
};

const hourlyRates = {
  en: [
    { name: "Studio Rental", duration: "1 Hour", price: "CHF 70", popular: false },
    { name: "Studio Rental", duration: "2 Hours", price: "CHF 120", popular: false },
    { name: "Studio Rental", duration: "3 Hours", price: "CHF 165", popular: false },
    { name: "Half Day", duration: "4 Hours", price: "CHF 250", popular: true },
    { name: "Full Day", duration: "8 Hours", price: "CHF 490", popular: false },
  ],
  de: [
    { name: "Studio Miete", duration: "1 Stunde", price: "CHF 70", popular: false },
    { name: "Studio Miete", duration: "2 Stunden", price: "CHF 120", popular: false },
    { name: "Studio Miete", duration: "3 Stunden", price: "CHF 165", popular: false },
    { name: "Halbtag", duration: "4 Stunden", price: "CHF 250", popular: true },
    { name: "Ganztag", duration: "8 Stunden", price: "CHF 490", popular: false },
  ],
  fr: [
    { name: "Location Studio", duration: "1 heure", price: "CHF 70", popular: false },
    { name: "Location Studio", duration: "2 heures", price: "CHF 120", popular: false },
    { name: "Location Studio", duration: "3 heures", price: "CHF 165", popular: false },
    { name: "Demi-Journée", duration: "4 heures", price: "CHF 250", popular: true },
    { name: "Journée Complète", duration: "8 heures", price: "CHF 490", popular: false },
  ],
  it: [
    { name: "Affitto Studio", duration: "1 ora", price: "CHF 70", popular: false },
    { name: "Affitto Studio", duration: "2 ore", price: "CHF 120", popular: false },
    { name: "Affitto Studio", duration: "3 ore", price: "CHF 165", popular: false },
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

const addons = {
  en: [
    { label: "Additional Lighting Setup", price: "CHF 20" },
    { label: "All Backdrops Access", price: "CHF 30" },
    { label: "Podcast Setup", price: "CHF 40" },
    { label: "Late Night (from 20:00)", price: "+CHF 10 / hour" },
  ],
  de: [
    { label: "Zusatzlicht Setup", price: "CHF 20" },
    { label: "Alle Backdrops nutzen", price: "CHF 30" },
    { label: "Podcast Setup", price: "CHF 40" },
    { label: "Late Night (ab 20:00)", price: "+CHF 10 / Stunde" },
  ],
  fr: [
    { label: "Setup Éclairage Supplémentaire", price: "CHF 20" },
    { label: "Accès à tous les Fonds", price: "CHF 30" },
    { label: "Setup Podcast", price: "CHF 40" },
    { label: "Late Night (dès 20:00)", price: "+CHF 10 / heure" },
  ],
  it: [
    { label: "Setup Illuminazione Extra", price: "CHF 20" },
    { label: "Accesso a Tutti gli Sfondi", price: "CHF 30" },
    { label: "Setup Podcast", price: "CHF 40" },
    { label: "Late Night (dalle 20:00)", price: "+CHF 10 / ora" },
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
    addonsH3: "Optional Add-ons",
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
    addonsH3: "Optionale Add-ons",
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
    addonsH3: "Options Supplémentaires",
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
    addonsH3: "Extra Opzionali",
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

        {/* Image Carousel */}
        <motion.div className="mt-16" {...fadeUp}>
          <StudioCarousel images={galleryImages} />
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

        {/* Add-ons (rental) */}
        <motion.div className="mt-16 max-w-7xl" {...fadeUp}>
          <Tag>{tx.addonsTag}</Tag>
          <h3 className="font-seasons text-3xl mt-2 mb-8">{tx.addonsH3}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {addons[l].map((item, i) => (
              <div key={i} className="border border-accent/40 p-6 bg-background flex flex-col gap-2">
                <p className="text-sm uppercase tracking-widest text-foreground/50 font-semibold">{item.label}</p>
                <p className="font-seasons text-2xl text-brand">{item.price}</p>
              </div>
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
      </div>

      <CtaBanner />
    </div>
  );
}
