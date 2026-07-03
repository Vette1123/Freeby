import { redirect } from "next/navigation";
import { getClientOptions } from "../actions";
import { InvoiceBuilder } from "@/components/invoices/invoice-builder";
import { PageHeader } from "@/components/shared/page-header";

export default async function NewInvoicePage() {
  const clients = await getClientOptions();
  if (clients.length === 0) redirect("/invoices");

  return (
    <div className="space-y-6">
      <PageHeader
        title="New invoice"
        description="Add line items, set tax, and save as a draft or send."
      />
      <InvoiceBuilder
        clients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          company: c.company,
        }))}
      />
    </div>
  );
}
