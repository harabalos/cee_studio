/**
 * OpenGraph image — 1200x630.
 *
 * Used for link previews on Facebook, LinkedIn, WhatsApp, iMessage,
 * Discord, and Slack. Wordmark in the brand's serif italic + location
 * + thin gold accent rule. Same composition the hero section uses,
 * so social and on-page feel like the same brand.
 */

import { ImageResponse } from "next/og";
import { loadBrandFont, BRAND_FONT_FAMILY } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = "CEE Studio — Premium Photo & Video Studio in Glattpark, Zürich";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "#661414";
const CREAM = "#FDFAF4";
const ACCENT = "#E6CDA3";

export default async function OGImage() {
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
        {/* Eyebrow — sans for legibility at small thumbnail sizes */}
        <div
          style={{
            fontSize: 20,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: ACCENT,
            fontFamily: "system-ui, sans-serif",
            opacity: 0.9,
            marginBottom: 28,
          }}
        >
          Photo & Video Studio
        </div>

        {/* Wordmark — serif italic, matches site logo */}
        <div
          style={{
            fontSize: 190,
            fontFamily: BRAND_FONT_FAMILY,
            fontStyle: "italic",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          CEE Studio
        </div>

        {/* Accent line */}
        <div
          style={{
            width: 120,
            height: 1,
            background: ACCENT,
            marginTop: 40,
            marginBottom: 40,
          }}
        />

        {/* Location */}
        <div
          style={{
            fontSize: 30,
            fontFamily: BRAND_FONT_FAMILY,
            fontStyle: "italic",
            opacity: 0.9,
            letterSpacing: "0.01em",
          }}
        >
          Glattpark · Zürich
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            right: 60,
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
