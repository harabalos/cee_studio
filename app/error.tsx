"use client";

/**
 * Route-segment error boundary.
 *
 * Renders when an unhandled error escapes a server/client component below
 * the root layout. The default Next.js fallback shows a stack trace +
 * "Application error" message — terrible UX for paying customers. This
 * gives them a recoverable, branded fallback instead.
 *
 * `reset()` re-runs the segment's render; useful when the error is
 * transient (network blip, race condition).
 */

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to logs — Vercel + Sentry-equivalent setups pick this up
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="relative z-10 text-center flex flex-col items-center">
        <h1 className="font-seasons text-[120px] md:text-[200px] leading-none text-brand font-medium tracking-tighter">
          500
        </h1>
        <h2 className="mt-2 font-seasons text-2xl md:text-4xl text-foreground font-semibold">
          Something went wrong
        </h2>
        <div className="w-16 h-[1px] bg-brand mt-6 mb-6"></div>

        <p className="text-foreground/70 max-w-sm mx-auto font-light leading-relaxed text-sm md:text-base">
          We hit an unexpected error. You can retry — or head back to the homepage and try again from there.
        </p>

        {error.digest && (
          <p className="text-foreground/40 text-xs mt-4 font-mono">
            ref: {error.digest}
          </p>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={reset}
            className="px-10 py-4 bg-brand text-background text-xs md:text-sm tracking-[0.2em] uppercase font-bold hover:bg-[#4a0f0f] transition-colors shadow-[0_10px_30px_rgba(102,20,20,0.3)] hover:shadow-[0_15px_40px_rgba(102,20,20,0.4)] hover:-translate-y-[2px] rounded-sm duration-300"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-10 py-4 border border-accent text-foreground text-xs md:text-sm tracking-[0.2em] uppercase font-bold hover:bg-brand/5 transition-colors rounded-sm duration-300"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
