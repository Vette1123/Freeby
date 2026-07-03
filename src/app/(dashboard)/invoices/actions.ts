"use server";
import { revalidatePath } from "next/cache";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { client, invoice, invoiceItem, user } from "@/lib/db/schema";
import { ids } from "@/lib/ids";
import { computeInvoiceTotals } from "@/lib/money";
import { nextInvoiceNumber } from "@/lib/invoice-number";
import {
  fail,
  ok,
  requireUser,
  countInvoicesThisMonth,
  type ActionResult,
} from "@/lib/actions";
import { LIMITS } from "@/lib/subscription";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations/freeby";

export async function getInvoices() {
  const { userId } = await requireUser();
  return db.query.invoice.findMany({
    where: eq(invoice.userId, userId),
    with: { client: true },
    orderBy: [desc(invoice.issueDate)],
  });
}

export async function getClientOptions() {
  const { userId } = await requireUser();
  return db.query.client.findMany({
    where: eq(client.userId, userId),
  });
}

export async function getInvoice(id: string) {
  const { userId } = await requireUser();
  const inv = await db.query.invoice.findFirst({
    where: and(eq(invoice.id, id), eq(invoice.userId, userId)),
    with: { client: true, items: true },
  });
  return inv;
}

export async function createInvoice(
  input: InvoiceInput,
): Promise<ActionResult<{ id: string }>> {
  const { userId, entitlement } = await requireUser();

  // Free-tier invoice/month limit.
  const limit = LIMITS[entitlement.plan].maxInvoicesPerMonth;
  if (limit !== Infinity) {
    const count = await countInvoicesThisMonth(userId);
    if (count >= limit) {
      return fail(
        `The Free plan allows ${limit} invoices per month. Upgrade to Pro for unlimited.`,
      );
    }
  }

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      parsed.error.issues[0]?.message ?? "Invalid invoice data.",
    );
  }

  // Load the user to get invoice prefix + counter + currency.
  const userRow = (await db.select().from(user).where(eq(user.id, userId)).limit(1))[0];
  if (!userRow) return fail("User not found.");

  const totals = computeInvoiceTotals(
    parsed.data.items.map((i) => ({
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    parsed.data.taxRate,
  );

  const invId = ids.invoice();
  const number = nextInvoiceNumber(
    userRow.invoicePrefix,
    userRow.invoiceCounter,
  );

  // Insert invoice + items in sequence (Neon HTTP driver doesn't support
  // transactions over separate HTTP calls; ordering gives us acceptable
  // consistency for a single-user insert path).
  await db.insert(invoice).values({
    id: invId,
    userId,
    clientId: parsed.data.clientId,
    number,
    status: "draft",
    currency: userRow.currency,
    issueDate: parsed.data.issueDate,
    dueDate: parsed.data.dueDate,
    subtotal: totals.subtotal,
    taxRate: totals.taxRate,
    taxAmount: totals.taxAmount,
    total: totals.total,
    notes: parsed.data.notes || null,
  });

  for (const item of parsed.data.items) {
    const lineTotal = (
      await import("@/lib/money")
    ).lineTotal(item.quantity, item.unitPrice);
    await db.insert(invoiceItem).values({
      id: ids.invoiceItem(),
      invoiceId: invId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: lineTotal,
    });
  }

  // Increment the user's invoice counter.
  await db
    .update(user)
    .set({ invoiceCounter: userRow.invoiceCounter + 1 })
    .where(eq(user.id, userId));

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invId}`);
  return ok({ id: invId });
}

export async function updateInvoiceStatus(
  id: string,
  status: "draft" | "sent" | "paid" | "overdue",
): Promise<ActionResult> {
  const { userId } = await requireUser();
  const patch: Partial<typeof invoice.$inferInsert> = { status };
  if (status === "sent") patch.sentAt = new Date();
  if (status === "paid") patch.paidAt = new Date();

  await db
    .update(invoice)
    .set(patch)
    .where(and(eq(invoice.id, id), eq(invoice.userId, userId)));

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/dashboard");
  return ok(undefined);
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  await db
    .delete(invoice)
    .where(and(eq(invoice.id, id), eq(invoice.userId, userId)));
  revalidatePath("/invoices");
  return ok(undefined);
}

// Re-export type for the builder.
export type InvoiceWithRelations = NonNullable<
  Awaited<ReturnType<typeof getInvoice>>
>;
