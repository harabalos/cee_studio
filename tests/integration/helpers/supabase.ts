/**
 * Supabase admin client + cleanup helpers for QA tests.
 *
 * Uses the SERVICE_ROLE_KEY so we can seed/teardown across all tables.
 * Test data is prefix-tagged so cleanup is bullet-proof — we never touch
 * production rows.
 */

import { createClient } from "@supabase/supabase-js";

// Stub WebSocket for Node < 22 so Supabase Realtime client init doesn't
// crash. We don't actually use realtime in QA — just need the constructor
// to exist so the SDK's lazy init doesn't throw at import time.
if (typeof globalThis.WebSocket === "undefined") {
  class WebSocketStub {
    constructor() {
      // never actually connects
    }
    close() {}
    addEventListener() {}
    removeEventListener() {}
    send() {}
  }
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = WebSocketStub;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing Supabase env vars for QA tests");
}

export const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// All test data uses this prefix so cleanup is bullet-proof
export const QA_PREFIX = "qa-test-";
export const QA_EMAIL_DOMAIN = "qa.ceestudio.test"; // non-routable domain

export function qaEmail(suffix: string = ""): string {
  const stamp = Date.now().toString(36);
  return `${QA_PREFIX}${stamp}${suffix ? `-${suffix}` : ""}@${QA_EMAIL_DOMAIN}`;
}

/**
 * Wipe all rows created by previous test runs.
 * Safe to call before AND after each test suite.
 */
export async function cleanupQA() {
  // Order matters — children first, then parents
  await admin.from("booking_addons").delete().like("booking_id", `${QA_PREFIX}%`);
  await admin.from("bookings").delete().like("guest_email", `%@${QA_EMAIL_DOMAIN}`);
  await admin.from("pending_holds").delete().contains("payload", { guest: { email: `%@${QA_EMAIL_DOMAIN}` } } as never);
  // Pending holds — filter by payload (JSONB)
  const { data: holds } = await admin
    .from("pending_holds")
    .select("id, payload");
  for (const h of holds ?? []) {
    const email = (h.payload as { guest?: { email?: string } })?.guest?.email;
    if (email && email.endsWith(`@${QA_EMAIL_DOMAIN}`)) {
      await admin.from("pending_holds").delete().eq("id", h.id);
    }
  }
  await admin.from("memberships").delete().like("stripe_subscription_id", `${QA_PREFIX}%`);
  await admin.from("users").delete().like("email", `%@${QA_EMAIL_DOMAIN}`);
  // Auth-users (separate schema, not cascade-linked to public.users)
  await deleteAllQAAuthUsersInternal();
}

async function deleteAllQAAuthUsersInternal(): Promise<void> {
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) break;
    const users = data?.users ?? [];
    if (users.length === 0) break;
    const toDelete = users.filter((u) =>
      u.email?.toLowerCase().endsWith(`@${QA_EMAIL_DOMAIN}`)
    );
    for (const u of toDelete) {
      await admin.auth.admin.deleteUser(u.id);
    }
    if (users.length < perPage) break;
    page += 1;
  }
}

/**
 * Insert a test user + return the row.
 */
export async function seedUser(opts: {
  email?: string;
  role?: "visitor" | "member" | "admin";
  name?: string;
}) {
  const email = opts.email ?? qaEmail("user");
  const { data, error } = await admin
    .from("users")
    .insert({
      email,
      name: opts.name ?? "QA Test User",
      phone: "+41 79 000 0000",
      role: opts.role ?? "visitor",
      preferred_lang: "de",
    })
    .select()
    .single();
  if (error) throw new Error(`seedUser failed: ${error.message}`);
  return data;
}

/**
 * Insert a test membership for the given user.
 */
export async function seedMembership(opts: {
  userId: string;
  plan?: "starter" | "pro" | "unlimited";
  hoursBalance?: number;
  status?: "active" | "past_due" | "paused" | "cancelled";
}) {
  const stamp = Date.now().toString(36);
  const { data, error } = await admin
    .from("memberships")
    .insert({
      user_id: opts.userId,
      plan: opts.plan ?? "starter",
      status: opts.status ?? "active",
      stripe_subscription_id: `${QA_PREFIX}${stamp}-sub`,
      hours_per_month: opts.plan === "pro" ? 9 : opts.plan === "unlimited" ? 16 : 4,
      hours_balance: opts.hoursBalance ?? (opts.plan === "pro" ? 9 : opts.plan === "unlimited" ? 16 : 4),
      hours_rolled_over: 0,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();
  if (error) throw new Error(`seedMembership failed: ${error.message}`);
  return data;
}

/**
 * Mint a magic-link recovery URL for the given email — used to bypass
 * the email-click step in tests. The returned URL contains a token_hash
 * that the /auth/callback route will verify normally.
 *
 * IMPORTANT: We do NOT use Supabase's `action_link` directly, because that
 * goes through Supabase's redirect chain which only honors URLs configured
 * in the Auth → URL Configuration allowlist. Instead, we extract the
 * `hashed_token` and construct a direct call to our /auth/callback on the
 * test server (localhost:3001) — bypassing Supabase's redirect leg entirely.
 *
 * @param email - the email to mint a link for; auth user is created on demand
 * @param baseUrl - target host (defaults to localhost:3001 for Playwright tests)
 */
export async function mintSignInLink(
  email: string,
  baseUrl: string = "http://localhost:3001"
): Promise<string> {
  // Ensure the auth user exists + is confirmed BEFORE minting. This way the
  // returned verification_type is "magiclink" rather than "signup" — and our
  // /auth/callback's verifyOtp accepts it without complaint.
  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!found) {
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createErr) throw new Error(`mintSignInLink createUser failed: ${createErr.message}`);
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });
  if (error) throw new Error(`mintSignInLink failed: ${error.message}`);

  const hashedToken = data.properties?.hashed_token;
  const verificationType = data.properties?.verification_type ?? "magiclink";
  if (!hashedToken) {
    throw new Error("mintSignInLink: hashed_token missing from Supabase response");
  }
  // Construct direct URL to our /auth/callback — skips Supabase redirect.
  // Pass verification_type back as `type` so verifyOtp receives the right kind.
  return `${baseUrl}/auth/callback?token_hash=${hashedToken}&type=${verificationType}`;
}

/**
 * Delete the auth.users entry for a QA test email so the next run doesn't
 * accumulate orphaned auth users. Safe to call even if the user doesn't exist.
 */
export async function deleteAuthUser(email: string): Promise<void> {
  const { data } = await admin.auth.admin.listUsers();
  const found = data?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (found) {
    await admin.auth.admin.deleteUser(found.id);
  }
}

/**
 * Delete ALL auth.users matching the QA test email pattern.
 * Called from cleanupQA() so test auth-users don't pile up across runs.
 */
export async function deleteAllQAAuthUsers(): Promise<void> {
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) break;
    const users = data?.users ?? [];
    if (users.length === 0) break;
    const toDelete = users.filter((u) =>
      u.email?.toLowerCase().endsWith(`@${QA_EMAIL_DOMAIN}`)
    );
    for (const u of toDelete) {
      await admin.auth.admin.deleteUser(u.id);
    }
    if (users.length < perPage) break;
    page += 1;
  }
}
