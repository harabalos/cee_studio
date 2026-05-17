/**
 * Rechnung (Invoice) — PDF document.
 *
 * Auto-generated and emailed to the customer after every paid booking.
 * Matches the layout of Konstantina's existing Canva invoice template.
 *
 * Each booking gets a sequential invoice number from the `settings`
 * table (`next_invoice_number` field) so the numbering stays monotonic
 * across the year — required for Swiss VAT bookkeeping.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export type InvoiceLang = "de" | "en" | "fr" | "it";

export type InvoiceProps = {
  lang: InvoiceLang;
  invoiceNo: string; // e.g. "1009-01"
  issuedAt: string; // formatted "09/05/26"
  customerName: string;
  customerEmail: string;
  lineItems: {
    description: string; // "Studio rental (1h)"
    unitPriceChf: string; // "70.00 CHF"
    quantity: number;
    amountChf: string; // "70.00 CHF"
  }[];
  taxChf: string; // "0.00 CHF" or "5.66 CHF" if 8.1% VAT
  totalChf: string; // "70.00 CHF"
  bankIban: string;
  twintNumber: string;
};

const BRAND = "#661414";
const CREAM = "#FDFAF4";
const ACCENT = "#E6CDA3";
const FG = "#2A1A1A";
const MUTED = "#7A6A6A";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: FG,
    backgroundColor: CREAM,
  },
  // Top burgundy band
  topBand: {
    backgroundColor: BRAND,
    color: CREAM,
    paddingHorizontal: 50,
    paddingTop: 50,
    paddingBottom: 55,
  },
  brandHeading: {
    fontSize: 44,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 9,
    letterSpacing: 4,
    marginTop: 4,
    opacity: 0.85,
  },
  // Body
  body: {
    paddingHorizontal: 50,
    paddingTop: 30,
    flex: 1,
  },
  invoiceTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  invoiceTitle: {
    fontSize: 40,
    fontFamily: "Helvetica-Bold",
  },
  invoiceMeta: {
    fontSize: 10,
    color: MUTED,
    marginTop: 4,
  },
  customerBlock: {
    alignItems: "flex-end",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  customerName: { color: BRAND, fontFamily: "Helvetica-Bold" },
  customerEmail: { color: BRAND, marginTop: 2 },
  // Line items table
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    marginBottom: 16,
  },
  th: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  thLeft: { flex: 3 },
  thRight: { flex: 1, textAlign: "right" },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    fontSize: 10,
  },
  tdLeft: { flex: 3, textTransform: "uppercase", letterSpacing: 0.5 },
  tdRight: { flex: 1, textAlign: "right" },
  // Totals
  totalsBlock: {
    marginTop: 60,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    letterSpacing: 1,
    marginRight: 40,
    textTransform: "uppercase",
  },
  totalValue: { fontSize: 10, textAlign: "right", minWidth: 80 },
  grandTotalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    letterSpacing: 1,
    color: FG,
    textTransform: "uppercase",
    marginRight: 40,
  },
  grandTotalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: FG,
    minWidth: 80,
    textAlign: "right",
  },
  // Footer
  footerSection: {
    paddingHorizontal: 50,
    paddingBottom: 40,
    marginTop: 30,
    flexDirection: "row",
    gap: 30,
    borderTopColor: ACCENT,
    borderTopWidth: 0.5,
    paddingTop: 20,
  },
  footerCol: { flex: 1 },
  footerHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: FG,
    marginBottom: 8,
    letterSpacing: 1,
  },
  footerLine: { fontSize: 9, color: MUTED, marginBottom: 2 },
  twintBox: {
    backgroundColor: "#000000",
    color: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  twintCaption: { fontStyle: "italic", color: MUTED, fontSize: 9 },
});

const T: Record<InvoiceLang, {
  title: string;
  invoiceNoLabel: string;
  dateLabel: string;
  description: string;
  unitPrice: string;
  qty: string;
  amount: string;
  taxes: string;
  total: string;
  twintHeading: string;
  twintCaption: string;
  accountHolder: string;
  iban: string;
  reference: string;
  twintNumber: string;
}> = {
  de: {
    title: "Rechnung",
    invoiceNoLabel: "Rechnungs-Nr.",
    dateLabel: "Datum",
    description: "Beschreibung",
    unitPrice: "Preis",
    qty: "Anzahl",
    amount: "Betrag",
    taxes: "Steuern",
    total: "Summe",
    twintHeading: "TWINT Bezahlung",
    twintCaption: "Wir akzeptieren auch TWINT Bezahlung",
    accountHolder: "Kontoinhaber",
    iban: "IBAN",
    reference: "Verwendungszweck",
    twintNumber: "TWINT",
  },
  en: {
    title: "Invoice",
    invoiceNoLabel: "Invoice no.",
    dateLabel: "Date",
    description: "Description",
    unitPrice: "Price",
    qty: "Qty",
    amount: "Amount",
    taxes: "Taxes",
    total: "Total",
    twintHeading: "TWINT Payment",
    twintCaption: "We also accept TWINT payments",
    accountHolder: "Account holder",
    iban: "IBAN",
    reference: "Reference",
    twintNumber: "TWINT",
  },
  fr: {
    title: "Facture",
    invoiceNoLabel: "Facture nº",
    dateLabel: "Date",
    description: "Description",
    unitPrice: "Prix",
    qty: "Qté",
    amount: "Montant",
    taxes: "Taxes",
    total: "Total",
    twintHeading: "Paiement TWINT",
    twintCaption: "Nous acceptons aussi les paiements TWINT",
    accountHolder: "Titulaire",
    iban: "IBAN",
    reference: "Référence",
    twintNumber: "TWINT",
  },
  it: {
    title: "Fattura",
    invoiceNoLabel: "Fattura nº",
    dateLabel: "Data",
    description: "Descrizione",
    unitPrice: "Prezzo",
    qty: "Q.tà",
    amount: "Importo",
    taxes: "Tasse",
    total: "Totale",
    twintHeading: "Pagamento TWINT",
    twintCaption: "Accettiamo anche pagamenti TWINT",
    accountHolder: "Titolare",
    iban: "IBAN",
    reference: "Causale",
    twintNumber: "TWINT",
  },
};

const STUDIO = {
  name: "CEE Studio",
  address: "Thurgauerstrasse 117",
  city: "8152 Glattpark",
  phone: "+41 76 240 20 56",
  accountHolder: "Konstantina Metaxa",
};

export function Invoice(props: InvoiceProps) {
  const t = T[props.lang] ?? T.de;

  return (
    <Document
      title={`${t.title} ${props.invoiceNo} – CEE Studio`}
      author="CEE Studio"
      subject={t.title}
    >
      <Page size="A4" style={styles.page}>
        {/* Top burgundy band */}
        <View style={styles.topBand}>
          <Text style={styles.brandHeading}>CEE STUDIO</Text>
          <Text style={styles.brandTagline}>PHOTO & CREATIVE STUDIO</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.invoiceTitleRow}>
            <View>
              <Text style={styles.invoiceTitle}>{t.title}</Text>
              <Text style={styles.invoiceMeta}>
                {t.invoiceNoLabel.toUpperCase()}: {props.invoiceNo}
              </Text>
              <Text style={styles.invoiceMeta}>
                {t.dateLabel.toUpperCase()}: {props.issuedAt}
              </Text>
            </View>
            <View style={styles.customerBlock}>
              <Text style={styles.customerName}>{props.customerName.toUpperCase()}</Text>
              <Text style={styles.customerEmail}>{props.customerEmail}</Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.thLeft]}>{t.description}</Text>
            <Text style={[styles.th, styles.thRight]}>{t.unitPrice}</Text>
            <Text style={[styles.th, styles.thRight]}>{t.qty}</Text>
            <Text style={[styles.th, styles.thRight]}>{t.amount}</Text>
          </View>
          {props.lineItems.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.tdLeft}>{item.description}</Text>
              <Text style={styles.tdRight}>{item.unitPriceChf}</Text>
              <Text style={styles.tdRight}>{item.quantity}</Text>
              <Text style={styles.tdRight}>{item.amountChf}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t.taxes}</Text>
              <Text style={styles.totalValue}>{props.taxChf}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>{t.total}</Text>
              <Text style={styles.grandTotalValue}>{props.totalChf}</Text>
            </View>
          </View>
        </View>

        {/* Footer with payment info */}
        <View style={styles.footerSection}>
          <View style={styles.footerCol}>
            <Text style={styles.footerHeading}>{STUDIO.name.toUpperCase()}</Text>
            <Text style={styles.footerLine}>{STUDIO.address}</Text>
            <Text style={styles.footerLine}>{STUDIO.city}</Text>
            <Text style={styles.footerLine}>{STUDIO.phone}</Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.twintBox}>TWINT</Text>
            <Text style={styles.footerHeading}>{t.twintHeading.toUpperCase()}</Text>
            <Text style={styles.twintCaption}>{t.twintCaption}</Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerLine}>
              {t.accountHolder.toUpperCase()}: {STUDIO.accountHolder}
            </Text>
            <Text style={styles.footerLine}>
              {t.iban}: {props.bankIban}
            </Text>
            <Text style={styles.footerLine}>
              {t.reference.toUpperCase()}: {props.invoiceNo}
            </Text>
            <Text style={styles.footerLine}>
              {t.twintNumber}: {props.twintNumber}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
