"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPostButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/blog", { method: "POST" });
      const data = await res.json();
      if (data.id) router.push(`/admin/blog/${data.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={create}
      disabled={busy}
      className="px-4 py-2 text-xs uppercase tracking-widest bg-brand text-background hover:bg-brand-hover transition-colors disabled:opacity-40"
    >
      {busy ? "…" : "+ New post"}
    </button>
  );
}
