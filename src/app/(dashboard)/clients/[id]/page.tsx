import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc, and } from "drizzle-orm";
import { ArrowLeft, Mail, Building2, FileText, FolderKanban } from "lucide-react";
import { db } from "@/lib/db";
import { client, invoice, project } from "@/lib/db/schema";
import { requireSession } from "@/lib/get-session";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { ClientRowActions } from "@/components/clients/client-row-actions";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const clientRow = await db.query.client.findFirst({
    where: and(eq(client.id, id), eq(client.userId, session.user.id)),
  });
  if (!clientRow) notFound();

  const [invoices, projects] = await Promise.all([
    db.query.invoice.findMany({
      where: eq(invoice.clientId, id),
      orderBy: [desc(invoice.issueDate)],
    }),
    db.query.project.findMany({
      where: eq(project.clientId, id),
      orderBy: [desc(project.createdAt)],
    }),
  ]);

  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + Number(i.total || 0), 0);
  const totalBilled = invoices.reduce(
    (s, i) => s + Number(i.total || 0),
    0,
  );
  const currency = invoices[0]?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to clients
      </Link>

      <PageHeader
        title={clientRow.name}
        description={
          <span className="flex flex-wrap items-center gap-3">
            {clientRow.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="size-3.5" />
                {clientRow.email}
              </span>
            )}
            {clientRow.company && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-3.5" />
                {clientRow.company}
              </span>
            )}
          </span>
        }
        actions={
          <ClientRowActions
            client={{
              id: clientRow.id,
              name: clientRow.name,
              email: clientRow.email ?? "",
              company: clientRow.company ?? "",
              address: clientRow.address ?? "",
              notes: clientRow.notes ?? "",
            }}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total billed
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">
            {formatMoney(totalBilled.toFixed(2), currency)}
          </p>
        </div>
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Outstanding
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {formatMoney(outstanding.toFixed(2), currency)}
          </p>
        </div>
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Invoices
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">
            {invoices.length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <h2 className="font-heading text-sm font-semibold">Invoices</h2>
          </div>
          {invoices.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
              No invoices yet.
            </p>
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
          <div className="flex items-center gap-2">
            <FolderKanban className="size-4 text-muted-foreground" />
            <h2 className="font-heading text-sm font-semibold">Projects</h2>
          </div>
          {projects.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
              No projects yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5 text-sm ring-1 ring-foreground/10"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">
                    {formatMoney(p.hourlyRate)}/hr
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {clientRow.notes && (
        <section className="rounded-xl bg-muted/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Notes
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{clientRow.notes}</p>
        </section>
      )}
    </div>
  );
}
