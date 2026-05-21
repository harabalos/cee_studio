"use client";

/**
 * Root-level error boundary — only triggered when the root layout itself
 * throws (rare but catastrophic; without this the user sees a blank page).
 *
 * Must include its own <html> and <body> since it REPLACES the root layout.
 */

import { useEffect } from "react";

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root-error-boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#fdfaf4",
          color: "#3d2e2c",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "5rem", margin: 0, color: "#661414" }}>500</h1>
          <h2 style={{ fontSize: "1.5rem", margin: "0.5rem 0 1.5rem" }}>
            Something went very wrong
          </h2>
          <p style={{ maxWidth: "20rem", margin: "0 auto 2rem", opacity: 0.7 }}>
            The page could not be loaded. Please retry or come back later.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", opacity: 0.4, marginBottom: "1.5rem", fontFamily: "monospace" }}>
              ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: "1rem 2.5rem",
              background: "#661414",
              color: "#fdfaf4",
              border: "none",
              fontSize: "0.875rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: "bold",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
