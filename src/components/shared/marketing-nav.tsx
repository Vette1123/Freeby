import Link from "next/link";
import { ArrowRight, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Sticky frosted-glass top nav shared by public marketing pages
 * (landing + pricing). Shows a Pricing link alongside auth actions.
 */
export function MarketingNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-heading text-lg font-semibold transition-opacity hover:opacity-80"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <ReceiptText className="size-4" />
          </span>
          Freeby
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/pricing"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-4"
          >
            Pricing
          </Link>
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "hidden rounded-full sm:inline-flex",
                )}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants(), "rounded-full shadow-sm shadow-primary/30")}
              >
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
