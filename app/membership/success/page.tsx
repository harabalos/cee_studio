"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Tag from "@/components/ui/Tag";

export default function MembershipSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [status, setStatus] = useState<"loading" | "ready" | "timeout">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("timeout");
      return;
    }
    let attempts = 0;
    let stop = false;
    async function poll() {
      attempts++;
      try {
        const r = await fetch(`/api/membership/by-session?session_id=${sessionId}`);
        if (r.ok) {
          const d = await r.json();
          if (d.membership) {
            setStatus("ready");
            return;
          }
        }
      } catch {}
      if (!stop && attempts < 12) setTimeout(poll, 2000);
      else if (!stop) setStatus("timeout");
    }
    poll();
    return () => {
      stop = true;
    };
  }, [sessionId]);

  return (
    <div className="pt-32 pb-32 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <Tag>✓</Tag>
        <h1 className="font-seasons text-4xl md:text-6xl text-brand mt-4">Welcome to CEE Studio</h1>
        <p className="mt-3 text-foreground/60 max-w-md mx-auto">
          Your membership is being set up. We&apos;ve sent a magic link to your email — click it to sign in and start booking.
        </p>

        <div className="mt-12 border border-accent/40 bg-background p-8">
          {status === "loading" && (
            <p className="text-sm text-foreground/50">Setting up your account…</p>
          )}
          {status === "ready" && (
            <>
              <p className="font-seasons text-xl text-brand mb-2">All set ✓</p>
              <p className="text-sm text-foreground/70 mb-6">
                Check your email for the sign-in link, or click below.
              </p>
              <Link
                href="/login?next=/account"
                className="inline-block py-3 px-8 bg-brand text-background text-xs uppercase tracking-widest hover:bg-brand-hover transition"
              >
                Go to my account
              </Link>
            </>
          )}
          {status === "timeout" && (
            <>
              <p className="font-seasons text-xl text-brand mb-2">Almost there</p>
              <p className="text-sm text-foreground/70">
                Your membership is being processed. Check your email in a minute or two —
                we&apos;ll send your sign-in link as soon as Stripe confirms the payment.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
