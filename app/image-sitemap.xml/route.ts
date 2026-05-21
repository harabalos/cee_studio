/**
 * Google Image Sitemap — boosts Google Images ranking for studio photos.
 *
 * Spec: https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
 *
 * Emits a separate sitemap-style XML at /image-sitemap.xml that lists
 * every public studio image with caption + geo location + license.
 * Indexed by Google Images crawler; sitemap.xml refers to this via the
 * sitemap index pattern (added to sitemap.ts).
 *
 * Why a separate route (not extending sitemap.ts):
 *   Next.js MetadataRoute.Sitemap exposes `images: string[]` but not the
 *   richer Google Image Sitemap schema (image:caption, image:geo_location,
 *   image:license). Hand-built XML gives full control.
 */

import type { NextRequest } from "next/server";

export const dynamic = "force-static";
export const revalidate = 86400; // 24h — images don't churn often

const BASE = "https://ceestudio.ch";
const GEO_LOCATION = "Zürich, Switzerland";
const LICENSE = "https://ceestudio.ch/impressum";

interface StudioImage {
  /** Path under /public, e.g. "/images/lounge-cowhide-view.jpg" */
  url: string;
  /** Image caption — descriptive, keyword-rich */
  caption: string;
  /** Page where the image appears (used as the parent loc) */
  parentPage: string;
}

const STUDIO_IMAGES: StudioImage[] = [
  // Homepage hero + zones
  { url: "/images/lounge-cowhide-view.jpg",  parentPage: "/",         caption: "Fotostudio Zürich — Lounge mit Cowhide-Teppich, Ghost-Stühlen und Aussicht über Zürich" },
  { url: "/images/cyc-softbox.jpg",          parentPage: "/",         caption: "Fotostudio Zürich — Cyc Wall mit parabolischem Softbox und Tageslicht" },
  { url: "/images/lounge-mirror.jpg",        parentPage: "/",         caption: "Fotostudio Zürich — Lifestyle Lounge mit Tufted Chairs und Arch Mirror" },
  { url: "/images/glam-station.jpg",         parentPage: "/",         caption: "Fotostudio Zürich — Make-up Bereich mit Hollywood-Spiegel und Director Chair" },
  { url: "/images/equipment-grid.jpg",       parentPage: "/",         caption: "Fotostudio Zürich — Equipment-Übersicht: Cyc, Lichter, Möbel" },

  // /studio carousel
  { url: "/images/lounge-softbox.jpg",       parentPage: "/studio",   caption: "Fotostudio Zürich — Lounge mit grossem Round-Softbox in Aktion" },

  // /equipment gallery
  { url: "/images/studio-overview.jpg",      parentPage: "/equipment",caption: "Fotostudio Zürich — Working Studio mit Cowhide, Softbox und Garderobenständer" },
  { url: "/images/lounge-glam.jpg",          parentPage: "/equipment",caption: "Fotostudio Zürich — Lounge während eines Shootings mit komplettem Set-up" },
  { url: "/images/props.jpg",                parentPage: "/equipment",caption: "Fotostudio Zürich — Möbel und Props: Ghost Chair, Leather Chair, Stool, Pedestals" },
  { url: "/images/paper-backdrops.jpg",      parentPage: "/equipment",caption: "Fotostudio Zürich — Hintergrundpapiere: Beige, Schwarz und Weiss auf Wandhalterung" },
  { url: "/images/makeup-area.jpg",          parentPage: "/equipment",caption: "Fotostudio Zürich — Make-up Bereich mit Hollywood-Spiegel, Espresso und Bergsicht" },
  { url: "/images/risers-detail.jpg",        parentPage: "/equipment",caption: "Fotostudio Zürich — Product-Setup: Tripod Stool, weisse Risers und Softbox-Kante" },
  { url: "/images/bts-shoot.jpg",            parentPage: "/equipment",caption: "Fotostudio Zürich — Behind-the-Scenes mit Klappe und Modell auf schwarzem Hintergrund" },
  { url: "/images/makeup-real.jpg",          parentPage: "/equipment",caption: "Fotostudio Zürich — Make-up Artist in Aktion an Kundin" },

  // /space
  { url: "/images/studio-vertical.jpg",      parentPage: "/space",    caption: "Fotostudio Zürich — Vertikale Aufnahme: Parabolic Softbox und Cyc Wall" },
  { url: "/images/makeup-corner.jpg",        parentPage: "/space",    caption: "Fotostudio Zürich — Makeup Corner mit Director Chair und Bar Cart" },
  { url: "/images/lighting-bts.jpg",         parentPage: "/space",    caption: "Fotostudio Zürich — Lighting Behind-the-Scenes Setup" },

  // /about
  { url: "/images/studio-wide.jpg",          parentPage: "/about",    caption: "Fotostudio Zürich — Grundriss und Übersicht des 60 m² Studios" },

  // Blog hero
  { url: "/images/lounge-cowhide-view.jpg",  parentPage: "/blog/willkommen-cee-studio-guide", caption: "Fotostudio Zürich — Willkommen Guide Hero-Bild" },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET(_req: NextRequest) {
  // Group images by parent page so each <url> entry can list multiple <image:image>
  const byPage = new Map<string, StudioImage[]>();
  for (const img of STUDIO_IMAGES) {
    const list = byPage.get(img.parentPage) ?? [];
    list.push(img);
    byPage.set(img.parentPage, list);
  }

  const urlEntries = Array.from(byPage.entries())
    .map(([page, images]) => {
      const imageBlocks = images
        .map(
          (img) =>
            `    <image:image>
      <image:loc>${BASE}${img.url}</image:loc>
      <image:caption>${escapeXml(img.caption)}</image:caption>
      <image:geo_location>${GEO_LOCATION}</image:geo_location>
      <image:license>${LICENSE}</image:license>
    </image:image>`
        )
        .join("\n");

      return `  <url>
    <loc>${BASE}${page === "/" ? "" : page}</loc>
${imageBlocks}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
