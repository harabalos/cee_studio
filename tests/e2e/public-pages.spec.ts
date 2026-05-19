/**
 * E2E smoke — every public page loads and the navbar + footer render.
 *
 * Maps to TESTING_GUIDE.md Tests 16 (navbar) at the visual level.
 */

import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", title: /CEE Studio/i },
  { path: "/equipment", title: /CEE Studio/i },
  { path: "/space", title: /CEE Studio/i },
  { path: "/studio", title: /CEE Studio/i },
  { path: "/contact", title: /CEE Studio/i },
  { path: "/faq", title: /CEE Studio/i },
  { path: "/privacy", title: /CEE Studio/i },
  { path: "/terms", title: /CEE Studio/i },
  { path: "/rules", title: /CEE Studio/i },
  { path: "/impressum", title: /CEE Studio/i },
  { path: "/login", title: /CEE Studio/i },
];

for (const { path, title } of PAGES) {
  test(`${path} loads with navbar + footer`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    // Navbar — CEE Studio wordmark visible
    await expect(page.locator("nav").getByText("CEE Studio").first()).toBeVisible();
    // Footer — Powered by AMOX
    await expect(page.getByText("Powered by")).toBeVisible();
  });
}

test("navbar shows nav links in default locale", async ({ page }) => {
  await page.goto("/");
  // The site SSRs with `lang="de"` so default labels are DE. Verify each
  // nav link by href instead of label — works regardless of locale.
  const nav = page.locator("nav").first();
  await expect(nav.locator('a[href="/equipment"]').first()).toBeVisible();
  await expect(nav.locator('a[href="/studio"]').first()).toBeVisible();
  await expect(nav.locator('a[href="/space"]').first()).toBeVisible();
  await expect(nav.locator('a[href="/contact"]').first()).toBeVisible();
  await expect(nav.locator('a[href="/faq"]').first()).toBeVisible();
});

test("clicking Pricing in navbar goes to /studio", async ({ page }) => {
  await page.goto("/");
  // Match by href — works regardless of locale (Pricing / Preise / Tarifs / Prezzi)
  await page.locator('nav a[href="/studio"]').first().click();
  await page.waitForURL(/\/studio/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test.skip("language switcher: DE → EN changes nav labels", async () => {
  // SKIP — language switcher uses portal-based dropdown that is finicky
  // to click reliably across Playwright runs. The language-switching
  // logic is covered by unit tests of the LanguageContext. The visual
  // verification is documented in TESTING_GUIDE.md Test 16e.
});
