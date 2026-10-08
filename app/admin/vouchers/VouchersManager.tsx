"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatChf } from "@/lib/booking/pricing";
import { formatZurich } from "@/lib/booking/availability";
import { describeVoucher, type Voucher, type VoucherType } from "@/lib/booking/vouchers";

export interface Redemption {
  id: string;
  voucher_code: string;
  discount_chf: number;
  guest_name: string | null;
  guest_email: string | null;
  start_time: string;
  status: string;
  created_at: string;
}

type FormState = {
  code: string;
  type: VoucherType;
  value: string; // percent, or CHF (decimals allowed) for fixed
  maxUses: string; // blank = unlimited
  expiresOn: string; // YYYY-MM-DD, blank = never
  note: string;
  active: boolean;
};

const inputCls = "w-full p-2 border border-accent/30 bg-background text-sm focus:outline-none focus:border-brand";
const btnPrimary =
  "px-4 py-2 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover disabled:opacity-40";
const btnGhost =
  "px-3 py-1.5 text-[10px] uppercase tracking-widest border border-accent/40 hover:border-brand disabled:opacity-40";

function toForm(v?: Voucher): FormState {
  if (!v) return { code: "", type: "percent", value: "", maxUses: "1", expiresOn: "", note: "", active: true };
  return {
    code: v.code,
    type: v.discount_type,
    value: v.discount_type === "percent" ? String(v.discount_value) : String(v.discount_value / 100),
    maxUses: v.max_uses === null ? "" : String(v.max_uses),
    expiresOn: v.expires_at ? formatZurich(v.expires_at, "yyyy-MM-dd") : "",
    note: v.note ?? "",
    active: v.active,
  };
}

/** Form → API fields. Returns a message instead when the input can't be sent. */
function toFields(f: FormState): { fields: Record<string, unknown> } | { error: string } {
  const value =
    f.type === "percent" ? parseInt(f.value, 10) : Math.round(parseFloat(f.value.replace(",", ".")) * 100);
  if (!Number.isFinite(value) || value <= 0) return { error: "Enter the discount amount." };
  const maxUses = f.maxUses.trim() === "" ? null : parseInt(f.maxUses, 10);
  if (maxUses !== null && (!Number.isFinite(maxUses) || maxUses <= 0)) {
    return { error: "Max uses must be 1 or more (or leave it blank for unlimited)." };
  }
  return {
    fields: {
      code: f.code,
      discount_type: f.type,
      discount_value: value,
      max_uses: maxUses,
      expires_on: f.expiresOn || null,
      active: f.active,
      note: f.note.trim() || null,
    },
  };
}

type State = { label: string; cls: string };
function stateOf(v: Voucher): State {
  if (!v.active) return { label: "Inactive", cls: "bg-foreground/10 text-foreground/60" };
  if (v.expires_at && new Date(v.expires_at) <= new Date()) return { label: "Expired", cls: "bg-red-100 text-red-800" };
  if (v.max_uses !== null && v.used_count >= v.max_uses) return { label: "Used up", cls: "bg-amber-100 text-amber-800" };
  return { label: "Live", cls: "bg-emerald-100 text-emerald-800" };
}

