/**
 * Smoke tests — every public page returns 200 in full mode.
 *
 * This catches build-time regressions in route handlers, broken imports,
 * missing translations etc. Cheap and fast.
 */

import { describe, it, expect } from "vitest";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3001";

const PUBLIC_PAGES = [
  "/",
  "/equipment",
  "/space",
  "/studio",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/rules",
  "/impressum",
  "/login",
  "/booking",
  "/coming-soon",
];

describe("Public pages smoke test", () => {
  // Dev mode compiles each route on first hit; the heaviest pages (/, /booking)
  // can take 30-60s on cold start. Bump timeout to 90s for these.
  for (const path of PUBLIC_PAGES) {
    it(`GET ${path} returns 200`, async () => {
      const res = await fetch(`${BASE}${path}`);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toMatch(/<html/i);
      expect(html).not.toMatch(/Internal Server Error/);
    }, 90_000);
  }
});

describe("Static asset routes", () => {
  it("/manifest.webmanifest returns valid JSON", async () => {
    const res = await fetch(`${BASE}/manifest.webmanifest`);
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.name).toBe("CEE Studio");
  });

  it("/sitemap.xml returns XML", async () => {
    const res = await fetch(`${BASE}/sitemap.xml`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toMatch(/<urlset/);
  });

  it("/robots.txt returns plain text", async () => {
    const res = await fetch(`${BASE}/robots.txt`);
    expect(res.status).toBe(200);
  });
});

describe("Dynamic icons", () => {
  it("/icon returns image/png", async () => {
    const res = await fetch(`${BASE}/icon`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("/apple-icon returns image/png", async () => {
    const res = await fetch(`${BASE}/apple-icon`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("/opengraph-image returns image/png", async () => {
    const res = await fetch(`${BASE}/opengraph-image`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("/twitter-image returns image/png", async () => {
    const res = await fetch(`${BASE}/twitter-image`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });
});
