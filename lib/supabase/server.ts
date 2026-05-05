/**
 * Supabase server client.
 *
 * Two factories:
 * - `getSupabaseServer()` — uses anon key, respects RLS. Use in route handlers
 *   that should act as the calling user (member dashboard, booking lookup, etc.).
 * - `getSupabaseAdmin()`  — uses service role key, bypasses RLS. Use in webhooks,
 *   cron jobs, and admin-only routes. NEVER call from a client component.
 */

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !anonKey) {
  // We don't throw here so build doesn't crash before envs are wired up.
  // Runtime calls will fail loudly with the underlying SDK error.
  console.warn("[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY env vars");
}

/**
 * Authenticated server client (RLS enforced).
 * Reads/writes the auth cookie so member sessions persist.
 */
export function getSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Ignored: middleware writes cookies on Route Handlers, this can throw in RSC.
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // ignored
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS. Server-only.
 * Use only in webhooks, cron, admin endpoints — and verify caller authorization
 * BEFORE calling this.
 */
export function getSupabaseAdmin() {
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
