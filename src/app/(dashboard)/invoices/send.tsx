"use server";
// "Send invoice" — renders the PDF, emails it to the client via Resend with the
// PDF attached, and marks the invoice status as "sent".
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { render } from "@react-email/components";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import {
  fail,
  ok,
  requireUser,
  type ActionResult,
} from "@/lib/actions";
import { getInvoice } from "./actions";
import { InvoicePdf, type InvoicePdfData } from "@/lib/pdf/invoice-pdf";
import { InvoiceEmail } from "@/lib/email/templates/invoice";
import { sendInvoiceWithAttachment } from "@/lib/email/resend";
import { updateInvoiceStatus } from "./actions";
import { formatDate } from "@/lib/format";

export async function sendInvoice(invoiceId: string): Promise<ActionResult> {
  const { userId, email: userEmail, entitlement } = await requireUser();

  // Sending invoices is a Pro feature (free users can create + preview, but
  // the email-send is gated to encourage upgrade). We still allow it in dev
  // where Resend may be unconfigured.
  if (!entitlement.isActive && process.env.NODE_ENV === "production") {
    return fail("Sending invoices by email is a Pro feature. Upgrade to send.");
  }

  const inv = await getInvoice(invoiceId);
  if (!inv || inv.userId !== userId) {
    return fail("Invoice not found.");
  }
  if (!inv.client.email) {
    return fail("This client has no email address. Add one and try again.");
  }

  const userRow = (
    await db.select().from(user).where(eq(user.id, userId)).limit(1)
  )[0];
  const fromName = userRow?.businessName || userEmail.split("@")[0];

  const data: InvoicePdfData = {
    number: inv.number,
    status: "sent",
    currency: inv.currency,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    subtotal: inv.subtotal,
    taxRate: inv.taxRate,
    taxAmount: inv.taxAmount,
    total: inv.total,
    notes: inv.notes,
    business: {
      name: userRow?.businessName || fromName,
      address: userRow?.businessAddress || null,
      email: userEmail,
    },
    billTo: {
      name: inv.client.name,
      company: inv.client.company,
      email: inv.client.email,
      address: inv.client.address,
    },
    items: inv.items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total,
    })),
  };

  const pdfBuffer = await renderToBuffer(<InvoicePdf data={data} />);
  const html = await render(
    InvoiceEmail({
      fromName,
      toName: inv.client.name,
      invoiceNumber: inv.number,
      total: inv.total,
      currency: inv.currency,
      dueDate: formatDate(inv.dueDate),
      notes: inv.notes,
    }),
  );

  await sendInvoiceWithAttachment({
    to: inv.client.email,
    subject: `Invoice ${inv.number} from ${fromName}`,
    html,
    attachment: { filename: `${inv.number}.pdf`, content: pdfBuffer },
  });

  await updateInvoiceStatus(invoiceId, "sent");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  return ok(undefined);
}
