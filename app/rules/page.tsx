"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import { bc } from "@/lib/breadcrumb-labels";
import { useLang } from "@/contexts/LanguageContext";

type Lang = "de" | "en" | "fr" | "it";

type RuleSection = { heading: string; body: string };

const t: Record<Lang, {
  tag: string;
  title: string;
  intro: string;
  sections: RuleSection[];
  lastUpdated: string;
}> = {
  en: {
    tag: "House Rules",
    title: "Studio Rules",
    intro:
      "Practical do's and don'ts for using the studio. By booking with us you agree to these rules. For the formal legal contract, see our Terms & Conditions.",
    sections: [
      {
        heading: "Access & Studio Hours",
        body:
          "Access to the studio is only permitted during the booked time slot. Please leave the studio on time to avoid additional overtime charges.",
      },
      {
        heading: "Key & Access Code",
        body:
          "The studio key must be returned to the lockbox after the booking. Access codes and entry information may not be shared with third parties.",
      },
      {
        heading: "Maximum Guests",
        body:
          "A maximum of 20 people is permitted inside the studio unless agreed otherwise in advance.",
      },
      {
        heading: "Music & Noise",
        body:
          "Music is allowed during bookings. Please keep the volume respectful, especially during evenings and weekends, as the building is shared with other businesses.",
      },
      {
        heading: "Food & Drinks",
        body:
          "Food and drinks are permitted inside the studio. Open flames, candles and cooking equipment are not allowed.",
      },
      {
        heading: "Smoking",
        body:
          "Smoking is not allowed inside the studio or building areas.",
      },
      {
        heading: "Cleanliness",
        body:
          "The studio does not need to be cleaned after the booking. We simply ask guests to leave the space tidy and return furniture or equipment to its original position. Disposable waste should be placed in the bins provided.",
      },
      {
        heading: "Equipment & Damages",
        body:
          "Please handle all studio equipment carefully. Any damage or technical issue must be reported immediately after the booking.",
      },
      {
        heading: "Overtime",
        body:
          "Additional time beyond the booked slot may be charged separately depending on studio availability (CHF 50 per started hour).",
      },
      {
        heading: "Pets",
        body:
          "Pets are only allowed with prior approval.",
      },
      {
        heading: "Studio Content",
        body:
          "Photos and videos taken inside the studio are allowed for personal, commercial and social media use.",
      },
    ],
    lastUpdated: "Last updated",
  },
  de: {
    tag: "Hausordnung",
    title: "Studio-Regeln",
    intro:
      "Praktische Hinweise zur Nutzung des Studios. Mit Ihrer Buchung akzeptieren Sie diese Regeln. Den formellen Rechtsvertrag finden Sie in unseren AGB.",
    sections: [
      {
        heading: "Zutritt & Studio-Zeiten",
        body:
          "Der Zutritt zum Studio ist nur während des gebuchten Zeitfensters erlaubt. Bitte verlassen Sie das Studio pünktlich, um zusätzliche Überzeit-Gebühren zu vermeiden.",
      },
      {
        heading: "Schlüssel & Zugangscode",
        body:
          "Der Studio-Schlüssel muss nach der Buchung in den Schlüsselkasten zurückgelegt werden. Zugangscodes und Eintrittsinformationen dürfen nicht an Dritte weitergegeben werden.",
      },
      {
        heading: "Maximale Personenanzahl",
        body:
          "Im Studio sind maximal 20 Personen erlaubt, sofern nicht im Voraus anders vereinbart.",
      },
      {
        heading: "Musik & Lärm",
        body:
          "Musik ist während der Buchung erlaubt. Bitte halten Sie die Lautstärke respektvoll, besonders abends und am Wochenende, da das Gebäude mit anderen Unternehmen geteilt wird.",
      },
      {
        heading: "Essen & Trinken",
        body:
          "Essen und Trinken sind im Studio erlaubt. Offene Flammen, Kerzen und Kochgeräte sind nicht erlaubt.",
      },
      {
        heading: "Rauchen",
        body:
          "Rauchen ist im Studio und in den Gebäudebereichen nicht erlaubt.",
      },
      {
        heading: "Sauberkeit",
        body:
          "Das Studio muss nach der Buchung nicht gereinigt werden. Wir bitten lediglich darum, den Raum ordentlich zu hinterlassen und Möbel oder Ausrüstung in die ursprüngliche Position zurückzubringen. Abfall gehört in die vorhandenen Behälter.",
      },
      {
        heading: "Ausrüstung & Schäden",
        body:
          "Bitte behandeln Sie die gesamte Studio-Ausrüstung sorgfältig. Schäden oder technische Probleme müssen unmittelbar nach der Buchung gemeldet werden.",
      },
      {
        heading: "Überzeit",
        body:
          "Zusätzliche Zeit über das gebuchte Slot hinaus kann je nach Studio-Verfügbarkeit separat verrechnet werden (CHF 50 pro angefangene Stunde).",
      },
      {
        heading: "Haustiere",
        body:
          "Haustiere sind nur mit vorheriger Genehmigung erlaubt.",
      },
      {
        heading: "Studio-Inhalte",
        body:
          "Foto- und Videoaufnahmen im Studio sind für private, kommerzielle und Social-Media-Nutzung erlaubt.",
      },
    ],
    lastUpdated: "Zuletzt aktualisiert",
  },
  fr: {
    tag: "Règlement intérieur",
    title: "Règlement du studio",
    intro:
      "Recommandations pratiques pour l'utilisation du studio. En réservant chez nous, vous acceptez ces règles. Pour le contrat juridique formel, consultez nos Conditions générales.",
    sections: [
      {
        heading: "Accès & Horaires",
        body:
          "L'accès au studio n'est autorisé que pendant le créneau réservé. Merci de quitter le studio à l'heure pour éviter des frais supplémentaires.",
      },
      {
        heading: "Clé & Code d'accès",
        body:
          "La clé du studio doit être remise dans la boîte à clés après la réservation. Les codes d'accès et informations d'entrée ne doivent pas être partagés avec des tiers.",
      },
      {
        heading: "Nombre maximum de personnes",
        body:
          "Un maximum de 20 personnes est autorisé dans le studio sauf accord préalable.",
      },
      {
        heading: "Musique & Bruit",
        body:
          "La musique est autorisée pendant les réservations. Merci de maintenir un volume respectueux, en particulier le soir et le week-end, car le bâtiment est partagé avec d'autres entreprises.",
      },
      {
        heading: "Nourriture & Boissons",
        body:
          "La nourriture et les boissons sont autorisées dans le studio. Les flammes nues, bougies et matériel de cuisson sont interdits.",
      },
      {
        heading: "Tabac",
        body:
          "Il est interdit de fumer dans le studio et les zones du bâtiment.",
      },
      {
        heading: "Propreté",
        body:
          "Le studio n'a pas besoin d'être nettoyé après la réservation. Nous demandons simplement de laisser l'espace en ordre et de remettre les meubles ou l'équipement à leur place d'origine. Les déchets doivent être placés dans les poubelles prévues.",
      },
      {
        heading: "Équipement & Dommages",
        body:
          "Veuillez manipuler tout l'équipement du studio avec soin. Tout dommage ou problème technique doit être signalé immédiatement après la réservation.",
      },
      {
        heading: "Heures supplémentaires",
        body:
          "Le temps supplémentaire au-delà du créneau réservé peut être facturé séparément selon la disponibilité du studio (CHF 50 par heure commencée).",
      },
      {
        heading: "Animaux",
        body:
          "Les animaux ne sont autorisés qu'avec accord préalable.",
      },
      {
        heading: "Contenu créé au studio",
        body:
          "Les photos et vidéos prises dans le studio sont autorisées pour un usage personnel, commercial et sur les réseaux sociaux.",
      },
    ],
    lastUpdated: "Dernière mise à jour",
  },
  it: {
    tag: "Regolamento interno",
    title: "Regole dello studio",
    intro:
      "Indicazioni pratiche per l'utilizzo dello studio. Prenotando con noi, accetti queste regole. Per il contratto legale formale, consulta i nostri Termini e Condizioni.",
    sections: [
      {
        heading: "Accesso & Orari",
        body:
          "L'accesso allo studio è consentito solo durante la fascia oraria prenotata. Si prega di lasciare lo studio in orario per evitare addebiti aggiuntivi.",
      },
      {
        heading: "Chiave & Codice di accesso",
        body:
          "La chiave dello studio deve essere riposta nella cassetta di sicurezza dopo la prenotazione. I codici di accesso e le informazioni di ingresso non possono essere condivisi con terzi.",
      },
      {
        heading: "Numero massimo di ospiti",
        body:
          "All'interno dello studio sono ammesse al massimo 20 persone salvo diverso accordo preliminare.",
      },
      {
        heading: "Musica & Rumore",
        body:
          "La musica è consentita durante le prenotazioni. Si prega di mantenere un volume rispettoso, soprattutto la sera e nei weekend, poiché l'edificio è condiviso con altre attività.",
      },
      {
        heading: "Cibo & Bevande",
        body:
          "Cibo e bevande sono ammessi all'interno dello studio. Fiamme libere, candele e attrezzature da cucina non sono consentite.",
      },
      {
        heading: "Fumo",
        body:
          "È vietato fumare all'interno dello studio e nelle aree comuni dell'edificio.",
      },
      {
        heading: "Pulizia",
        body:
          "Lo studio non deve essere pulito dopo la prenotazione. Chiediamo semplicemente di lasciare lo spazio in ordine e riporre mobili o attrezzatura nella posizione originale. I rifiuti devono essere gettati negli appositi cestini.",
      },
      {
        heading: "Attrezzatura & Danni",
        body:
          "Si prega di maneggiare con cura tutta l'attrezzatura dello studio. Eventuali danni o problemi tecnici devono essere segnalati immediatamente dopo la prenotazione.",
      },
      {
        heading: "Tempo extra",
        body:
          "Il tempo aggiuntivo oltre la fascia prenotata può essere addebitato separatamente in base alla disponibilità dello studio (CHF 50 per ora iniziata).",
      },
      {
        heading: "Animali",
        body:
          "Gli animali sono ammessi solo con previa approvazione.",
      },
      {
        heading: "Contenuti dello studio",
        body:
          "Foto e video scattati all'interno dello studio sono consentiti per uso personale, commerciale e sui social media.",
      },
    ],
    lastUpdated: "Ultimo aggiornamento",
  },
};

const LAST_UPDATED = "May 2026";

export default function RulesPage() {
  const { lang } = useLang();
  const l = lang.toLowerCase() as Lang;
  const tx = t[l] ?? t.en;

  return (
    <>
      <div className="pt-32 pb-24 px-6 md:px-10 max-w-4xl mx-auto min-h-screen">
        <Breadcrumbs items={bc(l, "rules")} className="mb-8" />
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

          <div className="mt-16 space-y-10">
            {tx.sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
                className="border-b border-accent pb-8"
              >
                <h2 className="font-seasons text-2xl md:text-3xl text-foreground font-semibold mb-3">
                  {section.heading}
                </h2>
                <p className="text-foreground/70 leading-relaxed font-light text-base">
                  {section.body}
                </p>
              </motion.div>
            ))}

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
