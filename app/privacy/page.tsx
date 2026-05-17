"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";
import { useLang } from "@/contexts/LanguageContext";

type Lang = "de" | "en" | "fr" | "it";

const t: Record<Lang, {
  tag: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
  contact: { heading: string; address: string };
  lastUpdated: string;
}> = {
  en: {
    tag: "Legal",
    title: "Privacy Policy",
    intro:
      "CEE Studio respects your privacy and handles personal information confidentially and in accordance with applicable Swiss and European data protection regulations.",
    sections: [
      {
        heading: "Collection of Personal Data",
        body:
          "Personal data may be collected when you contact us via email, WhatsApp or social media, submit a booking request, visit our website, or subscribe to newsletters or updates. The collected information may include name, email address, phone number, billing information and booking details.",
      },
      {
        heading: "Use of Data",
        body:
          "Your data is used exclusively for processing bookings and payments, communication regarding studio services, customer support and internal administrative purposes. We do not sell or share personal information with third parties unless legally required or necessary for payment and booking processing.",
      },
      {
        heading: "Website & Cookies",
        body:
          "Our website may use cookies or analytics tools to improve user experience and website performance.",
      },
      {
        heading: "Data Security",
        body:
          "CEE Studio takes reasonable technical and organisational measures to protect personal information against loss, misuse or unauthorised access.",
      },
      {
        heading: "Social Media & External Links",
        body:
          "Our website may contain links to Instagram or other external platforms. We are not responsible for the privacy practices of third party websites.",
      },
      {
        heading: "Your Rights",
        body:
          "You may request access, correction or deletion of your personal data at any time by contacting us.",
      },
    ],
    contact: {
      heading: "Contact",
      address:
        "For privacy related questions, please contact:\nCEE Studio\nThurgauerstrasse 117\n8152 Glattpark, Switzerland\ninfo@ceestudio.ch",
    },
    lastUpdated: "Last updated",
  },
  de: {
    tag: "Rechtliches",
    title: "Datenschutzerklärung",
    intro:
      "CEE Studio respektiert Ihre Privatsphäre und behandelt persönliche Informationen vertraulich und gemäss den geltenden Schweizer und europäischen Datenschutzbestimmungen.",
    sections: [
      {
        heading: "Erhebung personenbezogener Daten",
        body:
          "Personenbezogene Daten können erhoben werden, wenn Sie uns per E-Mail, WhatsApp oder über soziale Medien kontaktieren, eine Buchungsanfrage senden, unsere Website besuchen oder Newsletter abonnieren. Die erhobenen Informationen können Name, E-Mail-Adresse, Telefonnummer, Rechnungsangaben und Buchungsdetails umfassen.",
      },
      {
        heading: "Verwendung der Daten",
        body:
          "Ihre Daten werden ausschliesslich verwendet für die Abwicklung von Buchungen und Zahlungen, die Kommunikation bezüglich Studio-Dienstleistungen, den Kundensupport sowie für interne Verwaltungszwecke. Wir verkaufen oder teilen persönliche Informationen nicht mit Dritten, es sei denn, dies ist gesetzlich vorgeschrieben oder für die Zahlungs- und Buchungsabwicklung notwendig.",
      },
      {
        heading: "Website & Cookies",
        body:
          "Unsere Website kann Cookies oder Analyse-Tools verwenden, um die Benutzererfahrung und Website-Leistung zu verbessern.",
      },
      {
        heading: "Datensicherheit",
        body:
          "CEE Studio trifft angemessene technische und organisatorische Massnahmen, um persönliche Daten vor Verlust, Missbrauch oder unbefugtem Zugriff zu schützen.",
      },
      {
        heading: "Soziale Medien & externe Links",
        body:
          "Unsere Website kann Links zu Instagram oder anderen externen Plattformen enthalten. Wir sind nicht verantwortlich für die Datenschutzpraktiken von Drittanbieter-Websites.",
      },
      {
        heading: "Ihre Rechte",
        body:
          "Sie können jederzeit Auskunft, Berichtigung oder Löschung Ihrer persönlichen Daten beantragen, indem Sie uns kontaktieren.",
      },
    ],
    contact: {
      heading: "Kontakt",
      address:
        "Für Fragen zum Datenschutz kontaktieren Sie uns bitte:\nCEE Studio\nThurgauerstrasse 117\n8152 Glattpark, Schweiz\ninfo@ceestudio.ch",
    },
    lastUpdated: "Zuletzt aktualisiert",
  },
  fr: {
    tag: "Mentions légales",
    title: "Politique de confidentialité",
    intro:
      "CEE Studio respecte votre vie privée et traite les informations personnelles de manière confidentielle, conformément aux réglementations suisses et européennes en matière de protection des données.",
    sections: [
      {
        heading: "Collecte de données personnelles",
        body:
          "Des données personnelles peuvent être collectées lorsque vous nous contactez par e-mail, WhatsApp ou via les réseaux sociaux, soumettez une demande de réservation, visitez notre site web ou vous abonnez à notre newsletter. Les informations recueillies peuvent inclure votre nom, adresse e-mail, numéro de téléphone, informations de facturation et détails de réservation.",
      },
      {
        heading: "Utilisation des données",
        body:
          "Vos données sont utilisées exclusivement pour le traitement des réservations et paiements, la communication concernant les services du studio, le support client et les fins administratives internes. Nous ne vendons ni ne partageons d'informations personnelles avec des tiers, sauf si la loi l'exige ou si cela est nécessaire au traitement des paiements et des réservations.",
      },
      {
        heading: "Site web & Cookies",
        body:
          "Notre site web peut utiliser des cookies ou des outils d'analyse pour améliorer l'expérience utilisateur et les performances du site.",
      },
      {
        heading: "Sécurité des données",
        body:
          "CEE Studio prend des mesures techniques et organisationnelles raisonnables pour protéger les informations personnelles contre la perte, l'utilisation abusive ou l'accès non autorisé.",
      },
      {
        heading: "Réseaux sociaux & Liens externes",
        body:
          "Notre site peut contenir des liens vers Instagram ou d'autres plateformes externes. Nous ne sommes pas responsables des pratiques de confidentialité des sites tiers.",
      },
      {
        heading: "Vos droits",
        body:
          "Vous pouvez demander à tout moment l'accès, la correction ou la suppression de vos données personnelles en nous contactant.",
      },
    ],
    contact: {
      heading: "Contact",
      address:
        "Pour toute question relative à la confidentialité, veuillez nous contacter :\nCEE Studio\nThurgauerstrasse 117\n8152 Glattpark, Suisse\ninfo@ceestudio.ch",
    },
    lastUpdated: "Dernière mise à jour",
  },
  it: {
    tag: "Note legali",
    title: "Informativa sulla privacy",
    intro:
      "CEE Studio rispetta la tua privacy e tratta le informazioni personali in modo riservato, in conformità con le normative svizzere ed europee sulla protezione dei dati.",
    sections: [
      {
        heading: "Raccolta di dati personali",
        body:
          "I dati personali possono essere raccolti quando ci contatti via email, WhatsApp o tramite social media, invii una richiesta di prenotazione, visiti il nostro sito web o ti iscrivi alla nostra newsletter. Le informazioni raccolte possono includere nome, indirizzo email, numero di telefono, informazioni di fatturazione e dettagli della prenotazione.",
      },
      {
        heading: "Utilizzo dei dati",
        body:
          "I tuoi dati sono utilizzati esclusivamente per l'elaborazione di prenotazioni e pagamenti, la comunicazione relativa ai servizi dello studio, l'assistenza clienti e per scopi amministrativi interni. Non vendiamo né condividiamo informazioni personali con terze parti se non legalmente richiesto o necessario per l'elaborazione dei pagamenti e delle prenotazioni.",
      },
      {
        heading: "Sito web & Cookie",
        body:
          "Il nostro sito web può utilizzare cookie o strumenti di analisi per migliorare l'esperienza utente e le prestazioni del sito.",
      },
      {
        heading: "Sicurezza dei dati",
        body:
          "CEE Studio adotta misure tecniche e organizzative ragionevoli per proteggere le informazioni personali da perdita, uso improprio o accesso non autorizzato.",
      },
      {
        heading: "Social media & Link esterni",
        body:
          "Il nostro sito può contenere link a Instagram o altre piattaforme esterne. Non siamo responsabili delle pratiche sulla privacy dei siti web di terze parti.",
      },
      {
        heading: "I tuoi diritti",
        body:
          "Puoi richiedere l'accesso, la correzione o la cancellazione dei tuoi dati personali in qualsiasi momento contattandoci.",
      },
    ],
    contact: {
      heading: "Contatti",
      address:
        "Per domande relative alla privacy, contattaci:\nCEE Studio\nThurgauerstrasse 117\n8152 Glattpark, Svizzera\ninfo@ceestudio.ch",
    },
    lastUpdated: "Ultimo aggiornamento",
  },
};

