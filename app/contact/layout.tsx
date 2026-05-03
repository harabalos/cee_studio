import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt – Fotostudio Zürich Glattpark | CEE Studio",
  description:
    "Kontaktieren Sie CEE Studio – Fotostudio in Zürich (Glattpark, Opfikon). Thurgauerstrasse 117, 8152 Glattpark. Tel: +41 76 240 20 56.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Kontakt – CEE Studio Zürich",
    description: "Thurgauerstrasse 117, 8152 Glattpark (Opfikon). +41 76 240 20 56.",
    url: "/contact",
    images: ["/images/og-image.jpg"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
