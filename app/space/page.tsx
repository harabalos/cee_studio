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

const zones = [
  {
    id: "01",
    title: "[The Cyc Wall]",
    description: "[Dimensions, vibe, and uses.] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=800&fit=crop",
    features: ["[Key Feature 1: e.g. 5x6m size]", "[Key Feature 2: e.g. Overhead grid]", "[Key Feature 3: e.g. Direct ramp access]"],
  },
  {
    id: "02",
    title: "[The Lifestyle Set]",
    description: "[Interior decor and natural lighting info.] Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
    features: ["[Key Feature 1: e.g. Natural oak floors]", "[Key Feature 2: e.g. Mid-century furniture]", "[Key Feature 3: e.g. Southwest windows]"],
  },
  {
    id: "03",
    title: "[Utility & Makeup]",
    description: "[Glam area amenities overview.] Sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet.",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&h=800&fit=crop",
    features: ["[Key Feature 1: e.g. 2x Daylight mirrors]", "[Key Feature 2: e.g. Jiffy Steamer]", "[Key Feature 3: e.g. Z-racks]"],
  },
  {
    id: "04",
    title: "[Client Lounge]",
    description: "[Comfort area features for clients.] Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&h=800&fit=crop",
    features: ["[Key Feature 1: e.g. Nespresso machine]", "[Key Feature 2: e.g. High-speed Wi-Fi]", "[Key Feature 3: e.g. Client Monitor]"],
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
            [Explanation of the studio zones.] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
