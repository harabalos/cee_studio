/**
 * Apple touch icon — 180x180.
 *
 * iOS / iPadOS home-screen icon. Uses the brand's Cormorant Garamond
 * Italic "C" with a small gold accent dot underneath, echoing the
 * wordmark's understated punctuation accent.
 *
 * iOS applies a ~22% rounded mask to the icon, so we render a flat
 * burgundy field — the system rounds it for us.
 */

import { ImageResponse } from "next/og";
import { loadBrandFont, BRAND_FONT_FAMILY } from "@/lib/og-fonts";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BRAND = "#661414";
const CREAM = "#FDFAF4";
const ACCENT = "#E6CDA3";

export default async function AppleIcon() {
  const font = await loadBrandFont();
  const fontFamily = font ? BRAND_FONT_FAMILY : "Georgia, serif";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND,
          color: CREAM,
          fontFamily,
        }}
      >
        <div
          style={{
            fontSize: 165,
            fontStyle: "italic",
            fontWeight: 500,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginTop: -8,
          }}
        >
          C
        </div>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: ACCENT,
            marginTop: 6,
          }}
        />
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
