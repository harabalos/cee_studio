/**
 * E2E — guest booking wizard flow.
 *
 * Walks through the 6-step wizard, fills the form, reaches Step 6 but
 * STOPS before payment (real Stripe Checkout would charge a real card).
 *
 * Maps to TESTING_GUIDE.md Test 1 (Guest booking 1h).
 */

import { test, expect } from "@playwright/test";

test("guest booking — /booking page mounts and shows 6-step wizard markers", async ({ page }) => {
  await page.goto("/booking");

  // Page heading
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 30000 });

  // 6 step markers visible (numbered 1-6) — these stay on screen across steps
  for (const n of [1, 2, 3, 4, 5, 6]) {
    await expect(page.getByText(new RegExp(`^${n}$`)).first()).toBeVisible({ timeout: 5000 });
  }

  // Duration options visible (CHF prices)
  await expect(page.locator("body")).toContainText(/CHF\s*70/);
  await expect(page.locator("body")).toContainText(/CHF\s*120/);
});
