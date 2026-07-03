"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createInvoice } from "@/app/(dashboard)/invoices/actions";
import { computeInvoiceTotals, formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/auth/field";
import { Textarea } from "@/components/ui/textarea";

interface ClientOption {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
}

interface LineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

let itemSeq = 0;
function newItem(): LineItem {
  itemSeq += 1;
  return {
    id: `local-${itemSeq}`,
    description: "",
    quantity: "1",
    unitPrice: "0",
  };
}

export function InvoiceBuilder({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([newItem()]);
  const [saving, setSaving] = useState(false);

  const totals = computeInvoiceTotals(
    items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice })),
    taxRate,
  );

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  }

  async function handleSave() {
    if (!clientId) return toast.error("Select a client.");
    if (items.some((i) => !i.description.trim())) {
      return toast.error("Every line item needs a description.");
    }
    setSaving(true);
    const res = await createInvoice({
      clientId,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      taxRate,
      notes,
      items: items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Invoice created as draft.");
    router.push(`/invoices/${res.data.id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main: form */}
      <div className="space-y-6">
        {/* Client + dates */}
        <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client" htmlFor="clientId">
              <Select
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                options={clients.map((c) => ({
                  value: c.id,
                  label: c.company ? `${c.name} (${c.company})` : c.name,
                }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Issue date" htmlFor="issueDate">
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </Field>
              <Field label="Due date" htmlFor="dueDate">
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">Line items</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setItems((p) => [...p, newItem()])}
            >
              <Plus className="size-3.5" />
              Add line
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr_80px_120px_120px_36px] sm:items-center">
                <Input
                  placeholder={`Item ${idx + 1} description`}
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, { description: e.target.value })
                  }
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, { quantity: e.target.value })
                  }
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Unit price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateItem(item.id, { unitPrice: e.target.value })
                  }
                />
                <div className="px-2 py-1.5 text-right text-sm font-medium tabular-nums text-muted-foreground">
                  {formatMoney(
                    (
                      Number(item.quantity || 0) * Number(item.unitPrice || 0)
                    ).toFixed(2),
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  aria-label="Remove line"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <Field label="Notes (optional)" htmlFor="notes">
            <Textarea
              id="notes"
              rows={2}
              placeholder="Payment instructions, thank-you note, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Sidebar: summary */}
      <aside className="space-y-4">
        <div className="sticky top-24 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="mb-4 font-heading text-sm font-semibold">Summary</h2>
          <Field label="Tax rate (%)" htmlFor="taxRate">
            <Input
              id="taxRate"
              type="text"
              inputMode="decimal"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </Field>

          <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">
                {formatMoney(totals.subtotal)}
              </span>
            </div>
            {Number(taxRate) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tax ({taxRate}%)
                </span>
                <span className="font-medium tabular-nums">
                  {formatMoney(totals.taxAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/60 pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatMoney(totals.total)}</span>
            </div>
          </div>

          <Button
            className="mt-5 w-full"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save as draft
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            You can send it from the next screen.
          </p>
        </div>
      </aside>
    </div>
  );
}
