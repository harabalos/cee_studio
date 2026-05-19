/**
 * Playwright config for E2E tests.
 *
 * Runs against a locally-served Next.js dev server. Spawned automatically
 * by `webServer` block — no need to start it manually before `npx playwright
 * test`. Single Chromium project, headless by default, slowMo=0 (CI), or
 * `HEADED=1 SLOMO=1` for local debugging.
 */

import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import path from "node:path";

// Load .env.local so tests have access to Stripe/Supabase/Resend keys
config({ path: path.resolve(__dirname, ".env.local") });

const PORT = 3001; // separate from dev server (3000) so QA + dev can coexist
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // share DB state — serial avoids race conditions
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: !process.env.HEADED,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: BASE_URL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
});
