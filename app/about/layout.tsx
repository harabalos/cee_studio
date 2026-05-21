import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns — CEE Fotostudio Zürich",
  description:
    "Über CEE Studio — unser Fotostudio in Zürich für Lifestyle, Beauty und Content Creation. Erfahre mehr über unsere Vision und unser Team.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Über uns — CEE Fotostudio Zürich",
    description: "Die Vision hinter CEE Studio — unser Fotostudio in Zürich.",
    url: "/about",
    images: ["/images/studio-overview.jpg"],
    locale: "de_CH",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
