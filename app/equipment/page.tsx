"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const equipmentLists = [
  {
    category: "[Equipment Category 1: e.g. Lighting]",
    items: [
      "[Item 1: e.g. 2x Profoto D2]",
      "[Item 2: e.g. 2x Aputure LS 600d Pro]",
      "[Item 3: e.g. Battery Packs]",
    ],
  },
  {
    category: "[Equipment Category 2: e.g. Modifiers]",
    items: [
      "[Item 1: e.g. Octaboxes]",
      "[Item 2: e.g. Strip boxes]",
      "[Item 3: e.g. Umbrellas & Grids]",
    ],
  },
  {
    category: "[Equipment Category 3: e.g. Grip & Stands]",
    items: [
      "[Item 1: e.g. Heavy Duty C-Stands]",
      "[Item 2: e.g. Sandbags]",
      "[Item 3: e.g. Apple Boxes]",
      "[Item 4: e.g. Super Clamps]",
    ],
  },
  {
    category: "[Equipment Category 4: e.g. Logistics]",
    items: [
      "[Item 1: e.g. Phase 3 Power Drops]",
      "[Item 2: e.g. High-speed Wi-Fi]",
      "[Item 3: e.g. Ground Ramp Access]",
    ],
  },
];

export default function EquipmentPage() {
  return (
    <>
    <div className="pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <motion.div {...fadeUp} className="max-w-4xl text-center mx-auto">
          <Tag>Equipment Inventory</Tag>
          <h1 className="font-seasons text-6xl md:text-7xl mt-4">
            Everything you need. <br /> Built right in.
          </h1>
          <p className="mt-8 text-foreground/70 leading-relaxed text-lg max-w-2xl mx-auto">
            [Overview of the comprehensive equipment inventory.] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
        </motion.div>

        {/* Equipment Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {equipmentLists.map((list, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border-t border-brand pt-8"
            >
              <h2 className="font-seasons text-3xl text-brand mb-6">{list.category}</h2>
              <ul className="space-y-4">
                {list.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-foreground/80">
                    <span className="text-brand font-bold mt-0.5">•</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.div
          className="mt-24 bg-brand/5 border border-brand/20 p-8 rounded-sm text-center max-w-3xl mx-auto"
          {...fadeUp}
        >
          <p className="text-brand text-sm tracking-wide font-sans">
            <strong>Please Note:</strong> The Basic Grip & Backdrop support is included in all rentals. 
            Access to Profoto/Aputure lighting packages requires adding the &quot;Lighting Add-on&quot; to your booking.
          </p>
        </motion.div>


      </div>
    </div>
    <CtaBanner />
    </>
  );
}
