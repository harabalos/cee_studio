import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jetzt buchen – Fotostudio Zürich Glattpark | CEE Studio",
  description:
    "Fotostudio in Zürich (Glattpark, Opfikon) jetzt online buchen. Echtzeit-Verfügbarkeit, Self-Service Vermietung ab CHF 70/h. Sofort reservieren.",
  alternates: { canonical: "/booking" },
  openGraph: {
    title: "Jetzt buchen – CEE Studio Zürich",
    description:
      "Online-Buchung mit Echtzeit-Verfügbarkeit. Fotostudio Zürich Glattpark.",
    url: "/booking",
    images: ["/images/og-image.jpg"],
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
