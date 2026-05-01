"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import CtaBanner from "@/components/ui/CtaBanner";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const galleryImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&h=800&fit=crop",
];

const specs = [
  { title: "Total Area", value: "200m²", desc: "Open-plan studio floor" },
  { title: "Ceiling Height", value: "4.5m", desc: "Allows full-height lighting modifiers" },
  { title: "Base Equipment", value: "Included", desc: "C-Stands, Sandbags, & Apple Boxes" },
  { title: "Backdrops", value: "Available", desc: "Arctic White, Black, Grey & Colors" },
  { title: "Client Lounge", value: "Included", desc: "Wi-Fi, 4K Monitor, Espresso" },
  { title: "Access", value: "Smart PIN", desc: "24/7 keyless access for renters" },
];

const hourlyRates = [
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
];

const memberships = [
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
];

export default function StudioPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div {...fadeUp}>
          <Tag>Rental Rates</Tag>
          <h1 className="font-seasons text-6xl md:text-7xl mt-4">Pricing & Memberships</h1>
          <p className="mt-6 text-foreground/60 max-w-lg leading-relaxed text-lg">
            We provide the premium infrastructure, you provide the vision.
            Choose between flexible hourly rates or join our ABO subscription tiers for recurring monthly value.
          </p>
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
          <Tag>Studio Specifications</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">What&apos;s included in every rental</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
            {specs.map((spec, i) => (
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
          <Tag>Flexible Buchung</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">Stundentarife</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-3xl">
            {hourlyRates.map((plan, i) => (
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
                    Most Popular
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
          <Tag>ABO Memberships</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">Studio Memberships</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {memberships.map((plan, i) => (
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
                    Best Value
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
          <Tag>Zusatzoptionen</Tag>
          <h3 className="font-seasons text-3xl mt-2 mb-8">Add-ons für Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Extra Stunde", price: "CHF 50" },
              { label: "Weekend Priority", price: "CHF 50 / Monat" },
              { label: "Zusatzlicht Setup", price: "inkl. bei Pro & Unlimited" },
            ].map((item, i) => (
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
          <h3 className="font-seasons text-xl text-brand mb-4">Mitgliedschaftsbedingungen</h3>
          <ul className="text-sm text-foreground/70 space-y-2 font-sans">
            <li><span className="font-semibold text-foreground">Mindestlaufzeit:</span> 3 Monate</li>
            <li><span className="font-semibold text-foreground">Stundenübertrag:</span> Nicht genutzte Stunden sind max. 1 Monat übertragbar</li>
            <li><span className="font-semibold text-foreground">Nutzung:</span> Nach Verfügbarkeit (Priorität je nach Plan)</li>
          </ul>
        </motion.div>
      </div>

      <CtaBanner />
    </div>
  );
}
