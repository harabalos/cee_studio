import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns – CEE Studio Zürich Glattpark",
  description:
    "Lernen Sie CEE Studio kennen – das moderne Fotostudio in Zürich (Glattpark, Opfikon) für Content Creators, Marken und Fotografen.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Über uns – CEE Studio Zürich",
    description: "Modernes Fotostudio in Glattpark, Opfikon.",
    url: "/about",
    images: ["/images/og-image.jpg"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
