/**
 * Marketing-mode route guard.
 *
 * Runs on EVERY request. In "marketing" launch mode:
 *   - Page requests to backend routes (/booking, /login, /admin, ...) →
 *     redirect to /coming-soon
 *   - API requests under the same prefixes → return 404 (no leaked errors)
 *
 * In "full" launch mode, this middleware is a no-op — code path effectively
 * short-circuits to NextResponse.next().
 *
 * Bypasses Next internals (_next, favicon, static images) via the matcher.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Avoid importing from lib/launch-mode.ts here — middleware runs on the edge
// runtime which doesn't share the full Node module graph. Read the env var
// directly with the same fallback semantics.
const LAUNCH_MODE =
  process.env.NEXT_PUBLIC_LAUNCH_MODE === "marketing"
    ? "marketing"
    : process.env.NEXT_PUBLIC_LAUNCH_MODE === "full"
    ? "full"
    : "full"; // default — flip on the marketing-only branch via env

const BLOCKED_PAGES = [
  "/booking",
  "/login",
  "/logout",
  "/auth",
  "/account",
  "/admin",
  "/membership",
];

const BLOCKED_API = [
  "/api/booking",
  "/api/me",
  "/api/admin",
  "/api/membership",
  "/api/webhooks",
  "/api/cron",
  "/api/availability",
  "/api/calendar",
  "/api/auth",
];

function matchesPrefix(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  if (LAUNCH_MODE !== "marketing") return NextResponse.next();

  const path = request.nextUrl.pathname;

  // Block API routes — return 404 (matches how a deleted route would behave)
  if (matchesPrefix(path, BLOCKED_API)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Block protected pages — redirect to /coming-soon
  if (matchesPrefix(path, BLOCKED_PAGES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Match everything except Next internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
