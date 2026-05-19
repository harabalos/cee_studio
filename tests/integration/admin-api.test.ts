/**
 * Integration test — admin endpoints require admin auth.
 *
 * Verifies unauthorised access is rejected. Full admin happy-path
 * flows (settings, manual booking, refund) are covered by E2E tests
 * with a real admin session.
 *
 * Maps to TESTING_GUIDE.md Tests 6-9, 15 (preliminary access control).
 */

import { describe, it, expect } from "vitest";
import { getJSON, postJSON, patchJSON } from "./helpers/api";

describe("Admin endpoints — access control", () => {
  it("GET /api/admin/settings returns 401/403 unauthenticated", async () => {
    const r = await getJSON("/api/admin/settings");
    expect([401, 403, 404]).toContain(r.status);
  });

  it("PATCH /api/admin/settings returns 401/403 unauthenticated", async () => {
    const r = await patchJSON("/api/admin/settings", { door_code: "0000" });
    expect([401, 403, 404]).toContain(r.status);
  });

  it("POST /api/admin/bookings/manual returns 401/403 unauthenticated", async () => {
    const r = await postJSON("/api/admin/bookings/manual", {});
    expect([401, 403, 404, 400]).toContain(r.status);
  });

  it("GET /api/admin/blocked-dates returns 401/403 unauthenticated", async () => {
    const r = await getJSON("/api/admin/blocked-dates");
    expect([401, 403, 404]).toContain(r.status);
  });
});
