"use client";

import { useState } from "react";
import { formatChf } from "@/lib/booking/pricing";

export default function RefundButton({ id, totalChf }: { id: string; totalChf: number }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refund() {
    if (!confirm(`Refund ${formatChf(totalChf)}?\nThis cancels the booking and triggers a Stripe refund.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/refund`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed");
      } else {
        setDone(true);
        setTimeout(() => window.location.reload(), 800);
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (done) return <span className="text-xs text-emerald-700">refunded</span>;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={refund}
        disabled={busy}
        className="text-xs uppercase tracking-widest text-brand hover:underline disabled:opacity-50"
      >
        {busy ? "…" : "Refund"}
      </button>
      {error && <span className="text-[10px] text-brand">{error}</span>}
    </div>
  );
}
