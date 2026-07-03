import { getSession } from "@/lib/get-session";
import { SiteFooter } from "@/components/shared/site-footer";
import { MarketingNav } from "@/components/shared/marketing-nav";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

export const metadata = {
  title: "Pricing",
  description:
    "Freeby is free to start — 1 client and 3 invoices a month. Upgrade to Pro for $19/mo or $190/yr for unlimited everything.",
  alternates: { canonical: "/pricing" },
};

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
  {
    q: "What happens to my invoices if I downgrade?",
    a: "Nothing disappears. Your clients and past invoices stay fully accessible. You just can't create new invoices beyond the Free plan's monthly limit.",
  },
];

export default async function PricingPage() {
  const session = await getSession();

  return (
    <div className="bg-aurora-animated relative flex min-h-svh flex-col">
      <MarketingNav isAuthenticated={!!session} />

      {/* Pricing */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <PricingPreview isAuthenticated={!!session} />

        {/* FAQ */}
        <div className="mx-auto mt-24 max-w-2xl">
          <Reveal as="div" className="mb-8 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              FAQ
            </span>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              Frequently asked
            </h2>
          </Reveal>

          <Stagger className="space-y-3">
            {faqs.map((faq) => (
              <StaggerItem key={faq.q}>
                <details className="group rounded-xl border border-border/60 bg-card/40 px-5 py-4 backdrop-blur transition-colors hover:border-primary/30">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {faq.q}
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </details>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      </main>

      <SiteFooter />
    </div>
  );
}
