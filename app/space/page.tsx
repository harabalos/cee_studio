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

// Each service paired with an image from the studio library
const serviceImages = [
  "/images/bts-shoot.jpg",        // 01 — Content Creation & BTS
  "/images/makeup-vanity.jpg",    // 02 — Photo Editing
  "/images/wardrobe.jpg",         // 03 — Model & Team Sourcing
  "/images/cyc-wall.jpg",         // 04 — Brand & Product Shoots
  "/images/lounge-alt.jpg",       // 05 — Creative Direction
  "/images/studio-wide.jpg",      // 06 — Studio Assistance
];

const services = {
  en: [
    {
      title: "Content Creation & BTS",
      short: "BTS / Social",
      description:
        "Behind-the-scenes photo and video content for social media, campaigns or personal use. Ideal for creators and brands who want to capture the process alongside the final result.",
    },
    {
      title: "Photo Editing",
      short: "Retouch",
      description:
        "Basic retouching, color correction and advanced Photoshop editing available depending on the project. Delivered in a clean and consistent style.",
    },
    {
      title: "Model & Team Sourcing",
      short: "Casting",
      description:
        "Support in finding models, photographers, makeup artists or stylists for your shoot. We can help you build the right team based on your concept and needs.",
    },
    {
      title: "Brand & Product Shoots",
      short: "Brand",
      description:
        "Product photography, fashion lookbooks and content creation for brands. A simple, efficient setup for businesses that need high-quality visuals without a complex production process.",
    },
    {
      title: "Creative Direction & Shoot Support",
      short: "Direction",
      description:
        "Assistance with concept development, moodboards and on-set guidance. Designed for clients who want extra support in shaping the visual direction of their shoot.",
    },
    {
      title: "Studio Assistance",
      short: "On-Set",
      description:
        "Basic on-set support including lighting setup and general assistance during the shoot, ensuring a smooth and efficient workflow.",
    },
  ],
  de: [
    {
      title: "Content Creation & Behind the Scenes",
      short: "BTS / Social",
      description:
        "Behind-the-scenes Foto- und Videoinhalte für Social Media, Kampagnen oder den persönlichen Gebrauch. Ideal für Creators und Brands, die neben dem finalen Ergebnis auch den Entstehungsprozess festhalten möchten.",
    },
    {
      title: "Bildbearbeitung",
      short: "Retusche",
      description:
        "Basis-Retusche, Farbkorrektur sowie erweiterte Photoshop-Bearbeitung je nach Projekt. Die Ergebnisse werden in einem sauberen und konsistenten Stil geliefert.",
    },
    {
      title: "Model- & Teamvermittlung",
      short: "Casting",
      description:
        "Unterstützung bei der Suche nach Models, Fotografen, Make-up Artists oder Stylisten. Wir helfen dabei, das passende Team für Ihr Konzept zusammenzustellen.",
    },
    {
      title: "Brand- & Produktshootings",
      short: "Brand",
      description:
        "Produktfotografie, Fashion-Lookbooks und Content-Erstellung für Marken. Eine einfache und effiziente Lösung für Unternehmen, die hochwertige visuelle Inhalte benötigen.",
    },
    {
      title: "Creative Direction & Shooting Support",
      short: "Direction",
      description:
        "Unterstützung bei Konzeptentwicklung, Moodboards und kreativer Ausrichtung. Geeignet für Kundinnen und Kunden, die zusätzliche Hilfe bei der Umsetzung ihrer Ideen wünschen.",
    },
    {
      title: "Studio Assistance",
      short: "On-Set",
      description:
        "Grundlegende Unterstützung am Set, inklusive Lichtaufbau und allgemeiner Assistenz während des Shootings, für einen reibungslosen Ablauf.",
    },
  ],
  fr: [
    {
      title: "Création de Contenu & Behind the Scenes",
      short: "BTS / Social",
      description:
        "Contenus photo et vidéo behind-the-scenes pour les réseaux sociaux, campagnes ou usage personnel. Idéal pour les créateurs et marques qui souhaitent capturer le processus aux côtés du résultat final.",
    },
    {
      title: "Retouche Photo",
      short: "Retouche",
      description:
        "Retouche basique, correction colorimétrique et édition Photoshop avancée selon le projet. Livrée dans un style propre et cohérent.",
    },
    {
      title: "Sourcing Modèles & Équipe",
      short: "Casting",
      description:
        "Aide à trouver des modèles, photographes, maquilleurs ou stylistes pour votre shooting. Nous vous aidons à constituer la bonne équipe selon votre concept.",
    },
    {
      title: "Shootings Marque & Produit",
      short: "Marque",
      description:
        "Photographie produit, lookbooks mode et création de contenu pour marques. Une configuration simple et efficace pour les entreprises ayant besoin de visuels de qualité.",
    },
    {
      title: "Direction Créative & Support Shooting",
      short: "Direction",
      description:
        "Aide au développement de concept, moodboards et direction sur le plateau. Pour les clients qui souhaitent un soutien supplémentaire dans la direction visuelle de leur shooting.",
    },
    {
      title: "Assistance Studio",
      short: "On-Set",
      description:
        "Support de base sur le plateau incluant l'installation lumière et l'assistance générale pendant le shooting, pour un workflow fluide et efficace.",
    },
  ],
  it: [
    {
      title: "Content Creation & Behind the Scenes",
      short: "BTS / Social",
      description:
        "Contenuti foto e video behind-the-scenes per social media, campagne o uso personale. Ideale per creator e brand che vogliono catturare il processo insieme al risultato finale.",
    },
    {
      title: "Ritocco Fotografico",
      short: "Ritocco",
      description:
        "Ritocco base, correzione colore ed editing Photoshop avanzato a seconda del progetto. Consegnato in uno stile pulito e coerente.",
    },
    {
      title: "Ricerca Modelli & Team",
      short: "Casting",
      description:
        "Supporto nella ricerca di modelli, fotografi, make-up artist o stylist per il tuo shooting. Ti aiutiamo a costruire il team giusto basato sul tuo concept.",
    },
    {
      title: "Shooting Brand & Prodotto",
      short: "Brand",
      description:
        "Fotografia di prodotto, lookbook fashion e creazione di contenuti per brand. Una configurazione semplice ed efficiente per aziende che necessitano di immagini di alta qualità.",
    },
    {
      title: "Direzione Creativa & Supporto Shooting",
      short: "Direzione",
      description:
        "Assistenza nello sviluppo del concept, moodboard e direzione sul set. Per clienti che desiderano supporto extra nel definire la direzione visiva del loro shooting.",
    },
    {
      title: "Assistenza Studio",
      short: "On-Set",
      description:
        "Supporto base sul set inclusi setup luci e assistenza generale durante lo shooting, per un workflow fluido ed efficiente.",
    },
  ],
};

