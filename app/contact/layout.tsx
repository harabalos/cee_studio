import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt — CEE Fotostudio Zürich",
  description:
    "Kontakt CEE Studio — Fotostudio in Zürich. Thurgauerstrasse 117, 8152. Tel: +41 76 240 20 56. info@ceestudio.ch. 5 Min. von Zürich Oerlikon mit Tram 10.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Kontakt — CEE Fotostudio Zürich",
    description: "Thurgauerstrasse 117 — 5 Min. von Zürich Oerlikon. +41 76 240 20 56.",
    url: "/contact",
    images: ["/images/og-image.jpg"],
    locale: "de_CH",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
