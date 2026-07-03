import { describe, it, expect } from "vitest";
import {
  clientSchema,
  invoiceSchema,
  businessProfileSchema,
  timeEntrySchema,
} from "./freeby";

describe("validations", () => {
  describe("clientSchema", () => {
    it("accepts a valid client", () => {
      const r = clientSchema.safeParse({
        name: "Acme",
        email: "a@b.com",
      });
      expect(r.success).toBe(true);
    });

    it("rejects missing name", () => {
      const r = clientSchema.safeParse({ name: "", email: "" });
      expect(r.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const r = clientSchema.safeParse({ name: "Acme", email: "notanemail" });
      expect(r.success).toBe(false);
    });

    it("accepts empty email string (optional)", () => {
      const r = clientSchema.safeParse({ name: "Acme", email: "" });
      expect(r.success).toBe(true);
    });
  });

  describe("invoiceSchema", () => {
    const base = {
      clientId: "cli_1",
      issueDate: new Date(),
      dueDate: new Date(),
      taxRate: "14",
    };

    it("requires at least one item", () => {
      const r = invoiceSchema.safeParse({ ...base, items: [] });
      expect(r.success).toBe(false);
    });

    it("accepts a valid invoice", () => {
      const r = invoiceSchema.safeParse({
        ...base,
        items: [{ description: "Dev work", quantity: "10", unitPrice: "75" }],
      });
      expect(r.success).toBe(true);
    });

    it("rejects items without description", () => {
      const r = invoiceSchema.safeParse({
        ...base,
        items: [{ description: "", quantity: "1", unitPrice: "50" }],
      });
      expect(r.success).toBe(false);
    });
  });

  describe("businessProfileSchema", () => {
    it("accepts a valid profile", () => {
      const r = businessProfileSchema.safeParse({
        currency: "USD",
        invoicePrefix: "INV",
        taxRate: "0",
      });
      expect(r.success).toBe(true);
    });

    it("rejects invalid currency code", () => {
      const r = businessProfileSchema.safeParse({
        currency: "DOLLAR",
        invoicePrefix: "INV",
        taxRate: "0",
      });
      expect(r.success).toBe(false);
    });

    it("rejects prefix with special chars", () => {
      const r = businessProfileSchema.safeParse({
        currency: "USD",
        invoicePrefix: "IN-V",
        taxRate: "0",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("timeEntrySchema", () => {
    it("accepts a valid entry", () => {
      const r = timeEntrySchema.safeParse({
        projectId: "prj_1",
        durationMs: 3600000,
        startedAt: new Date("2026-01-01"),
        endedAt: new Date("2026-01-01T01:00:00Z"),
      });
      expect(r.success).toBe(true);
    });

    it("rejects non-positive duration", () => {
      const r = timeEntrySchema.safeParse({
        projectId: "prj_1",
        durationMs: 0,
        startedAt: new Date(),
        endedAt: new Date(),
      });
      expect(r.success).toBe(false);
    });
  });
});
