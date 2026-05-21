"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import Divider from "@/components/ui/Divider";
import Breadcrumbs from "@/components/Breadcrumbs";
import { bcBlogPost } from "@/lib/breadcrumb-labels";
import { useLang } from "@/contexts/LanguageContext";
import { getPost } from "@/lib/blog/posts";

type Lang = "en" | "de" | "fr" | "it";

const post = getPost("willkommen-cee-studio-guide")!;

// Article JSON-LD (rich results in Google + News carousel eligibility)
const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title.de,
  description: post.summary.de,
  image: [`https://ceestudio.ch${post.image}`],
  datePublished: post.publishedAt,
  dateModified: post.updatedAt ?? post.publishedAt,
  author: {
    "@type": "Organization",
    name: "CEE Studio",
    url: "https://ceestudio.ch/about",
  },
  publisher: {
    "@type": "Organization",
    name: "CEE Studio",
    logo: {
      "@type": "ImageObject",
      url: "https://ceestudio.ch/apple-icon",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://ceestudio.ch/blog/${post.slug}`,
  },
  inLanguage: "de-CH",
};

const t: Record<Lang, {
  category: string;
  readMin: (n: number) => string;
  publishedOn: string;
  backToBlog: string;
  // Article content
  lead: string;
  // Section 1
  s1H: string;
  s1P1: string;
  // Section 2
  s2H: string;
  s2P: string;
  s2List: string[];
  // Section 3
  s3H: string;
  s3Steps: { num: string; title: string; desc: string }[];
  // Section 4
  s4H: string;
  s4P: string;
  s4Bullets: string[];
  // Section 5
  s5H: string;
  s5P: string;
  // Section 6
  s6H: string;
  s6P1: string;
  s6P2: string;
  // CTA
  ctaTitle: string;
  ctaBtn: string;
  // Inline links
  studioLink: string;
  equipmentLink: string;
  bookingLink: string;
  membershipLink: string;
  faqLink: string;
  contactLink: string;
}> = {
  de: {
    category: "Willkommen",
    readMin: (n) => `${n} Min. Lesezeit`,
    publishedOn: "Veröffentlicht am",
    backToBlog: "← Zurück zum Blog",
    lead: "Schön, dass du da bist! Wir sind das CEE Studio — ein modernes Fotostudio mitten in Zürich. Hier ist ein kurzer Rundgang durch alles, was du auf unserer Website tun kannst.",
    s1H: "Wer wir sind",
    s1P1: "CEE Studio ist ein 60 m² Tageslichtstudio in Zürich. Wir bieten Self-Service Vermietung — das heisst, du buchst online, kommst vorbei, machst dein Shoot und gehst wieder. Keine versteckten Gebühren, keine umständlichen Anrufe, keine Wartezeiten.",
    s2H: "Was du auf der Website finden kannst",
    s2P: "Die Seite ist absichtlich einfach gehalten — du findest alles in maximal zwei Klicks:",
    s2List: [
      "Studio — Specs, Stundentarife und Monats-ABO auf einen Blick",
      "Equipment — komplette Liste mit Cyc Wall, Beleuchtung, Make-up Bereich und Möbel",
      "Weitere Services — was wir noch anbieten ausser Studio-Miete",
      "Kontakt — Telefon, E-Mail und Anfahrt nach Glattpark",
      "FAQ — Antworten auf die häufigsten Fragen",
    ],
    s3H: "So buchst du das Studio in 4 Schritten",
    s3Steps: [
      {
        num: "1",
        title: "Datum & Uhrzeit wählen",
        desc: "Auf der Buchungsseite siehst du in Echtzeit, wann das Studio frei ist. Wähle eine Dauer (1h, 2h, 3h, 4h oder 8h) und einen Slot.",
      },
      {
        num: "2",
        title: "Add-ons auswählen",
        desc: "Optional: extra Beleuchtung, mehr Hintergrundpapiere, Late-Night Aufschlag. Nichts ist Pflicht.",
      },
      {
        num: "3",
        title: "Bezahlen",
        desc: "Karte oder TWINT. B2B-Kunden können auch per Rechnung zahlen (auf Anfrage).",
      },
      {
        num: "4",
        title: "Tür-Code & WiFi-Passwort kommen per E-Mail",
        desc: "Direkt nach der Bezahlung erhältst du eine Bestätigung mit allem, was du wissen musst — inkl. PDF Vertrag und Rechnung.",
      },
    ],
    s4H: "ABO Membership — lohnt sich das für dich?",
    s4P: "Wenn du regelmässig Shoots machst, sparst du mit einem ABO bis zu 30%. Du zahlst einen monatlichen Fixbetrag und bekommst eine bestimmte Anzahl Stunden, die du frei einteilen kannst.",
    s4Bullets: [
      "Mindestlaufzeit: 3 Monate — danach jederzeit kündbar",
      "Ungenutzte Stunden werden in den nächsten Monat übertragen (1× pro Monat)",
      "Frühere Verfügbarkeit für stark nachgefragte Slots",
    ],
    s5H: "Hausregeln & FAQ",
    s5P: "Unsere Studio-Regeln decken alles ab, was du wissen musst — Zutrittszeiten, Zugangscode, maximale Personenanzahl, Musik & Lärm, Essen & Trinken, Sauberkeit, Equipment-Handhabung und Überstunden. Und das FAQ beantwortet die häufigsten Fragen zu Parkplätzen, Anfahrt und Umbuchungen.",
    s6H: "Hast du Fragen?",
    s6P1: "Schreib uns einfach. Wir antworten meistens innerhalb von ein paar Stunden — werktags meist sofort.",
    s6P2: "Wir freuen uns, dich bei deinem ersten Shoot zu sehen.",
    ctaTitle: "Jetzt buchen — Fotostudio Zürich",
    ctaBtn: "Studio buchen →",
    studioLink: "Studio & Preise",
    equipmentLink: "Equipment & Galerie",
    bookingLink: "Buchungsseite",
    membershipLink: "ABO Membership",
    faqLink: "FAQ",
    contactLink: "Kontakt",
  },
  en: {
    category: "Welcome",
    readMin: (n) => `${n} min read`,
    publishedOn: "Published on",
    backToBlog: "← Back to blog",
    lead: "Glad you're here! We're CEE Studio — a modern photo studio in Zurich. Here's a quick walk-through of everything you can do on our website.",
    s1H: "Who we are",
    s1P1: "CEE Studio is a 60 m² daylight studio in Zurich. We offer self-service rental — meaning you book online, come in, shoot, and leave. No hidden fees, no awkward phone calls, no waiting around.",
    s2H: "What you can find on the site",
    s2P: "The site is intentionally simple — everything is two clicks away or less:",
    s2List: [
      "Studio — specs, hourly rates and monthly memberships at a glance",
      "Equipment — full list with cyc wall, lighting, makeup area and furniture",
      "Other services — what we offer beyond studio rental",
      "Contact — phone, email and how to get to Glattpark",
      "FAQ — answers to the most common questions",
    ],
    s3H: "How to book the studio in 4 steps",
    s3Steps: [
      { num: "1", title: "Pick a date & time", desc: "Real-time availability — pick a duration (1h to 8h) and a slot." },
      { num: "2", title: "Choose add-ons", desc: "Optional: extra lighting, more backdrop rolls, late-night. Nothing is mandatory." },
      { num: "3", title: "Pay", desc: "Card or TWINT. B2B clients can pay by invoice on request." },
      { num: "4", title: "Door code & WiFi arrive by email", desc: "Right after payment you get a confirmation with everything you need — including the usage agreement PDF and invoice." },
    ],
    s4H: "Membership — is it worth it for you?",
    s4P: "If you shoot regularly, a membership saves you up to 30%. You pay a fixed monthly amount and get a set number of hours to use whenever you want.",
    s4Bullets: [
      "3-month minimum commitment — then cancel anytime",
      "Unused hours roll over to the next month (1× per month)",
      "Priority access for high-demand slots",
    ],
    s5H: "House rules & FAQ",
    s5P: "Our studio rules cover everything you need to know — access hours, key code, maximum guests, music & noise, food & drinks, cleanliness, equipment handling and overtime. And the FAQ answers the most common questions about parking, transit and rescheduling.",
    s6H: "Got questions?",
    s6P1: "Just write us. We usually reply within a few hours — often immediately on weekdays.",
    s6P2: "See you at your first shoot.",
    ctaTitle: "Book now — photo studio Zurich",
    ctaBtn: "Book the studio →",
    studioLink: "Studio & pricing",
    equipmentLink: "Equipment & gallery",
    bookingLink: "Booking page",
    membershipLink: "Membership",
    faqLink: "FAQ",
    contactLink: "Contact",
  },
  fr: {
    category: "Bienvenue",
    readMin: (n) => `${n} min de lecture`,
    publishedOn: "Publié le",
    backToBlog: "← Retour au blog",
    lead: "Ravis de t'avoir ici ! Nous sommes CEE Studio — un studio photo moderne à Zurich. Voici une rapide visite de tout ce que tu peux faire sur notre site.",
    s1H: "Qui nous sommes",
    s1P1: "CEE Studio est un studio de 60 m² avec lumière naturelle à Zurich. Location en self-service : tu réserves en ligne, tu viens, tu shootes, tu repars. Pas de frais cachés, pas d'appels gênants.",
    s2H: "Ce que tu trouves sur le site",
    s2P: "Le site est volontairement simple — tout est à deux clics maximum :",
    s2List: [
      "Studio — specs, tarifs horaires et forfaits mensuels en un coup d'œil",
      "Équipement — liste complète : cyc wall, éclairage, espace maquillage, mobilier",
      "Autres services — ce qu'on propose en plus de la location",
      "Contact — téléphone, e-mail, accès à Glattpark",
      "FAQ — les questions les plus courantes",
    ],
    s3H: "Comment réserver en 4 étapes",
    s3Steps: [
      { num: "1", title: "Choisis date & heure", desc: "Disponibilité en temps réel — choisis une durée (1h à 8h) et un créneau." },
      { num: "2", title: "Options", desc: "En option : éclairage supplémentaire, plus de fonds, late-night. Rien n'est obligatoire." },
      { num: "3", title: "Paiement", desc: "Carte ou TWINT. Les clients B2B peuvent payer par facture sur demande." },
      { num: "4", title: "Code & WiFi par e-mail", desc: "Juste après le paiement, tu reçois une confirmation avec tout ce qu'il faut — contrat PDF et facture inclus." },
    ],
    s4H: "Abonnement — est-ce pour toi ?",
    s4P: "Si tu shootes régulièrement, un abonnement t'économise jusqu'à 30%. Tu paies un montant mensuel fixe et reçois un nombre d'heures à utiliser quand tu veux.",
    s4Bullets: [
      "Engagement minimum 3 mois — annulation libre ensuite",
      "Les heures non utilisées sont reportées au mois suivant (1× par mois)",
      "Accès prioritaire aux créneaux populaires",
    ],
    s5H: "Règles & FAQ",
    s5P: "Nos règles du studio couvrent tout ce que tu dois savoir — horaires d'accès, code, nombre maximum d'invités, musique & bruit, nourriture & boissons, propreté, gestion de l'équipement et heures supplémentaires. Et la FAQ répond aux questions courantes sur le parking, les transports et les modifications.",
    s6H: "Des questions ?",
    s6P1: "Écris-nous. Nous répondons généralement en quelques heures — souvent immédiatement en semaine.",
    s6P2: "À très vite pour ton premier shoot.",
    ctaTitle: "Réserve maintenant — studio photo Zurich",
    ctaBtn: "Réserver →",
    studioLink: "Studio & tarifs",
    equipmentLink: "Équipement & galerie",
    bookingLink: "Page de réservation",
    membershipLink: "Abonnement",
    faqLink: "FAQ",
    contactLink: "Contact",
  },
  it: {
    category: "Benvenuto",
    readMin: (n) => `${n} min di lettura`,
    publishedOn: "Pubblicato il",
    backToBlog: "← Torna al blog",
    lead: "Felici che tu sia qui! Siamo CEE Studio — uno studio fotografico moderno a Zurigo. Ecco una rapida panoramica di tutto ciò che puoi fare sul nostro sito.",
    s1H: "Chi siamo",
    s1P1: "CEE Studio è uno studio di 60 m² con luce naturale a Zurigo. Affitto self-service: prenoti online, vieni, scatti, te ne vai. Niente costi nascosti, niente telefonate scomode.",
    s2H: "Cosa trovi sul sito",
    s2P: "Il sito è volutamente semplice — tutto è a due click di distanza:",
    s2List: [
      "Studio — specs, tariffe orarie e abbonamenti mensili in un colpo d'occhio",
      "Attrezzatura — lista completa: cyc wall, illuminazione, area trucco, mobili",
      "Altri servizi — cosa offriamo oltre all'affitto",
      "Contatti — telefono, e-mail, come arrivare a Glattpark",
      "FAQ — le domande più frequenti",
    ],
    s3H: "Come prenotare in 4 passi",
    s3Steps: [
      { num: "1", title: "Scegli data & orario", desc: "Disponibilità in tempo reale — scegli durata (1h-8h) e slot." },
      { num: "2", title: "Extra opzionali", desc: "Opzionali: luce extra, più sfondi, late-night. Nulla è obbligatorio." },
      { num: "3", title: "Pagamento", desc: "Carta o TWINT. Clienti B2B possono pagare con fattura su richiesta." },
      { num: "4", title: "Codice porta & WiFi via e-mail", desc: "Subito dopo il pagamento ricevi conferma con tutto il necessario — incluso contratto PDF e fattura." },
    ],
    s4H: "Abbonamento — conviene a te?",
    s4P: "Se scatti regolarmente, un abbonamento ti fa risparmiare fino al 30%. Paghi un fisso mensile e ricevi un numero di ore da usare quando vuoi.",
    s4Bullets: [
      "Impegno minimo 3 mesi — poi cancellabile in qualsiasi momento",
      "Le ore non utilizzate vengono riportate al mese successivo (1× al mese)",
      "Accesso prioritario agli slot più richiesti",
    ],
    s5H: "Regole della casa & FAQ",
    s5P: "Le nostre regole dello studio coprono tutto ciò che devi sapere — orari di accesso, codice, numero massimo di ospiti, musica e rumore, cibo e bevande, pulizia, gestione dell'attrezzatura e straordinari. E la FAQ risponde alle domande più frequenti su parcheggio, trasporti e modifiche.",
    s6H: "Hai domande?",
    s6P1: "Scrivici. Di solito rispondiamo entro qualche ora — spesso subito durante i giorni feriali.",
    s6P2: "A presto al tuo primo shoot.",
    ctaTitle: "Prenota ora — studio fotografico Zurigo",
    ctaBtn: "Prenota lo studio →",
    studioLink: "Studio & prezzi",
    equipmentLink: "Attrezzatura & galleria",
    bookingLink: "Pagina di prenotazione",
    membershipLink: "Abbonamento",
    faqLink: "FAQ",
    contactLink: "Contatti",
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

export default function WelcomeGuidePost() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as Lang;
  const tx = t[l] ?? t.de;
  const date = new Date(post.publishedAt);
  const dateStr = date.toLocaleDateString(l === "de" ? "de-CH" : l, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="pt-32 pb-24 min-h-screen">
        {/* Breadcrumbs (replaces standalone back link) */}
        <div className="max-w-3xl mx-auto px-6 md:px-10 mb-8">
          <Breadcrumbs items={bcBlogPost(l, post.title[l])} />
        </div>

        {/* Title section */}
        <header className="max-w-3xl mx-auto px-6 md:px-10">
          <motion.div {...fadeUp}>
            <Tag>{tx.category}</Tag>
            <h1 className="font-seasons text-4xl md:text-6xl text-brand mt-4 leading-tight">
              {post.title[l]}
            </h1>
            <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-foreground/50">
              <span>{dateStr}</span>
              <span>·</span>
              <span>{tx.readMin(post.readingMinutes)}</span>
              <span>·</span>
              <span>CEE Studio</span>
            </div>
          </motion.div>
        </header>

        {/* Hero image */}
        <motion.div
          className="mt-12 relative aspect-[16/9] max-w-5xl mx-auto px-0 md:px-10"
          {...fadeUp}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <div className="relative w-full h-full">
            <Image
              src={post.image}
              alt="Fotostudio Zürich — CEE Studio Lounge mit Cowhide-Teppich und Aussicht"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        </motion.div>

        {/* Body */}
        <div className="max-w-3xl mx-auto px-6 md:px-10 mt-16 space-y-12">
          {/* Lead */}
          <motion.p
            className="text-lg md:text-xl text-foreground/80 leading-relaxed font-light"
            {...fadeUp}
          >
            {tx.lead}
          </motion.p>

          <Divider />

          {/* Section 1: Who we are */}
          <motion.section {...fadeUp}>
            <h2 className="font-seasons text-3xl md:text-4xl text-foreground mb-5">
              {tx.s1H}
            </h2>
            <p className="text-foreground/75 leading-relaxed">{tx.s1P1}</p>
          </motion.section>

          {/* Section 2: What's on the site */}
          <motion.section {...fadeUp}>
            <h2 className="font-seasons text-3xl md:text-4xl text-foreground mb-5">
              {tx.s2H}
            </h2>
            <p className="text-foreground/75 leading-relaxed mb-5">{tx.s2P}</p>
            <ul className="space-y-3">
              {tx.s2List.map((item, i) => {
                // The first 5 items map directly to the 5 page links below
                const links = [
                  { href: "/studio", label: tx.studioLink },
                  { href: "/equipment", label: tx.equipmentLink },
                  { href: "/space", label: tx.bookingLink },
                  { href: "/contact", label: tx.contactLink },
                  { href: "/faq", label: tx.faqLink },
                ];
                const linkObj = links[i];
                return (
                  <li key={i} className="flex gap-3 text-foreground/75">
                    <span className="text-brand font-seasons text-lg leading-tight mt-0.5">·</span>
                    <span className="leading-relaxed flex-1">
                      {item}
                      {linkObj && (
                        <>
                          {" — "}
                          <Link href={linkObj.href} className="text-brand hover:underline">
                            {linkObj.label}
                          </Link>
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.section>

          {/* Section 3: How to book */}
          <motion.section {...fadeUp}>
            <h2 className="font-seasons text-3xl md:text-4xl text-foreground mb-6">
              {tx.s3H}
            </h2>
            <div className="space-y-5">
              {tx.s3Steps.map((step) => (
                <div key={step.num} className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 border border-brand text-brand font-seasons text-lg flex items-center justify-center">
                    {step.num}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-seasons text-xl text-foreground mb-1">{step.title}</h3>
                    <p className="text-foreground/70 leading-relaxed text-[15px]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-foreground/75 leading-relaxed">
              <Link href="/booking" className="text-brand hover:underline">
                {tx.bookingLink} →
              </Link>
            </p>
          </motion.section>

          {/* Section 4: Membership */}
          <motion.section {...fadeUp}>
            <h2 className="font-seasons text-3xl md:text-4xl text-foreground mb-5">
              {tx.s4H}
            </h2>
            <p className="text-foreground/75 leading-relaxed mb-5">{tx.s4P}</p>
            <ul className="space-y-2 mb-5">
              {tx.s4Bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-foreground/75">
                  <span className="text-brand mt-1">→</span>
                  <span className="leading-relaxed flex-1">{b}</span>
                </li>
              ))}
            </ul>
            <p className="text-foreground/75 leading-relaxed">
              <Link href="/membership/signup" className="text-brand hover:underline">
                {tx.membershipLink} →
              </Link>
            </p>
          </motion.section>

          {/* Section 5: Rules & FAQ */}
          <motion.section {...fadeUp}>
            <h2 className="font-seasons text-3xl md:text-4xl text-foreground mb-5">
              {tx.s5H}
            </h2>
            <p className="text-foreground/75 leading-relaxed">
              {tx.s5P}{" "}
              <Link href="/rules" className="text-brand hover:underline">
                {l === "de" ? "Hausregeln" : l === "fr" ? "Règles" : l === "it" ? "Regole" : "House rules"}
              </Link>{" · "}
              <Link href="/faq" className="text-brand hover:underline">
                {tx.faqLink}
              </Link>
            </p>
          </motion.section>

          {/* Section 6: Questions */}
          <motion.section {...fadeUp}>
            <h2 className="font-seasons text-3xl md:text-4xl text-foreground mb-5">
              {tx.s6H}
            </h2>
            <p className="text-foreground/75 leading-relaxed">{tx.s6P1}</p>
            <p className="text-foreground/75 leading-relaxed mt-4 italic">— {tx.s6P2}</p>
            <p className="mt-6">
              <Link href="/contact" className="text-brand hover:underline">
                {tx.contactLink} →
              </Link>
            </p>
          </motion.section>

          <Divider />

          {/* CTA box */}
          <motion.div
            {...fadeUp}
            className="border border-accent bg-background p-8 md:p-10 text-center"
          >
            <p className="text-[10px] uppercase tracking-widest text-foreground/50">
              CEE Studio
            </p>
            <h3 className="font-seasons text-3xl md:text-4xl text-brand mt-3">
              {tx.ctaTitle}
            </h3>
            <Link
              href="/booking"
              className="inline-block mt-6 px-8 py-3 bg-brand text-background text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              {tx.ctaBtn}
            </Link>
          </motion.div>
        </div>
      </article>
    </>
  );
}
