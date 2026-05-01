"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/ui/Tag";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import CtaBanner from "@/components/ui/CtaBanner";
import { useLang } from "@/contexts/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const homeZones = {
  en: [
    { id: "01", title: "Cyc Wall", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=800&fit=crop" },
    { id: "02", title: "Lifestyle Set", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=800&fit=crop" },
    { id: "03", title: "Makeup Area", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&h=800&fit=crop" },
    { id: "04", title: "Equipment", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=800&fit=crop" },
  ],
  de: [
    { id: "01", title: "Cyc Wall", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=800&fit=crop" },
    { id: "02", title: "Lifestyle Set", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=800&fit=crop" },
    { id: "03", title: "Make-up Bereich", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&h=800&fit=crop" },
    { id: "04", title: "Equipment", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=800&fit=crop" },
  ],
  fr: [
    { id: "01", title: "Cyc Wall", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=800&fit=crop" },
    { id: "02", title: "Lifestyle Set", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=800&fit=crop" },
    { id: "03", title: "Espace Maquillage", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&h=800&fit=crop" },
    { id: "04", title: "Équipement", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=800&fit=crop" },
  ],
  it: [
    { id: "01", title: "Cyc Wall", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=800&fit=crop" },
    { id: "02", title: "Lifestyle Set", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=800&fit=crop" },
    { id: "03", title: "Area Trucco", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&h=800&fit=crop" },
    { id: "04", title: "Attrezzatura", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=800&fit=crop" },
  ],
};

const t = {
  en: {
    heroTitle: "CEE Studio",
    heroSub: "Creative Content & Photo Studio near Zurich",
    intro: "A modern studio for content creators, brands and photographers.",
    introP: "Equipped for high-quality photo shoots, creative projects, model jobs and more.",
    heroCta: "Elevate Your Portfolio",
    spaceH2: "Equipment",
    spaceLink: "Explore More →",
    bookTag: "Book Your Slot",
    bookH2: "Create. Shoot. Elevate.",
    bookP1: "Featuring natural light, professional equipment, and a minimal aesthetic.",
    bookP2: "Check real-time availability and instantly reserve the finest studio for your next project.",
    bookCta: "Book Now",
  },
  de: {
    heroTitle: "CEE Studio",
    heroSub: "Creative Content & Photo Studio near Zürich",
    intro: "Ein modernes Studio für Content Creator, Marken und Fotografen.",
    introP: "Ausgestattet für hochwertige Fotoshootings, kreative Projekte, Modeljobs und mehr.",
    heroCta: "Bereichern Sie Ihr Portfolio",
    spaceH2: "Ausstattung",
    spaceLink: "Mehr entdecken →",
    bookTag: "Termin sichern",
    bookH2: "Create. Shoot. Elevate.",
    bookP1: "Mit natürlichem Licht, professioneller Ausstattung und minimalistischem Design.",
    bookP2: "Prüfen Sie die Verfügbarkeit in Echtzeit und reservieren Sie sofort das beste Studio für Ihr nächstes Projekt.",
    bookCta: "Jetzt buchen",
  },
  fr: {
    heroTitle: "CEE Studio",
    heroSub: "Studio Créatif & Photo près de Zurich",
    intro: "Un studio moderne pour créateurs de contenu, marques et photographes.",
    introP: "Équipé pour des shootings photo de haute qualité, projets créatifs, jobs mannequin et plus encore.",
    heroCta: "Enrichissez votre portfolio",
    spaceH2: "Équipement",
    spaceLink: "Découvrir plus →",
    bookTag: "Réservez votre créneau",
    bookH2: "Create. Shoot. Elevate.",
    bookP1: "Lumière naturelle, équipement professionnel et esthétique minimaliste.",
    bookP2: "Vérifiez la disponibilité en temps réel et réservez instantanément le meilleur studio pour votre prochain projet.",
    bookCta: "Réserver",
  },
  it: {
    heroTitle: "CEE Studio",
    heroSub: "Studio Creativo & Foto vicino a Zurigo",
    intro: "Uno studio moderno per content creator, brand e fotografi.",
    introP: "Attrezzato per shooting fotografici di alta qualità, progetti creativi, lavori da modello e altro ancora.",
    heroCta: "Arricchisci il tuo portfolio",
    spaceH2: "Attrezzatura",
    spaceLink: "Scopri di più →",
    bookTag: "Prenota il tuo slot",
    bookH2: "Create. Shoot. Elevate.",
    bookP1: "Luce naturale, attrezzatura professionale e estetica minimalista.",
    bookP2: "Controlla la disponibilità in tempo reale e prenota istantaneamente il miglior studio per il tuo prossimo progetto.",
    bookCta: "Prenota ora",
  },
};

export default function Home() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as "en" | "de" | "fr" | "it";
  const tx = t[l];
  const zones = homeZones[l];

  return (
    <>
      {/* Section 1 — Hero */}
      <section className="relative h-[95vh] w-full overflow-hidden">
        <div className="absolute inset-0 grain-overlay">
          <Image
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1920&h=1080&fit=crop"
            alt="CEE Studio Hero"
            fill
            className="object-cover animate-kenburns"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-background px-4 max-w-3xl">
            <h1 className="font-seasons text-6xl md:text-8xl tracking-wide">{tx.heroTitle}</h1>
            <p className="font-seasons text-xl md:text-3xl mt-2 tracking-wide opacity-90">{tx.heroSub}</p>
            <Link
              href="/booking"
              className="inline-block mt-10 px-8 py-3 lg:px-10 lg:py-4 bg-background text-brand text-[10px] md:text-xs uppercase tracking-[0.2em] font-extrabold hover:bg-accent transition-all duration-300 shadow-[0_5px_15px_rgba(253,250,244,0.15)] hover:shadow-[0_8px_20px_rgba(253,250,244,0.3)] hover:-translate-y-[1px] rounded-sm"
            >
              {tx.heroCta}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-[1px] h-10 bg-background animate-pulse-line" />
        </div>
      </section>

      {/* Section 2 — Intro */}
      <section className="py-32 bg-background">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            className="font-seasons text-5xl md:text-6xl lg:text-7xl text-foreground font-medium"
            {...fadeUp}
          >
            {tx.intro}
          </motion.h2>
          <motion.p
            className="mt-8 text-foreground/70 max-w-lg mx-auto leading-relaxed text-lg"
            {...fadeUp}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            {tx.introP}
          </motion.p>
          <Divider className="mt-16 max-w-xs mx-auto" />
        </div>
      </section>

      {/* Section 3 — Equipment / Zones Teaser */}
      <section className="px-6 md:px-10 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <motion.h2
              className="font-seasons text-4xl md:text-5xl"
              {...fadeUp}
            >
              {tx.spaceH2}
            </motion.h2>
            <motion.div {...fadeUp}>
              <Link
                href="/equipment"
                className="text-sm uppercase tracking-widest text-brand hover:text-brand-hover transition-colors font-semibold"
              >
                {tx.spaceLink}
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {zones.map((zone, i) => (
              <motion.div
                key={zone.id}
                className="relative h-96 overflow-hidden group border border-accent/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.1 }}
              >
                <Image
                  src={zone.image}
                  alt={zone.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-brand/10 group-hover:bg-brand/60 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="text-center">
                    <p className="font-sans text-sm uppercase tracking-widest text-background font-bold">
                      {zone.title}
                    </p>
                    <span className="text-accent text-2xl mt-2 inline-block">&rarr;</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section — Booking CTA (replaces old "Become a resident creator" memberships teaser) */}
      <section className="bg-brand text-background">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32 flex flex-col md:flex-row-reverse gap-12 md:gap-16 items-center">
          <motion.div
            className="relative w-full md:w-1/2 h-[60vh] grain-overlay"
            {...fadeUp}
          >
            <Image
              src="https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=1000&fit=crop"
              alt="CEE Studio"
              fill
              className="object-cover grayscale"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
          <motion.div className="w-full md:w-1/2" {...fadeUp}>
            <Tag>{tx.bookTag}</Tag>
            <h2 className="font-seasons text-4xl md:text-5xl mt-4">
              {tx.bookH2}
            </h2>
            <p className="mt-6 text-background/80 leading-relaxed max-w-md text-lg">
              {tx.bookP1}
            </p>
            <p className="mt-4 text-background/80 leading-relaxed max-w-md text-lg">
              {tx.bookP2}
            </p>
            <Button href="/booking" variant="filled" className="mt-8 bg-background text-brand hover:bg-accent">
              {tx.bookCta}
            </Button>
          </motion.div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
