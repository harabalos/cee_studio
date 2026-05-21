import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns — CEE Fotostudio Zürich | Konstantina Metaxa",
  description:
    "Hinter CEE Studio steht Konstantina Metaxa — unser Fotostudio in Zürich für Lifestyle, Beauty und Content Creation. Erfahre mehr über unsere Vision und das Team.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Über uns — CEE Fotostudio Zürich",
    description: "Konstantina Metaxa und die Vision hinter CEE Studio — unser Fotostudio in Zürich.",
    url: "/about",
    images: ["/images/studio-overview.jpg"],
    locale: "de_CH",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
