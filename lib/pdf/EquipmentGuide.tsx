/**
 * Equipment Guide — branded PDF (German).
 *
 * Replaces the plain ChatGPT/Canva equipment guide with one that matches the
 * CEE Studio brand (burgundy band + cream body), consistent with Invoice.tsx.
 * Lists the standard rental, the premium package, and individual rental prices.
 * Product/brand names stay in their original form; labels are German.
 *
 * Regenerate with: npx tsx scripts/generate-equipment-pdfs.tsx
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const BRAND = "#661414";
const CREAM = "#FDFAF4";
const ACCENT = "#E6CDA3";
const FG = "#2A1A1A";
const MUTED = "#7A6A6A";
const HAIR = "#EFE6D6";

const STANDARD = [
  "Godox DP800III-V Studioblitz ×2",
  "Farbgele (Blau, Gelb, Rot)",
  "Octabox 120 cm",
  "Strip Softbox 30 × 120 cm",
  "Lichtstative",
  "V-Flat",
  "Hintergrundsystem",
];

const PREMIUM = [
  "Profoto B10 Plus",
  "Broncolor Siros L800",
  "Broncolor Unilite",
  "Profoto Beauty Dish",
  "Profoto L Umbrella + Diffusor",
  "Zoom Reflektor mit Grids",
  "Trigger",
];

const INDIVIDUAL: [string, string][] = [
  ["Broncolor Scoro A4S", "ab CHF 70"],
  ["Broncolor Move 1200L", "ab CHF 60"],
  ["Broncolor Siros L800", "ab CHF 30"],
  ["Broncolor Unilite", "ab CHF 15"],
  ["Profoto B10 Plus", "ab CHF 30"],
  ["Broncolor Para 170", "ab CHF 50"],
  ["Broncolor Para 133", "ab CHF 40"],
  ["Broncolor Para 88", "ab CHF 30"],
  ["Broncolor Octa", "ab CHF 15"],
  ["Broncolor Flooter", "ab CHF 20"],
  ["Broncolor P70", "ab CHF 5"],
  ["Profoto Beauty Dish", "ab CHF 15"],
  ["Profoto L Umbrella + Diffusor", "ab CHF 5"],
  ["Zoom Reflektor mit Grids", "ab CHF 5"],
  ["Systemspezifische Fernbedienung", "CHF 5"],
  ["PocketWizard", "Inklusive"],
  ["Heavy-Duty-Stativ", "Inklusive"],
  ["C-Stand", "CHF 5"],
  ["Heavy-Duty-Stativ für Para 133", "Inklusive"],
];

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: FG, backgroundColor: CREAM },
  topBand: {
    backgroundColor: BRAND,
    color: CREAM,
    paddingHorizontal: 50,
    paddingTop: 46,
    paddingBottom: 38,
  },
  brand: { fontSize: 38, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
  tagline: { fontSize: 9, letterSpacing: 4, marginTop: 8, opacity: 0.85 },
  body: { paddingHorizontal: 50, paddingTop: 28, paddingBottom: 46 },

  section: { marginBottom: 22 },
  sectionHeadRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: ACCENT,
    paddingBottom: 6,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: BRAND, letterSpacing: 1.5 },
  badge: { fontSize: 12, fontFamily: "Helvetica-Bold", color: BRAND },
  intro: { fontSize: 9, color: MUTED, marginBottom: 10, fontStyle: "italic" },

  list: { flexDirection: "row", flexWrap: "wrap" },
  item: { flexDirection: "row", width: "50%", paddingVertical: 3, paddingRight: 12 },
  bullet: { color: BRAND, marginRight: 7, fontFamily: "Helvetica-Bold" },
  itemText: { flex: 1, fontSize: 10 },

  priceGrid: { flexDirection: "row", flexWrap: "wrap" },
  priceCell: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIR,
  },
  priceName: { flex: 1, fontSize: 9.5 },
  priceVal: { fontFamily: "Helvetica-Bold", color: BRAND, fontSize: 9.5, marginLeft: 10 },

  footer: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ACCENT,
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.5,
  },
});

function Bullets({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((it, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.itemText}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export function EquipmentGuide() {
  return (
    <Document title="CEE Studio — Equipment-Übersicht" author="CEE Studio">
      <Page size="A4" style={styles.page}>
        <View style={styles.topBand}>
          <Text style={styles.brand}>CEE STUDIO</Text>
          <Text style={styles.tagline}>FOTOSTUDIO ZÜRICH · EQUIPMENT</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.section}>
            <View style={styles.sectionHeadRow}>
              <Text style={styles.sectionTitle}>STANDARD STUDIO-MIETE</Text>
              <Text style={styles.badge}>Inklusive</Text>
            </View>
            <Bullets items={STANDARD} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeadRow}>
              <Text style={styles.sectionTitle}>STUDIO + PREMIUM-EQUIPMENT</Text>
              <Text style={styles.badge}>+ CHF 50</Text>
            </View>
            <Text style={styles.intro}>Beinhaltet alles aus dem Standard-Paket, plus:</Text>
            <Bullets items={PREMIUM} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeadRow}>
              <Text style={styles.sectionTitle}>EINZELNE GERÄTE MIETEN</Text>
              <Text style={styles.badge}>Auf Anfrage</Text>
            </View>
            <View style={styles.priceGrid}>
              {INDIVIDUAL.map(([name, price], i) => (
                <View
                  key={i}
                  style={[styles.priceCell, i % 2 === 0 ? { paddingRight: 16 } : { paddingLeft: 16 }]}
                >
                  <Text style={styles.priceName}>{name}</Text>
                  <Text style={styles.priceVal}>{price}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.footer}>
            Premium-Equipment wird separat gemietet und zusätzlich zum Standard-Setup vorbereitet.
            Einzelne Geräte auf Anfrage — melde dich, um sie zu deiner Buchung hinzuzufügen.{"\n"}
            CEE Studio · Thurgauerstrasse 117, 8152 Glattpark (Opfikon) · info@ceestudio.ch · ceestudio.ch
          </Text>
        </View>
      </Page>
    </Document>
  );
}
