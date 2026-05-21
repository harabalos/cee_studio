import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ Fotostudio Zürich — Häufige Fragen | CEE Studio",
  description:
    "Antworten zu Buchung, Preisen, Equipment und Anfahrt für unser Fotostudio in Zürich. Wie funktioniert Self-Service? Was ist im ABO enthalten? Hier findest du alle Infos.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ Fotostudio Zürich — CEE Studio",
    description: "Häufige Fragen zum Fotostudio Zürich: Buchung, Preise, Equipment, Anfahrt.",
    url: "/faq",
    images: ["/images/og-image.jpg"],
    locale: "de_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ Fotostudio Zürich",
    description: "Häufige Fragen: Buchung, Preise, Equipment, Anfahrt.",
    images: ["/images/og-image.jpg"],
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
