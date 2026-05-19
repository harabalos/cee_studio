import { defineConfig } from "vitest/config";
import path from "node:path";
import { config } from "dotenv";

// Load .env.local so integration tests can talk to Supabase / Stripe / Resend.
// Next.js auto-loads this for runtime, but Vitest doesn't.
config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  // Use the React JSX automatic runtime so .tsx files (emails, PDF
  // templates) compile without an explicit `import React` line.
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "tests/**/*.test.ts"],
    // Integration suites are slow (HTTP + DB roundtrips)
    testTimeout: 60_000,
    // Serial — integration tests share DB state and would race in parallel.
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
