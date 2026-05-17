/**
 * Nutzungsvertrag (Usage Agreement) — PDF document.
 *
 * Auto-generated and emailed to the customer after every paid booking.
 * Matches the layout of Konstantina's existing Canva-produced contract,
 * so the legal terms and visual identity stay consistent.
 *
 * The document acts as a receipt of the contract that was concluded the
 * moment the customer ticked "I accept the terms" and completed payment.
 * Customers do NOT need to sign and return it — Swiss law accepts the
 * online checkbox + payment as binding consent.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export type UsageAgreementLang = "de" | "en" | "fr" | "it";

export type UsageAgreementProps = {
  lang: UsageAgreementLang;
  // Booking details
  bookingId: string;
  date: string; // formatted "13.05.2026"
  time: string; // formatted "15:45 - 17:15"
  service: string; // e.g. "Studio Miete inkl. Setup- & Abbauzeit"
  totalChf: string; // formatted "CHF 70"
  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string | null;
  // Issue date
  issuedAt: string; // formatted "09.05.2026"
};

const BRAND = "#661414";
const CREAM = "#FDFAF4";
const ACCENT = "#E6CDA3";
const FG = "#2A1A1A";
const MUTED = "#7A6A6A";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: FG,
    backgroundColor: CREAM,
    flexDirection: "column",
  },
  // Burgundy header band
  header: {
    backgroundColor: BRAND,
    color: CREAM,
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 40,
  },
  headerBrand: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  headerSubrow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 22,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  headerCaption: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    opacity: 0.85,
  },
  // White content card
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 40,
    marginTop: -28,
    marginBottom: 16,
    padding: 28,
    borderColor: ACCENT,
    borderWidth: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomColor: ACCENT,
    borderBottomWidth: 0.5,
    marginBottom: 16,
  },
  metaItem: { fontSize: 9, color: MUTED },
  partiesRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  partyBlock: { flex: 1 },
  partyLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    marginBottom: 6,
  },
  partyKV: { flexDirection: "row", marginBottom: 2 },
  partyKey: { width: 60, color: MUTED, fontSize: 9 },
  partyValue: { flex: 1, fontSize: 9 },
  // 2-column section layout
  twoCol: {
    flexDirection: "row",
    gap: 24,
  },
  col: { flex: 1 },
  sectionHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    marginTop: 14,
    marginBottom: 4,
  },
  sectionBody: { fontSize: 9, lineHeight: 1.5, color: FG },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDot: { width: 8, fontSize: 9, color: BRAND },
  bulletText: { flex: 1, fontSize: 9, color: FG },
  bookingDetails: {
    marginTop: 6,
    marginBottom: 4,
  },
  detailRow: { flexDirection: "row", marginBottom: 3 },
  detailKey: { width: 70, color: MUTED, fontStyle: "italic", fontSize: 9 },
  detailValue: { flex: 1, fontSize: 9 },
  totalRow: {
    flexDirection: "row",
    marginTop: 10,
    paddingTop: 8,
    borderTopColor: ACCENT,
    borderTopWidth: 0.5,
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: BRAND,
    width: 90,
  },
  totalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: BRAND,
  },
  // Spacer pushes the footer to the page bottom without producing a
  // second page from `marginTop: "auto"` (which react-pdf doesn't
  // handle the way CSS flexbox does).
  spacer: { flexGrow: 1 },
  // Burgundy footer with signatures
  footer: {
    backgroundColor: BRAND,
    color: CREAM,
    paddingTop: 22,
    paddingBottom: 24,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerLabel: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  signatureBlock: { flex: 1 },
  signatureLine: {
    width: 130,
    borderBottomColor: CREAM,
    borderBottomWidth: 0.5,
    paddingBottom: 4,
    marginTop: 24,
  },
  signatureCaption: { fontSize: 8, marginTop: 4, opacity: 0.85 },
});

const T: Record<UsageAgreementLang, {
  documentTitle: string;
  tagline: string;
  dateLabel: string;
  locationLabel: string;
  studioBlockTitle: string;
  customerBlockTitle: string;
  name: string;
  address: string;
  mobile: string;
  email: string;
  company: string;
  sections: {
    s1: { heading: string; body: string };
    s2: { heading: string; date: string; time: string; service: string; total: string };
    s3: { heading: string; body: string };
    s4: { heading: string; body: string };
    s5: { heading: string; body: string; bullets: string[]; tail: string };
    s6: { heading: string; body: string };
    s7: { heading: string; body: string };
    s8: { heading: string; body: string };
  };
  signaturesHeading: string;
  studioParty: string;
  customerParty: string;
}> = {
  de: {
    documentTitle: "Nutzungsvertrag",
    tagline: "Photo & Creative Studio",
    dateLabel: "Datum",
    locationLabel: "Ort",
    studioBlockTitle: "CEE Studio",
    customerBlockTitle: "Mieter",
    name: "Name",
    address: "Adresse",
    mobile: "Mobile",
    email: "E-Mail",
    company: "Firma",
    sections: {
      s1: {
        heading: "1. Vertragsgegenstand",
        body:
          "Das Studio vermietet dem Kunden die Studiofläche inklusive vorhandener Ausstattung zur Durchführung von Foto-, Video- oder Content Produktionen.",
      },
      s2: {
        heading: "2. Buchungsdetails",
        date: "Datum",
        time: "Uhrzeit",
        service: "Leistung",
        total: "Gesamtpreis",
      },
      s3: {
        heading: "3. Nutzung",
        body:
          "Das Studio darf ausschliesslich für vereinbarte Zwecke genutzt werden. Der Kunde verpflichtet sich, die Räumlichkeiten sowie das Equipment sorgfältig zu behandeln.",
      },
      s4: {
        heading: "4. Zahlung",
        body:
          "Die Zahlung erfolgt im Voraus oder gemäss Vereinbarung. Die Buchung ist erst nach Zahlungseingang verbindlich.",
      },
      s5: {
        heading: "5. Stornierung",
        body: "Werktags-Buchungen:",
        bullets: [
          "Mehr als 48h vorher: kostenlos",
          "24-48h vorher: 50% des Betrags",
          "Weniger als 24h vorher: 100% des Betrags",
        ],
        tail:
          "Wochenend-Buchungen sind nicht stornierbar. Nicht wahrgenommene Termine werden vollständig verrechnet.",
      },
      s6: {
        heading: "6. Haftung",
        body:
          "Der Kunde haftet für alle Schäden, die während der Nutzung entstehen. Das Studio nimmt keine Haftung für persönliche Gegenstände.",
      },
      s7: {
        heading: "7. Überziehung",
        body:
          "Eine Überziehung der gebuchten Zeit wird mit CHF 50.- pro angefangene Stunde verrechnet.",
      },
      s8: {
        heading: "8. Schlussbestimmung",
        body: "Es gilt Schweizer Recht. Gerichtsstand ist Zürich.",
      },
    },
    signaturesHeading: "Unterschriften",
    studioParty: "CEE Studio",
    customerParty: "Mieter",
  },
  en: {
    documentTitle: "Usage Agreement",
    tagline: "Photo & Creative Studio",
    dateLabel: "Date",
    locationLabel: "Location",
    studioBlockTitle: "CEE Studio",
    customerBlockTitle: "Tenant",
    name: "Name",
    address: "Address",
    mobile: "Mobile",
    email: "Email",
    company: "Company",
    sections: {
      s1: {
        heading: "1. Subject of Contract",
        body:
          "The studio rents the space including available equipment to the client for photo, video or content production.",
      },
      s2: {
        heading: "2. Booking Details",
        date: "Date",
        time: "Time",
        service: "Service",
        total: "Total",
      },
      s3: {
        heading: "3. Use",
        body:
          "The studio may only be used for agreed purposes. The client commits to handling the premises and equipment with care.",
      },
      s4: {
        heading: "4. Payment",
        body:
          "Payment is due in advance or as agreed. A booking is only binding upon receipt of payment.",
      },
      s5: {
        heading: "5. Cancellation",
        body: "Weekday bookings:",
        bullets: [
          "More than 48h before: free cancellation",
          "24-48h before: 50% of the amount",
          "Less than 24h before: 100% of the amount",
        ],
        tail:
          "Weekend bookings are non-cancellable. Missed bookings are charged in full.",
      },
      s6: {
        heading: "6. Liability",
        body:
          "The client is liable for all damages that occur during use. The studio assumes no liability for personal belongings.",
      },
      s7: {
        heading: "7. Overrun",
        body:
          "Going over the booked time is charged at CHF 50.- per started hour.",
      },
      s8: {
        heading: "8. Final Clause",
        body: "Swiss law applies. Jurisdiction is Zürich.",
      },
    },
    signaturesHeading: "Signatures",
    studioParty: "CEE Studio",
    customerParty: "Tenant",
  },
  fr: {
    documentTitle: "Contrat d'utilisation",
    tagline: "Photo & Creative Studio",
    dateLabel: "Date",
    locationLabel: "Lieu",
    studioBlockTitle: "CEE Studio",
    customerBlockTitle: "Locataire",
    name: "Nom",
    address: "Adresse",
    mobile: "Mobile",
    email: "E-mail",
    company: "Entreprise",
    sections: {
      s1: {
        heading: "1. Objet du contrat",
        body:
          "Le studio loue au client l'espace y compris l'équipement disponible pour la réalisation de productions photo, vidéo ou contenu.",
      },
      s2: {
        heading: "2. Détails de la réservation",
        date: "Date",
        time: "Heure",
        service: "Service",
        total: "Total",
      },
      s3: {
        heading: "3. Utilisation",
        body:
          "Le studio ne peut être utilisé que pour les fins convenues. Le client s'engage à traiter les locaux et l'équipement avec soin.",
      },
      s4: {
        heading: "4. Paiement",
        body:
          "Le paiement est dû à l'avance ou selon accord. Une réservation n'est ferme qu'après réception du paiement.",
      },
      s5: {
        heading: "5. Annulation",
        body: "Réservations en semaine :",
        bullets: [
          "Plus de 48h avant : annulation gratuite",
          "24-48h avant : 50% du montant",
          "Moins de 24h avant : 100% du montant",
        ],
        tail:
          "Les réservations du week-end ne sont pas annulables. Les rendez-vous manqués sont facturés à 100%.",
      },
      s6: {
        heading: "6. Responsabilité",
        body:
          "Le client est responsable de tous les dommages qui surviennent pendant l'utilisation. Le studio n'assume aucune responsabilité pour les effets personnels.",
      },
      s7: {
        heading: "7. Dépassement",
        body:
          "Le dépassement du temps réservé est facturé CHF 50.- par heure commencée.",
      },
      s8: {
        heading: "8. Disposition finale",
        body: "Le droit suisse s'applique. La juridiction est Zurich.",
      },
    },
    signaturesHeading: "Signatures",
    studioParty: "CEE Studio",
    customerParty: "Locataire",
  },
  it: {
    documentTitle: "Contratto di utilizzo",
    tagline: "Photo & Creative Studio",
    dateLabel: "Data",
    locationLabel: "Luogo",
    studioBlockTitle: "CEE Studio",
    customerBlockTitle: "Locatario",
    name: "Nome",
    address: "Indirizzo",
    mobile: "Mobile",
    email: "Email",
    company: "Azienda",
    sections: {
      s1: {
        heading: "1. Oggetto del contratto",
        body:
          "Lo studio affitta al cliente lo spazio inclusa l'attrezzatura disponibile per la realizzazione di produzioni foto, video o contenuti.",
      },
      s2: {
        heading: "2. Dettagli della prenotazione",
        date: "Data",
        time: "Orario",
        service: "Servizio",
        total: "Totale",
      },
      s3: {
        heading: "3. Utilizzo",
        body:
          "Lo studio può essere utilizzato esclusivamente per gli scopi concordati. Il cliente si impegna a trattare i locali e l'attrezzatura con cura.",
      },
      s4: {
        heading: "4. Pagamento",
        body:
          "Il pagamento è dovuto in anticipo o secondo accordo. Una prenotazione è vincolante solo dopo la ricezione del pagamento.",
      },
      s5: {
        heading: "5. Cancellazione",
        body: "Prenotazioni infrasettimanali:",
        bullets: [
          "Più di 48h prima: cancellazione gratuita",
          "24-48h prima: 50% dell'importo",
          "Meno di 24h prima: 100% dell'importo",
        ],
        tail:
          "Le prenotazioni del weekend non sono cancellabili. Le prenotazioni mancate sono addebitate al 100%.",
      },
      s6: {
        heading: "6. Responsabilità",
        body:
          "Il cliente è responsabile di tutti i danni che si verificano durante l'utilizzo. Lo studio non si assume responsabilità per gli effetti personali.",
      },
      s7: {
        heading: "7. Sforamento",
        body:
          "Il superamento del tempo prenotato è addebitato a CHF 50.- per ora iniziata.",
      },
      s8: {
        heading: "8. Disposizione finale",
        body: "Si applica il diritto svizzero. Foro competente è Zurigo.",
      },
    },
    signaturesHeading: "Firme",
    studioParty: "CEE Studio",
    customerParty: "Locatario",
  },
};

const STUDIO = {
  name: "CEE Studio",
  address: "Thurgauerstrasse 117, 8152 Glattpark",
  mobile: "+41 76 240 20 56",
};

export function UsageAgreement(props: UsageAgreementProps) {
  const t = T[props.lang] ?? T.de;

  return (
    <Document
      title={`${t.documentTitle} – CEE Studio – ${props.bookingId}`}
      author="CEE Studio"
      subject={t.documentTitle}
    >
      <Page size="A4" style={styles.page}>
        {/* Header band */}
        <View style={styles.header}>
          <Text style={styles.headerBrand}>CEE Studio</Text>
          <View style={styles.headerSubrow}>
            <Text style={styles.headerTitle}>{t.documentTitle}</Text>
            <Text style={styles.headerCaption}>{t.tagline}</Text>
          </View>
        </View>

        {/* White card */}
        <View style={styles.card}>
          {/* Date / location meta row */}
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>
              {t.dateLabel}: {props.issuedAt}
            </Text>
            <Text style={styles.metaItem}>
              {t.locationLabel}: Glattpark
            </Text>
          </View>

          {/* Parties */}
          <View style={styles.partiesRow}>
            <View style={styles.partyBlock}>
              <Text style={styles.partyLabel}>{t.studioBlockTitle}</Text>
              <View style={styles.partyKV}>
                <Text style={styles.partyKey}>{t.name}</Text>
                <Text style={styles.partyValue}>: {STUDIO.name}</Text>
              </View>
              <View style={styles.partyKV}>
                <Text style={styles.partyKey}>{t.address}</Text>
                <Text style={styles.partyValue}>: {STUDIO.address}</Text>
              </View>
              <View style={styles.partyKV}>
                <Text style={styles.partyKey}>{t.mobile}</Text>
                <Text style={styles.partyValue}>: {STUDIO.mobile}</Text>
              </View>
            </View>
            <View style={styles.partyBlock}>
              <Text style={styles.partyLabel}>{t.customerBlockTitle}</Text>
              <View style={styles.partyKV}>
                <Text style={styles.partyKey}>{t.name}</Text>
                <Text style={styles.partyValue}>: {props.customerName}</Text>
              </View>
              <View style={styles.partyKV}>
                <Text style={styles.partyKey}>{t.email}</Text>
                <Text style={styles.partyValue}>: {props.customerEmail}</Text>
              </View>
              <View style={styles.partyKV}>
                <Text style={styles.partyKey}>{t.mobile}</Text>
                <Text style={styles.partyValue}>: {props.customerPhone}</Text>
              </View>
              {props.customerCompany && (
                <View style={styles.partyKV}>
                  <Text style={styles.partyKey}>{t.company}</Text>
                  <Text style={styles.partyValue}>: {props.customerCompany}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Two-column body */}
          <View style={styles.twoCol}>
            {/* Left column */}
            <View style={styles.col}>
              <Text style={styles.sectionHeading}>{t.sections.s1.heading}</Text>
              <Text style={styles.sectionBody}>{t.sections.s1.body}</Text>

              <Text style={styles.sectionHeading}>{t.sections.s2.heading}</Text>
              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>{t.sections.s2.date}:</Text>
                  <Text style={styles.detailValue}>{props.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>{t.sections.s2.time}:</Text>
                  <Text style={styles.detailValue}>{props.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>{t.sections.s2.service}:</Text>
                  <Text style={styles.detailValue}>{props.service}</Text>
                </View>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t.sections.s2.total}:</Text>
                <Text style={styles.totalValue}>{props.totalChf}</Text>
              </View>

              <Text style={styles.sectionHeading}>{t.sections.s3.heading}</Text>
              <Text style={styles.sectionBody}>{t.sections.s3.body}</Text>

              <Text style={styles.sectionHeading}>{t.sections.s4.heading}</Text>
              <Text style={styles.sectionBody}>{t.sections.s4.body}</Text>
            </View>

            {/* Right column */}
            <View style={styles.col}>
              <Text style={styles.sectionHeading}>{t.sections.s5.heading}</Text>
              <Text style={styles.sectionBody}>{t.sections.s5.body}</Text>
              {t.sections.s5.bullets.map((b, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
              <Text style={[styles.sectionBody, { marginTop: 4 }]}>
                {t.sections.s5.tail}
              </Text>

              <Text style={styles.sectionHeading}>{t.sections.s6.heading}</Text>
              <Text style={styles.sectionBody}>{t.sections.s6.body}</Text>

              <Text style={styles.sectionHeading}>{t.sections.s7.heading}</Text>
              <Text style={styles.sectionBody}>{t.sections.s7.body}</Text>

              <Text style={styles.sectionHeading}>{t.sections.s8.heading}</Text>
              <Text style={styles.sectionBody}>{t.sections.s8.body}</Text>
            </View>
          </View>
        </View>

        {/* Spacer keeps the burgundy footer pinned at the bottom of page 1.
            wrap={false} prevents react-pdf from splitting the footer across
            pages when it would otherwise overflow by a few pixels. */}
        <View style={styles.spacer} />

        {/* Burgundy footer with signature lines */}
        <View style={styles.footer} wrap={false}>
          <View style={styles.signatureBlock}>
            <Text style={styles.footerLabel}>{t.signaturesHeading}:</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.footerLabel}>{t.studioParty}</Text>
            <Text style={styles.signatureCaption}>Konstantina Metaxa</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.footerLabel}>{t.customerParty}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureCaption}>{props.customerName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
