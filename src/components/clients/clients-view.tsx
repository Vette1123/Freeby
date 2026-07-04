"use client";
// Client list with optimistic add / edit / delete. Holds the rows in
// useOptimistic so a create/delete reflects instantly; the server action's
// revalidatePath then reconciles the truth on the next render.
import Link from "next/link";
import { Mail, Building2, Users } from "lucide-react";
import { useOptimisticList } from "@/hooks/use-optimistic-list";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { ClientRowActions } from "@/components/clients/client-row-actions";
import type { ClientRow } from "@/components/clients/client-form";

export interface ClientSummary extends ClientRow {
  invoiceCount: number;
  outstandingTotal: string;
}

export function ClientsView({
  clients,
  isFreePlan,
}: {
  clients: ClientSummary[];
  isFreePlan: boolean;
}) {
  const { items, updateOptimistic } = useOptimisticList(clients);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Everyone you bill — track outstanding balances at a glance."
        actions={
          <ClientFormDialog
            onCreated={(row) =>
              updateOptimistic({
                op: "add",
                data: { ...row, invoiceCount: 0, outstandingTotal: "0" },
              })
            }
          />
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to start tracking invoices and outstanding balances."
          action={<ClientFormDialog triggerLabel="Add your first client" />}
        />
      ) : (
        <>
          {isFreePlan && <UpgradeBanner />}

          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border/60">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Client
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">
                    Invoices
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Outstanding
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.id}
                    className="group border-b border-border/40 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${c.id}`}
                        className="flex flex-col"
                      >
                        <span className="font-medium hover:text-primary">
                          {c.name}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {c.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="size-3" />
                              {c.email}
                            </span>
                          )}
                          {c.company && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="size-3" />
                              {c.company}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {c.invoiceCount}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {Number(c.outstandingTotal) > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {formatMoney(c.outstandingTotal)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <ClientRowActions
                        client={{
                          id: c.id,
                          name: c.name,
                          email: c.email ?? "",
                          company: c.company ?? "",
                          address: "",
                          notes: "",
                        }}
                        onDeleted={(id) => updateOptimistic({ op: "delete", id })}
                        onUpdated={(id, patch) =>
                          updateOptimistic({ op: "update", id, data: patch })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
