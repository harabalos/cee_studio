"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = getSupabaseBrowser();
    // Send link to /auth/callback so the server-side route can exchange the
    // OTP / code for a real session cookie. After that, redirect to /admin.
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="pt-40 pb-32 min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <h1 className="font-seasons text-3xl text-brand mb-2">Admin login</h1>
        <p className="text-sm text-foreground/60 mb-8">A magic link will be sent to your email.</p>

        {sent ? (
          <p className="border border-accent/40 p-4 text-sm">Check your email for the login link.</p>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ceestudio.ch"
              className="w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand text-background text-xs uppercase tracking-widest hover:bg-brand-hover disabled:opacity-50"
            >
              {loading ? "…" : "Send magic link"}
            </button>
            {error && <p className="text-sm text-brand">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
