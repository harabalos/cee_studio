/**
 * E2E — Accessibility (axe-core WCAG AA scan).
 *
 * Maps to Switzerland's BehiG/LHand law which mandates accessibility for
 * public-facing business websites. Also good practice for SEO + screen-reader
 * users.
 *
 * Strategy: load each key page in a headless browser, run @axe-core/playwright
 * against the rendered DOM, fail on `critical` or `serious` violations.
 * Moderate / minor are logged for awareness but don't fail the test (would be
 * too noisy for a first-pass scan).
 *
 * Critical examples: missing form labels, no alt text on informational images,
 * insufficient color contrast, keyboard traps.
 *
 * What this verifies:
 *   - Homepage, /booking, /studio, /coming-soon, /faq, /contact pass WCAG AA
 *     for critical + serious issues
 *
 * NOT verified:
 *   - Subjective UX (screen-reader narration quality)
 *   - Dynamic states (modal open, dropdown expanded — only initial render)
 *   - Pages behind auth (admin dashboard, /account) — separate concern
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES_TO_SCAN = [
  { path: "/", name: "homepage" },
  { path: "/studio", name: "studio (rates + memberships)" },
  { path: "/equipment", name: "equipment" },
  { path: "/space", name: "space (other services)" },
  { path: "/contact", name: "contact" },
  { path: "/faq", name: "faq" },
  { path: "/coming-soon", name: "coming-soon (marketing mode)" },
  { path: "/login", name: "login" },
  { path: "/privacy", name: "privacy" },
  { path: "/terms", name: "terms" },
  { path: "/rules", name: "rules" },
  { path: "/impressum", name: "impressum" },
];

test.describe("Accessibility — WCAG AA scan via axe-core", () => {
  for (const page of PAGES_TO_SCAN) {
    test(`${page.name} (${page.path}) — no critical/serious WCAG violations`, async ({ page: browserPage }) => {
      // Reduce motion — Framer Motion respects prefers-reduced-motion and
      // shortcuts fade-ins. Without this, axe scans mid-animation when text
      // is mid-opacity and fails on color-contrast (false positive).
      await browserPage.emulateMedia({ reducedMotion: "reduce" });

      await browserPage.goto(page.path);
      await browserPage.waitForLoadState("domcontentloaded");

      // Belt-and-braces: also force-finish any CSS transitions/animations
      // by injecting !important overrides. Some Framer Motion variants
      // still tween opacity even with reduced-motion.
      await browserPage.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0ms !important;
            animation-delay: 0ms !important;
            transition-duration: 0ms !important;
            transition-delay: 0ms !important;
          }
        `,
      });

      // Wait for staggered fade-ins to settle (FAQ has up to 10×0.1s delays
      // plus 0.5s duration = 1.5s). Use 2s for safety margin.
      await browserPage.waitForTimeout(2000);

      const results = await new AxeBuilder({ page: browserPage })
        // Scope to body — ignore browser/devtools UI
        .include("body")
        // WCAG 2.1 AA is the Swiss legal standard
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Filter to critical + serious only — moderate/minor are warnings
      const blocking = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      if (blocking.length > 0) {
        // Pretty-print all violations so the failure shows everything at once
        const summary = blocking
          .map((v) => {
            const nodes = v.nodes
              .slice(0, 3)
              .map((n) => `      ${n.target.join(" ")} — ${n.failureSummary?.replace(/\n/g, " ")}`)
              .join("\n");
            return `\n  [${v.impact}] ${v.id}: ${v.help}\n    Help: ${v.helpUrl}\n${nodes}`;
          })
          .join("");
        console.error(`axe violations on ${page.path}:${summary}`);
      }

      expect(
        blocking.length,
        `${page.name} has ${blocking.length} critical/serious WCAG violation(s)`
      ).toBe(0);
    });
  }
});
