"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { fail, ok, requireUser, type ActionResult } from "@/lib/actions";
import { businessProfileSchema } from "@/lib/validations/freeby";

export async function getBusinessProfile() {
  const { userId } = await requireUser();
  const row = (
    await db.select().from(user).where(eq(user.id, userId)).limit(1)
  )[0];
  return {
    businessName: row?.businessName ?? "",
    businessAddress: row?.businessAddress ?? "",
    currency: row?.currency ?? "USD",
    invoicePrefix: row?.invoicePrefix ?? "INV",
    taxRate: row?.taxRate ?? "0",
  };
}

export async function updateBusinessProfile(input: {
  businessName?: string;
  businessAddress?: string;
  currency: string;
  invoicePrefix: string;
  taxRate: string;
}): Promise<ActionResult> {
  const { userId } = await requireUser();
  const parsed = businessProfileSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  await db
    .update(user)
    .set({
      businessName: parsed.data.businessName || null,
      businessAddress: parsed.data.businessAddress || null,
      currency: parsed.data.currency,
      invoicePrefix: parsed.data.invoicePrefix.toUpperCase(),
      taxRate: parsed.data.taxRate,
    })
    .where(eq(user.id, userId));

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return ok(undefined);
}
