import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Das Studio — Tageslichtstudio Zürich mit Backdrop Setup & Equipment",
  description:
    "Unser 60 m² Fotostudio in Zürich: Backdrop Setup, Tageslicht, Godox Beleuchtung, Make-up Bereich, Lounge und komplettes Equipment. Alles inklusive im Mietpreis.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "Das Studio — CEE Fotostudio Zürich",
    description:
      "60 m² Tageslichtstudio mit Backdrop Setup, Godox Beleuchtung, Make-up Bereich und komplettem Equipment — alles inklusive.",
    url: "/studio",
    images: ["/images/studio-overview.jpg"],
    locale: "de_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Das Studio — Fotostudio Zürich",
    description: "60 m², Backdrop Setup, Tageslicht, Make-up Bereich. Alles inklusive.",
    images: ["/images/studio-overview.jpg"],
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
