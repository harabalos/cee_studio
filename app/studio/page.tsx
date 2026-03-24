"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";

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

const pricing = [
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
  {
    name: "Creator ABO (Monthly)",
    price: "CHF 280",
    duration: "4 Hours / Month",
    features: [
      "Recurring monthly subscription",
      "4 hours of studio time per month",
      "Hours roll over to the next month",
      "Perfect for content creators & influencers",
    ],
    popular: false,
  },
  {
    name: "Pro ABO (Monthly)",
    price: "CHF 500",
    duration: "8 Hours / Month",
    features: [
      "Recurring monthly subscription",
      "8 hours of studio time per month",
      "Includes Lighting Flash Package for free",
      "VIP priority booking calendar",
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

        {/* Pricing Cards */}
        <motion.div className="mt-32" {...fadeUp}>
          <Tag>Flexible & Subscription</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">Rates & ABO Memberships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {pricing.map((plan, i) => (
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

        {/* Lighting Package Upsell Note */}
        <motion.div
          className="mt-16 bg-brand/5 border border-brand/20 p-8 rounded-sm text-center max-w-4xl mx-auto"
          {...fadeUp}
        >
          <h3 className="font-seasons text-2xl text-brand mb-2">Need Professional Lighting?</h3>
          <p className="text-foreground/80 text-sm tracking-wide font-sans max-w-2xl mx-auto">
            Our high-end Profoto Flash and Aputure Continuous lighting packages can be added to any hourly or daily booking for a flat rate of <strong>CHF 150 / day</strong>. 
            <br/><br/>
            (Lighting is included for free with the Pro ABO Membership).
          </p>
        </motion.div>

        {/* Booking CTA */}
        <motion.div className="mt-32 text-center" {...fadeUp}>
          <h2 className="font-seasons text-4xl md:text-5xl">
            Secure your dates.
          </h2>
          <p className="mt-6 text-foreground/60 max-w-md mx-auto leading-relaxed text-lg">
            Check real-time availability and instantly reserve the studio for your next big project.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Button href="/contact" variant="filled">
              Book the Studio
            </Button>
            <Button href="/contact" variant="outlined">
              Inquire about ABO
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
