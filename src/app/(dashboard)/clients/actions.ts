"use server";
// Clients CRUD — establishes the server-action + revalidatePath pattern used
// across all Freeby CRUD features. Every action:
//   1. resolves the user (throws if unauthenticated),
//   2. enforces plan limits on create,
//   3. validates input with zod,
//   4. scopes every query by userId (multi-tenant isolation),
//   5. returns a typed ActionResult,
//   6. calls revalidatePath so server components re-render with fresh data.
import { revalidatePath } from "next/cache";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { client, invoice } from "@/lib/db/schema";
import { ids } from "@/lib/ids";
import {
  enforceClientLimit,
  fail,
  ok,
  requireUser,
  type ActionResult,
} from "@/lib/actions";
import { clientSchema } from "@/lib/validations/freeby";

export async function getClients(): Promise<
  Array<{
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    invoiceCount: number;
    outstandingTotal: string;
  }>
> {
  const { userId } = await requireUser();
  const clients = await db
    .select()
    .from(client)
    .where(eq(client.userId, userId))
    .orderBy(desc(client.createdAt));

  // Compute per-client aggregates. With small per-user datasets this is fine
  // and avoids a complex join/aggregation query against Neon's HTTP driver.
  const result = await Promise.all(
    clients.map(async (c) => {
      const invoices = await db
        .select({ total: invoice.total, status: invoice.status })
        .from(invoice)
        .where(eq(invoice.clientId, c.id));
      const outstanding = invoices
        .filter((i) => i.status === "sent" || i.status === "overdue")
        .reduce((sum, i) => sum + Number(i.total || 0), 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
        invoiceCount: invoices.length,
        outstandingTotal: outstanding.toFixed(2),
      };
    }),
  );
  return result;
}

export async function getClient(id: string) {
  const { userId } = await requireUser();
  const rows = await db
    .select()
    .from(client)
    .where(and(eq(client.id, id), eq(client.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createClient(
  input: z.infer<typeof clientSchema>,
): Promise<ActionResult<{ id: string }>> {
  const { userId, entitlement } = await requireUser();

  const limitError = await enforceClientLimit(entitlement, userId);
  if (limitError) return fail(limitError);

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return fail("Please fix the errors below.", fieldErrors);
  }

  const id = ids.client();
  await db.insert(client).values({
    id,
    userId,
    name: parsed.data.name,
    email: parsed.data.email || null,
    company: parsed.data.company || null,
    address: parsed.data.address || null,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/clients");
  return ok({ id });
}

export async function updateClient(
  id: string,
  input: z.infer<typeof clientSchema>,
): Promise<ActionResult> {
  const { userId } = await requireUser();
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return fail("Please fix the errors below.", fieldErrors);
  }

  await db
    .update(client)
    .set({
      name: parsed.data.name,
      email: parsed.data.email || null,
      company: parsed.data.company || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
    })
    .where(and(eq(client.id, id), eq(client.userId, userId)));

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return ok(undefined);
}

export async function deleteClient(id: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  await db
    .delete(client)
    .where(and(eq(client.id, id), eq(client.userId, userId)));
  revalidatePath("/clients");
  return ok(undefined);
}