const t = {
  en: {
    tag: "Services",
    h1: "Other Services",
    heroSub: "Beyond the studio space — production support tailored to your shoot.",
    intro:
      "Cee Studio is primarily a rental photography space. For clients who need additional support, we also offer a selection of services to complement your shoot and simplify the production process.",
    introNote: "All services are optional and available upon request.",
    sectionTag: "Selection",
    sectionH2: "Production Support",
    outro:
      "All services are tailored to each project and can be combined with your studio booking depending on your needs.",
  },
  de: {
    tag: "Services",
    h1: "Weitere Services",
    heroSub: "Über die Studiomiete hinaus — Produktionssupport für Ihr Shooting.",
    intro:
      "Cee Studio ist in erster Linie ein mietbares Fotostudio. Für Kundinnen und Kunden, die zusätzliche Unterstützung benötigen, bieten wir ergänzende Services an, die Ihr Shooting vereinfachen und den gesamten Ablauf unterstützen.",
    introNote: "Alle Leistungen sind optional und auf Anfrage verfügbar.",
    sectionTag: "Auswahl",
    sectionH2: "Produktions-Support",
    outro:
      "Alle Leistungen werden individuell auf das jeweilige Projekt abgestimmt und können je nach Bedarf mit der Studiomiete kombiniert werden.",
  },
  fr: {
    tag: "Services",
    h1: "Autres Services",
    heroSub: "Au-delà de la location — support de production sur-mesure.",
    intro:
      "Cee Studio est avant tout un studio photo à la location. Pour les clients qui ont besoin d'un soutien supplémentaire, nous proposons une sélection de services pour compléter votre shooting et simplifier le processus de production.",
    introNote: "Tous les services sont optionnels et disponibles sur demande.",
    sectionTag: "Sélection",
    sectionH2: "Support Production",
    outro:
      "Tous les services sont adaptés à chaque projet et peuvent être combinés avec votre réservation de studio selon vos besoins.",
  },
  it: {
    tag: "Servizi",
    h1: "Altri Servizi",
    heroSub: "Oltre l'affitto — supporto produzione su misura per il tuo shooting.",
    intro:
      "Cee Studio è principalmente uno spazio fotografico in affitto. Per i clienti che necessitano di supporto aggiuntivo, offriamo una selezione di servizi per completare il vostro shooting e semplificare il processo di produzione.",
    introNote: "Tutti i servizi sono opzionali e disponibili su richiesta.",
    sectionTag: "Selezione",
    sectionH2: "Supporto Produzione",
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
      {/* Hero banner */}
      <section className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
        <Image
          src="/images/lounge-alt.jpg"
          alt="CEE Studio"
          fill
          priority
          className="object-cover animate-kenburns"
          style={{ objectPosition: "center 40%" }}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-foreground/45" />
        <div className="absolute inset-0 grain-overlay opacity-30 pointer-events-none" />

        {/* Editorial corner brackets */}
        <div className="pointer-events-none absolute inset-6 md:inset-12 z-10">
          <span className="absolute top-0 left-0 w-7 h-7 md:w-9 md:h-9 border-t border-l border-background/60" />
          <span className="absolute top-0 right-0 w-7 h-7 md:w-9 md:h-9 border-t border-r border-background/60" />
          <span className="absolute bottom-0 left-0 w-7 h-7 md:w-9 md:h-9 border-b border-l border-background/60" />
          <span className="absolute bottom-0 right-0 w-7 h-7 md:w-9 md:h-9 border-b border-r border-background/60" />
        </div>

        {/* Hero copy */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="font-sans text-background/85 text-[10px] md:text-xs uppercase tracking-[0.3em] mb-4 block">
              {tx.tag}
            </span>
            <h1 className="font-seasons text-5xl md:text-7xl lg:text-8xl text-background tracking-wide drop-shadow-md">
              {tx.h1}
            </h1>
            <p className="font-seasons italic text-xl md:text-2xl text-background/85 mt-5 max-w-2xl mx-auto">
              {tx.heroSub}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="pt-20 md:pt-28 pb-32">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* Intro */}
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="text-foreground/75 leading-relaxed text-lg md:text-xl">{tx.intro}</p>
            <p className="text-foreground/50 leading-relaxed mt-4 text-sm">{tx.introNote}</p>
          </motion.div>

          {/* Services */}
          <motion.div {...fadeUp} className="mt-24">
            <div className="flex items-end justify-between mb-12 border-b border-accent pb-6">
              <div>
                <Tag>{tx.sectionTag}</Tag>
                <h2 className="font-seasons text-4xl md:text-5xl mt-3">{tx.sectionH2}</h2>
              </div>
              <span className="font-seasons text-xl md:text-2xl text-foreground/40 hidden sm:block">
                — {String(services[l].length).padStart(2, "0")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
              {services[l].map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
                  className="group cursor-default"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-foreground/5">
                    <Image
                      src={serviceImages[i] ?? "/images/studio-hero.jpg"}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/10 to-transparent transition-opacity duration-500 group-hover:from-foreground/40" />

                    {/* Number badge top-left */}
                    <span className="absolute top-4 left-4 md:top-5 md:left-5 font-seasons text-background text-3xl md:text-4xl drop-shadow-md">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Short label top-right */}
                    <span className="absolute top-5 right-4 md:top-6 md:right-5 font-sans text-background/85 text-[9px] md:text-[10px] uppercase tracking-[0.25em] border border-background/50 px-2 py-1 backdrop-blur-[2px]">
                      {service.short}
                    </span>

                    {/* Title at bottom of image */}
                    <div className="absolute bottom-4 left-4 right-4 md:bottom-5 md:left-5 md:right-5 z-10">
                      <h3 className="font-seasons text-xl md:text-2xl text-background drop-shadow-md leading-tight">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-foreground/65 leading-relaxed text-sm mt-5">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.p
            {...fadeUp}
            className="mt-20 text-foreground/50 text-sm leading-relaxed border-t border-accent pt-8 max-w-3xl"
          >
            {tx.outro}
          </motion.p>
        </div>
      </div>
      <CtaBanner />
    </>
  );
}
