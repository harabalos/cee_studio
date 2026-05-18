import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preise & ABO – Fotostudio Zürich ab CHF 70/h | CEE Studio",
  description:
    "Self-Service Fotostudio in Zürich (Glattpark) mieten – ab CHF 70 / Stunde, Halbtag CHF 250, Ganztag CHF 490. Add-ons: Zusatzlicht, Backdrops, Late Night. Auch ABO Memberships verfügbar.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "Preise & Mitgliedschaften – CEE Studio Zürich",
    description:
      "Stundentarife ab CHF 70 und ABO Memberships für das Fotostudio in Glattpark, Opfikon.",
    url: "/studio",
    images: ["/images/og-image.jpg"],
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
