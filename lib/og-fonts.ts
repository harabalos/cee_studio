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
  // Prefer the canonical site URL when configured (works in prod / preview).
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return `${fromEnv}${FONT_FILE}`;
  // Fall back to localhost in development.
  return `http://localhost:${process.env.PORT ?? 3000}${FONT_FILE}`;
}

export async function loadBrandFont(): Promise<ArrayBuffer> {
  const res = await fetch(resolveFontUrl());
  if (!res.ok) {
    throw new Error(`Could not load brand font: ${res.status} from ${resolveFontUrl()}`);
  }
  return res.arrayBuffer();
}
