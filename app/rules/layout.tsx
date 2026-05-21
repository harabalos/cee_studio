import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Regeln — CEE Fotostudio Zürich",
  description:
    "Hausregeln für unser Fotostudio in Zürich: Was ist erlaubt, was nicht. Damit dein Shoot reibungslos abläuft. Lies die wichtigsten Punkte vor deiner Buchung.",
  alternates: { canonical: "https://ceestudio.ch/rules" },
  robots: { index: true, follow: true },
};

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