export default function VouchersManager({ initial, redemptions }: { initial: Voucher[]; redemptions: Redemption[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(body: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Something went wrong.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Network error — try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function remove(v: Voucher) {
    if (!confirm(`Delete ${v.code}? This can't be undone.`)) return;
    await post({ action: "delete", id: v.id });
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-seasons text-3xl text-brand">Vouchers</h1>
        {!creating && (
          <button
            onClick={() => {
              setCreating(true);
              setEditingId(null);
              setError(null);
            }}
            className={btnPrimary}
          >
            + New voucher
          </button>
        )}
      </div>

      {error && <p className="text-sm text-brand border border-brand/30 bg-brand/5 p-3">{error}</p>}

      {creating && (
        <section className="border border-accent/40 bg-background p-5">
          <h2 className="font-seasons text-xl mb-4">New voucher</h2>
          <VoucherForm
            initial={toForm()}
            busy={busy}
            submitLabel="Create"
            onCancel={() => setCreating(false)}
            onSubmit={async (fields) => {
              if (await post({ action: "create", ...fields })) setCreating(false);
            }}
          />
        </section>
      )}

      {initial.length === 0 && !creating && (
        <p className="text-sm text-foreground/50 italic border border-accent/30 p-4 bg-background">No vouchers yet.</p>
      )}

      <div className="space-y-4">
        {initial.map((v) => {
          const state = stateOf(v);
          const used = redemptions.filter((r) => r.voucher_code === v.code);
          const editing = editingId === v.id;

          return (
            <section key={v.id} className="border border-accent/40 bg-background p-5">
              {editing ? (
                <>
                  <h2 className="font-seasons text-xl mb-4">Edit {v.code}</h2>
                  <VoucherForm
                    initial={toForm(v)}
                    busy={busy}
                    submitLabel="Save"
                    codeLocked={v.used_count > 0}
                    onCancel={() => setEditingId(null)}
                    onSubmit={async (fields) => {
                      if (await post({ action: "update", id: v.id, ...fields })) setEditingId(null);
                    }}
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg tracking-wide">{v.code}</span>
                      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest ${state.cls}`}>{state.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => post({ action: "set_active", id: v.id, active: !v.active })}
                        disabled={busy}
                        className={v.active ? btnGhost : `${btnPrimary} !py-1.5 !text-[10px]`}
                      >
                        {v.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(v.id);
                          setCreating(false);
                          setError(null);
                        }}
                        disabled={busy}
                        className={btnGhost}
                      >
                        Edit
                      </button>
                      {v.used_count === 0 && (
                        <button
                          onClick={() => remove(v)}
                          disabled={busy}
                          className="text-[10px] uppercase tracking-widest text-foreground/40 hover:text-brand disabled:opacity-40"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-foreground/80">
                    <strong>{describeVoucher(v)}</strong>
                    <span className="text-foreground/40"> · </span>
                    used {v.used_count} / {v.max_uses ?? "∞"}
                    <span className="text-foreground/40"> · </span>
                    {v.expires_at ? `valid until ${formatZurich(v.expires_at, "d MMM yyyy")}` : "no expiry"}
                  </p>
                  {v.note && <p className="text-xs text-foreground/50">{v.note}</p>}

                  {used.length > 0 && (
                    <ul className="border-t border-accent/20 pt-3 space-y-1">
                      {used.map((r) => (
                        <li key={r.id} className="text-xs text-foreground/70">
                          <span className="uppercase tracking-widest text-foreground/40">Redeemed</span>{" "}
                          {r.guest_name ?? "—"}
                          {r.guest_email && <span className="text-foreground/50"> · {r.guest_email}</span>}
                          <span className="text-foreground/50">
                            {" "}
                            · booked {formatZurich(r.created_at, "d MMM yyyy")} · shoot {formatZurich(r.start_time, "d MMM yyyy")}
                            {r.status !== "confirmed" && ` (${r.status})`} · −{formatChf(r.discount_chf)}
                          </span>{" "}
                          <Link href={`/admin/bookings/${r.id}/edit`} className="text-brand hover:underline">
                            View →
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function VoucherForm({
  initial,
  busy,
  submitLabel,
  codeLocked = false,
  onSubmit,
  onCancel,
}: {
  initial: FormState;
  busy: boolean;
  submitLabel: string;
  codeLocked?: boolean;
  onSubmit: (fields: Record<string, unknown>) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [f, setF] = useState<FormState>(initial);
  const [localError, setLocalError] = useState<string | null>(null);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const out = toFields(f);
    if ("error" in out) {
      setLocalError(out.error);
      return;
    }
    setLocalError(null);
    onSubmit(out.fields);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Label text="Code">
          <input
            value={f.code}
            onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s+/g, ""))}
            placeholder="e.g. GIVEAWAY10"
            maxLength={32}
            required
            disabled={codeLocked}
            title={codeLocked ? "Already redeemed — the code can't be renamed" : undefined}
            className={`${inputCls} font-mono uppercase disabled:opacity-60`}
          />
        </Label>
        <Label text="Note (only you see this)">
          <input value={f.note} onChange={(e) => set("note", e.target.value)} maxLength={200} className={inputCls} placeholder="e.g. Instagram giveaway, Oct 2026" />
        </Label>
        <Label text="Discount type">
          <select value={f.type} onChange={(e) => set("type", e.target.value as VoucherType)} className={inputCls}>
            <option value="percent">Percent of the booking total (%)</option>
            <option value="fixed">Fixed amount (CHF)</option>
          </select>
        </Label>
        <Label text={f.type === "percent" ? "Percent off (1–99)" : "CHF off"}>
          <input
            type="number"
            inputMode="decimal"
            value={f.value}
            onChange={(e) => set("value", e.target.value)}
            min={f.type === "percent" ? 1 : 0.01}
            max={f.type === "percent" ? 99 : undefined}
            step={f.type === "percent" ? 1 : "any"}
            required
            className={inputCls}
          />
        </Label>
        <Label text="Max uses (blank = unlimited)">
          <input type="number" value={f.maxUses} onChange={(e) => set("maxUses", e.target.value)} min={1} step={1} placeholder="unlimited" className={inputCls} />
        </Label>
        <Label text="Valid until (blank = no expiry)">
          <input type="date" value={f.expiresOn} onChange={(e) => set("expiresOn", e.target.value)} className={inputCls} />
        </Label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-brand" />
        Active — guests can use this code right away
      </label>

      {localError && <p className="text-sm text-brand">{localError}</p>}

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} disabled={busy} className={btnGhost}>
          Cancel
        </button>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">{text}</span>
      {children}
    </label>
  );
}
