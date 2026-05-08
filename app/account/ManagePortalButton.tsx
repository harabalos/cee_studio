"use client";

import { useState } from "react";

export default function ManagePortalButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/membership/portal", { method: "POST" });
      const d = await r.json();
      if (!r.ok || !d.url) {
        setError(d.error ?? "Could not open portal");
        return;
      }
      window.location.href = d.url;
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={open}
        disabled={busy}
        className="text-xs uppercase tracking-widest border border-brand/40 hover:border-brand text-foreground hover:text-brand px-5 py-2.5 transition disabled:opacity-50"
      >
        {busy ? "…" : "Manage subscription"}
      </button>
      {error && <p className="text-xs text-brand">{error}</p>}
    </>
  );
}
