"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { updateBusinessProfile } from "@/app/(dashboard)/settings/actions";
import {
  CURRENCIES,
  type BusinessProfileInput,
} from "@/lib/validations/freeby";
import { Field } from "@/components/auth/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function BusinessProfileForm({
  defaults,
}: {
  defaults: BusinessProfileInput;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaults);

  async function save() {
    setSaving(true);
    const res = await updateBusinessProfile(form);
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Business profile saved.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Field label="Business name" htmlFor="businessName">
        <Input
          id="businessName"
          placeholder="Your name or company"
          value={form.businessName ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, businessName: e.target.value }))
          }
        />
      </Field>
      <Field label="Business address" htmlFor="businessAddress">
        <Textarea
          id="businessAddress"
          rows={2}
          placeholder="Shown on your invoices"
          value={form.businessAddress ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, businessAddress: e.target.value }))
          }
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Currency" htmlFor="currency">
          <Select
            id="currency"
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            value={form.currency}
            onChange={(e) =>
              setForm((f) => ({ ...f, currency: e.target.value }))
            }
          />
        </Field>
        <Field label="Invoice prefix" htmlFor="invoicePrefix">
          <Input
            id="invoicePrefix"
            placeholder="INV"
            value={form.invoicePrefix}
            onChange={(e) =>
              setForm((f) => ({ ...f, invoicePrefix: e.target.value }))
            }
          />
        </Field>
        <Field label="Default tax rate (%)" htmlFor="taxRate">
          <Input
            id="taxRate"
            inputMode="decimal"
            placeholder="0"
            value={form.taxRate}
            onChange={(e) =>
              setForm((f) => ({ ...f, taxRate: e.target.value }))
            }
          />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save profile
        </Button>
      </div>
    </div>
  );
}
