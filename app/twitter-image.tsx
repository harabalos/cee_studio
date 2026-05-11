/**
 * Twitter / X card image — 1200x675 (16:9, what X prefers for
 * "summary_large_image" cards).
 *
 * Same composition as OG image, slightly bigger wordmark to fill the
 * taller frame.
 */

import { ImageResponse } from "next/og";
import { loadBrandFont, BRAND_FONT_FAMILY } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = "CEE Studio — Premium Photo & Video Studio in Glattpark, Zürich";
export const size = { width: 1200, height: 675 };
export const contentType = "image/png";

const BRAND = "#661414";
const CREAM = "#FDFAF4";
const ACCENT = "#E6CDA3";

export default async function TwitterImage() {
  const font = await loadBrandFont();
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
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: ACCENT,
            fontFamily: "system-ui, sans-serif",
            opacity: 0.9,
            marginBottom: 32,
          }}
        >
          Photo & Video Studio
        </div>

        <div
          style={{
            fontSize: 210,
            fontFamily: BRAND_FONT_FAMILY,
            fontStyle: "italic",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          CEE Studio
        </div>

        <div
          style={{
            width: 120,
            height: 1,
            background: ACCENT,
            marginTop: 44,
            marginBottom: 44,
          }}
        />

        <div
          style={{
            fontSize: 32,
            fontFamily: BRAND_FONT_FAMILY,
            fontStyle: "italic",
            opacity: 0.9,
            letterSpacing: "0.01em",
          }}
        >
          Glattpark · Zürich
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 64,
            fontSize: 16,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            opacity: 0.6,
            fontFamily: "system-ui, sans-serif",
            color: ACCENT,
          }}
        >
          ceestudio.ch
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: BRAND_FONT_FAMILY, data: font, weight: 500, style: "italic" }],
    }
  );
}
