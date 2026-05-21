import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weitere Services — Content, Editing & Brand Shoots | CEE Studio Zürich",
  description:
    "Zusätzliche Services im Fotostudio Zürich: Content Creation, Behind-the-Scenes, Bildbearbeitung, Model- & Teamvermittlung, Brand- & Produktshootings, Creative Direction und Studio Assistance.",
  alternates: { canonical: "/space" },
  openGraph: {
    title: "Weitere Services — CEE Fotostudio Zürich",
    description: "Produktions-Support in Zürich: Content, Editing, Casting, Brand Shoots, Creative Direction.",
    url: "/space",
    images: ["/images/lounge-cowhide-view.jpg"],
    locale: "de_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weitere Services — Fotostudio Zürich",
    description: "Content, Editing, Casting, Brand Shoots.",
    images: ["/images/lounge-cowhide-view.jpg"],
  },
};

export default function SpaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
