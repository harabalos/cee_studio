import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Das Studio – Fotostudio mieten in Zürich Glattpark | 60 m² Tageslicht",
  description:
    "60 m² Fotostudio in Zürich (Glattpark, Opfikon) mit Tageslicht, Cyc Wall, Godox Flash, Octabox, Make-up Bereich, Lounge und Marshall Sound System. Komplette Equipment-Liste hier.",
  alternates: { canonical: "/equipment" },
  openGraph: {
    title: "Das Studio – CEE Studio Zürich Glattpark",
    description:
      "60 m² Tageslichtstudio mit Cyc Wall, Godox Beleuchtung und Make-up Bereich in Glattpark, Opfikon.",
    url: "/equipment",
    images: ["/images/og-image.jpg"],
  },
};

export default function EquipmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
