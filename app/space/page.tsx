"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";
import Button from "@/components/ui/Button";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const zones = [
  {
    id: "01",
    title: "The Cyc Wall",
    description: "A 5x6m U-shaped cyclorama wall corner. Perfect for fashion lookbooks, e-commerce, and clean commercial portraiture. Painted fresh white weekly.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=800&fit=crop",
    features: ["5m (W) x 6m (D) x 4.5m (H) dimensions", "Overhead lighting grid", "Direct drive-up loading ramp access"],
  },
  {
    id: "02",
    title: "The Lifestyle Set",
    description: "A warmly lit, furnished corner featuring real oak floors, linen curtains, and natural southwestern sunlight. Ideal for lifestyle brands, interviews, and intimate portraits.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
    features: ["Natural oak flooring", "Curated mid-century furniture", "South-West facing windows for golden hour"],
  },
  {
    id: "03",
    title: "Utility & Makeup Zone",
    description: "A dedicated sanctuary for your glam team. Two daylight-balanced mirror stations, professional steamer, and heavy-duty clothing racks ensure your talent is camera-ready.",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&h=800&fit=crop",
    features: ["2x Daylight mirror stations", "Jiffy Steamer", "2x Z-racks with hangers"],
  },
  {
    id: "04",
    title: "Client Lounge",
    description: "A comfortable space for clients and agencies to oversee the production. Equipped with high-speed Wi-Fi, a premium espresso machine, and a tethering monitor.",
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&h=800&fit=crop",
    features: ["Nespresso machine & water", "High-speed 1Gbps Wi-Fi", "4K Client Monitor"],
  },
];

export default function SpacePage() {
  return (
    <>
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div {...fadeUp} className="max-w-3xl">
          <Tag>The Space</Tag>
          <h1 className="font-seasons text-6xl md:text-7xl mt-4">
            Four distinct zones. <br /> One seamless booking.
          </h1>
          <p className="mt-8 text-foreground/70 leading-relaxed text-lg">
            Our 200m² studio is intelligently divided into purposeful zones, 
            allowing you to capture multiple distinct aesthetics in a single shoot day.
          </p>
        </motion.div>

        {/* Zones List */}
        <div className="mt-24 space-y-32">
          {zones.map((zone, i) => (
            <motion.div
              key={zone.id}
              className={`flex flex-col ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-12 md:gap-16 items-center`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* Image */}
              <div className="w-full md:w-1/2 relative h-[60vh] overflow-hidden grain-overlay group">
                <Image
                  src={zone.image}
                  alt={zone.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Content */}
              <div className="w-full md:w-1/2">
                <Tag>Zone {zone.id}</Tag>
                <h2 className="font-seasons text-4xl md:text-5xl mt-2">
                  {zone.title}
                </h2>
                <p className="mt-6 text-foreground/70 leading-relaxed text-lg">
                  {zone.description}
                </p>
                <ul className="mt-8 space-y-3">
                  {zone.features.map((feature, j) => (
                    <li key={j} className="text-foreground/80 flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
    <CtaBanner />
    </>
  );
}
