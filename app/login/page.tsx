"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import Tag from "@/components/ui/Tag";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const params = useSearchParams();
  const errorParam = params.get("error");
  const next = params.get("next") ?? "";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorParam) setError(errorParam);
  }, [errorParam]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = getSupabaseBrowser();
    const callbackParams = next ? `?next=${encodeURIComponent(next)}` : "";
    const { error: err } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback${callbackParams}`,
      },
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <div className="pt-32 pb-32 min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Tag>Login</Tag>
          <h1 className="font-seasons text-4xl md:text-5xl text-brand mt-4">Sign in</h1>
          <p className="text-sm text-foreground/60 mt-3">
            Enter your email — we&apos;ll send you a magic link. No password needed.
          </p>
        </div>

        {sent ? (
          <div className="border border-accent/40 bg-background p-6 text-center">
            <p className="font-seasons text-xl text-brand mb-2">Check your email</p>
            <p className="text-sm text-foreground/70">
              We sent a magic link to <strong>{email}</strong>.
              <br />
              Click it to sign in.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-4 text-xs uppercase tracking-widest text-foreground/50 hover:text-brand"
            >
              ← Use different email
            </button>
          </div>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              className="w-full p-3 border border-accent/40 bg-background text-sm focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand text-background text-xs uppercase tracking-widest hover:bg-brand-hover disabled:opacity-50 transition"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
            {error && (
              <p className="text-sm text-brand border border-brand/30 bg-brand/5 p-3">{error}</p>
            )}
          </form>
        )}

        <p className="mt-8 text-xs text-foreground/50 text-center leading-relaxed">
          New customer? Just enter your email — we&apos;ll create your account
          automatically.<br />
          Existing customer? Sign in to see all your bookings.
        </p>
      </div>
    </div>
  );
}
