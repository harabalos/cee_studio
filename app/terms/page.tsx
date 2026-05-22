"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";
import CtaBanner from "@/components/ui/CtaBanner";
import { useLang } from "@/contexts/LanguageContext";

type Lang = "de" | "en" | "fr" | "it";

type Section = { heading: string; body: string; bullets?: string[] };

const t: Record<Lang, {
  tag: string;
  title: string;
  intro: string;
  sections: Section[];
  lastUpdated: string;
}> = {
  en: {
    tag: "Legal",
    title: "Terms & Conditions",
    intro:
      "These Terms & Conditions apply to all bookings, memberships and services provided by CEE Studio.",
    sections: [
      {
        heading: "1. Scope",
        body:
          "These Terms & Conditions apply to all bookings, memberships and services provided by CEE Studio.",
      },
      {
        heading: "2. Booking & Contract",
        body:
          "A booking becomes binding once payment confirmation has been received by CEE Studio. By checking 'I accept the terms' and completing payment, the client agrees to these conditions as a binding contract under Swiss law.",
      },
      {
        heading: "3. Prices & Payment",
        body:
          "All prices are listed in CHF. Payments must be completed before the booking unless agreed otherwise in writing.",
      },
      {
        heading: "4. Cancellation Policy",
        body: "Cancellation conditions depend on the booking day and timing:",
        bullets: [
          "Weekday bookings cancelled more than 48 hours before the session receive a full refund",
          "Weekday bookings cancelled less than 48 hours before the session are charged 50% of the booking amount",
          "Weekday bookings cancelled less than 24 hours before the session are non-refundable",
          "Weekend bookings cancelled more than 48 hours before the session receive a full refund",
          "Weekend bookings cancelled less than 48 hours before the session are non-refundable",
          "Missed bookings or no-shows are charged in full",
        ],
      },
      {
        heading: "5. Memberships / Packages",
        body:
          "Special packages and memberships may include separate conditions regarding minimum duration, hour validity and cancellation procedures. Plan hours cover the studio base rental only — add-ons and late-night surcharges are charged separately at standard rates. Overage hours beyond the plan are billed at CHF 50 per hour.",
      },
      {
        heading: "6. Liability",
        body:
          "Clients are responsible for all persons attending under their booking and for any damage caused during the rental period. CEE Studio is not liable for personal belongings, equipment brought by clients, or interruptions caused by technical issues outside of reasonable control.",
      },
      {
        heading: "7. Damages",
        body:
          "Any damages or missing equipment must be reported immediately after the booking. Damaged or missing items may be charged at replacement or repair value.",
      },
      {
        heading: "8. Insurance",
        body:
          "Clients are responsible for arranging their own insurance coverage if required.",
      },
      {
        heading: "9. Privacy",
        body:
          "Personal information is handled confidentially and processed in accordance with applicable Swiss and European data protection regulations. See our Privacy Policy for details.",
      },
      {
        heading: "10. Intellectual Property",
        body:
          "All content created during the booking remains the property of the client. CEE Studio may request permission to repost selected content for promotional purposes.",
      },
      {
        heading: "11. Force Majeure",
        body:
          "CEE Studio is not responsible for cancellations, delays or interruptions caused by circumstances beyond reasonable control, including natural disasters, government restrictions or technical failures.",
      },
      {
        heading: "12. Applicable Law",
        body:
          "Swiss law applies exclusively. Jurisdiction is Zürich, Switzerland.",
      },
    ],
    lastUpdated: "Last updated",
  },
  de: {
    tag: "Rechtliches",
    title: "Allgemeine Geschäftsbedingungen",
    intro:
      "Diese Allgemeinen Geschäftsbedingungen gelten für alle Buchungen, Mitgliedschaften und Dienstleistungen, die von CEE Studio angeboten werden.",
    sections: [
      {
        heading: "1. Geltungsbereich",
        body:
          "Diese AGB gelten für alle Buchungen, Mitgliedschaften und Dienstleistungen von CEE Studio.",
      },
      {
        heading: "2. Buchung & Vertragsabschluss",
        body:
          "Eine Buchung wird verbindlich, sobald die Zahlungsbestätigung bei CEE Studio eingegangen ist. Durch das Setzen des Häkchens „Ich akzeptiere die AGB\" und das Abschliessen der Zahlung stimmt der Kunde diesen Bedingungen als verbindlichen Vertrag nach Schweizer Recht zu.",
      },
      {
        heading: "3. Preise & Zahlung",
        body:
          "Alle Preise sind in CHF angegeben. Zahlungen sind vor der Buchung zu leisten, sofern nicht schriftlich anders vereinbart.",
      },
      {
        heading: "4. Stornierungsbedingungen",
        body: "Die Stornierungsbedingungen richten sich nach dem Buchungstag und dem Zeitpunkt:",
        bullets: [
          "Werktags-Buchungen, mehr als 48 Stunden vor dem Termin storniert: volle Rückerstattung",
          "Werktags-Buchungen, weniger als 48 Stunden vor dem Termin storniert: 50% des Buchungsbetrags werden in Rechnung gestellt",
          "Werktags-Buchungen, weniger als 24 Stunden vor dem Termin storniert: nicht erstattungsfähig",
          "Wochenend-Buchungen, mehr als 48 Stunden vor dem Termin storniert: volle Rückerstattung",
          "Wochenend-Buchungen, weniger als 48 Stunden vor dem Termin storniert: nicht erstattungsfähig",
          "Versäumte Buchungen oder Nichterscheinen: voll berechnet",
        ],
      },
      {
        heading: "5. Mitgliedschaften / Pakete",
        body:
          "Besondere Pakete und Mitgliedschaften können separate Bedingungen bezüglich Mindestlaufzeit, Stundenverfall und Kündigungsverfahren enthalten. Die im Abonnement enthaltenen Stunden decken nur die Grundmiete des Studios — Add-ons und Nachttarif-Zuschläge werden separat zu Standardtarifen berechnet. Überschreitungsstunden über das Abo hinaus werden mit CHF 50 pro Stunde abgerechnet.",
      },
      {
        heading: "6. Haftung",
        body:
          "Der Kunde ist verantwortlich für alle Personen, die unter seiner Buchung anwesend sind, sowie für alle Schäden, die während des Mietzeitraums entstehen. CEE Studio haftet nicht für persönliche Gegenstände, vom Kunden mitgebrachte Ausrüstung oder Unterbrechungen, die durch technische Probleme ausserhalb des angemessenen Einflussbereichs verursacht werden.",
      },
      {
        heading: "7. Schäden",
        body:
          "Schäden oder fehlende Ausrüstung müssen unmittelbar nach der Buchung gemeldet werden. Beschädigte oder fehlende Gegenstände können zum Wiederbeschaffungs- oder Reparaturwert in Rechnung gestellt werden.",
      },
      {
        heading: "8. Versicherung",
        body:
          "Der Kunde ist für den Abschluss einer eigenen Versicherung verantwortlich, falls erforderlich.",
      },
      {
        heading: "9. Datenschutz",
        body:
          "Persönliche Informationen werden vertraulich behandelt und gemäss den geltenden schweizerischen und europäischen Datenschutzbestimmungen verarbeitet. Siehe unsere Datenschutzerklärung für Details.",
      },
      {
        heading: "10. Geistiges Eigentum",
        body:
          "Alle während der Buchung erstellten Inhalte bleiben Eigentum des Kunden. CEE Studio kann um Erlaubnis bitten, ausgewählte Inhalte für Werbezwecke zu reposten.",
      },
      {
        heading: "11. Höhere Gewalt",
        body:
          "CEE Studio ist nicht verantwortlich für Stornierungen, Verzögerungen oder Unterbrechungen, die durch Umstände ausserhalb des angemessenen Einflussbereichs verursacht werden, einschliesslich Naturkatastrophen, behördlicher Einschränkungen oder technischer Ausfälle.",
      },
      {
        heading: "12. Anwendbares Recht",
        body:
          "Es gilt ausschliesslich schweizerisches Recht. Gerichtsstand ist Zürich, Schweiz.",
      },
    ],
    lastUpdated: "Zuletzt aktualisiert",
  },
  fr: {
    tag: "Mentions légales",
    title: "Conditions générales",
    intro:
      "Les présentes conditions générales s'appliquent à toutes les réservations, abonnements et services fournis par CEE Studio.",
    sections: [
      {
        heading: "1. Champ d'application",
        body:
          "Les présentes conditions s'appliquent à toutes les réservations, abonnements et services fournis par CEE Studio.",
      },
      {
        heading: "2. Réservation & Contrat",
        body:
          "Une réservation devient ferme dès que CEE Studio a reçu la confirmation de paiement. En cochant « J'accepte les conditions » et en effectuant le paiement, le client accepte ces conditions comme un contrat liant selon le droit suisse.",
      },
      {
        heading: "3. Prix & Paiement",
        body:
          "Tous les prix sont indiqués en CHF. Les paiements doivent être effectués avant la réservation, sauf accord écrit contraire.",
      },
      {
        heading: "4. Politique d'annulation",
        body: "Les conditions d'annulation dépendent du jour de la réservation et du moment :",
        bullets: [
          "Réservations en semaine, annulées plus de 48 heures avant la séance : remboursement complet",
          "Réservations en semaine, annulées moins de 48 heures avant la séance : 50% du montant facturés",
          "Réservations en semaine, annulées moins de 24 heures avant la séance : non remboursables",
          "Réservations du week-end, annulées plus de 48 heures avant la séance : remboursement complet",
          "Réservations du week-end, annulées moins de 48 heures avant la séance : non remboursables",
          "Réservations manquées ou non-présentation : facturées à 100%",
        ],
      },
      {
        heading: "5. Abonnements / Forfaits",
        body:
          "Les forfaits et abonnements peuvent inclure des conditions distinctes concernant la durée minimale, la validité des heures et les procédures d'annulation. Les heures du plan couvrent uniquement la location de base du studio — les options et suppléments de nuit sont facturés séparément aux tarifs standard. Les heures supplémentaires au-delà du forfait sont facturées à CHF 50 de l'heure.",
      },
      {
        heading: "6. Responsabilité",
        body:
          "Les clients sont responsables de toutes les personnes présentes lors de leur réservation et de tout dommage causé pendant la période de location. CEE Studio n'est pas responsable des effets personnels, du matériel apporté par les clients ou des interruptions causées par des problèmes techniques hors de son contrôle raisonnable.",
      },
      {
        heading: "7. Dommages",
        body:
          "Tout dommage ou matériel manquant doit être signalé immédiatement après la réservation. Les objets endommagés ou manquants peuvent être facturés à leur valeur de remplacement ou de réparation.",
      },
      {
        heading: "8. Assurance",
        body:
          "Les clients sont responsables de souscrire à leur propre assurance si nécessaire.",
      },
      {
        heading: "9. Confidentialité",
        body:
          "Les informations personnelles sont traitées de manière confidentielle, conformément aux réglementations suisses et européennes en matière de protection des données. Consultez notre Politique de confidentialité pour plus de détails.",
      },
      {
        heading: "10. Propriété intellectuelle",
        body:
          "Tout contenu créé pendant la réservation reste la propriété du client. CEE Studio peut demander l'autorisation de republier le contenu sélectionné à des fins promotionnelles.",
      },
      {
        heading: "11. Force majeure",
        body:
          "CEE Studio n'est pas responsable des annulations, retards ou interruptions causés par des circonstances échappant à son contrôle raisonnable, y compris catastrophes naturelles, restrictions gouvernementales ou pannes techniques.",
      },
      {
        heading: "12. Droit applicable",
        body:
          "Le droit suisse s'applique exclusivement. La juridiction est Zurich, Suisse.",
      },
    ],
    lastUpdated: "Dernière mise à jour",
  },
  it: {
    tag: "Note legali",
    title: "Termini e Condizioni",
    intro:
      "I presenti Termini e Condizioni si applicano a tutte le prenotazioni, gli abbonamenti e i servizi forniti da CEE Studio.",
    sections: [
      {
        heading: "1. Ambito",
        body:
          "Questi Termini e Condizioni si applicano a tutte le prenotazioni, gli abbonamenti e i servizi forniti da CEE Studio.",
      },
      {
        heading: "2. Prenotazione & Contratto",
        body:
          "Una prenotazione diventa vincolante una volta che CEE Studio ha ricevuto la conferma del pagamento. Spuntando « Accetto i termini » e completando il pagamento, il cliente accetta queste condizioni come contratto vincolante secondo il diritto svizzero.",
      },
      {
        heading: "3. Prezzi & Pagamento",
        body:
          "Tutti i prezzi sono indicati in CHF. I pagamenti devono essere completati prima della prenotazione salvo diversamente concordato per iscritto.",
      },
      {
        heading: "4. Politica di cancellazione",
        body: "Le condizioni di cancellazione dipendono dal giorno della prenotazione e dalla tempistica:",
        bullets: [
          "Prenotazioni infrasettimanali, cancellate più di 48 ore prima della sessione: rimborso completo",
          "Prenotazioni infrasettimanali, cancellate meno di 48 ore prima della sessione: viene addebitato il 50% dell'importo",
          "Prenotazioni infrasettimanali, cancellate meno di 24 ore prima della sessione: non rimborsabili",
          "Prenotazioni nel weekend, cancellate più di 48 ore prima della sessione: rimborso completo",
          "Prenotazioni nel weekend, cancellate meno di 48 ore prima della sessione: non rimborsabili",
          "Prenotazioni mancate o no-show: addebitate al 100%",
        ],
      },
      {
        heading: "5. Abbonamenti / Pacchetti",
        body:
          "Pacchetti speciali e abbonamenti possono includere condizioni separate riguardanti durata minima, validità delle ore e procedure di cancellazione. Le ore del piano coprono solo il noleggio base dello studio — add-on e supplementi notturni sono addebitati separatamente alle tariffe standard. Le ore extra oltre il piano sono fatturate a CHF 50 all'ora.",
      },
      {
        heading: "6. Responsabilità",
        body:
          "I clienti sono responsabili di tutte le persone presenti durante la loro prenotazione e di eventuali danni causati durante il periodo di noleggio. CEE Studio non è responsabile di effetti personali, attrezzature portate dai clienti o interruzioni causate da problemi tecnici al di fuori del suo controllo ragionevole.",
      },
      {
        heading: "7. Danni",
        body:
          "Eventuali danni o attrezzature mancanti devono essere segnalati immediatamente dopo la prenotazione. Gli oggetti danneggiati o mancanti possono essere addebitati al valore di sostituzione o riparazione.",
      },
      {
        heading: "8. Assicurazione",
        body:
          "I clienti sono responsabili di organizzare la propria copertura assicurativa se necessaria.",
      },
      {
        heading: "9. Privacy",
        body:
          "Le informazioni personali sono trattate in modo riservato e processate in conformità con le normative svizzere ed europee sulla protezione dei dati. Vedi la nostra Informativa sulla privacy per i dettagli.",
      },
      {
        heading: "10. Proprietà intellettuale",
        body:
          "Tutti i contenuti creati durante la prenotazione rimangono di proprietà del cliente. CEE Studio può richiedere il permesso di ripostare contenuti selezionati a scopo promozionale.",
      },
      {
        heading: "11. Forza maggiore",
        body:
          "CEE Studio non è responsabile per cancellazioni, ritardi o interruzioni causati da circostanze al di fuori del suo controllo ragionevole, inclusi disastri naturali, restrizioni governative o guasti tecnici.",
      },
      {
        heading: "12. Legge applicabile",
        body:
          "Si applica esclusivamente il diritto svizzero. Foro competente è Zurigo, Svizzera.",
      },
    ],
    lastUpdated: "Ultimo aggiornamento",
  },
};

const LAST_UPDATED = "May 2026";

export default function TermsPage() {
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
                transition={{ duration: 0.5, delay: idx * 0.04 }}
                className="border-b border-accent pb-10"
              >
                <h2 className="font-seasons text-2xl md:text-3xl text-foreground font-semibold mb-4">
                  {section.heading}
                </h2>
                <p className="text-foreground/70 leading-relaxed font-light text-base">
                  {section.body}
                </p>
                {section.bullets && (
                  <ul className="mt-4 space-y-2">
                    {section.bullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="text-foreground/70 leading-relaxed font-light text-base flex gap-3"
                      >
                        <span className="text-brand mt-1 flex-shrink-0">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
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
