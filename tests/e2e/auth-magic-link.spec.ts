/**
 * E2E — Magic-link auth bypass + account/admin route guards.
 *
 * Bypasses the email step by minting a Supabase magic link via the admin
 * client (service-role key). This is the same flow a user would see after
 * clicking the link in their inbox — we just skip Resend/Gmail entirely.
 *
 * Maps to TESTING_GUIDE.md Test 5 (Admin login) + Test 6 (Account access).
 *
 * What this verifies (which IS our code):
 *   - /auth/callback handles token_hash verification correctly
 *   - Session cookie is set after callback → /account loads (200, not redirect)
 *   - Non-admin email hitting /admin → redirect to /login
 *   - Logout clears the session → /account redirects back to /login
 *
 * What this does NOT verify (intentionally — out of scope):
 *   - Email delivery itself (covered by tests/e2e/resend-delivery.spec.ts)
 *   - The full admin dashboard rendering (production admin email check is
 *     env-gated and would require polluting auth.users with real prod emails)
 */

import { test, expect } from "@playwright/test";
import { admin, cleanupQA, qaEmail, mintSignInLink } from "../integration/helpers/supabase";

test.describe("Magic-link auth bypass — account + admin guards", () => {
  test.beforeAll(async () => {
    await cleanupQA();
  });

  test.afterAll(async () => {
    await cleanupQA();
  });

  test("magic-link sign-in → /account is reachable + shows user email", async ({ page }) => {
    const email = qaEmail("auth-account");

    // 1. Seed user row (the auth user is created by mintSignInLink below)
    await admin.from("users").insert({
      email,
      name: "QA Auth Tester",
      phone: "+41 79 000 0002",
      role: "visitor",
      preferred_lang: "de",
    });

    // 2. Mint a magic-link URL via the admin API (skips the inbox)
    const link = await mintSignInLink(email);
    expect(link).toMatch(/token_hash=/);

    // 3. Open the link — it should land on /account (or wherever /auth/callback
    //    routes). Use waitUntil:domcontentloaded since the callback chain
    //    bounces through multiple redirects before settling.
    await page.goto(link, { waitUntil: "domcontentloaded" });

    // Either we landed on /account, or the smart-redirect sent us to /booking.
    // Both indicate auth succeeded. We just need to NOT be on /login.
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 10_000 });
    expect(page.url()).not.toContain("/login");

    // 4. Navigate to /account explicitly — should be reachable, not a redirect
    await page.goto("/account");
    await expect(page).toHaveURL(/\/account/);
    // The header shows the signed-in user's email
    await expect(page.locator("body")).toContainText(email);
  });

  test("non-admin user hitting /admin → redirects to /login", async ({ page }) => {
    const email = qaEmail("auth-not-admin");

    await admin.from("users").insert({
      email,
      name: "QA Non-Admin",
      phone: "+41 79 000 0003",
      role: "visitor",
      preferred_lang: "de",
    });

    // Sign in as a non-admin
    const link = await mintSignInLink(email);
    await page.goto(link, { waitUntil: "domcontentloaded" });
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 10_000 });

    // Now try /admin — must redirect to /login (or coming-soon in marketing mode)
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/(login|coming-soon)/);
  });

  test("unauthenticated /account → redirects to /login", async ({ page, context }) => {
    // Fresh context — no cookies, no session
    await context.clearCookies();

    await page.goto("/account");
    await expect(page).toHaveURL(/\/(login|coming-soon)/);
  });

  test("logout clears session — /account becomes inaccessible again", async ({ page }) => {
    const email = qaEmail("auth-logout");

    await admin.from("users").insert({
      email,
      name: "QA Logout Tester",
      phone: "+41 79 000 0004",
      role: "visitor",
      preferred_lang: "de",
    });

    const link = await mintSignInLink(email);
    await page.goto(link, { waitUntil: "domcontentloaded" });
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 10_000 });

    // We're signed in. Confirm /account loads.
    await page.goto("/account");
    await expect(page).toHaveURL(/\/account/);

    // Log out — /logout is a client component that calls signOut() then
    // navigates to /login. Wait for that final URL before asserting.
    await page.goto("/logout");
    await page.waitForURL(/\/login/, { timeout: 10_000 });

    // Now /account must redirect to /login again
    await page.goto("/account");
    await expect(page).toHaveURL(/\/(login|coming-soon)/);
  });
});
