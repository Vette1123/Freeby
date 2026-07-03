import { describe, it, expect } from "vitest";
import {
  lineTotal,
  sum,
  taxAmount,
  computeInvoiceTotals,
  toMoney,
  formatMoney,
} from "./money";

describe("money", () => {
  describe("lineTotal", () => {
    it("multiplies quantity by unit price", () => {
      expect(lineTotal("2", "50")).toBe("100.00");
      expect(lineTotal("1.5", "40")).toBe("60.00");
      expect(lineTotal("0", "100")).toBe("0.00");
    });

    it("handles decimal quantities", () => {
      expect(lineTotal("2.5", "75.50")).toBe("188.75");
    });
  });

  describe("sum", () => {
    it("adds money strings", () => {
      expect(sum(["100.00", "50.50", "25.25"])).toBe("175.75");
    });

    it("handles empty array", () => {
      expect(sum([])).toBe("0.00");
    });
  });

  describe("taxAmount", () => {
    it("computes percentage rounded to cents", () => {
      expect(taxAmount("100", "14")).toBe("14.00");
      expect(taxAmount("199.99", "10")).toBe("20.00");
    });

    it("handles zero rate", () => {
      expect(taxAmount("100", "0")).toBe("0.00");
    });
  });

  describe("computeInvoiceTotals", () => {
    it("computes subtotal, tax, and total from line items", () => {
      const totals = computeInvoiceTotals(
        [
          { quantity: "2", unitPrice: "50" },
          { quantity: "1", unitPrice: "100" },
        ],
        "10",
      );
      expect(totals.subtotal).toBe("200.00");
      expect(totals.taxAmount).toBe("20.00");
      expect(totals.total).toBe("220.00");
    });

    it("handles empty items", () => {
      const totals = computeInvoiceTotals([], "14");
      expect(totals.subtotal).toBe("0.00");
      expect(totals.taxAmount).toBe("0.00");
      expect(totals.total).toBe("0.00");
    });
  });

  describe("toMoney", () => {
    it("normalises to 2 decimal places", () => {
      expect(toMoney("100")).toBe("100.00");
      expect(toMoney(50.5)).toBe("50.50");
    });
  });

  describe("formatMoney", () => {
    it("formats with currency symbol", () => {
      const formatted = formatMoney("1999.99", "USD");
      expect(formatted).toMatch(/1,999\.99/);
    });

    it("falls back gracefully for invalid currency", () => {
      expect(formatMoney("100", "XYZ")).toMatch(/XYZ[\s\u00A0]100\.00/);
    });
  });
});
