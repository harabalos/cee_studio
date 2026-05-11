/**
 * Launch mode flag.
 *
 * Single source of truth for whether backend features (booking, auth,
 * payments, admin, member account) are exposed to visitors.
 *
 *   "full"      — everything works (default for development & post-launch)
 *   "marketing" — backend routes redirect to /coming-soon, CTAs read as
 *                 "Coming Soon" and link to the same page. Used for the
 *                 first public launch of the site before payments + tests
 *                 are ready.
 *
 * To switch a branch into marketing mode, change the literal below.
 * To override at runtime, set NEXT_PUBLIC_LAUNCH_MODE=marketing in env.
 */

export type LaunchMode = "full" | "marketing";

// Branch default — flipped to "marketing" on the marketing-only branch
// so deployments from this branch hide backend features without needing
// any env-var configuration on the host (Vercel etc.).
const DEFAULT_MODE: LaunchMode = "marketing";

export const LAUNCH_MODE: LaunchMode =
  (process.env.NEXT_PUBLIC_LAUNCH_MODE === "marketing"
    ? "marketing"
    : process.env.NEXT_PUBLIC_LAUNCH_MODE === "full"
    ? "full"
    : DEFAULT_MODE);

export const IS_MARKETING_MODE = LAUNCH_MODE === "marketing";

/**
 * Routes that should be unreachable in marketing mode.
 * Anything matching these prefixes gets redirected to /coming-soon
 * (pages) or 404 (API routes).
 */
export const MARKETING_BLOCKED_PAGES = [
  "/booking",
  "/login",
  "/logout",
  "/auth",
  "/account",
  "/admin",
  "/membership",
] as const;

export const MARKETING_BLOCKED_API = [
  "/api/booking",
  "/api/me",
  "/api/admin",
  "/api/membership",
  "/api/webhooks",
  "/api/cron",
  "/api/availability",
  "/api/calendar",
  "/api/auth",
] as const;
