"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";
import { useLang } from "@/contexts/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const services = {
  en: [
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
  ],
  de: [
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
  ],
  fr: [
    {
      title: "Création de Contenu & Behind the Scenes",
      description:
        "Contenus photo et vidéo behind-the-scenes pour les réseaux sociaux, campagnes ou usage personnel. Idéal pour les créateurs et marques qui souhaitent capturer le processus aux côtés du résultat final.",
    },
    {
      title: "Retouche Photo",
      description:
        "Retouche basique, correction colorimétrique et édition Photoshop avancée selon le projet. Livrée dans un style propre et cohérent.",
    },
    {
      title: "Sourcing Modèles & Équipe",
      description:
        "Aide à trouver des modèles, photographes, maquilleurs ou stylistes pour votre shooting. Nous vous aidons à constituer la bonne équipe selon votre concept.",
    },
    {
      title: "Shootings Marque & Produit",
      description:
        "Photographie produit, lookbooks mode et création de contenu pour marques. Une configuration simple et efficace pour les entreprises ayant besoin de visuels de qualité.",
    },
    {
      title: "Direction Créative & Support Shooting",
      description:
        "Aide au développement de concept, moodboards et direction sur le plateau. Pour les clients qui souhaitent un soutien supplémentaire dans la direction visuelle de leur shooting.",
    },
    {
      title: "Assistance Studio",
      description:
        "Support de base sur le plateau incluant l'installation lumière et l'assistance générale pendant le shooting, pour un workflow fluide et efficace.",
    },
  ],
  it: [
    {
      title: "Content Creation & Behind the Scenes",
      description:
        "Contenuti foto e video behind-the-scenes per social media, campagne o uso personale. Ideale per creator e brand che vogliono catturare il processo insieme al risultato finale.",
    },
    {
      title: "Ritocco Fotografico",
      description:
        "Ritocco base, correzione colore ed editing Photoshop avanzato a seconda del progetto. Consegnato in uno stile pulito e coerente.",
    },
    {
      title: "Ricerca Modelli & Team",
      description:
        "Supporto nella ricerca di modelli, fotografi, make-up artist o stylist per il tuo shooting. Ti aiutiamo a costruire il team giusto basato sul tuo concept.",
    },
    {
      title: "Shooting Brand & Prodotto",
      description:
        "Fotografia di prodotto, lookbook fashion e creazione di contenuti per brand. Una configurazione semplice ed efficiente per aziende che necessitano di immagini di alta qualità.",
    },
    {
      title: "Direzione Creativa & Supporto Shooting",
      description:
        "Assistenza nello sviluppo del concept, moodboard e direzione sul set. Per clienti che desiderano supporto extra nel definire la direzione visiva del loro shooting.",
    },
    {
      title: "Assistenza Studio",
      description:
        "Supporto base sul set inclusi setup luci e assistenza generale durante lo shooting, per un workflow fluido ed efficiente.",
    },
  ],
};

const t = {
  en: {
    tag: "Services",
    h1: "Other Services",
    intro:
      "Cee Studio is primarily a rental photography space. For clients who need additional support, we also offer a selection of services to complement your shoot and simplify the production process.",
    introNote: "All services are optional and available upon request.",
    outro:
      "All services are tailored to each project and can be combined with your studio booking depending on your needs.",
  },
  de: {
    tag: "Services",
    h1: "Weitere Services",
    intro:
      "Cee Studio ist in erster Linie ein mietbares Fotostudio. Für Kundinnen und Kunden, die zusätzliche Unterstützung benötigen, bieten wir ergänzende Services an, die Ihr Shooting vereinfachen und den gesamten Ablauf unterstützen.",
    introNote: "Alle Leistungen sind optional und auf Anfrage verfügbar.",
    outro:
      "Alle Leistungen werden individuell auf das jeweilige Projekt abgestimmt und können je nach Bedarf mit der Studiomiete kombiniert werden.",
  },
  fr: {
    tag: "Services",
    h1: "Autres Services",
    intro:
      "Cee Studio est avant tout un studio photo à la location. Pour les clients qui ont besoin d'un soutien supplémentaire, nous proposons une sélection de services pour compléter votre shooting et simplifier le processus de production.",
    introNote: "Tous les services sont optionnels et disponibles sur demande.",
    outro:
      "Tous les services sont adaptés à chaque projet et peuvent être combinés avec votre réservation de studio selon vos besoins.",
  },
  it: {
    tag: "Servizi",
    h1: "Altri Servizi",
    intro:
      "Cee Studio è principalmente uno spazio fotografico in affitto. Per i clienti che necessitano di supporto aggiuntivo, offriamo una selezione di servizi per completare il vostro shooting e semplificare il processo di produzione.",
    introNote: "Tutti i servizi sono opzionali e disponibili su richiesta.",
    outro:
      "Tutti i servizi sono personalizzati per ogni progetto e possono essere combinati con la prenotazione dello studio in base alle vostre esigenze.",
  },
};

export default function OtherServicesPage() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as "en" | "de" | "fr" | "it";
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

          {/* Intro */}
          <div className="mt-16 max-w-3xl border-t border-accent pt-14">
            <motion.div {...fadeUp}>
              <p className="text-foreground/70 leading-relaxed text-lg">{tx.intro}</p>
              <p className="text-foreground/50 leading-relaxed mt-4 text-sm">{tx.introNote}</p>
            </motion.div>
          </div>

          {/* Services */}
          <motion.div {...fadeUp} className="mt-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {services[l].map((service, i) => (
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
              {tx.outro}
            </p>
          </motion.div>
        </div>
      </div>
      <CtaBanner />
    </>
  );
}
