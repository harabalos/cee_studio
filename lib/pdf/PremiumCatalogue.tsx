/**
 * Premium Equipment Catalogue — branded PDF.
 *
 * Rebuilds the plain product catalogue in the CEE Studio brand (burgundy band +
 * cream body + white product cards), consistent with Invoice.tsx / EquipmentGuide.
 * Product photos live in ./catalogue-assets (extracted from the owner's original
 * catalogue, mapped to product names).
 *
 * Regenerate with: npx tsx scripts/generate-equipment-pdfs.tsx
 */

import React from "react";
import path from "path";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const BRAND = "#661414";
const CREAM = "#FDFAF4";
const ACCENT = "#E6CDA3";
const FG = "#2A1A1A";
const MUTED = "#7A6A6A";
const HAIR = "#EFE6D6";

const ASSETS = path.join(process.cwd(), "lib/pdf/catalogue-assets");
const a = (f: string) => path.join(ASSETS, f);

type Item = { img: string; name: string };

const LIGHTING: Item[] = [
  { img: "scoro-a4s.jpg", name: "Broncolor Scoro A4S" },
  { img: "flooter.jpg", name: "Broncolor Flooter" },
  { img: "p70.jpg", name: "Broncolor P70" },
  { img: "move-1200.jpg", name: "Broncolor Move 1200" },
  { img: "para-133.jpg", name: "Broncolor Para 133" },
];

const MODIFIERS: Item[] = [
  { img: "para-88.jpg", name: "Broncolor Para 88" },
  { img: "octa.jpg", name: "Broncolor Octa" },
  { img: "para-170.jpg", name: "Broncolor Para 170" },
  { img: "unilite.jpg", name: "Broncolor Unilite" },
  { img: "l-umbrella.png", name: "Profoto L Umbrella + Diffuser" },
  { img: "siros-l800.png", name: "Broncolor Siros L800" },
  { img: "b10-plus.jpg", name: "Profoto B10 Plus" },
  { img: "beauty-dish.jpg", name: "Profoto Beauty Dish" },
  { img: "zoom-reflector.png", name: "Zoom Reflector With Grids" },
];

const ACCESSORIES = [
  "System Specific Remote",
  "PocketWizard",
  "Heavy Duty Stand",
  "C-Stand",
  "Heavy Duty Stand For Para 133",
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
  body: { paddingHorizontal: 44, paddingTop: 26, paddingBottom: 46 },

  section: { marginBottom: 18 },
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
  sectionCount: { fontSize: 9, color: MUTED, letterSpacing: 1 },

  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 },
  card: { width: "33.33%", padding: 5 },
  cardInner: {
    borderWidth: 1,
    borderColor: HAIR,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  imgWrap: { height: 88, width: "100%", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  img: { width: "100%", height: 88, objectFit: "contain" },
  name: { fontSize: 8.5, textAlign: "center", color: FG, letterSpacing: 0.3 },

  accBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: HAIR,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  accItem: { width: "50%", flexDirection: "row", paddingVertical: 4 },
  accBullet: { color: BRAND, marginRight: 7, fontFamily: "Helvetica-Bold" },
  accText: { fontSize: 9.5 },

  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ACCENT,
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.5,
  },
});

function ProductGrid({ items }: { items: Item[] }) {
  return (
    <View style={styles.grid}>
      {items.map((it) => (
        <View key={it.img} style={styles.card} wrap={false}>
          <View style={styles.cardInner}>
            <View style={styles.imgWrap}>
              <Image style={styles.img} src={a(it.img)} />
            </View>
            <Text style={styles.name}>{it.name}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function SectionHead({ title, count }: { title: string; count: string }) {
  return (
    <View style={styles.sectionHeadRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
}

export function PremiumCatalogue() {
  return (
    <Document title="CEE Studio — Premium Equipment Catalogue" author="CEE Studio">
      <Page size="A4" style={styles.page}>
        <View style={styles.topBand}>
          <Text style={styles.brand}>CEE STUDIO</Text>
          <Text style={styles.tagline}>PREMIUM EQUIPMENT CATALOGUE</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.section}>
            <SectionHead title="LIGHTING" count="On Request" />
            <ProductGrid items={LIGHTING} />
          </View>

          <View style={styles.section}>
            <SectionHead title="LIGHT MODIFIERS" count="On Request" />
            <ProductGrid items={MODIFIERS} />
          </View>

          <View style={styles.section} wrap={false}>
            <SectionHead title="ACCESSORIES" count="" />
            <View style={styles.accBox}>
              {ACCESSORIES.map((it) => (
                <View key={it} style={styles.accItem}>
                  <Text style={styles.accBullet}>•</Text>
                  <Text style={styles.accText}>{it}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.footer}>
            Premium equipment is rented separately, on request. See the Equipment Guide for
            individual rental prices, or get in touch to add it to your booking.{"\n"}
            CEE Studio · Thurgauerstrasse 117, 8152 Glattpark (Opfikon) · info@ceestudio.ch · ceestudio.ch
          </Text>
        </View>
      </Page>
    </Document>
  );
}
