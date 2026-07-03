import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  Users,
  Check,
  Sparkles,
  Zap,
  Shield,
  Globe,
  ReceiptText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/get-session";
import { StructuredData } from "@/components/seo/structured-data";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata = {
  title: "Freeby — Invoicing & Time Tracking for Freelancers",
  description:
    "Track time, send professional invoices, and get paid in one unbroken flow. Free to start — no credit card required.",
  alternates: { canonical: "/" },
};

const flow = [
  {
    icon: Clock,
    step: "01",
    title: "Track time",
    description:
      "Hit start on the timer. Your hours log automatically against any client and project.",
  },
  {
    icon: FileText,
    step: "02",
    title: "Build invoices",
    description:
      "Turn tracked hours into polished invoices in seconds. Add line items, set tax, done.",
  },
  {
    icon: Check,
    step: "03",
    title: "Get paid",
    description:
      "Email a professional PDF invoice with one click. Mark it paid and watch the dashboard update.",
  },
];

const features = [
  {
    icon: Zap,
    title: "Fast, not bloated",
    description:
      "FreshBooks has 47 tabs. Freeby has the three you actually use. Every screen loads instantly.",
  },
  {
    icon: Clock,
    title: "Live time tracking",
    description:
      "A running timer that survives page refreshes. No more guessing how long a project took.",
  },
  {
    icon: FileText,
    title: "Professional invoices",
    description:
      "Beautiful PDF invoices with your branding. Send by email with a single click.",
  },
  {
    icon: Users,
    title: "Client management",
    description:
      "See every client's outstanding balance, total billed, and invoice history in one view.",
  },
  {
    icon: Globe,
    title: "Global payments",
    description:
      "Lemon Squeezy handles tax and VAT worldwide, so you can bill anyone, anywhere.",
  },
  {
    icon: Shield,
    title: "Yours, forever",
    description:
      "Your data lives in your own Postgres. No lock-in, no surprise price hikes, no ads.",
  },
];

const stats = [
  { value: "3 steps", label: "From timer to paid" },
  { value: "1 click", label: "To send an invoice" },
  { value: "$0", label: "To start, forever" },
];

const testimonials = [
  {
    name: "Sara M.",
    role: "Brand designer",
    quote:
      "I replaced FreshBooks and Toggl with Freeby. My invoicing went from a Sunday-night dread to a 2-minute task.",
  },
  {
    name: "Karim A.",
    role: "Full-stack dev",
    quote:
      "The timer survives a refresh. The invoices look clean. It does exactly what I need and nothing I don't.",
  },
  {
    name: "Lena F.",
    role: "Copywriter",
    quote:
      "I finally stopped forgetting to bill clients. The outstanding balance on the dashboard is my new favourite number.",
  },
];

export default async function Home() {
  const session = await getSession();

  return (
    <main className="bg-aurora relative flex min-h-svh flex-col overflow-hidden">
      <StructuredData />
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5 font-heading text-lg font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ReceiptText className="size-4" />
          </span>
          Freeby
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
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
                  "rounded-full",
                )}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants(), "rounded-full")}
              >
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-12 text-center">
        <span className="mb-7 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-primary" />
          Invoicing without the bloat
        </span>

        <h1 className="font-heading text-5xl font-semibold leading-[1.05] sm:text-6xl md:text-7xl">
          Track time.
          <br />
          Send invoices.
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Get paid.
          </span>
        </h1>

        <p className="mt-7 max-w-xl text-lg text-muted-foreground sm:text-xl">
          The freelancer billing tool with one unbroken flow — from a running
          timer to a paid invoice. No 47-tab nightmare. No bloat. Just getting
          paid.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href={session ? "/dashboard" : "/signup"}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 rounded-xl px-7 text-[0.95rem]",
            )}
          >
            {session ? "Go to dashboard" : "Start free — it's $0"}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-xl px-7 text-[0.95rem]",
            )}
          >
            See pricing
          </Link>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          Free forever · Pro from $19/mo · No credit card to start
        </p>
      </section>

      {/* App preview mockup */}
      <section className="mx-auto w-full max-w-4xl px-6 pb-24">
        <div className="relative">
          {/* Glow behind the card */}
          <div className="absolute -inset-x-8 -inset-y-4 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-2xl backdrop-blur">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <span className="size-3 rounded-full bg-rose-400/70" />
              <span className="size-3 rounded-full bg-amber-400/70" />
              <span className="size-3 rounded-full bg-emerald-400/70" />
              <span className="ml-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ReceiptText className="size-3" />
                freeby.app/dashboard
              </span>
            </div>
            {/* App body */}
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              {/* Stat cards */}
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Outstanding
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold text-amber-500">
                  $4,250
                </p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tracked (7d)
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold">
                  32h 15m
                </p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Clients
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold">12</p>
              </div>
            </div>
            {/* Timer row */}
            <div className="flex items-center gap-4 px-5 pb-5">
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3 ring-1 ring-primary/20">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Clock className="size-4" />
                </span>
                <div>
                  <p className="font-heading text-lg font-semibold tabular-nums text-primary">
                    01:23:45
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Website redesign
                  </p>
                </div>
              </div>
            </div>
            {/* Invoice rows */}
            <div className="space-y-1.5 px-5 pb-5">
              {[
                { num: "INV-0042", status: "paid", color: "bg-emerald-500" },
                { num: "INV-0041", status: "sent", color: "bg-amber-500" },
                { num: "INV-0040", status: "paid", color: "bg-emerald-500" },
              ].map((row) => (
                <div
                  key={row.num}
                  className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{row.num}</span>
                  <span className="flex items-center gap-2">
                    <span className={`${row.color} size-2 rounded-full`} />
                    <span className="capitalize text-muted-foreground">
                      {row.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flow section */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {flow.map((f, i) => (
            <div
              key={f.title}
              className="relative rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <span className="font-heading text-2xl font-bold text-muted-foreground/30">
                  {f.step}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {f.description}
              </p>
              {i < flow.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-muted-foreground/40 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-border/40 bg-card/30 backdrop-blur">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-3 gap-4 px-6 py-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-3xl font-bold sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built by a freelancer who got tired of paying $30/month for
            software with more tabs than features.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur transition-colors hover:bg-card/70"
            >
              <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="font-heading font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            Loved by freelancers
          </h2>
          <p className="mt-4 text-muted-foreground">
            Who switched from the bloated incumbents.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur"
            >
              <div className="mb-3 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Sparkles key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-4xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-10 text-center text-primary-foreground sm:p-16">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="relative">
            <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
              Stop chasing payments.
              <br />
              Start getting paid.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
              Join the freelancers who replaced their bloated billing software
              with something that just works.
            </p>
            <Link
              href={session ? "/dashboard" : "/signup"}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 h-12 rounded-xl bg-background px-8 text-[0.95rem] text-foreground hover:bg-background/90",
              )}
            >
              {session ? "Open dashboard" : "Get started — free"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
