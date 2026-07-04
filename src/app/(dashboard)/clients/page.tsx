import { getClients } from "./actions";
import { requireSession } from "@/lib/get-session";
import { getEntitlement } from "@/lib/subscription";
import { ClientsView } from "@/components/clients/clients-view";

export default async function ClientsPage() {
  const session = await requireSession();
  const entitlement = await getEntitlement(session.user.id);
  const clients = await getClients();

  return (
    <ClientsView
      clients={clients.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
        invoiceCount: c.invoiceCount,
        outstandingTotal: c.outstandingTotal,
      }))}
      isFreePlan={entitlement.plan === "free"}
    />
  );
}
