import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="bg-aurora flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <ReceiptText className="size-7" />
      </div>
      <p className="font-heading text-7xl font-bold tracking-tight text-primary">
        404
      </p>
      <h1 className="mt-4 font-heading text-2xl font-semibold">
        This page took an unpaid break.
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Let&apos;s get you back to billing.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Back to home
        </Link>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
          )}
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