const LAST_UPDATED = "May 2026";

export default function PrivacyPage() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as Lang;
  const tx = t[l] ?? t.en;

  return (
    <>
      <div className="pt-32 pb-24 px-6 md:px-10 max-w-4xl mx-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Tag>{tx.tag}</Tag>
          <h1 className="font-seasons text-5xl md:text-7xl text-brand mt-4">
            {tx.title}
          </h1>
          <p className="mt-6 text-foreground/70 max-w-2xl text-base md:text-lg leading-relaxed">
            {tx.intro}
          </p>

          <div className="mt-16 space-y-12">
            {tx.sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="border-b border-accent pb-10"
              >
                <h2 className="font-seasons text-2xl md:text-3xl text-foreground font-semibold mb-4">
                  {section.heading}
                </h2>
                <p className="text-foreground/70 leading-relaxed font-light text-base">
                  {section.body}
                </p>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: tx.sections.length * 0.06 }}
              className="pb-10"
            >
              <h2 className="font-seasons text-2xl md:text-3xl text-foreground font-semibold mb-4">
                {tx.contact.heading}
              </h2>
              <p className="text-foreground/70 leading-relaxed font-light text-base whitespace-pre-line">
                {tx.contact.address}
              </p>
            </motion.div>

            <p className="text-foreground/50 text-xs italic mt-8">
              {tx.lastUpdated}: {LAST_UPDATED}
            </p>
          </div>
        </motion.div>
      </div>
      <CtaBanner />
    </>
  );
}
