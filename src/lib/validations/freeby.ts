// Zod validation schemas for Freeby domain features.
//
// Mirrors the pattern in validations/auth.ts: named `*Schema` constants +
// co-located `*Input` inferred types. Money/numeric values are kept as strings
// to avoid float drift (see lib/money.ts).
import { z } from "zod";

const moneyString = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d{1,4})?$/, "Enter a valid amount");

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export const clientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")),
  company: z.string().trim().max(120).optional(),
  address: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type ClientInput = z.infer<typeof clientSchema>;

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projectSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  name: z.string().trim().min(1, "Name is required").max(120),
  hourlyRate: moneyString.default("0"),
  status: z.enum(["active", "archived"]).default("active"),
});
export type ProjectInput = z.infer<typeof projectSchema>;

// ---------------------------------------------------------------------------
// Time entries
// ---------------------------------------------------------------------------

export const timeEntrySchema = z.object({
  projectId: z.string().min(1, "Select a project"),
  description: z.string().trim().max(500).optional(),
  durationMs: z.number().int().positive("Duration must be positive"),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
});
export type TimeEntryInput = z.infer<typeof timeEntrySchema>;

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().trim().min(1, "Description is required").max(300),
  quantity: moneyString.default("1"),
  unitPrice: moneyString.default("0"),
});
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  taxRate: moneyString.default("0"),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;

// ---------------------------------------------------------------------------
// Settings (business profile)
// ---------------------------------------------------------------------------

export const businessProfileSchema = z.object({
  businessName: z.string().trim().max(120).optional(),
  businessAddress: z.string().trim().max(500).optional(),
  currency: z.string().trim().length(3, "Use a 3-letter currency code"),
  invoicePrefix: z
    .string()
    .trim()
    .max(8, "Max 8 characters")
    .regex(/^[A-Za-z0-9]*$/, "Letters and numbers only")
    .default("INV"),
  taxRate: moneyString.default("0"),
});
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

/** Common currencies offered in the settings dropdown. */
export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "EGP",
  "AED",
  "SAR",
  "CAD",
  "AUD",
  "JPY",
  "INR",
] as const;

/** Generic { value, label } option type used by our <Select> components. */
export interface SelectOption {
  value: string;
  label: string;
}
