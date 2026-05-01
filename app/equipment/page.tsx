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
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
];

const equipment = {
  en: [
    {
      category: "Lighting",
      items: ["Godox DP800III-V Studio Flash ×2"],
    },
    {
      category: "Modifiers",
      items: ["Octabox 120 cm", "Strip Softbox 30 × 120 cm"],
    },
    {
      category: "Grips & Stands",
      items: [
        "Manfrotto Light Stands ×3",
        "V-flat",
        "Sandbags",
        "Phone tripod (small)",
        "Phone tripod (tall)",
      ],
    },
    {
      category: "Logistics",
      items: [
        "Seamless paper backdrops (White, Black, Beige)",
        "Background support system",
        "High-speed WiFi",
        "Extension cables & power strips",
        "Gaffer tape",
        "Clothing rack",
      ],
    },
    {
      category: "Amenities",
      items: [
        "Coffee machine",
        "Coffee, tea & essentials",
        "Drinking water",
        "Cups & basic kitchen items",
        "Seating area",
        "Make up corner",
        "Marshall sound system",
      ],
    },
  ],
  de: [
    {
      category: "Beleuchtung",
      items: ["Godox DP800III-V Studioblitz ×2"],
    },
    {
      category: "Lichtformer",
      items: ["Octabox 120 cm", "Strip Softbox 30 × 120 cm"],
    },
    {
      category: "Stative & Zubehör",
      items: [
        "Manfrotto Lichtstative ×3",
        "V-flat",
        "Sandsäcke",
        "Handy-Stativ klein",
        "Handy-Stativ gross",
      ],
    },
    {
      category: "Studio Logistik & Setup",
      items: [
        "Nahtlose Papierhintergründe (Weiss, Schwarz, Beige)",
        "Hintergrundsystem für Studiofotografie",
        "Hochgeschwindigkeits-WLAN",
        "Verlängerungskabel & Steckdosenleisten",
        "Gaffa Tape",
        "Kleiderständer",
      ],
    },
    {
      category: "Amenities & Ausstattung",
      items: [
        "Kaffeemaschine",
        "Kaffee, Tee & Grundausstattung",
        "Trinkwasser",
        "Tassen & einfache Küchenutensilien",
        "Sitzbereich im Studio",
        "Make-up Bereich",
        "Marshall Sound System",
      ],
    },
  ],
};

const t = {
  en: {
    tag: "Opfikon, Glattpark",
    h1: "The Studio",
    description:
      "60 m² photography studio in Opfikon, Glattpark, near Zurich. 5th floor with natural light, open views and a clean, minimal space for photography and content creation. Bright all day, with soft light and a warm atmosphere at sunset.",
    equipmentTag: "Equipment",
    equipmentH2: "What's included",
  },
  de: {
    tag: "Opfikon, Glattpark",
    h1: "Das Studio",
    description:
      "60 m² Fotostudio in Opfikon, Glattpark, nahe Zürich. Im 5. Stock mit viel Tageslicht, offener Aussicht und einem cleanen, minimalistischen Raum für Fotografie und Content Creation. Den ganzen Tag hell, mit weichem Licht und einer warmen Atmosphäre bei Sonnenuntergang.",
    equipmentTag: "Ausstattung",
    equipmentH2: "Studio Equipment Liste",
  },
};

export default function TheStudioPage() {
  const { lang } = useLang();
  const l = lang === "DE" ? "de" : "en";
  const tx = t[l];

  return (
    <>
      <div className="pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* Header */}
          <motion.div {...fadeUp} className="max-w-3xl">
            <Tag>{tx.tag}</Tag>
            <h1 className="font-seasons text-6xl md:text-7xl mt-4">{tx.h1}</h1>
          </motion.div>

          {/* Photo Gallery */}
          <motion.div
            {...fadeUp}
            className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
          >
            {galleryImages.map((src, i) => (
              <div
                key={i}
                className={`relative overflow-hidden ${i === 0 ? "col-span-2 md:col-span-2 aspect-[16/9]" : "aspect-square"}`}
              >
                <Image
                  src={src}
                  alt={`Studio photo ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </motion.div>

          {/* Description */}
          <div className="mt-20 max-w-3xl border-t border-accent pt-16">
            <motion.div {...fadeUp}>
              <p className="text-foreground/70 leading-relaxed text-lg">{tx.description}</p>
            </motion.div>
          </div>

          {/* Equipment */}
          <motion.div {...fadeUp} className="mt-24">
            <Tag>{tx.equipmentTag}</Tag>
            <h2 className="font-seasons text-4xl md:text-5xl mt-4 mb-16">{tx.equipmentH2}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {equipment[l].map((list, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="border-t border-brand pt-8"
                >
                  <h3 className="font-seasons text-2xl text-brand mb-6">{list.category}</h3>
                  <ul className="space-y-3">
                    {list.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-foreground/80">
                        <span className="text-brand font-bold mt-0.5">•</span>
                        <span className="leading-snug text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <CtaBanner />
    </>
  );
}
