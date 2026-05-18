"use client";

import { useEffect, useState } from "react";

type Settings = {
  door_code: string | null;
  wifi_password: string | null;
  b2b_emails: string[];
  operating_hours: { start: string; end: string };
  buffer_minutes: number;
  late_night_starts_at: string;
  late_night_surcharge_chf_per_hour: number;
  prices: Record<string, number>;
  addon_prices: Record<string, number>;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load");
        setLoading(false);
      });
  }, []);

  async function save(patch: Partial<Settings>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed");
      } else {
        setSettings(data.settings);
        setSavedAt(new Date().toLocaleTimeString());
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-foreground/50">Loading…</p>;
  if (!settings) return <p className="text-sm text-brand">Failed to load settings.</p>;

  return (
    <div className="space-y-10 max-w-3xl">
      <div className="flex items-baseline justify-between">
        <h1 className="font-seasons text-3xl text-brand">Settings</h1>
        {savedAt && <span className="text-xs text-emerald-700">Saved at {savedAt}</span>}
      </div>

      {/* Studio access (door code + WiFi) — embedded in confirmation emails */}
      <Section title="Studio access" subtitle="Embedded in every confirmation email. Update if you rotate the code.">
        <Row label="Door code">
          <input
            defaultValue={settings.door_code ?? ""}
            onBlur={(e) => save({ door_code: e.target.value })}
            placeholder="e.g. 4892"
            className="w-full p-2 border border-accent/40 bg-background text-sm font-mono"
          />
        </Row>
        <Row label="WiFi password">
          <input
            defaultValue={settings.wifi_password ?? ""}
            onBlur={(e) => save({ wifi_password: e.target.value })}
            placeholder="e.g. CEE-Studio-2026"
            className="w-full p-2 border border-accent/40 bg-background text-sm font-mono"
          />
        </Row>
      </Section>

      {/* Operating hours */}
      <Section title="Operating hours" subtitle="Bookings only allowed within this window (Europe/Zurich).">
        <div className="grid grid-cols-2 gap-3">
          <Row label="Open at">
            <input
              type="time"
              defaultValue={settings.operating_hours.start}
              onBlur={(e) =>
                save({
                  operating_hours: { ...settings.operating_hours, start: e.target.value },
                })
              }
              className="w-full p-2 border border-accent/40 bg-background text-sm"
            />
          </Row>
          <Row label="Close at">
            <input
              type="time"
              defaultValue={settings.operating_hours.end}
              onBlur={(e) =>
                save({
                  operating_hours: { ...settings.operating_hours, end: e.target.value },
                })
              }
              className="w-full p-2 border border-accent/40 bg-background text-sm"
            />
          </Row>
        </div>
        <Row label="Buffer between bookings (minutes)">
          <input
            type="number"
            defaultValue={settings.buffer_minutes}
            onBlur={(e) => save({ buffer_minutes: parseInt(e.target.value, 10) })}
            min={0}
            max={120}
            className="w-32 p-2 border border-accent/40 bg-background text-sm"
          />
        </Row>
      </Section>

      {/* Late-night */}
      <Section title="Late-night surcharge" subtitle="Extra fee per hour past the cutoff time.">
        <div className="grid grid-cols-2 gap-3">
          <Row label="Cutoff time">
            <input
              type="time"
              defaultValue={settings.late_night_starts_at}
              onBlur={(e) => save({ late_night_starts_at: e.target.value })}
              className="w-full p-2 border border-accent/40 bg-background text-sm"
            />
          </Row>
          <Row label="Surcharge per hour (CHF cents)">
            <input
              type="number"
              defaultValue={settings.late_night_surcharge_chf_per_hour}
              onBlur={(e) =>
                save({ late_night_surcharge_chf_per_hour: parseInt(e.target.value, 10) })
              }
              min={0}
              className="w-full p-2 border border-accent/40 bg-background text-sm"
            />
          </Row>
        </div>
        <p className="text-xs text-foreground/50 mt-1">
          Current: {(settings.late_night_surcharge_chf_per_hour / 100).toFixed(2)} CHF / hour past{" "}
          {settings.late_night_starts_at}
        </p>
      </Section>

      {/* Pricing tiers */}
      <Section title="Pricing tiers" subtitle="In CHF cents. 7000 = CHF 70. Updates apply to new bookings only.">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 8].map((d) => (
            <Row key={d} label={`${d}h`}>
              <input
                type="number"
                defaultValue={settings.prices[String(d)] ?? 0}
                onBlur={(e) =>
                  save({
                    prices: { ...settings.prices, [String(d)]: parseInt(e.target.value, 10) },
                  })
                }
                min={0}
                className="w-full p-2 border border-accent/40 bg-background text-sm"
              />
            </Row>
          ))}
        </div>
      </Section>

      <Section title="Add-on prices" subtitle="In CHF cents.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["lighting", "backdrops"] as const).map((a) => (
            <Row key={a} label={a}>
              <input
                type="number"
                defaultValue={settings.addon_prices[a] ?? 0}
                onBlur={(e) =>
                  save({
                    addon_prices: {
                      ...settings.addon_prices,
                      [a]: parseInt(e.target.value, 10),
                    },
                  })
                }
                min={0}
                className="w-full p-2 border border-accent/40 bg-background text-sm"
              />
            </Row>
          ))}
        </div>
      </Section>

      {/* B2B whitelist */}
      <Section title="B2B invoice email whitelist" subtitle="Comma-separated. These customers can pay by invoice instead of card.">
        <Row label="Approved emails">
          <textarea
            defaultValue={(settings.b2b_emails ?? []).join(", ")}
            onBlur={(e) =>
              save({
                b2b_emails: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            rows={3}
            placeholder="client1@company.ch, client2@brand.com"
            className="w-full p-2 border border-accent/40 bg-background text-sm"
          />
        </Row>
      </Section>

      {error && <p className="text-sm text-brand border border-brand/30 bg-brand/5 p-3">{error}</p>}
      {saving && <p className="text-xs text-foreground/50">Saving…</p>}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="border border-accent/40 bg-background p-6">
      <h2 className="font-seasons text-xl">{title}</h2>
      {subtitle && <p className="text-xs text-foreground/50 mt-1">{subtitle}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">{label}</label>
      {children}
    </div>
  );
}
