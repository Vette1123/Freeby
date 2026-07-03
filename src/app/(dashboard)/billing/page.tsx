import { Check, Sparkles } from "lucide-react";
import { requireSession } from "@/lib/get-session";
import { getEntitlement } from "@/lib/subscription";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { PlanBadge } from "@/components/shared/plan-badge";
import { UpgradeCard } from "@/components/billing/upgrade-card";
import { ManageSubscription } from "@/components/billing/manage-subscription";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const session = await requireSession();
  const entitlement = await getEntitlement(session.user.id);
  const { upgraded } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Billing"
        description="Manage your Freeby subscription."
      />

      {upgraded && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <Sparkles className="size-4" />
          Welcome to Pro! All limits are now lifted.
        </div>
      )}

      {/* Current plan */}
      <section className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current plan
            </p>
            <p className="mt-1 font-heading text-2xl font-semibold capitalize">
              {entitlement.plan === "pro" ? "Pro" : "Free"}
            </p>
          </div>
          <PlanBadge plan={entitlement.plan} />
        </div>

        {entitlement.plan === "pro" && entitlement.currentPeriodEnd && (
          <p className="mt-3 text-sm text-muted-foreground">
            {entitlement.cancelAtPeriodEnd
              ? `Cancels on ${formatDate(entitlement.currentPeriodEnd)}. You keep Pro access until then.`
              : `Renews on ${formatDate(entitlement.currentPeriodEnd)}.`}
          </p>
        )}

        {entitlement.plan === "free" && (
          <p className="mt-3 text-sm text-muted-foreground">
            1 client · 3 invoices/month · Upgrade for unlimited everything.
          </p>
        )}
      </section>

      {/* Upgrade or manage */}
      {entitlement.plan === "pro" ? (
        <ManageSubscription cancelAtPeriodEnd={entitlement.cancelAtPeriodEnd} />
      ) : (
        <UpgradeCard />
      )}

      {/* What's included */}
      <section className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="mb-4 font-heading text-sm font-semibold">
          What&apos;s included in Pro
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            "Unlimited clients",
            "Unlimited invoices",
            "Email invoices with PDF",
            "Remove Freeby branding",
            "Payment tracking",
            "Priority support",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="size-3.5" />
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
