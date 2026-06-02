"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Manually trigger the AI generator (same endpoint the cron uses). */
export default function GenerateButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/cron/generate-blog");
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/admin/blog/${data.id}`);
      } else {
        setMsg(data.error || data.reason || "failed");
      }
    } catch {
      setMsg("network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {msg && <span className="text-[10px] text-brand">{msg}</span>}
      <button
        onClick={run}
        disabled={busy}
        className="px-4 py-2 text-xs uppercase tracking-widest border border-accent/40 hover:border-brand transition-colors disabled:opacity-40"
        title="Trigger the AI generator now (same as the cron)"
      >
        {busy ? "Generiere…" : "🤖 Generate now"}
      </button>
    </div>
  );
}
