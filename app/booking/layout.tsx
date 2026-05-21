import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio buchen — Fotostudio Zürich Online Booking",
  description:
    "Buche unser Fotostudio in Zürich online — wähle Datum, Uhrzeit und Dauer. Sofortige Bestätigung. Zahlung per Karte oder TWINT. Ab CHF 70/Stunde inklusive Equipment.",
  alternates: { canonical: "/booking" },
  openGraph: {
    title: "Studio Online buchen — Fotostudio Zürich",
    description: "Online Buchung mit Echtzeit-Verfügbarkeit. Fotostudio Zürich ab CHF 70/h.",
    url: "/booking",
    images: ["/images/studio-overview.jpg"],
    locale: "de_CH",
    type: "website",
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
