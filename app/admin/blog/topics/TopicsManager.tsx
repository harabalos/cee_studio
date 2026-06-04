"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface Topic {
  id: string;
  keyword: string;
  brief: string | null;
  image_url: string | null;
  status: string;
  sort: number;
}

/**
 * The topic queue — what the AI will write about next. Edit/add/remove here so
 * you can plan the content calendar. The generator picks the next "queued"
 * topic (lowest sort) each run.
 */
export default function TopicsManager({ initial }: { initial: Topic[] }) {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(initial);
  const [busy, setBusy] = useState(false);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/blog/topics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      return await res.json();
    } finally {
      setBusy(false);
    }
  }

  const update = (id: string, patch: Partial<Topic>) =>
    setTopics((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  async function save(t: Topic) {
    await post({ action: "update", id: t.id, keyword: t.keyword, brief: t.brief, image_url: t.image_url, status: t.status, sort: t.sort });
    router.refresh();
  }
  async function remove(id: string) {
    if (!confirm("Delete this topic?")) return;
    await post({ action: "delete", id });
    setTopics((t) => t.filter((x) => x.id !== id));
  }
  async function add() {
    const maxSort = topics.reduce((m, t) => Math.max(m, t.sort), 0);
    const data = await post({ action: "create", keyword: "new topic keyword", brief: "", sort: maxSort + 1 });
    if (data.id) router.refresh();
  }

  const queued = topics.filter((t) => t.status === "queued");
  const used = topics.filter((t) => t.status !== "queued");
  const inputCls = "w-full p-2 border border-accent/30 bg-background text-sm focus:outline-none focus:border-brand";

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link href="/admin/blog" className="text-xs uppercase tracking-widest text-foreground/50 hover:text-brand">← Blog</Link>
          <h1 className="font-seasons text-3xl text-brand mt-1">Topic queue</h1>
        </div>
        <button onClick={add} disabled={busy} className="px-4 py-2 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover disabled:opacity-40">
          + Add topic
        </button>
      </div>

      <p className="text-sm text-foreground/60 max-w-2xl">
        These are the topics the AI writes about — one every ~10 days, in order. Edit the
        keyword/brief to shape each post, set an optional image URL (downloaded automatically),
        and reorder with the number. <strong>Queued</strong> = not yet written.
      </p>

      <Section title={`Queued (${queued.length})`} topics={queued} update={update} save={save} remove={remove} inputCls={inputCls} busy={busy} />
      {used.length > 0 && (
        <Section title={`Used (${used.length})`} topics={used} update={update} save={save} remove={remove} inputCls={inputCls} busy={busy} muted />
      )}
    </div>
  );
}

function Section({
  title, topics, update, save, remove, inputCls, busy, muted = false,
}: {
  title: string;
  topics: Topic[];
  update: (id: string, p: Partial<Topic>) => void;
  save: (t: Topic) => void;
  remove: (id: string) => void;
  inputCls: string;
  busy: boolean;
  muted?: boolean;
}) {
  return (
    <section className={muted ? "opacity-70" : ""}>
      <h2 className="font-seasons text-xl mb-4">{title}</h2>
      <div className="space-y-4">
        {topics.map((t) => (
          <div key={t.id} className="border border-accent/40 bg-background p-4 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="number"
                value={t.sort}
                onChange={(e) => update(t.id, { sort: Number(e.target.value) })}
                className="w-14 p-2 border border-accent/30 bg-background text-sm text-center"
                title="Order"
              />
              <input
                value={t.keyword}
                onChange={(e) => update(t.id, { keyword: e.target.value })}
                className={inputCls}
                placeholder="Keyword / topic"
              />
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 mt-2 whitespace-nowrap">{t.status}</span>
            </div>
            <textarea
              value={t.brief ?? ""}
              onChange={(e) => update(t.id, { brief: e.target.value })}
              className={`${inputCls} min-h-[56px]`}
              placeholder="Brief — what the post should cover"
            />
            <input
              value={t.image_url ?? ""}
              onChange={(e) => update(t.id, { image_url: e.target.value })}
              className={inputCls}
              placeholder="Optional hero image URL (e.g. https://images.unsplash.com/...)"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => remove(t.id)} disabled={busy} className="text-[10px] uppercase tracking-widest text-foreground/40 hover:text-brand">Delete</button>
              <button onClick={() => save(t)} disabled={busy} className="px-4 py-1.5 text-[10px] uppercase tracking-widest border border-accent/40 hover:border-brand disabled:opacity-40">Save</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
