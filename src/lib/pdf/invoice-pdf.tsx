// The invoice PDF document, rendered server-side via @react-pdf/renderer.
//
// We keep this as a presentational React component that react-pdf can render
// to a streamable PDF buffer. It uses react-pdf primitives (<Document>,
// <Page>, <View>, <Text>) — NOT DOM elements.
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatDate } from "@/lib/format";
import { brandHost } from "@/lib/brand";

export interface InvoicePdfData {
  number: string;
  status: string;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  notes: string | null;
  business: {
    name: string;
    address: string | null;
    email: string;
  };
  billTo: {
    name: string;
    company: string | null;
    email: string | null;
    address: string | null;
  };
  items: Array<{
    description: string;
    quantity: string;
    unitPrice: string;
    total: string;
  }>;
}

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#4f46e5" },
  brandSub: { fontSize: 8, color: "#888", marginTop: 2 },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  invoiceNumber: { fontSize: 10, color: "#666", marginTop: 4, textAlign: "right" },
  parties: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  partyLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#999",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  partyName: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  partyLine: { fontSize: 9, color: "#666", marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 6,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  colDesc: { flex: 5 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 2, textAlign: "right" },
  colTotal: { flex: 2, textAlign: "right" },
  th: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#999" },
  totals: {
    marginTop: 24,
    alignSelf: "flex-end",
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontSize: 10,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    marginTop: 8,
    paddingTop: 8,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  notes: {
    marginTop: 40,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    fontSize: 9,
    color: "#666",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    textAlign: "center",
    fontSize: 7,
    color: "#bbb",
  },
});

function money(v: string, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(v));
  } catch {
    return `${currency} ${Number(v).toFixed(2)}`;
  }
}

export function InvoicePdf({ data }: { data: InvoicePdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Freeby</Text>
            <Text style={styles.brandSub}>INVOICING WITHOUT THE BLOAT</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.number}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.parties}>
          <View style={{ flex: 1 }}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>
              {data.business.name || "—"}
            </Text>
            {data.business.address && (
              <Text style={styles.partyLine}>{data.business.address}</Text>
            )}
            <Text style={styles.partyLine}>{data.business.email}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.partyLabel}>Bill to</Text>
            <Text style={styles.partyName}>{data.billTo.name}</Text>
            {data.billTo.company && (
              <Text style={styles.partyLine}>{data.billTo.company}</Text>
            )}
            {data.billTo.email && (
              <Text style={styles.partyLine}>{data.billTo.email}</Text>
            )}
            {data.billTo.address && (
              <Text style={styles.partyLine}>{data.billTo.address}</Text>
            )}
          </View>
        </View>

        {/* Dates */}
        <View style={{ flexDirection: "row", gap: 40, marginBottom: 24 }}>
          <View>
            <Text style={styles.partyLabel}>Issue date</Text>
            <Text>{formatDate(data.issueDate)}</Text>
          </View>
          <View>
            <Text style={styles.partyLabel}>Due date</Text>
            <Text>{formatDate(data.dueDate)}</Text>
          </View>
          <View>
            <Text style={styles.partyLabel}>Status</Text>
            <Text style={{ textTransform: "capitalize" }}>{data.status}</Text>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, styles.th]}>Description</Text>
          <Text style={[styles.colQty, styles.th]}>Qty</Text>
          <Text style={[styles.colPrice, styles.th]}>Unit price</Text>
          <Text style={[styles.colTotal, styles.th]}>Amount</Text>
        </View>
        {data.items.map((item, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>
              {money(item.unitPrice, data.currency)}
            </Text>
            <Text style={styles.colTotal}>
              {money(item.total, data.currency)}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{money(data.subtotal, data.currency)}</Text>
          </View>
          {Number(data.taxRate) > 0 && (
            <View style={styles.totalRow}>
              <Text>Tax ({data.taxRate}%)</Text>
              <Text>{money(data.taxAmount, data.currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text>Total</Text>
            <Text>{money(data.total, data.currency)}</Text>
          </View>
        </View>

        {data.notes && (
          <View style={styles.notes}>
            <Text>{data.notes}</Text>
          </View>
        )}

        <Text style={styles.footer} fixed>
          Generated with Freeby · {brandHost()}
        </Text>
      </Page>
    </Document>
  );
}
