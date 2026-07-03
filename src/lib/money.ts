// Money math for invoices.
//
// All monetary values are stored in Drizzle as `numeric` strings (e.g. "199.99")
// to avoid float drift. In app code we use decimal.js for arithmetic, and round
// to the currency's minor unit only when computing tax/totals.
//
// Conventions:
//  - Inputs/outputs of public helpers are strings (matches DB + form values).
//  - Tax rate is a percentage string, e.g. "14" for 14%, "14.5" for 14.5%.
//  - Rounding is round-half-up (RHI), the common invoice convention.
import Decimal from "decimal.js";

Decimal.set({ rounding: Decimal.ROUND_HALF_UP, precision: 28 });

export type Money = string;

/** Normalise any numeric-ish input to a trimmed string ("1.00"). */
export function toMoney(v: string | number | Decimal): string {
  if (v instanceof Decimal) return v.toFixed(2);
  return new Decimal(v || 0).toFixed(2);
}

/** Line total = quantity × unit price. */
export function lineTotal(quantity: Money, unitPrice: Money): string {
  return new Decimal(quantity || 0).times(unitPrice || 0).toFixed(2);
}

/** Sum a list of money strings. */
export function sum(values: Money[]): string {
  return values.reduce<Decimal>(
    (acc, v) => acc.plus(v || 0),
    new Decimal(0),
  ).toFixed(2);
}

/** Tax amount = subtotal × (rate / 100), rounded to cents. */
export function taxAmount(subtotal: Money, rate: Money): string {
  return new Decimal(subtotal || 0)
    .times(new Decimal(rate || 0).div(100))
    .toFixed(2);
}

export interface InvoiceTotals {
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
}

/**
 * Compute invoice totals from a set of line items.
 * `items` is an array of { quantity, unitPrice } as money strings.
 */
export function computeInvoiceTotals(
  items: { quantity: Money; unitPrice: Money }[],
  taxRate: Money,
): InvoiceTotals {
  const subtotal = sum(
    items.map((i) => lineTotal(i.quantity, i.unitPrice)),
  );
  const tax = taxAmount(subtotal, taxRate);
  const total = new Decimal(subtotal).plus(tax).toFixed(2);
  return { subtotal, taxRate: toMoney(taxRate), taxAmount: tax, total };
}

/** Format a money string for display, e.g. "1999.99" -> "$1,999.99". */
export function formatMoney(value: Money, currency = "USD"): string {
  const n = new Decimal(value || 0).toNumber();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(n);
  } catch {
    // Fallback if the currency code is invalid.
    return `${currency}\u00A0${n.toFixed(2)}`;
  }
}
