import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function InvoiceEmail({
  fromName,
  invoiceNumber,
  total,
  currency,
  dueDate,
  notes,
}: {
  fromName: string;
  toName?: string;
  invoiceNumber: string;
  total: string;
  currency: string;
  dueDate: string;
  notes?: string | null;
}) {
  const formatted = (() => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(Number(total));
    } catch {
      return `${currency} ${Number(total).toFixed(2)}`;
    }
  })();

  return (
    <Html>
      <Head />
      <Preview>
        Invoice {invoiceNumber} from {fromName} — {formatted}
      </Preview>
      <Body style={{ fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: 0, backgroundColor: "#f4f4f5" }}>
        <Container style={{ maxWidth: 560, margin: "40px auto", backgroundColor: "#fff", borderRadius: 8, padding: 40 }}>
          <Heading style={{ fontSize: 22, color: "#4f46e5", marginBottom: 4 }}>
            You have a new invoice
          </Heading>
          <Text style={{ color: "#71717a", marginTop: 0 }}>
            {fromName} sent you invoice {invoiceNumber}.
          </Text>

          <Section style={{ backgroundColor: "#f9fafb", borderRadius: 8, padding: 24, marginTop: 24 }}>
            <Text style={{ margin: 0, fontSize: 13, color: "#71717a" }}>Amount due</Text>
            <Text style={{ margin: "4px 0 12px", fontSize: 28, fontWeight: 700, color: "#18181b" }}>
              {formatted}
            </Text>
            <Text style={{ margin: 0, fontSize: 13, color: "#71717a" }}>
              Due {dueDate}
            </Text>
          </Section>

          {notes && (
            <Text style={{ fontSize: 14, color: "#52525b", marginTop: 24 }}>
              {notes}
            </Text>
          )}

          <Hr style={{ borderColor: "#e4e4e7", margin: "32px 0" }} />
          <Text style={{ fontSize: 13, color: "#a1a1aa" }}>
            A PDF copy of this invoice is attached.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
