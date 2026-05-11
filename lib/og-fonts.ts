/**
 * Shared font loader for dynamic Open Graph / icon routes.
 *
 * Next.js edge runtime doesn't ship system fonts (no Georgia, no Helvetica),
 * so ImageResponse falls back to a generic sans-serif unless we pass a font
 * explicitly. We host the brand's display font (Cormorant Garamond Italic)
 * in /public/fonts and fetch it at render time.
 *
 * The fetched ArrayBuffer is reused across renders via the in-memory edge
 * cache, so the 293KB cost is paid once per cold start.
 */

export const BRAND_FONT_FAMILY = "Cormorant";

const FONT_FILE = "/fonts/CormorantGaramond-Italic-500.ttf";

function resolveFontUrl(): string {
  // 1. Canonical site URL when explicitly configured.
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return `${fromEnv.replace(/\/$/, "")}${FONT_FILE}`;

  // 2. Vercel auto-injects VERCEL_URL on every deployment (preview + prod).
  //    Without this, dynamic OG/icon routes return 500 in production when
  //    NEXT_PUBLIC_SITE_URL hasn't been set on the host.
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}${FONT_FILE}`;

  // 3. Local development fallback.
  return `http://localhost:${process.env.PORT ?? 3000}${FONT_FILE}`;
}

export async function loadBrandFont(): Promise<ArrayBuffer> {
  const res = await fetch(resolveFontUrl());
  if (!res.ok) {
    throw new Error(`Could not load brand font: ${res.status} from ${resolveFontUrl()}`);
  }
  return res.arrayBuffer();
}
