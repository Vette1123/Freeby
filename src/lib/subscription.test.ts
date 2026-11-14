import { describe, it, expect } from "vitest";
import {
  mapLsStatus,
  LIMITS,
  showsBranding,
  deriveEntitlement,
  ACTIVE_STATUSES,
} from "./subscription-types";

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

    it("paused in free mode keeps Pro; void mode and no mode do not", () => {
      expect(mapLsStatus("paused", "free")).toEqual({ status: "active", isActive: true });
      expect(mapLsStatus("paused", "void").isActive).toBe(false);
      expect(mapLsStatus("paused").isActive).toBe(false);
      expect(mapLsStatus("active", "void").isActive).toBe(true);
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

  describe("showsBranding", () => {
    it("brands free invoices", () => {
      expect(showsBranding({ plan: "free", isActive: false })).toBe(true);
    });
    it("removes branding for active Pro", () => {
      expect(showsBranding({ plan: "pro", isActive: true })).toBe(false);
    });
    it("brands again once Pro lapses", () => {
      expect(showsBranding({ plan: "pro", isActive: false })).toBe(true);
    });
  });

  describe("deriveEntitlement", () => {
    const now = new Date("2026-11-11T12:00:00Z");
    const later = new Date("2026-12-11T12:00:00Z");
    const earlier = new Date("2026-10-11T12:00:00Z");
    const row = (status: Parameters<typeof deriveEntitlement>[0]["status"], end: Date | null) => ({
      plan: "pro",
      status,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: end,
    });

    it("active Pro gets Pro limits", () => {
      const e = deriveEntitlement(row("active", later), now);
      expect(e.plan).toBe("pro");
      expect(LIMITS[e.plan].maxClients).toBe(Infinity);
    });

    it("expired Pro falls back to Free limits", () => {
      const e = deriveEntitlement(row("expired", earlier), now);
      expect(e.plan).toBe("free");
      expect(e.isActive).toBe(false);
      expect(LIMITS[e.plan].maxInvoicesPerMonth).toBe(3);
    });

    it("cancelled Pro keeps access until the paid period ends", () => {
      const e = deriveEntitlement(row("canceled", later), now);
      expect(e.plan).toBe("pro");
      expect(e.isActive).toBe(true);
      expect(e.cancelAtPeriodEnd).toBe(true);
    });

    it("cancelled Pro past its period end is Free", () => {
      expect(deriveEntitlement(row("canceled", earlier), now).plan).toBe("free");
    });

    it("paused Pro is Free", () => {
      expect(deriveEntitlement(row("paused", later), now).plan).toBe("free");
    });
  });

  describe("status sources agree", () => {
    it("mapLsStatus.isActive matches ACTIVE_STATUSES for every Lemon Squeezy status", () => {
      for (const ls of [
        "active",
        "on_trial",
        "past_due",
        "unpaid",
        "paused",
        "cancelled",
        "cancelled_immediately",
        "expired",
      ]) {
        const r = mapLsStatus(ls);
        expect(ACTIVE_STATUSES.includes(r.status), ls).toBe(r.isActive);
      }
    });

    it("past_due Pro keeps access during the payment retry", () => {
      const e = deriveEntitlement(
        {
          plan: "pro",
          status: "past_due",
          cancelAtPeriodEnd: false,
          currentPeriodEnd: null,
        },
        new Date(),
      );
      expect(e.plan).toBe("pro");
    });
  });
});
