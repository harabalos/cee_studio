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

const servicesEN = [
  {
    title: "Content Creation & BTS",
    description:
      "Behind-the-scenes photo and video content for social media, campaigns or personal use. Ideal for creators and brands who want to capture the process alongside the final result.",
  },
  {
    title: "Photo Editing",
    description:
      "Basic retouching, color correction and advanced Photoshop editing available depending on the project. Delivered in a clean and consistent style.",
  },
  {
    title: "Model & Team Sourcing",
    description:
      "Support in finding models, photographers, makeup artists or stylists for your shoot. We can help you build the right team based on your concept and needs.",
  },
  {
    title: "Brand & Product Shoots",
    description:
      "Product photography, fashion lookbooks and content creation for brands. A simple, efficient setup for businesses that need high-quality visuals without a complex production process.",
  },
  {
    title: "Creative Direction & Shoot Support",
    description:
      "Assistance with concept development, moodboards and on-set guidance. Designed for clients who want extra support in shaping the visual direction of their shoot.",
  },
  {
    title: "Studio Assistance",
    description:
      "Basic on-set support including lighting setup and general assistance during the shoot, ensuring a smooth and efficient workflow.",
  },
];

const servicesDE = [
  {
    title: "Content Creation & Behind the Scenes",
    description:
      "Behind-the-scenes Foto- und Videoinhalte für Social Media, Kampagnen oder den persönlichen Gebrauch. Ideal für Creators und Brands, die neben dem finalen Ergebnis auch den Entstehungsprozess festhalten möchten.",
  },
  {
    title: "Bildbearbeitung",
    description:
      "Basis-Retusche, Farbkorrektur sowie erweiterte Photoshop-Bearbeitung je nach Projekt. Die Ergebnisse werden in einem sauberen und konsistenten Stil geliefert.",
  },
  {
    title: "Model- & Teamvermittlung",
    description:
      "Unterstützung bei der Suche nach Models, Fotografen, Make-up Artists oder Stylisten. Wir helfen dabei, das passende Team für Ihr Konzept zusammenzustellen.",
  },
  {
    title: "Brand- & Produktshootings",
    description:
      "Produktfotografie, Fashion-Lookbooks und Content-Erstellung für Marken. Eine einfache und effiziente Lösung für Unternehmen, die hochwertige visuelle Inhalte benötigen.",
  },
  {
    title: "Creative Direction & Shooting Support",
    description:
      "Unterstützung bei Konzeptentwicklung, Moodboards und kreativer Ausrichtung. Geeignet für Kundinnen und Kunden, die zusätzliche Hilfe bei der Umsetzung ihrer Ideen wünschen.",
  },
  {
    title: "Studio Assistance",
    description:
      "Grundlegende Unterstützung am Set, inklusive Lichtaufbau und allgemeiner Assistenz während des Shootings, für einen reibungslosen Ablauf.",
  },
];

export default function OtherServicesPage() {
  return (
    <>
      <div className="pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6 md:px-10">

          {/* Header */}
          <motion.div {...fadeUp} className="max-w-3xl">
            <Tag>Services</Tag>
            <h1 className="font-seasons text-6xl md:text-7xl mt-4">Other Services</h1>
          </motion.div>

          {/* Intro EN */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 border-t border-accent pt-14">
            <motion.div {...fadeUp}>
              <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-4">EN</p>
              <p className="text-foreground/70 leading-relaxed">
                Cee Studio is primarily a rental photography space. For clients who need additional support, we also offer a selection of services to complement your shoot and simplify the production process.
              </p>
              <p className="text-foreground/50 leading-relaxed mt-4 text-sm">
                All services are optional and available upon request.
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}>
              <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-4">DE</p>
              <p className="text-foreground/70 leading-relaxed">
                Cee Studio ist in erster Linie ein mietbares Fotostudio. Für Kundinnen und Kunden, die zusätzliche Unterstützung benötigen, bieten wir ergänzende Services an, die Ihr Shooting vereinfachen und den gesamten Ablauf unterstützen.
              </p>
              <p className="text-foreground/50 leading-relaxed mt-4 text-sm">
                Alle Leistungen sind optional und auf Anfrage verfügbar.
              </p>
            </motion.div>
          </div>

          {/* Services EN */}
          <motion.div {...fadeUp} className="mt-24">
            <h2 className="font-seasons text-3xl md:text-4xl mb-12 text-brand">English</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {servicesEN.map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="border-t border-accent pt-8 pb-10 pr-8"
                >
                  <h3 className="font-seasons text-2xl text-foreground mb-4">{service.title}</h3>
                  <p className="text-foreground/60 leading-relaxed text-sm">{service.description}</p>
                </motion.div>
              ))}
            </div>
            <p className="mt-10 text-foreground/50 text-sm leading-relaxed border-t border-accent pt-8">
              All services are tailored to each project and can be combined with your studio booking depending on your needs.
            </p>
          </motion.div>

          {/* Services DE */}
          <motion.div {...fadeUp} className="mt-24">
            <h2 className="font-seasons text-3xl md:text-4xl mb-12 text-brand">Deutsch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {servicesDE.map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="border-t border-accent pt-8 pb-10 pr-8"
                >
                  <h3 className="font-seasons text-2xl text-foreground mb-4">{service.title}</h3>
                  <p className="text-foreground/60 leading-relaxed text-sm">{service.description}</p>
                </motion.div>
              ))}
            </div>
            <p className="mt-10 text-foreground/50 text-sm leading-relaxed border-t border-accent pt-8">
              Alle Leistungen werden individuell auf das jeweilige Projekt abgestimmt und können je nach Bedarf mit der Studiomiete kombiniert werden.
            </p>
          </motion.div>

        </div>
      </div>
      <CtaBanner />
    </>
  );
}
