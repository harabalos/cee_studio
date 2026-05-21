/**
 * Integration — Translation key parity lint.
 *
 * The app uses INLINE per-component translations (no central JSON):
 *     const t = {
 *       en: { ... },
 *       de: { ... },
 *       fr: { ... },
 *       it: { ... },
 *     };
 *
 * This test scans every `.tsx`/`.ts` file in app/ and components/ for that
 * shape, parses the four language sub-objects with a lightweight regex,
 * and verifies all four have the same TOP-LEVEL key set.
 *
 * Catches the most common i18n bug: someone adds a key to `de` but forgets
 * to update `fr` or `it`, leaving the UI broken for those visitors.
 *
 * NOT covered:
 *   - Nested keys (only top-level diff'd — covers 95% of real bugs)
 *   - Type-safe interpolation tokens ({name}, {count}, etc.)
 *   - Translation QUALITY — only structural completeness
 */

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");
const SCAN_DIRS = ["app", "components"];
const EXTS = new Set([".ts", ".tsx"]);

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, acc);
    else if (EXTS.has(path.extname(full))) acc.push(full);
  }
  return acc;
}

/**
 * Returns a list of i18n parity violations across all source files.
 * Each entry: { file, locale, missing: string[], extra: string[] }
 */
function findI18nViolations(): {
  file: string;
  baseline: "en" | "de" | "fr" | "it";
  locale: "en" | "de" | "fr" | "it";
  missing: string[];
  extra: string[];
}[] {
  const violations: ReturnType<typeof findI18nViolations> = [];
  const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)));

  for (const file of files) {
    const src = readFileSync(file, "utf8");

    // Look for `const t = {` or `const labels = {` etc. blocks containing
    // all four locale keys. Use a balanced-brace match starting at the const.
    // We scan for any object literal where all four lang keys appear as direct
    // immediate children.
    const matches = matchI18nBlocks(src);
    for (const block of matches) {
      const en = extractTopKeys(block, "en");
      const de = extractTopKeys(block, "de");
      const fr = extractTopKeys(block, "fr");
      const it = extractTopKeys(block, "it");

      // Use DE as the baseline (studio's primary language)
      const baseline = de;
      for (const [name, set] of [
        ["en", en],
        ["fr", fr],
        ["it", it],
      ] as const) {
        const missing = baseline.filter((k) => !set.includes(k));
        const extra = set.filter((k) => !baseline.includes(k));
        if (missing.length || extra.length) {
          violations.push({
            file: path.relative(ROOT, file),
            baseline: "de",
            locale: name,
            missing,
            extra,
          });
        }
      }
    }
  }
  return violations;
}

/** Find substrings that look like i18n objects with all four locales. */
function matchI18nBlocks(src: string): string[] {
  const blocks: string[] = [];
  // Heuristic: look for "en:" and "de:" and "fr:" and "it:" within ~5000 chars
  // of each other (inline object). Then balance braces from the opening { that
  // immediately precedes "en:".
  const enIdxs: number[] = [];
  let i = 0;
  while ((i = src.indexOf("en: {", i)) !== -1) {
    enIdxs.push(i);
    i += 5;
  }
  for (const enIdx of enIdxs) {
    // Find the next "de:", "fr:", "it:" within window
    const window = src.slice(enIdx, enIdx + 8000);
    if (
      !window.includes("de: {") ||
      !window.includes("fr: {") ||
      !window.includes("it: {")
    )
      continue;

    // Walk backwards to find the { that opens the whole object
    let open = enIdx - 1;
    while (open >= 0 && src[open] !== "{") open--;
    if (open < 0) continue;

    // Walk forward, tracking braces, to find matching close
    let depth = 1;
    let close = open + 1;
    while (close < src.length && depth > 0) {
      const c = src[close];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      close++;
    }
    blocks.push(src.slice(open, close));
  }
  return blocks;
}

/** Extract top-level keys directly inside `{locale}: { ... }`. */
function extractTopKeys(block: string, locale: "en" | "de" | "fr" | "it"): string[] {
  const idx = block.indexOf(`${locale}: {`);
  if (idx === -1) return [];
  let depth = 0;
  let start = -1;
  for (let i = idx + locale.length + 2; i < block.length; i++) {
    if (block[i] === "{") {
      depth++;
      if (start === -1) start = i + 1;
    } else if (block[i] === "}") {
      depth--;
      if (depth === 0) {
        return parseTopKeys(block.slice(start, i));
      }
    }
  }
  return [];
}

/** Given the inside of a `{ k1: ..., k2: ... }`, return the top-level keys. */
function parseTopKeys(inside: string): string[] {
  const keys: string[] = [];
  let depth = 0;
  let lookingForKey = true;
  let i = 0;
  while (i < inside.length) {
    const c = inside[i];
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    else if (depth === 0 && lookingForKey) {
      // Try to read an identifier or quoted key followed by colon
      const m = inside.slice(i).match(/^([A-Za-z_$][\w$]*|"[^"]+"|'[^']+')\s*:/);
      if (m) {
        const raw = m[1];
        const key = raw.replace(/^['"]/, "").replace(/['"]$/, "");
        keys.push(key);
        i += m[0].length;
        lookingForKey = false;
        continue;
      }
    } else if (depth === 0 && c === ",") {
      lookingForKey = true;
    }
    i++;
  }
  return keys;
}

describe("i18n key parity across all locale-aware components", () => {
  it("every translation block has the same top-level keys in en/de/fr/it", () => {
    const violations = findI18nViolations();
    // Pretty-print all violations so the test failure shows everything at once
    if (violations.length > 0) {
      const summary = violations
        .map(
          (v) =>
            `\n  ${v.file} :: ${v.locale} (vs ${v.baseline})` +
            (v.missing.length ? `\n    missing: ${v.missing.join(", ")}` : "") +
            (v.extra.length ? `\n    extra:   ${v.extra.join(", ")}` : "")
        )
        .join("");
      console.error("i18n parity violations found:" + summary);
    }
    expect(violations, "translation keys must match across en/de/fr/it").toEqual([]);
  });
});
