/**
 * Equipment Guide — branded PDF.
 *
 * Replaces the plain ChatGPT/Canva equipment guide with one that matches the
 * CEE Studio brand (burgundy band + cream body), consistent with Invoice.tsx.
 * Lists the standard rental, the premium package, and individual rental prices.
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
  "Godox DP800III-V Studio Flash ×2",
  "Color Gels (Blue, Yellow, Red)",
  "Octabox 120 cm",
  "Strip Softbox 30 × 120 cm",
  "Light Stands",
  "V-Flat",
  "Backdrop System",
];

const PREMIUM = [
  "Profoto B10 Plus",
  "Broncolor Siros L800",
  "Broncolor Unilite",
  "Profoto Beauty Dish",
  "Profoto L Umbrella With Diffuser",
  "Zoom Reflector With Grids",
  "Triggers",
];

const INDIVIDUAL: [string, string][] = [
  ["Broncolor Scoro A4S", "from CHF 70"],
  ["Broncolor Move 1200L", "from CHF 60"],
  ["Broncolor Siros L800", "from CHF 30"],
  ["Broncolor Unilite", "from CHF 15"],
  ["Profoto B10 Plus", "from CHF 30"],
  ["Broncolor Para 170", "from CHF 50"],
  ["Broncolor Para 133", "from CHF 40"],
  ["Broncolor Para 88", "from CHF 30"],
  ["Broncolor Octa", "from CHF 15"],
  ["Broncolor Flooter", "from CHF 20"],
  ["Broncolor P70", "from CHF 5"],
  ["Profoto Beauty Dish", "from CHF 15"],
  ["Profoto L Umbrella With Diffuser", "from CHF 5"],
  ["Zoom Reflector With Grids", "from CHF 5"],
  ["System Specific Remote", "CHF 5"],
  ["PocketWizard", "Included"],
  ["Heavy Duty Stand", "Included"],
  ["C-Stand", "CHF 5"],
  ["Heavy Duty Stand For Para 133", "Included"],
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
    <Document title="CEE Studio — Equipment Guide" author="CEE Studio">
      <Page size="A4" style={styles.page}>
        <View style={styles.topBand}>
          <Text style={styles.brand}>CEE STUDIO</Text>
          <Text style={styles.tagline}>FOTOSTUDIO ZÜRICH · EQUIPMENT GUIDE</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.section}>
            <View style={styles.sectionHeadRow}>
              <Text style={styles.sectionTitle}>STANDARD STUDIO RENTAL</Text>
              <Text style={styles.badge}>Included</Text>
            </View>
            <Bullets items={STANDARD} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeadRow}>
              <Text style={styles.sectionTitle}>STUDIO + PREMIUM EQUIPMENT</Text>
              <Text style={styles.badge}>+ CHF 50</Text>
            </View>
            <Text style={styles.intro}>Includes everything from the Standard package, plus:</Text>
            <Bullets items={PREMIUM} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeadRow}>
              <Text style={styles.sectionTitle}>INDIVIDUAL EQUIPMENT RENTAL</Text>
              <Text style={styles.badge}>On Request</Text>
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
            Premium equipment is rented separately and prepared on top of the standard setup.
            Individual items available on request — get in touch to add them to your booking.{"\n"}
            CEE Studio · Thurgauerstrasse 117, 8152 Glattpark (Opfikon) · info@ceestudio.ch · ceestudio.ch
          </Text>
        </View>
      </Page>
    </Document>
  );
}
