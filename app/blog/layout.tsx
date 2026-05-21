import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Tipps & Guides | CEE Fotostudio Zürich",
  description:
    "Insights, Guides und News rund um unser Fotostudio in Zürich. Tipps für deinen Shoot, Equipment-Erklärungen, Behind-the-Scenes und mehr.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — CEE Fotostudio Zürich",
    description: "Tipps, Guides und News rund um unser Fotostudio in Zürich.",
    url: "/blog",
    images: ["/images/lounge-cowhide-view.jpg"],
    locale: "de_CH",
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
