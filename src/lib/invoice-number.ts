// Invoice number generation.
//
// Format: `<PREFIX>-<ZERO_PADDED>` — e.g. "INV-0001", "INV-0042".
// The prefix and counter live on the user row (user.invoicePrefix /
// user.invoiceCounter). The caller is responsible for incrementing the counter
// atomically; this module only renders the number from a counter value and
// ensures uniqueness by virtue of the monotonic counter.

const PAD_WIDTH = 4;

/** Render an invoice number from a prefix and a 1-based sequence value. */
export function formatInvoiceNumber(prefix: string, sequence: number): string {
  const cleanPrefix = (prefix || "INV").trim().toUpperCase() || "INV";
  return `${cleanPrefix}-${String(sequence).padStart(PAD_WIDTH, "0")}`;
}

/**
 * Compute the next invoice number for a user given their current counter.
 * The counter is the count of invoices already issued; the next sequence
 * value is counter + 1.
 */
export function nextInvoiceNumber(prefix: string, counter: number): string {
  return formatInvoiceNumber(prefix, counter + 1);
}
