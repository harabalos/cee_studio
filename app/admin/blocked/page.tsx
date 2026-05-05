"use client";

import { useEffect, useState } from "react";

type Blocked = { id: string; start_time: string; end_time: string; reason: string | null };

export default function BlockedDatesPage() {
  const [list, setList] = useState<Blocked[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/blocked-dates");
    const d = await r.json();
    setList(d.blocked ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/admin/blocked-dates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ start_time: new Date(start).toISOString(), end_time: new Date(end).toISOString(), reason }),
    });
    if (r.ok) { setStart(""); setEnd(""); setReason(""); load(); }
    else { const d = await r.json(); setError(d.error ?? "Error"); }
  }

  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/blocked-dates/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-seasons text-3xl text-brand mb-8">Blocked dates</h1>

      <form onSubmit={add} className="border border-accent/40 bg-background p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)} className="p-2 border border-accent/40 bg-background text-sm" />
        <input type="datetime-local" required value={end} onChange={(e) => setEnd(e.target.value)} className="p-2 border border-accent/40 bg-background text-sm" />
        <input type="text" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="p-2 border border-accent/40 bg-background text-sm" />
        <button className="bg-brand text-background py-2 text-xs uppercase tracking-widest">Block</button>
        {error && <p className="text-sm text-brand md:col-span-4">{error}</p>}
      </form>

      <div className="border border-accent/40 bg-background">
        {list.length === 0 ? (
          <p className="p-4 text-sm text-foreground/50">No blocked dates.</p>
        ) : (
          list.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-4 border-b border-accent/20 last:border-0">
              <div>
                <div className="text-sm">{new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}</div>
                {b.reason && <div className="text-xs text-foreground/50 mt-1">{b.reason}</div>}
              </div>
              <button onClick={() => remove(b.id)} className="text-xs text-brand hover:underline">Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
