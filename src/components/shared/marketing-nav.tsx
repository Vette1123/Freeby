"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandWordmark } from "@/components/brand/brand-mark";

/**
 * Nav entries. Active state is derived deterministically from the current
 * hash (#features / #pricing / #faq) — no IntersectionObserver, so it can
 * never flicker or "randomly switch" during a smooth-scroll.
 */
const NAV_LINKS = [
  { label: "Features", href: "/#features", hash: "features" },
  { label: "Pricing", href: "/#pricing", hash: "pricing" },
  { label: "FAQ", href: "/#faq", hash: "faq" },
] as const;

/**
 * Sticky scroll-aware marketing nav.
 * - Transparent at the top, frosted + bordered once scrolled > 8px.
 * - Active link derived from the URL hash (deterministic, no spy flicker).
 * - Animated pill highlight that slides between active links.
 * - Mobile slide-down menu.
 */
export function MarketingNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState<string>("");
  const pathname = usePathname();
  const reduce = useReducedMotion();

  // Shadow on scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track the URL hash. Next.js Link updates the hash for /#section hrefs,
  // and the browser fires `hashchange`. This is the single source of truth
  // for which link is active — no observer, no guessing.
  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace(/^#/, ""));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // A link is active only when we're on the landing route AND its hash
  // matches the current URL hash exactly.
  const isActive = (linkHash: string) => pathname === "/" && hash === linkHash;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        scrolled || open
          ? "glass-strong border-b border-border/60 shadow-sm shadow-black/[0.03]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
        >
          <BrandWordmark glow={scrolled} />
        </Link>

        {/* Desktop center links with sliding pill */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.hash);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {/* Hover background for non-active links */}
                {!active && (
                  <span className="absolute inset-0 rounded-full bg-transparent transition-colors group-hover:bg-muted" />
                )}
                {/* Active pill — slides via layoutId */}
                {active && (
                  <span className="absolute inset-0 rounded-full bg-primary/10 ring-1 ring-inset ring-primary/20" />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-2 md:flex">
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
                className={cn(buttonVariants({ variant: "ghost" }), "rounded-full")}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants(),
                  "group rounded-full shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25",
                )}
              >
                Start free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile right actions */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-b border-border/60 bg-background/95 backdrop-blur-xl backdrop-saturate-150 md:hidden"
          >
            <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.hash);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/90 hover:bg-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-3">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants(), "rounded-xl")}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "rounded-xl",
                      )}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants(), "rounded-xl")}
                    >
                      Start free
                      <ArrowRight className="size-4" />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
