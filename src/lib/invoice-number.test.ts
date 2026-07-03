import { describe, it, expect } from "vitest";
import { formatInvoiceNumber, nextInvoiceNumber } from "./invoice-number";

describe("invoice-number", () => {
  describe("formatInvoiceNumber", () => {
    it("formats with prefix and zero padding", () => {
      expect(formatInvoiceNumber("INV", 1)).toBe("INV-0001");
      expect(formatInvoiceNumber("INV", 42)).toBe("INV-0042");
      expect(formatInvoiceNumber("INV", 9999)).toBe("INV-9999");
    });

    it("uppercases and trims the prefix", () => {
      expect(formatInvoiceNumber("inv", 1)).toBe("INV-0001");
      expect(formatInvoiceNumber("  rec  ", 5)).toBe("REC-0005");
    });

    it("defaults to INV when prefix is empty", () => {
      expect(formatInvoiceNumber("", 1)).toBe("INV-0001");
      expect(formatInvoiceNumber("   ", 1)).toBe("INV-0001");
    });
  });

  describe("nextInvoiceNumber", () => {
    it("increments the counter", () => {
      expect(nextInvoiceNumber("INV", 0)).toBe("INV-0001");
      expect(nextInvoiceNumber("INV", 41)).toBe("INV-0042");
    });
  });
});
