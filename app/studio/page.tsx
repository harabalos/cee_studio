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
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=800&fit=crop",
];

const specs = [
  { title: "Total Area", value: "200m²", desc: "Open-plan studio floor" },
  { title: "Ceiling Height", value: "4.5m", desc: "Full-height backdrops" },
  { title: "Lighting", value: "Profoto", desc: "Pro B10 & D2 kit included" },
  { title: "Backdrops", value: "12+", desc: "Paper, muslin & cyclorama" },
  { title: "Client Lounge", value: "Included", desc: "Wi-Fi, coffee, monitors" },
  { title: "Parking", value: "On-site", desc: "2 reserved spots" },
];

const pricing = [
  {
    name: "Half Day",
    price: "CHF 650",
    duration: "4 hours",
    features: ["Studio access", "Basic lighting kit", "1 backdrop", "Client lounge"],
    popular: false,
  },
  {
    name: "Full Day",
    price: "CHF 1,100",
    duration: "8 hours",
    features: [
      "Studio access",
      "Full lighting kit",
      "All backdrops",
      "Client lounge",
      "Styling area",
      "Parking included",
    ],
    popular: true,
  },
  {
    name: "Multi-Day",
    price: "CHF 900/day",
    duration: "3+ days",
    features: [
      "Everything in Full Day",
      "Priority scheduling",
      "Equipment consultation",
      "Overnight set storage",
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
          <h1 className="font-seasons text-6xl md:text-7xl">The Studio</h1>
          <p className="mt-6 text-foreground/60 max-w-lg leading-relaxed">
            A purpose-built creative space in Zurich&apos;s Kreis 5 district.
            200 square meters of versatile studio, equipped for photography,
            video, and everything in between.
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
          <Tag>Specifications</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">What&apos;s included</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
            {specs.map((spec, i) => (
              <motion.div
                key={i}
                className="border border-accent p-6 md:p-8 hover:border-brand transition-colors duration-500"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-seasons text-brand">{spec.value}</p>
                <p className="text-sm uppercase tracking-widest mt-3">{spec.title}</p>
                <p className="text-xs text-foreground/50 mt-1">{spec.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div className="mt-32" {...fadeUp}>
          <Tag>Pricing</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">Studio rental</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {pricing.map((plan, i) => (
              <motion.div
                key={i}
                className={`relative border p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-lg ${
                  plan.popular ? "border-brand" : "border-accent"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-8 bg-brand text-white text-xs uppercase tracking-widest px-3 py-1">
                    Most Popular
                  </span>
                )}
                <h3 className="font-seasons text-2xl">{plan.name}</h3>
                <p className="text-3xl font-seasons text-brand mt-2">{plan.price}</p>
                <p className="text-xs text-foreground/50 mt-1">{plan.duration}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-foreground/60 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-brand flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Booking CTA */}
        <motion.div className="mt-32 text-center" {...fadeUp}>
          <h2 className="font-seasons text-4xl md:text-5xl">
            Ready to book?
          </h2>
          <p className="mt-6 text-foreground/60 max-w-md mx-auto leading-relaxed">
            Check availability and reserve the studio for your next project.
            We&apos;ll take care of the rest.
          </p>
          <div className="mt-10">
            <Button href="/contact" variant="filled">
              Book the Studio
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
