import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPost } from "@/lib/blog/db";
import BlogPostClient from "./BlogPostClient";

export const dynamic = "force-dynamic"; // DB-backed; reflect publish instantly

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPublishedPost(params.slug);
  if (!post) return { title: "Blog — CEE Studio Zürich" };

  const title = post.title.de;
  const desc = post.meta_description.de || post.summary.de;
  const url = `https://ceestudio.ch/blog/${post.slug}`;

  return {
    title: `${title} | CEE Fotostudio Zürich`,
    description: desc,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description: desc,
      url,
      images: post.hero_image ? [post.hero_image] : ["/images/lounge-cowhide-view.jpg"],
      locale: "de_CH",
      type: "article",
      publishedTime: post.published_at ?? post.created_at,
      authors: ["CEE Studio"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: post.hero_image ? [post.hero_image] : ["/images/lounge-cowhide-view.jpg"],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPublishedPost(params.slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title.de,
    description: post.meta_description.de || post.summary.de,
    image: [post.hero_image ?? "https://ceestudio.ch/images/lounge-cowhide-view.jpg"],
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.published_at ?? post.created_at,
    author: { "@type": "Organization", name: "CEE Studio", url: "https://ceestudio.ch/about" },
    publisher: {
      "@type": "Organization",
      name: "CEE Studio",
      logo: { "@type": "ImageObject", url: "https://ceestudio.ch/apple-icon" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://ceestudio.ch/blog/${post.slug}` },
    inLanguage: "de-CH",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogPostClient post={post} />
    </>
  );
}
