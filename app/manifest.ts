/**
 * Web App Manifest — gives the site PWA install support on Android /
 * iOS / Desktop (Chrome). Reuses the same brand colours as the icons
 * so the install banner and splash screen feel native.
 *
 * Next.js serves this at /manifest.webmanifest automatically.
 */

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CEE Studio",
    short_name: "CEE Studio",
    description:
      "Premium B2B photo and video production studio in Glattpark, Zürich. Self-service rental and creator memberships.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFAF4",
    theme_color: "#661414",
    orientation: "portrait-primary",
    categories: ["photography", "business", "productivity"],
    lang: "de",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
