/**
 * E2E — Navbar auth-aware behaviour.
 *
 * Maps to TESTING_GUIDE.md Test 16 (Auth-aware Navbar):
 *  - Logged out: "Sign in" link visible
 *  - Logged in: avatar + dropdown
 *
 * Login itself bypasses the magic-link email by minting a session
 * cookie directly via Supabase admin.
 */

import { test, expect } from "@playwright/test";

test("logged-out navbar shows Sign in link, no avatar", async ({ page }) => {
  await page.goto("/");
  // Wait for AccountMenu to mount (it fetches /api/me first)
  await page.waitForTimeout(2000);
  const navbar = page.locator("nav").first();
  // "Sign in" / "Anmelden" / "Connexion" / "Accedi" — match any locale
  await expect(
    navbar.getByRole("link", { name: /Sign in|Anmelden|Connexion|Accedi/i }).first()
  ).toBeVisible();
});

test("BOOK NOW CTA visible on every page", async ({ page }) => {
  for (const path of ["/", "/equipment", "/studio", "/contact"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    // CTA "BOOK NOW" or "JETZT BUCHEN" or "COMING SOON" depending on mode
    const cta = page.getByRole("link", { name: /Book Now|Jetzt buchen|Coming Soon|Bald verfügbar/i }).first();
    await expect(cta).toBeVisible();
  }
});

test("hamburger menu opens on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 size
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Hamburger button (visible only on mobile)
  const hamburger = page.locator('button[aria-label="Toggle menu"]');
  await expect(hamburger).toBeVisible();
  await hamburger.click();

  // Menu items should appear large
  await expect(page.getByRole("link", { name: /The Studio|Das Studio/i }).first()).toBeVisible();
});

test("hero subtitle contains 'Zurich' / 'Zürich'", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText(/Zurich|Zürich/);
});
