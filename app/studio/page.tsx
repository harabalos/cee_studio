"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import StudioCarousel from "@/components/StudioCarousel";
import { bc } from "@/lib/breadcrumb-labels";
import { useLang } from "@/contexts/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const galleryImages = [
  { src: "/images/lounge-softbox.jpg",   labels: { en: "The Studio",     de: "Das Studio",      fr: "Le Studio",         it: "Lo Studio" } },
  { src: "/images/cyc-softbox.jpg",      labels: { en: "Cyc Wall",       de: "Cyc Wall",        fr: "Cyc Wall",          it: "Cyc Wall" } },
  { src: "/images/makeup-area.jpg",      labels: { en: "Makeup Area",    de: "Make-up Bereich", fr: "Espace Maquillage", it: "Area Trucco" } },
  { src: "/images/paper-backdrops.jpg",  labels: { en: "Backdrops",      de: "Hintergründe",    fr: "Fonds",             it: "Sfondi" } },
  { src: "/images/studio-overview.jpg",  labels: { en: "Lifestyle Set",  de: "Lifestyle Set",   fr: "Lifestyle Set",     it: "Lifestyle Set" } },
];

const equipment = {
  en: [
    {
      category: "Lighting",
      items: ["Godox DP800III-V Studio Flash ×2", "Color Gels (Blue, Yellow, Red)"],
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
        "Iron",
        "Fan",
        "Marshall sound system",
      ],
    },
  ],
  de: [
    {
      category: "Beleuchtung",
      items: ["Godox DP800III-V Studioblitz ×2", "Farbgele (Blau, Gelb, Rot)"],
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
        "Bügeleisen",
        "Ventilator",
        "Marshall Sound System",
      ],
    },
  ],
  fr: [
    {
      category: "Éclairage",
      items: ["Godox DP800III-V Flash de Studio ×2", "Gels Colorés (Bleu, Jaune, Rouge)"],
    },
    {
      category: "Modificateurs",
      items: ["Octabox 120 cm", "Strip Softbox 30 × 120 cm"],
    },
    {
      category: "Pieds & Supports",
      items: [
        "Pieds Manfrotto ×3",
        "V-flat",
        "Sacs de sable",
        "Trépied téléphone (petit)",
        "Trépied téléphone (grand)",
      ],
    },
    {
      category: "Logistique",
      items: [
        "Fonds papier sans couture (Blanc, Noir, Beige)",
        "Système de support de fond",
        "WiFi haut débit",
        "Rallonges & multiprises",
        "Gaffer tape",
        "Portant à vêtements",
      ],
    },
    {
      category: "Commodités",
      items: [
        "Machine à café",
        "Café, thé & essentiels",
        "Eau potable",
        "Tasses & ustensiles de base",
        "Coin salon",
        "Espace maquillage",
        "Fer à repasser",
        "Ventilateur",
        "Système son Marshall",
      ],
    },
  ],
  it: [
    {
      category: "Illuminazione",
      items: ["Godox DP800III-V Flash da Studio ×2", "Gel Colorati (Blu, Giallo, Rosso)"],
    },
    {
      category: "Modificatori",
      items: ["Octabox 120 cm", "Strip Softbox 30 × 120 cm"],
    },
    {
      category: "Stativi & Supporti",
      items: [
        "Stativi Manfrotto ×3",
        "V-flat",
        "Sacchi di sabbia",
        "Treppiede smartphone (piccolo)",
        "Treppiede smartphone (grande)",
      ],
    },
    {
      category: "Logistica",
      items: [
        "Sfondi in carta senza giunte (Bianco, Nero, Beige)",
        "Sistema di supporto sfondi",
        "WiFi ad alta velocità",
        "Prolunghe & ciabatte",
        "Gaffer tape",
        "Stender porta-abiti",
      ],
    },
    {
      category: "Comfort",
      items: [
        "Macchina del caffè",
        "Caffè, tè & essenziali",
        "Acqua potabile",
        "Tazze & utensili base",
        "Area relax",
        "Angolo trucco",
        "Ferro da stiro",
        "Ventilatore",
        "Impianto audio Marshall",
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
  fr: {
    tag: "Opfikon, Glattpark",
    h1: "Le Studio",
    description:
      "Studio photo de 60 m² à Opfikon, Glattpark, près de Zurich. Au 5ème étage avec lumière naturelle, vues dégagées et un espace épuré et minimaliste pour la photographie et la création de contenu. Lumineux toute la journée, avec une lumière douce et une atmosphère chaleureuse au coucher du soleil.",
    equipmentTag: "Équipement",
    equipmentH2: "Liste de l'équipement",
  },
  it: {
    tag: "Opfikon, Glattpark",
    h1: "Lo Studio",
    description:
      "Studio fotografico di 60 m² a Opfikon, Glattpark, vicino a Zurigo. Al 5° piano con luce naturale, viste aperte e uno spazio pulito e minimalista per fotografia e content creation. Luminoso tutto il giorno, con luce morbida e un'atmosfera calda al tramonto.",
    equipmentTag: "Attrezzatura",
    equipmentH2: "Lista Attrezzatura Studio",
  },
};

export default function TheStudioPage() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as "en" | "de" | "fr" | "it";
  const tx = t[l];

  return (
    <>
      <div className="pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Breadcrumbs items={bc(l, "studio")} className="mb-8" />
          {/* Header */}
          <motion.div {...fadeUp} className="max-w-3xl">
            <Tag>{tx.tag}</Tag>
            <h1 className="font-seasons text-6xl md:text-7xl mt-4">{tx.h1}</h1>
          </motion.div>

          {/* Studio carousel — moved here from /studio on 2026-05-31.
              Replaces the previous static photo grid. */}
          <motion.div {...fadeUp} className="mt-12">
            <StudioCarousel images={galleryImages} lang={l} />
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
