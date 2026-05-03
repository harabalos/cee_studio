import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ – Fotostudio Zürich häufige Fragen | CEE Studio",
  description:
    "Häufige Fragen zum CEE Studio Zürich: Buchung, Equipment, Self-Service, Parkplätze, Anfahrt nach Glattpark, ABO Memberships und mehr.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ – CEE Studio Zürich",
    description: "Antworten zu Buchung, Equipment, Anfahrt und mehr.",
    url: "/faq",
    images: ["/images/og-image.jpg"],
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
