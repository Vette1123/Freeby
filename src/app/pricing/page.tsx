import Link from "next/link";
import { Check, ArrowRight, Sparkles, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/get-session";

export const metadata = {
  title: "Pricing",
  description:
    "Freeby is free to start — 1 client and 3 invoices a month. Upgrade to Pro for $19/mo or $190/yr for unlimited everything.",
  alternates: { canonical: "/pricing" },
};

const freeFeatures = [
  "1 client",
  "3 invoices per month",
  "Time tracking",
  "PDF download",
  "Dashboard analytics",
];

const proFeatures = [
  "Unlimited clients",
  "Unlimited invoices",
  "Email invoices with PDF",
  "Remove Freeby branding",
  "Payment tracking",
  "Priority support",
  "Global tax handling (via Lemon Squeezy)",
];

const faqs = [
  {
    q: "Do I need a credit card to start?",
    a: "No. The Free plan is free forever, no card required. You only enter payment details when you choose to upgrade to Pro.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel Pro with one click and you keep access until the end of your billing period, then drop back to Free.",
  },
  {
    q: "How does payment work?",
    a: "We use Lemon Squeezy, a Merchant of Record — they handle global tax and VAT automatically, so you can bill clients anywhere in the world without tax headaches.",
  },
  {
    q: "Is my data secure?",
    a: "Your data lives in a dedicated Postgres database. We never sell your data, show ads, or lock you in. Export anytime.",
  },
];

export default async function PricingPage() {
  const session = await getSession();

  return (
    <main className="bg-aurora relative flex min-h-svh flex-col">
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-heading text-lg font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ReceiptText className="size-4" />
          </span>
          Freeby
        </Link>
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
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost" }), "rounded-full")}
            >
              Log in
            </Link>
          )}
        </div>
      </header>

      {/* Pricing */}
      <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <div className="text-center">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            Simple, honest pricing
          </span>
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">
            Free to start.
            <br />
            Pro when you grow.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            No hidden fees. No per-invoice charges. No nonsense.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-border/60 bg-card/50 p-8 backdrop-blur">
            <h2 className="font-heading text-lg font-semibold">Free</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For getting started
            </p>
            <p className="mt-6 font-heading text-5xl font-bold">$0</p>
            <p className="text-sm text-muted-foreground">forever</p>

            <Link
              href={session ? "/dashboard" : "/signup"}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-6 w-full rounded-xl",
              )}
            >
              {session ? "Current plan" : "Start free"}
            </Link>

            <ul className="mt-8 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="size-4 shrink-0 text-muted-foreground" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/10 to-transparent p-8 backdrop-blur">
            <div className="absolute right-5 top-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                <Sparkles className="size-3" />
                Popular
              </span>
            </div>
            <h2 className="font-heading text-lg font-semibold">Pro</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For serious freelancers
            </p>
            <p className="mt-6 font-heading text-5xl font-bold">$19</p>
            <p className="text-sm text-muted-foreground">per month</p>

            <Link
              href={session ? "/billing" : "/signup"}
              className={cn(
                buttonVariants(),
                "mt-6 w-full rounded-xl",
              )}
            >
              {session ? "Upgrade to Pro" : "Start free, upgrade later"}
              <ArrowRight className="size-4" />
            </Link>

            <ul className="mt-8 space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Yearly note */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Prefer annual? Get Pro for{" "}
          <span className="font-medium text-foreground">$190/year</span> —
          that&apos;s 2 months free.{" "}
          <Link
            href={session ? "/billing" : "/signup"}
            className="text-primary hover:underline"
          >
            Choose yearly →
          </Link>
        </p>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-2xl">
          <h2 className="text-center font-heading text-2xl font-semibold">
            Frequently asked
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur"
              >
                <h3 className="font-medium">{faq.q}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ReceiptText className="size-3" />
            </span>
            Freeby
          </div>
          <p>© {new Date().getFullYear()} Freeby.</p>
        </div>
      </footer>
    </main>
  );
}
