import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { getInvoice, markInvoicePaid, deleteInvoice } from "../actions";
import { sendInvoice } from "../send";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { InvoiceActions } from "@/components/invoices/invoice-actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inv = await getInvoice(id);
  if (!inv) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to invoices
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {inv.number}
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
        }
        description={`${inv.client.name} · issued ${formatDate(inv.issueDate)}`}
        actions={
          <InvoiceActions
            invoiceId={inv.id}
            status={inv.status}
            clientEmail={inv.client.email ?? null}
            actions={{
              send: sendInvoice,
              markPaid: markInvoicePaid,
              remove: deleteInvoice,
            }}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Items */}
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b border-border/60">
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Qty
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Price
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {formatMoney(item.unitPrice, inv.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatMoney(item.total, inv.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {inv.notes && (
            <div className="border-t border-border/60 bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{inv.notes}</p>
            </div>
          )}
        </div>

        {/* Totals */}
        <aside className="space-y-4">
          <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatMoney(inv.subtotal, inv.currency)}
                </span>
              </div>
              {Number(inv.taxRate) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({inv.taxRate}%)
                  </span>
                  <span className="tabular-nums">
                    {formatMoney(inv.taxAmount, inv.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border/60 pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatMoney(inv.total, inv.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Bill to
            </p>
            <p className="mt-1 font-medium">{inv.client.name}</p>
            {inv.client.company && (
              <p className="text-sm text-muted-foreground">
                {inv.client.company}
              </p>
            )}
            {inv.client.email && (
              <p className="text-sm text-muted-foreground">
                {inv.client.email}
              </p>
            )}
            <div className="mt-3 border-t border-border/60 pt-3 text-sm">
              <p className="text-muted-foreground">Due {formatDate(inv.dueDate)}</p>
            </div>
          </div>

          <Link
            href={`/invoices/${inv.id}/pdf`}
            target="_blank"
            className="flex items-center justify-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium hover:bg-muted/40"
          >
            <Download className="size-4" />
            Download PDF
          </Link>
        </aside>
      </div>
    </div>
  );
}
