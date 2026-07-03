"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, ReceiptText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the server so we see production errors in Vercel logs.
    console.error(error);
  }, [error]);

  return (
    <main className="bg-aurora flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <ReceiptText className="size-7" />
      </div>
      <p className="font-heading text-7xl font-bold tracking-tight text-primary">
        500
      </p>
      <h1 className="mt-4 font-heading text-2xl font-semibold">
        Something broke — but your invoices are safe.
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. Try again, or head back home. If the
        problem persists, the details below help us track it down.
      </p>
      {error.digest && (
        <p className="mt-4 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
