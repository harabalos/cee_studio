"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import { useLang } from "@/contexts/LanguageContext";

const faqList = {
  en: [
    {
      question: "Is there parking?",
      answer: "Yes, parking is available directly under the building. It can be accessed via the Serpy application at approximately 1.5 CHF per hour.",
    },
    {
      question: "Where is the studio located?",
      answer: "The studio is located at Thurgauerstrasse 117, 8152 Glattpark (Opfikon) — TMC Fashion Square AG.",
    },
    {
      question: "What floor is it on?",
      answer: "The studio is located on the 5th floor of the building, Studio 560.",
    },
    {
      question: "How big is the studio?",
      answer: "The studio is 60 m² and designed as a clean, minimal space for photography and content creation.",
    },
    {
      question: "Can I bring people?",
      answer: "Yes, you can bring your team. Please keep the number of people reasonable according to the size of the space and your booking.",
    },
    {
      question: "Is there a deposit required?",
      answer: "A deposit may be required depending on the type of booking. Please contact us for more details.",
    },
    {
      question: "Can I extend my booking?",
      answer: "Yes, extensions are possible depending on availability. Please contact us during your session to arrange this.",
    },
    {
      question: "Booking hours and setup",
      answer: "Your booking time includes setup time. If you require a late check-out, please inform us in advance.",
    },
    {
      question: "Can I cancel or reschedule?",
      answer: "Weekend bookings cannot be cancelled or rescheduled, as these are high-demand days. For weekday bookings, rescheduling may be possible if requested at least 48 hours in advance.",
    },
    {
      question: "Do you offer other services like photographers and makeup artists?",
      answer: "Yes, if you need a photographer, makeup artist or other services, feel free to contact us and we can help arrange it.",
    },
    {
      question: "Can I bring a photographer?",
      answer: "Yes, of course. You are welcome to bring your own photographer and team.",
    },
    {
      question: "Do you have a lift in the building?",
      answer: "Yes, the building has multiple lifts for easy access to the studio.",
    },
  ],
  de: [
    {
      question: "Gibt es Parkplätze?",
      answer: "Ja, direkt unter dem Gebäude stehen Parkplätze zur Verfügung. Diese sind über die Serpy-App buchbar (ca. 1.50 CHF pro Stunde).",
    },
    {
      question: "Wo befindet sich das Studio?",
      answer: "Das Studio befindet sich an der Thurgauerstrasse 117, 8152 Glattpark (Opfikon) — TMC Fashion Square AG.",
    },
    {
      question: "In welchem Stock ist das Studio?",
      answer: "Das Studio befindet sich im 5. Stock, Studio 560.",
    },
    {
      question: "Wie gross ist das Studio?",
      answer: "Das Studio ist 60 m² gross und als cleaner, minimalistischer Raum für Fotografie und Content Creation konzipiert.",
    },
    {
      question: "Kann ich Personen mitbringen?",
      answer: "Ja, Sie können Ihr Team mitbringen. Bitte halten Sie die Anzahl Personen im Verhältnis zur Studiogrösse und Ihrer Buchung angemessen.",
    },
    {
      question: "Wird eine Kaution verlangt?",
      answer: "Je nach Buchungstyp kann eine Kaution erforderlich sein. Bitte kontaktieren Sie uns für weitere Details.",
    },
    {
      question: "Kann ich meine Buchung verlängern?",
      answer: "Ja, Verlängerungen sind je nach Verfügbarkeit möglich. Bitte kontaktieren Sie uns während Ihrer Session.",
    },
    {
      question: "Buchungszeiten und Setup",
      answer: "Ihre Buchungszeit inkludiert die Aufbauzeit. Falls Sie einen späteren Check-out benötigen, geben Sie uns bitte im Voraus Bescheid.",
    },
    {
      question: "Kann ich stornieren oder umbuchen?",
      answer: "Wochenend-Buchungen können nicht storniert oder umgebucht werden, da diese Tage stark nachgefragt sind. Werktag-Buchungen können bei einer Anfrage mindestens 48 Stunden im Voraus umgebucht werden.",
    },
    {
      question: "Bieten Sie auch andere Services wie Fotografen oder Make-up Artists an?",
      answer: "Ja, wenn Sie einen Fotografen, Make-up Artist oder andere Services benötigen, kontaktieren Sie uns gerne und wir helfen bei der Organisation.",
    },
    {
      question: "Kann ich einen Fotografen mitbringen?",
      answer: "Ja, selbstverständlich. Sie können Ihren eigenen Fotografen und Ihr Team mitbringen.",
    },
    {
      question: "Gibt es einen Lift im Gebäude?",
      answer: "Ja, das Gebäude verfügt über mehrere Lifte für den bequemen Zugang zum Studio.",
    },
  ],
  fr: [
    { question: "Y a-t-il un parking ?", answer: "Oui, un parking est disponible directement sous le bâtiment. Il est accessible via l'application Serpy à environ 1.50 CHF par heure." },
    { question: "Où se trouve le studio ?", answer: "Le studio se trouve à Thurgauerstrasse 117, 8152 Glattpark (Opfikon) — TMC Fashion Square AG." },
    { question: "À quel étage se trouve-t-il ?", answer: "Le studio se trouve au 5ème étage du bâtiment, Studio 560." },
    { question: "Quelle est la taille du studio ?", answer: "Le studio fait 60 m² et est conçu comme un espace épuré et minimaliste pour la photographie et la création de contenu." },
    { question: "Puis-je amener du monde ?", answer: "Oui, vous pouvez amener votre équipe. Veuillez garder le nombre de personnes raisonnable selon la taille de l'espace et votre réservation." },
    { question: "Une caution est-elle requise ?", answer: "Une caution peut être demandée selon le type de réservation. Veuillez nous contacter pour plus de détails." },
    { question: "Puis-je prolonger ma réservation ?", answer: "Oui, des prolongations sont possibles selon disponibilité. Veuillez nous contacter pendant votre session pour l'organiser." },
    { question: "Heures de réservation et installation", answer: "Votre temps de réservation inclut le temps d'installation. Si vous avez besoin d'un check-out tardif, veuillez nous prévenir à l'avance." },
    { question: "Puis-je annuler ou reporter ?", answer: "Les réservations de week-end ne peuvent pas être annulées ou reportées, car ce sont des jours très demandés. Pour les réservations en semaine, le report est possible si demandé au moins 48 heures à l'avance." },
    { question: "Proposez-vous d'autres services comme photographes et maquilleurs ?", answer: "Oui, si vous avez besoin d'un photographe, maquilleur ou autres services, contactez-nous et nous pouvons aider à organiser cela." },
    { question: "Puis-je amener un photographe ?", answer: "Oui, bien sûr. Vous pouvez amener votre propre photographe et équipe." },
    { question: "Y a-t-il un ascenseur dans le bâtiment ?", answer: "Oui, le bâtiment dispose de plusieurs ascenseurs pour un accès facile au studio." },
  ],
  it: [
    { question: "C'è un parcheggio?", answer: "Sì, il parcheggio è disponibile direttamente sotto l'edificio. È accessibile tramite l'applicazione Serpy a circa 1.50 CHF all'ora." },
    { question: "Dove si trova lo studio?", answer: "Lo studio si trova a Thurgauerstrasse 117, 8152 Glattpark (Opfikon) — TMC Fashion Square AG." },
    { question: "A che piano si trova?", answer: "Lo studio si trova al 5° piano dell'edificio, Studio 560." },
    { question: "Quanto è grande lo studio?", answer: "Lo studio è di 60 m² ed è progettato come uno spazio pulito e minimalista per fotografia e content creation." },
    { question: "Posso portare delle persone?", answer: "Sì, puoi portare il tuo team. Si prega di mantenere il numero di persone ragionevole rispetto alle dimensioni dello spazio e alla prenotazione." },
    { question: "È richiesto un deposito?", answer: "Un deposito può essere richiesto a seconda del tipo di prenotazione. Contattateci per maggiori dettagli." },
    { question: "Posso estendere la mia prenotazione?", answer: "Sì, le estensioni sono possibili in base alla disponibilità. Contattateci durante la vostra sessione per organizzarlo." },
    { question: "Orari di prenotazione e setup", answer: "Il tuo tempo di prenotazione include il tempo di setup. Se hai bisogno di un check-out tardivo, ti preghiamo di informarci in anticipo." },
    { question: "Posso cancellare o riprogrammare?", answer: "Le prenotazioni del weekend non possono essere cancellate o riprogrammate, poiché sono giorni ad alta richiesta. Per le prenotazioni infrasettimanali, la riprogrammazione è possibile se richiesta con almeno 48 ore di anticipo." },
    { question: "Offrite altri servizi come fotografi e make-up artist?", answer: "Sì, se hai bisogno di un fotografo, make-up artist o altri servizi, contattaci e possiamo aiutarti a organizzarlo." },
    { question: "Posso portare un fotografo?", answer: "Sì, certamente. Sei il benvenuto a portare il tuo fotografo e team." },
    { question: "C'è un ascensore nell'edificio?", answer: "Sì, l'edificio dispone di più ascensori per un facile accesso allo studio." },
  ],
};

const t = {
  en: { tag: "Information", h1: "FAQ" },
  de: { tag: "Informationen", h1: "FAQ" },
  fr: { tag: "Informations", h1: "FAQ" },
  it: { tag: "Informazioni", h1: "FAQ" },
};

export default function FAQPage() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as "en" | "de" | "fr" | "it";
  const tx = t[l];

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Tag>{tx.tag}</Tag>
        <h1 className="font-seasons text-5xl md:text-7xl text-brand mt-4 mb-16">
          {tx.h1}
        </h1>

        <div className="space-y-12">
          {faqList[l].map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="border-b border-accent pb-10"
            >
              <h2 className="font-seasons text-2xl md:text-3xl text-foreground font-semibold mb-4">
                {faq.question}
              </h2>
              <p className="text-foreground/70 leading-relaxed font-light text-sm md:text-base">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
