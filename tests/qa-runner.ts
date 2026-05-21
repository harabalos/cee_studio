#!/usr/bin/env tsx
/**
 * Master QA runner — orchestrates all 3 test layers and writes a
 * markdown report to docs/qa-report.md.
 *
 * Usage:
 *   npm run qa:all
 *
 * Requires:
 *   - Local Next.js dev server on port 3001 (used by integration + E2E)
 *     If not running, the script will start one automatically.
 *
 * Reports:
 *   - docs/qa-report.md — human-readable summary
 *   - Exit code 0 if all green, 1 if any failure
 */

import { execSync, spawn, type ChildProcess } from "child_process";
import { writeFileSync } from "fs";
import path from "path";

type LayerResult = {
  name: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  rawOutput: string;
  exitCode: number;
};

const RESULTS_PATH = path.join(__dirname, "..", "docs", "qa-report.md");

// ============================================================
// Helpers
// ============================================================

function runCommand(cmd: string, args: string[]): { stdout: string; exitCode: number; duration: number } {
  const start = Date.now();
  let stdout = "";
  let exitCode = 0;
  try {
    stdout = execSync(`${cmd} ${args.join(" ")}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024,
    });
  } catch (e: unknown) {
    const err = e as { stdout?: Buffer | string; stderr?: Buffer | string; status?: number };
    stdout =
      ((typeof err.stdout === "string" ? err.stdout : err.stdout?.toString("utf8")) ?? "") +
      ((typeof err.stderr === "string" ? err.stderr : err.stderr?.toString("utf8")) ?? "");
    exitCode = err.status ?? 1;
  }
  return { stdout, exitCode, duration: Date.now() - start };
}

function parseVitestOutput(output: string): { passed: number; failed: number; skipped: number } {
  const passedMatch = output.match(/Tests\s+(?:(\d+)\s+failed\s+\|\s+)?(\d+)\s+passed/);
  const failedMatch = output.match(/Tests\s+(\d+)\s+failed/);
  const skippedMatch = output.match(/(\d+)\s+skipped/);
  return {
    passed: parseInt(passedMatch?.[2] ?? "0", 10),
    failed: parseInt(failedMatch?.[1] ?? "0", 10),
    skipped: parseInt(skippedMatch?.[1] ?? "0", 10),
  };
}

function parsePlaywrightOutput(output: string): { passed: number; failed: number; skipped: number } {
  const passedMatch = output.match(/(\d+)\s+passed/);
  const failedMatch = output.match(/(\d+)\s+failed/);
  const skippedMatch = output.match(/(\d+)\s+skipped/);
  return {
    passed: parseInt(passedMatch?.[1] ?? "0", 10),
    failed: parseInt(failedMatch?.[1] ?? "0", 10),
    skipped: parseInt(skippedMatch?.[1] ?? "0", 10),
  };
}

// ============================================================
// Ensure dev server running on 3001
// ============================================================

async function isServerUp(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:3001", { signal: AbortSignal.timeout(3000) });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function waitForServer(maxSeconds = 90): Promise<boolean> {
  for (let i = 0; i < maxSeconds; i++) {
    if (await isServerUp()) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

let spawnedServer: ChildProcess | null = null;

async function ensureServer(): Promise<void> {
  if (await isServerUp()) {
    console.log("✓ Dev server already running on :3001");
    return;
  }
  console.log("Starting dev server on :3001 …");
  spawnedServer = spawn("npx", ["next", "dev", "-p", "3001"], {
    detached: true,
    stdio: "ignore",
  });
  spawnedServer.unref();
  const ok = await waitForServer(120);
  if (!ok) throw new Error("Dev server failed to start within 120s");
  console.log("✓ Dev server ready");
}

// ============================================================
// Layer runners
// ============================================================

function runUnit(): LayerResult {
  console.log("\n→ Layer 1: Unit tests");
  const start = Date.now();
  const { stdout, exitCode } = runCommand("npx", ["vitest", "run", "tests/unit", "lib"]);
  const counts = parseVitestOutput(stdout);
  return {
    name: "Layer 1 — Unit tests",
    ...counts,
    duration: Date.now() - start,
    rawOutput: stdout,
    exitCode,
  };
}

function runIntegration(): LayerResult {
  console.log("→ Layer 2: Integration tests");
  const start = Date.now();
  const { stdout, exitCode } = runCommand("npx", ["vitest", "run", "tests/integration"]);
  const counts = parseVitestOutput(stdout);
  return {
    name: "Layer 2 — Integration tests",
    ...counts,
    duration: Date.now() - start,
    rawOutput: stdout,
    exitCode,
  };
}

function runE2E(): LayerResult {
  console.log("→ Layer 3: E2E browser tests");
  const start = Date.now();
  const { stdout, exitCode } = runCommand("npx", ["playwright", "test", "--reporter=list"]);
  const counts = parsePlaywrightOutput(stdout);
  return {
    name: "Layer 3 — E2E browser tests",
    ...counts,
    duration: Date.now() - start,
    rawOutput: stdout,
    exitCode,
  };
}

// ============================================================
// Markdown report
// ============================================================

function writeReport(results: LayerResult[]): void {
  const totalPassed = results.reduce((s, r) => s + r.passed, 0);
  const totalFailed = results.reduce((s, r) => s + r.failed, 0);
  const totalSkipped = results.reduce((s, r) => s + r.skipped, 0);
  const totalDuration = results.reduce((s, r) => s + r.duration, 0);
  const overallStatus = totalFailed === 0 ? "✅ ALL GREEN" : "❌ HAS FAILURES";

  const now = new Date();
  const report = `# CEE Studio — QA Report

**Generated**: ${now.toISOString()}
**Status**: ${overallStatus}

## Summary

| Layer | Passed | Failed | Skipped | Duration |
|---|---:|---:|---:|---:|
${results
  .map(
    (r) =>
      `| ${r.name} | ${r.passed} | ${r.failed} | ${r.skipped} | ${(r.duration / 1000).toFixed(1)}s |`
  )
  .join("\n")}
| **Total** | **${totalPassed}** | **${totalFailed}** | **${totalSkipped}** | **${(totalDuration / 1000).toFixed(1)}s** |

---

## Coverage map

This QA suite maps to the manual tests in \`docs/TESTING_GUIDE.md\`:

| TESTING_GUIDE Test | Auto-covered by | Status |
|---|---|---|
| 1 — Guest booking 1h | booking-flow.test.ts + booking-flow.spec.ts | ✅ |
| 2 — Cancellation rules (3 sub) | cancellation-extended.test.ts | ✅ |
| 3 — Late-night surcharge (4 sub) | pricing-extended.test.ts | ✅ |
| 4 — Slot conflict prevention | availability-extended.test.ts + availability.test.ts | ✅ |
| 5 — Admin login UI | login.spec.ts | ✅ |
| 6 — Manual booking | admin-api.test.ts (access control) | ⚠️ partial (needs admin session) |
| 7 — Edit/no-show | admin-api.test.ts | ⚠️ partial |
| 8 — Settings save | admin-api.test.ts | ⚠️ partial |
| 9 — Block date | admin-api.test.ts | ⚠️ partial |
| 10 — iCal feed | (not in QA — easy manual) | ❌ manual |
| 11 — Customer login + tabs | login.spec.ts + public-pages.spec.ts | ⚠️ partial |
| 12a-f — Membership flows | (requires real Stripe subscription) | ❌ manual |
| 13 — Cron jobs | crons.test.ts | ✅ |
| 14 — Email deliverability | email-rendering.test.ts | ⚠️ render-only |
| 15 — Refund | admin-api.test.ts | ⚠️ partial |
| 16 — Auth-aware Navbar | navbar-auth-aware.spec.ts | ✅ |
| 17 — Success page hint | (in booking E2E) | ⚠️ partial |
| 18 — Profile edit | me-api.test.ts | ✅ |

Also covered (beyond TESTING_GUIDE):
- All public pages return 200 (public-pages.test.ts)
- PDF generation in 4 languages (pdf-generation.test.ts)
- Dynamic icons (/icon, /apple-icon, /opengraph-image, /twitter-image)
- All 9 email templates render (email-rendering.test.ts)
- Manifest, sitemap, robots.txt

---

## Layer details

${results
  .map(
    (r) => `### ${r.name}

- Exit code: ${r.exitCode}
- Tests: ${r.passed} passed, ${r.failed} failed, ${r.skipped} skipped
- Duration: ${(r.duration / 1000).toFixed(1)}s

${r.failed > 0 ? "**⚠️ Failures detected — see raw output below.**" : ""}
`
  )
  .join("\n")}

---

## Manual steps still required before deploy

Things this QA suite **cannot** auto-verify — please tick off manually:

- [ ] Real card payment goes through (Stripe TEST mode card 4242 4242 4242 4242)
- [ ] Confirmation email arrives in real Gmail inbox (not spam)
- [ ] PDFs attached to confirmation email open correctly
- [ ] Customer can sign in via real magic link click
- [ ] Admin (\`babismetaxas000@gmail.com\`) lands on /admin after magic link
- [ ] Custom domain (ceestudio.ch) DNS resolves and serves
- [ ] Stripe Webhook endpoint configured in Stripe Dashboard for production URL
- [ ] Mobile look-and-feel on real iPhone (iOS Safari)
- [ ] Mobile look-and-feel on real Android (Chrome)
- [ ] Membership subscription completes (CHF 220 charge — cancel right after)

---

_Run \`npm run qa:all\` to regenerate this report._
`;

  writeFileSync(RESULTS_PATH, report, "utf8");
  console.log(`\n📄 Report written to ${RESULTS_PATH}`);
}

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  console.log("CEE Studio — QA Runner");
  console.log("=======================");

  await ensureServer();

  const results: LayerResult[] = [];
  results.push(runUnit());
  results.push(runIntegration());
  results.push(runE2E());

  writeReport(results);

  // Print summary
  console.log("\n=======================");
  const totalFailed = results.reduce((s, r) => s + r.failed, 0);
  const totalPassed = results.reduce((s, r) => s + r.passed, 0);
  for (const r of results) {
    const icon = r.failed === 0 ? "✓" : "✗";
    console.log(`${icon} ${r.name}: ${r.passed} passed, ${r.failed} failed, ${r.skipped} skipped`);
  }
  console.log(`\nTotal: ${totalPassed} passed / ${totalFailed} failed`);

  // Cleanup server if we spawned one
  if (spawnedServer && !spawnedServer.killed) {
    try {
      process.kill(-(spawnedServer.pid as number), "SIGTERM");
    } catch {
      // ignore
    }
  }

  process.exit(totalFailed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("QA runner crashed:", e);
  process.exit(1);
});
