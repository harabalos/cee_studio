import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fotostudio Zürich mieten ab CHF 70/h — Preise & ABO",
  description:
    "Fotostudio in Zürich mieten: ab CHF 70/h, Halbtag CHF 250, Ganztag CHF 490. 60 m² Tageslichtstudio mit Cyc Wall, Godox Beleuchtung, Make-up Bereich. Auch monatliches ABO verfügbar. 5 Min. von Zürich Oerlikon.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Fotostudio Zürich mieten — Preise & ABO | CEE Studio",
    description:
      "Stundentarife ab CHF 70 und monatliche Memberships für das Fotostudio in Zürich.",
    url: "/pricing",
    images: ["/images/pricing-overview.jpg"],
    locale: "de_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fotostudio Zürich — Preise & ABO",
    description: "Fotostudio in Zürich. Ab CHF 70/h. Tageslicht, Cyc Wall, Make-up.",
    images: ["/images/pricing-overview.jpg"],
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
