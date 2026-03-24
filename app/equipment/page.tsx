"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";
import Button from "@/components/ui/Button";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const equipmentLists = [
  {
    category: "Lighting (Flash)",
    items: [
      "2x Profoto D2 1000 AirTTL",
      "2x Profoto B10X Plus (Battery)",
      "1x Profoto Air Remote TTL-S/C",
    ],
  },
  {
    category: "Lighting (Continuous)",
    items: [
      "2x Aputure LS 600d Pro",
      "1x Aputure LS 300x Bi-Color",
      "2x Amaran F22c RGBWW Flex",
    ],
  },
  {
    category: "Modifiers",
    items: [
      "1x Profoto RFi Softbox Octa (150cm)",
      "2x Profoto RFi Softbox Strip (30x120cm)",
      "1x Aputure Light Dome II",
      "1x Aputure Lantern",
      "Assorted Umbrellas & Grids",
    ],
  },
  {
    category: "Grip & Stands",
    items: [
      "6x Avenger C-Stands with Grip Head & Arm",
      "2x Manfrotto Heavy Duty Roller Stands",
      "1x Avenger Boom Stand",
      "8x Sandbags (10kg)",
      "Apple Boxes (Full, Half, Quarter)",
      "Assorted Super Clamps & Magic Arms",
    ],
  },
  {
    category: "Backdrops (2.72m Paper)",
    items: [
      "Arctic White (Included)",
      "Storm Grey (Included)",
      "Black (Included)",
      "Coral Pink (+CHF 20 / cut meter)",
      "Primary Blue (+CHF 20 / cut meter)",
    ],
  },
  {
    category: "Digital & Tethering",
    items: [
      "EIZO ColorEdge 27\" Monitor",
      "Tether Tools 4.6m USB-C Cable",
      "Seaport i-Visor Station on tripod",
    ],
  },
  {
    category: "Technical Specs & Logistics",
    items: [
      "3-Phase Power (T25) available for heavy continuous lighting",
      "High-speed 1Gbps Fiber Wi-Fi",
      "Direct drive-up loading ramp to studio entrance",
      "12+ distinct 16-Amp power outlets",
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
            Stop hauling heavy stands and modifiers across town. Our studio is fully 
            equipped with high-end Profoto and Aputure gear, heavy-duty grip, and all the 
            essentials needed for a seamless production.
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
            Access to Profoto/Aputure lighting packages requires adding the "Lighting Add-on" to your booking.
          </p>
        </motion.div>


      </div>
    </div>
    <CtaBanner />
    </>
  );
}
