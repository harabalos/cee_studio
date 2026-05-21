import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equipment & Galerie — Tageslichtstudio Zürich | CEE Studio",
  description:
    "Komplettes Equipment unseres Fotostudios in Zürich: Cyc Wall, Godox Continuous Lights, Hintergrundpapiere, Make-up Bereich, Möbel und Props. Alles inklusive im Mietpreis.",
  alternates: { canonical: "/equipment" },
  openGraph: {
    title: "Studio Equipment & Galerie — CEE Fotostudio Zürich",
    description:
      "Cyc Wall, Godox Lights, Make-up Bereich, Hintergründe & Möbel. Alles inklusive in unserem Tageslichtstudio in Zürich.",
    url: "/equipment",
    images: ["/images/studio-overview.jpg"],
    locale: "de_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Equipment — Fotostudio Zürich",
    description: "Cyc Wall, Godox, Make-up Bereich. Alles inklusive.",
    images: ["/images/studio-overview.jpg"],
  },
};

export default function EquipmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
