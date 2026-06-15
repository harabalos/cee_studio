import type { Metadata } from "next";
import { getPost } from "@/lib/blog/posts";

const post = getPost("willkommen-cee-studio-guide")!;
const url = `https://www.ceestudio.ch/blog/${post.slug}`;

export const metadata: Metadata = {
  title: `${post.title.de} | CEE Fotostudio Zürich`,
  description: post.summary.de,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: {
    title: post.title.de,
    description: post.summary.de,
    url,
    images: [post.image],
    locale: "de_CH",
    type: "article",
    publishedTime: post.publishedAt,
    authors: ["CEE Studio"],
    tags: ["Fotostudio Zürich", "Studio mieten", "Buchungs-Guide"],
  },
  twitter: {
    card: "summary_large_image",
    title: post.title.de,
    description: post.summary.de,
    images: [post.image],
  },
};

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
