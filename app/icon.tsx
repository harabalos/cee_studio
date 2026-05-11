/**
 * Favicon — 32x32.
 *
 * Single "C" in the brand's Cormorant Garamond Italic on burgundy.
 * Subtle squircle radius so the mark feels tailored, not a stock OG glyph.
 */

import { ImageResponse } from "next/og";
import { loadBrandFont, BRAND_FONT_FAMILY } from "@/lib/og-fonts";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const BRAND = "#661414";
const CREAM = "#FDFAF4";

export default async function Icon() {
  const font = await loadBrandFont();
  const fontFamily = font ? BRAND_FONT_FAMILY : "Georgia, serif";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND,
          borderRadius: 6,
          color: CREAM,
          fontSize: 30,
          fontFamily,
          fontStyle: "italic",
          fontWeight: 500,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          paddingBottom: 3,
        }}
      >
        C
      </div>
    ),
    {
      ...size,
      ...(font && {
        fonts: [{ name: BRAND_FONT_FAMILY, data: font, weight: 500, style: "italic" }],
      }),
    }
  );
}
