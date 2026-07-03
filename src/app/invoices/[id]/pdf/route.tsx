// Renders an invoice as a PDF stream. Protected by session + ownership check.
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { requireSession } from "@/lib/get-session";
import { getInvoice } from "@/app/(dashboard)/invoices/actions";
import { InvoicePdf, type InvoicePdfData } from "@/lib/pdf/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  const { id } = await params;

  const inv = await getInvoice(id);
  if (!inv || inv.userId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const userRow = (
    await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  )[0];

  const data: InvoicePdfData = {
    number: inv.number,
    status: inv.status,
    currency: inv.currency,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    subtotal: inv.subtotal,
    taxRate: inv.taxRate,
    taxAmount: inv.taxAmount,
    total: inv.total,
    notes: inv.notes,
    business: {
      name: userRow?.businessName || session.user.name,
      address: userRow?.businessAddress || null,
      email: session.user.email,
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

  const buffer = await renderToBuffer(<InvoicePdf data={data} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${inv.number}.pdf"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
