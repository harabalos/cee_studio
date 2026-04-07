"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
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
  { title: "[Spec: Total Area]", value: "[XXm²]", desc: "[Description of the floor plan]" },
  { title: "[Spec: Ceiling Height]", value: "[4.5m]", desc: "[Details about modifier space]" },
  { title: "[Spec: Base Equipment]", value: "[Included]", desc: "[What grip is included]" },
  { title: "[Spec: Backdrops]", value: "[Available]", desc: "[What colors are available]" },
  { title: "[Spec: Client Lounge]", value: "[Included]", desc: "[Details about amenities]" },
  { title: "[Spec: Access]", value: "[Smart PIN]", desc: "[How renters access the space]" },
];

const pricing = [
  {
    name: "[Plan Name: Hourly Rate]",
    price: "[CHF XX]",
    duration: "[Per Hour]",
    features: ["[Feature 1: Minimum booking hours]", "[Feature 2: Areas accessed]", "[Feature 3: Included grip]", "[Feature 4: Parking info]"],
    popular: false,
  },
  {
    name: "[Plan Name: Full Day Lockout]",
    price: "[CHF XXX]",
    duration: "[8 Hours]",
    features: [
      "[Feature 1: Areas accessed]",
      "[Feature 2: Included grip]",
      "[Feature 3: Priority load-in]",
      "[Feature 4: Lounge access]",
      "[Feature 5: Parking info]",
    ],
    popular: true,
  },
  {
    name: "[Plan Name: Creator ABO]",
    price: "[CHF XX]",
    duration: "[4 Hours / Month]",
    features: [
      "[Feature 1: Subscription details]",
      "[Feature 2: Usage hours]",
      "[Feature 3: Rollover info]",
      "[Feature 4: Target audience]",
    ],
    popular: false,
  },
  {
    name: "[Plan Name: Pro ABO]",
    price: "[CHF XXX]",
    duration: "[8 Hours / Month]",
    features: [
      "[Feature 1: Subscription details]",
      "[Feature 2: Usage hours]",
      "[Feature 3: Included perks]",
      "[Feature 4: Booking priority]",
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
            [Overview of rental rates and subscription ABO plans.] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
          <h3 className="font-seasons text-2xl text-brand mb-2">[Add-on Title: e.g. Need Professional Lighting?]</h3>
          <p className="text-foreground/80 text-sm tracking-wide font-sans max-w-2xl mx-auto">
            [Details on professional lighting package added costs.] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            <br/><br/>
            (Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris).
          </p>
        </motion.div>
      </div>

      <CtaBanner />
    </div>
  );
}
