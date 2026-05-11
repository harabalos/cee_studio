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

function candidateUrls(): string[] {
  const out: string[] = [];
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) out.push(`${fromEnv.replace(/\/$/, "")}${FONT_FILE}`);
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) out.push(`https://${vercelUrl}${FONT_FILE}`);
  // Vercel also exposes VERCEL_PROJECT_PRODUCTION_URL on prod deployments
  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProdUrl) out.push(`https://${vercelProdUrl}${FONT_FILE}`);
  out.push(`http://localhost:${process.env.PORT ?? 3000}${FONT_FILE}`);
  return out;
}

/**
 * Load the brand display font. Returns null if every candidate URL fails,
 * so callers can render with system fallback rather than crashing the route.
 */
export async function loadBrandFont(): Promise<ArrayBuffer | null> {
  for (const url of candidateUrls()) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.arrayBuffer();
    } catch {
      // try next candidate
    }
  }
  return null;
}
