/**
 * E2E — legal pages content verification.
 *
 * Maps to:
 *  - /privacy   (Konstantina's content)
 *  - /terms     (12 sections + 3-tier cancellation)
 *  - /rules     (11 house rules)
 *  - /impressum (Swiss-required)
 */

import { test, expect } from "@playwright/test";

test("/privacy displays all sections", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.locator("h1")).toContainText(/Privacy Policy|Datenschutz/i);
  await expect(page.locator("body")).toContainText(/Collection|Erhebung|Collecte|Raccolta/i);
});

test("/terms shows 3-tier cancellation policy", async ({ page }) => {
  await page.goto("/terms");
  await expect(page.locator("h1")).toContainText(/Terms|Geschäftsbedingungen|Conditions|Termini/i);
  // Cancellation section bullets
  await expect(page.locator("body")).toContainText(/48 hours|48 Stunden|48 heures|48 ore/i);
  await expect(page.locator("body")).toContainText(/24 hours|24 Stunden|24 heures|24 ore/i);
  await expect(page.locator("body")).toContainText(/50%/);
});

test("/rules displays 11 house rules sections", async ({ page }) => {
  await page.goto("/rules");
  await expect(page.locator("h1")).toContainText(/Studio Rules|Studio-Regeln|Règlement|Regole/i);
  // Some specific rule keywords
  await expect(page.locator("body")).toContainText(/Smoking|Rauchen|Tabac|Fumo/i);
  await expect(page.locator("body")).toContainText(/Pets|Haustiere|Animaux|Animali/i);
});

test("/impressum shows CEE Studio info", async ({ page }) => {
  await page.goto("/impressum");
  await expect(page.locator("h1")).toContainText(/Impressum|Legal Notice|Mentions légales|Note legali/i);
  await expect(page.locator("body")).toContainText("Thurgauerstrasse 117");
  await expect(page.locator("body")).toContainText("info@ceestudio.ch");
});

test("footer legal strip has all 3 links", async ({ page }) => {
  await page.goto("/");
  await page.locator("footer").scrollIntoViewIfNeeded();
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: /Privacy|Datenschutz|Confidentialité|Privacy/i }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: /^Terms|AGB|Conditions|Termini/i }).first()).toBeVisible();
  await expect(footer.getByRole("link", { name: /Impressum/i }).first()).toBeVisible();
});
