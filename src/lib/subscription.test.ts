import { describe, it, expect } from "vitest";
import { mapLsStatus, LIMITS } from "./subscription-types";

describe("subscription", () => {
  describe("mapLsStatus", () => {
    it("maps active", () => {
      const r = mapLsStatus("active");
      expect(r.status).toBe("active");
      expect(r.isActive).toBe(true);
    });

    it("maps on_trial as active", () => {
      const r = mapLsStatus("on_trial");
      expect(r.isActive).toBe(true);
    });

    it("maps past_due as active (grace period)", () => {
      const r = mapLsStatus("past_due");
      expect(r.isActive).toBe(true);
    });

    it("maps expired as inactive", () => {
      const r = mapLsStatus("expired");
      expect(r.isActive).toBe(false);
      expect(r.status).toBe("expired");
    });

    it("maps cancelled as canceled", () => {
      const r = mapLsStatus("cancelled");
      expect(r.status).toBe("canceled");
      expect(r.isActive).toBe(false);
    });

    it("maps unknown statuses to free", () => {
      const r = mapLsStatus("something_random");
      expect(r.status).toBe("free");
      expect(r.isActive).toBe(false);
    });
  });

  describe("LIMITS", () => {
    it("free plan has finite limits", () => {
      expect(LIMITS.free.maxClients).toBe(1);
      expect(LIMITS.free.maxInvoicesPerMonth).toBe(3);
    });

    it("pro plan has unlimited limits", () => {
      expect(LIMITS.pro.maxClients).toBe(Infinity);
      expect(LIMITS.pro.maxInvoicesPerMonth).toBe(Infinity);
    });
  });
});
