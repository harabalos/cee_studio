/**
 * Integration test — all 5 cron endpoints.
 *
 * Maps to TESTING_GUIDE.md Test 13.
 *
 * We just verify each endpoint accepts a valid CRON_SECRET and returns
 * a structured response without throwing. Real expiry/email logic is
 * unit-tested separately.
 */

import { describe, it, expect } from "vitest";
import { getJSON } from "./helpers/api";

const CRON_SECRET = process.env.CRON_SECRET;
if (!CRON_SECRET) throw new Error("CRON_SECRET missing for QA tests");

const auth = { Authorization: `Bearer ${CRON_SECRET}` };

async function authedGet(path: string) {
  const res = await fetch(`${process.env.QA_BASE_URL ?? "http://localhost:3001"}${path}`, {
    headers: auth,
  });
  return { status: res.status, body: (await res.json()) as { ok?: boolean } };
}

describe("Cron endpoints (TESTING_GUIDE Test 13)", () => {
  it("expire-holds returns ok JSON", async () => {
    const r = await authedGet("/api/cron/expire-holds");
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
  });

  it("reminders-24h returns ok JSON", async () => {
    const r = await authedGet("/api/cron/reminders-24h");
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
  });

  it("auto-complete returns ok JSON", async () => {
    const r = await authedGet("/api/cron/auto-complete");
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
  });

  it("expire-rolled-over returns ok JSON", async () => {
    const r = await authedGet("/api/cron/expire-rolled-over");
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
  });

  it("low-balance returns ok JSON", async () => {
    const r = await authedGet("/api/cron/low-balance");
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
  });

  it("rejects requests without auth header (401)", async () => {
    const res = await fetch(
      `${process.env.QA_BASE_URL ?? "http://localhost:3001"}/api/cron/expire-holds`
    );
    expect(res.status).toBe(401);
  });

  it("rejects requests with wrong secret (401)", async () => {
    const res = await fetch(
      `${process.env.QA_BASE_URL ?? "http://localhost:3001"}/api/cron/expire-holds`,
      { headers: { Authorization: "Bearer wrong-secret-12345" } }
    );
    expect(res.status).toBe(401);
  });
});
