"use client";

/**
 * Global error boundary — the only error UI rendered if the ROOT layout
 * itself throws. It must render its own <html> and <body> since the root
 * layout is bypassed.
 */
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 1.5rem",
          textAlign: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          background:
            "radial-gradient(900px 520px at 50% -18%, rgba(79,70,229,0.36), transparent 70%), #0a0a0a",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "#4f46e5",
            color: "#fff",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          ⏱
        </div>
        <p style={{ fontSize: 72, fontWeight: 700, color: "#818cf8", margin: 0 }}>
          500
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginTop: 16 }}>
          The app hit an unexpected error.
        </h1>
        <p style={{ maxWidth: 380, color: "rgba(250,250,250,0.64)", marginTop: 8 }}>
          Your data is safe. Try reloading — if the problem persists, refresh in
          a moment.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 32,
            padding: "0.6rem 1.25rem",
            borderRadius: 10,
            border: "none",
            background: "#4f46e5",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
