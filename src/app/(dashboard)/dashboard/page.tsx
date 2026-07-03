import Link from "next/link";
import { eq, desc, and, gte } from "drizzle-orm";
import {
  DollarSign,
  Clock,
  Users,
  ArrowRight,
  Timer,
  FileText,
} from "lucide-react";
import { db } from "@/lib/db";
import { client, invoice, timeEntry, user } from "@/lib/db/schema";
import { requireSession } from "@/lib/get-session";
import { getEntitlement } from "@/lib/subscription";
import { formatMoney } from "@/lib/money";
import { formatDuration, formatRelative } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireSession();
  const userId = session.user.id;
  const entitlement = await getEntitlement(userId);

  const userRow = (
    await db.select().from(user).where(eq(user.id, userId)).limit(1)
  )[0];
  const currency = userRow?.currency ?? "USD";

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const [invoices, clients, recentTime] = await Promise.all([
    db.query.invoice.findMany({
      where: eq(invoice.userId, userId),
      with: { client: true },
      orderBy: [desc(invoice.issueDate)],
      limit: 5,
    }),
    db.select({ id: client.id }).from(client).where(eq(client.userId, userId)),
    db.query.timeEntry.findMany({
      where: and(
        eq(timeEntry.userId, userId),
        gte(timeEntry.startedAt, weekAgo),
      ),
      with: { project: { with: { client: true } } },
      orderBy: [desc(timeEntry.startedAt)],
      limit: 5,
    }),
  ]);

  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + Number(i.total || 0), 0);

  const weekMs = recentTime.reduce((s, e) => s + e.durationMs, 0);

  const unpaidCount = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue",
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${session.user.name.split(" ")[0]}`}
        description="Here's your business at a glance."
      />

      {entitlement.plan === "free" && <UpgradeBanner />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Outstanding"
          value={formatMoney(outstanding.toFixed(2), currency)}
          hint={`${unpaidCount} unpaid invoice${unpaidCount === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={Clock}
          label="Tracked (7 days)"
          value={formatDuration(weekMs)}
          hint={`${recentTime.length} entries this week`}
        />
        <StatCard
          icon={Users}
          label="Clients"
          value={String(clients.length)}
          hint={entitlement.plan === "free" ? "1 on Free plan" : "Unlimited on Pro"}
        />
        <StatCard
          icon={FileText}
          label="Invoices"
          value={String(invoices.length)}
          hint="Last 5 shown below"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">
              Recent invoices
            </h2>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {invoices.length === 0 ? (
            <Link
              href="/invoices"
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-10 text-sm text-muted-foreground hover:bg-muted/30"
            >
              <FileText className="size-4" />
              Create your first invoice
            </Link>
          ) : (
            <div className="space-y-1.5">
              {invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5 text-sm ring-1 ring-foreground/10 hover:bg-muted/40"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-medium">{inv.number}</span>
                    <Badge
                      variant={
                        inv.status === "paid"
                          ? "success"
                          : inv.status === "overdue"
                            ? "danger"
                            : inv.status === "sent"
                              ? "warning"
                              : "muted"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatMoney(inv.total, inv.currency)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">
              Recent activity
            </h2>
            <Link
              href="/timer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Start timer
              <Timer className="size-3.5" />
            </Link>
          </div>
          {recentTime.length === 0 ? (
            <Link
              href="/timer"
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-10 text-sm text-muted-foreground hover:bg-muted/30"
            >
              <Timer className="size-4" />
              Track your first hour
            </Link>
          ) : (
            <div className="space-y-1.5">
              {recentTime.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-lg bg-card px-3 py-2.5 text-sm ring-1 ring-foreground/10"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {e.description || e.project?.name || "Time entry"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatRelative(e.startedAt)}
                    </p>
                  </div>
                  <span className="font-medium tabular-nums">
                    {formatDuration(e.durationMs)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/timer"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto justify-start py-4",
          )}
        >
          <Timer className="size-4" />
          Track time
        </Link>
        <Link
          href="/invoices/new"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto justify-start py-4",
          )}
        >
          <FileText className="size-4" />
          New invoice
        </Link>
        <Link
          href="/clients"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto justify-start py-4",
          )}
        >
          <Users className="size-4" />
          Add client
        </Link>
      </section>
    </div>
  );
}
