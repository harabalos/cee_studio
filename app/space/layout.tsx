import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weitere Services – Content, Editing & Brand Shoots | CEE Studio Zürich",
  description:
    "Zusätzliche Services im CEE Studio Zürich: Content Creation, BTS, Bildbearbeitung, Model- & Teamvermittlung, Brand- & Produktshootings, Creative Direction und Studio Assistance.",
  alternates: { canonical: "/space" },
  openGraph: {
    title: "Weitere Services – CEE Studio Zürich",
    description:
      "Produktions-Support: Content, Editing, Casting, Brand Shoots, Creative Direction.",
    url: "/space",
    images: ["/images/og-image.jpg"],
  },
};

export default function SpaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
