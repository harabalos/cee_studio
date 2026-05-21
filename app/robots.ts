import type { MetadataRoute } from "next";

const BASE = "https://ceestudio.ch";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: [
      `${BASE}/sitemap.xml`,
      `${BASE}/image-sitemap.xml`,
    ],
    host: BASE,
  };
}
