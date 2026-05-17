import type { MetadataRoute } from "next";
import { IS_MARKETING_MODE } from "@/lib/launch-mode";

const BASE = "https://ceestudio.ch";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "",          priority: 1.0, changeFrequency: "weekly" },
    { path: "/equipment", priority: 0.9, changeFrequency: "monthly" },
    { path: "/studio",    priority: 0.95, changeFrequency: "weekly" },
    // /booking is excluded in marketing mode — middleware redirects it to /coming-soon
    ...(IS_MARKETING_MODE
      ? []
      : [{ path: "/booking", priority: 0.95, changeFrequency: "weekly" as const }]),
    { path: "/space",     priority: 0.85, changeFrequency: "monthly" },
    { path: "/contact",   priority: 0.8,  changeFrequency: "monthly" },
    { path: "/about",     priority: 0.7,  changeFrequency: "monthly" },
    { path: "/faq",       priority: 0.7,  changeFrequency: "monthly" },
    { path: "/terms",     priority: 0.4,  changeFrequency: "yearly" },
    { path: "/privacy",   priority: 0.3,  changeFrequency: "yearly" },
    { path: "/impressum", priority: 0.3,  changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    alternates: {
      languages: {
        "de-CH": `${BASE}${r.path}`,
        de: `${BASE}${r.path}`,
        en: `${BASE}${r.path}`,
        fr: `${BASE}${r.path}`,
        it: `${BASE}${r.path}`,
      },
    },
  }));
}
