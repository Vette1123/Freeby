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
  Star,
  Infinity as InfinityIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/get-session";
import { StructuredData } from "@/components/seo/structured-data";
import { SiteFooter } from "@/components/shared/site-footer";
import { MarketingNav } from "@/components/shared/marketing-nav";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Hero } from "@/components/landing/hero";
import { DashboardMockup } from "@/components/landing/dashboard-mockup";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { TiltCard } from "@/components/landing/tilt-card";
import { PricingPreview } from "@/components/landing/pricing-preview";

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

const faqs = [
  {
    q: "Is Freeby really free?",
    a: "Yes. The Free plan covers 1 client and 3 invoices a month, forever, no credit card. Pro ($19/mo) unlocks unlimited clients, invoices, and time tracking.",
  },
  {
    q: "Can I import my clients and invoices?",
    a: "You can add clients manually in seconds. We're working on CSV import for invoices — if you need it now, reach out and we'll help you migrate.",
  },
  {
    q: "Does the timer work if I close the tab?",
    a: "The timer keeps running on the server. Reopen the tab and it's still ticking — no lost hours, no manual catch-up.",
  },
  {
    q: "How do payments work?",
    a: "You send a PDF invoice by email and mark it paid when the money lands. We don't touch your funds — there's no payment-processing fee.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime, from your billing settings. Cancel Pro and you drop back to the Free plan — your data stays intact.",
  },
];

export default async function Home() {
  const session = await getSession();

  return (
    <div className="bg-aurora-animated relative flex min-h-svh flex-col overflow-x-clip">
      <StructuredData />
      <MarketingNav isAuthenticated={!!session} />
      <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Hero */}
      <Hero isAuthenticated={!!session} />

      {/* App preview mockup */}
      <section className="mx-auto w-full max-w-4xl px-6 pb-24">
        <div className="relative">
          {/* Soft glow behind the card — single layer, no double-blur */}
          <div className="absolute -inset-x-6 -inset-y-3 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/15 to-transparent blur-2xl" />
          <DashboardMockup />
        </div>

        {/* "Replaced from" marquee */}
        <div className="mt-16">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Replacing the bloated stack
          </p>
          <div className="mt-4">
            <LogoMarquee />
          </div>
        </div>
      </section>

      {/* Flow section */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <Reveal as="div" className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            The flow
          </span>
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            Three steps. One flow.
          </h2>
          <p className="mt-4 text-muted-foreground">
            From a running timer to money in the bank — no copy-paste between
            five different apps.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {flow.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <div className="group relative h-full rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <f.icon className="size-5" />
                  </span>
                  <span className="font-heading text-3xl font-bold text-muted-foreground/20 transition-colors group-hover:text-primary/20">
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <Reveal as="section" className="border-y border-border/40 bg-card/30 backdrop-blur">
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
      </Reveal>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-24">
        <Reveal as="div" className="mx-auto max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Features
          </span>
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built by a freelancer who got tired of paying $30/month for
            software with more tabs than features.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <TiltCard className="group relative h-full rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur transition-colors hover:border-primary/30 hover:bg-card/70">
                <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <f.icon className="size-5" />
                </span>
                <h3 className="font-heading font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {f.description}
                </p>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <Reveal as="div" className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            Loved by freelancers
          </h2>
          <p className="mt-4 text-muted-foreground">
            Who switched from the bloated incumbents.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
                <div className="mb-3 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="size-3.5 fill-current" />
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-3xl scroll-mt-24 px-6 pb-24">
        <Reveal as="div" className="mb-10 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            FAQ
          </span>
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            Questions, answered
          </h2>
        </Reveal>

        <Stagger className="space-y-3">
          {faqs.map((f) => (
            <StaggerItem key={f.q}>
              <details className="group rounded-xl border border-border/60 bg-card/40 px-5 py-4 backdrop-blur transition-colors hover:border-primary/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </details>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Pricing preview */}
      <section id="pricing" className="mx-auto w-full max-w-5xl scroll-mt-24 px-6 pb-24">
        <PricingPreview isAuthenticated={!!session} />
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-4xl px-6 pb-24">
        <Reveal>
          <div className="gradient-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-10 text-center text-primary-foreground shadow-2xl shadow-primary/20 sm:p-16">
            <div className="absolute inset-0 bg-grid-lines opacity-10" />
            {/* Floating sparkles */}
            <Sparkles className="absolute right-8 top-8 size-6 text-primary-foreground/30 animate-float-slow" />
            <InfinityIcon className="absolute bottom-8 left-10 size-6 text-primary-foreground/20 animate-float" />

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
                  "group mt-8 h-12 rounded-xl bg-background px-8 text-[0.95rem] text-foreground hover:bg-background/90",
                )}
              >
                {session ? "Open dashboard" : "Get started — free"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      </main>

      <SiteFooter />
    </div>
  );
}
