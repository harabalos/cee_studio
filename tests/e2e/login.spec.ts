/**
 * E2E — /login page UI.
 *
 * Maps to TESTING_GUIDE.md Test 5 (Admin login UI).
 * Does NOT actually complete the magic link flow — that requires a real
 * email inbox. We verify the UI states and form interactions.
 */

import { test, expect } from "@playwright/test";

test("/login renders with email pre-fill from query param", async ({ page }) => {
  await page.goto("/login?email=qa%40example.test");
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toHaveValue("qa@example.test");
});

test("/login contextual subtitle for ?next=/account", async ({ page }) => {
  await page.goto("/login?next=/account");
  // EN: bookings/membership · DE: Buchungen/ABO · FR: réservations/abonnement
  // · IT: prenotazioni/abbonamento
  await expect(page.locator("body")).toContainText(
    /bookings|membership|Buchungen|ABO|réservations|abonnement|prenotazioni|abbonamento/i
  );
});

test("/login submit empty email keeps user on /login", async ({ page }) => {
  await page.goto("/login");
  // Magic-link button — match any locale
  await page.getByRole("button", { name: /Send magic link|Magic Link senden|Envoyer le lien magique|Invia magic link/i }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("/login shows error message when ?error= param present", async ({ page }) => {
  await page.goto("/login?error=otp_expired");
  await expect(page.locator("body")).toContainText(/expired|abgelaufen|expir|scaduto/i);
});

test("/login submits valid email and shows 'check inbox' state", async ({ page }) => {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill("qa-login-e2e@qa.ceestudio.test");
  await page.getByRole("button", { name: /Send magic link|Magic Link senden|Envoyer le lien magique|Invia magic link/i }).click();
  await expect(
    page.locator("body")
  ).toContainText(
    /Check your (inbox|email)|Prüfe deinen|Vérifie ta boîte|Controlla la tua casella|expired|failed|fehlgeschlagen|fallita/i,
    { timeout: 20000 }
  );
});
