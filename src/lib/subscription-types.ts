// Pure subscription types + helpers with no DB dependency.
// Separated from subscription.ts so they can be unit-tested in isolation
// without loading the database module.

export type Plan = "free" | "pro";
export type SubscriptionStatus =
  | "free"
  | "active"
  | "on_trial"
  | "past_due"
  | "canceled"
  | "expired"
  | "paused";

export interface Entitlement {
  plan: Plan;
  status: SubscriptionStatus;
  /** True when the user should get Pro features right now. */
  isActive: boolean;
  /** True if the subscription is set to cancel at period end but still active. */
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
}

/** Plan limits used for gating. */
export const LIMITS = {
  free: { maxClients: 1, maxInvoicesPerMonth: 3 },
  pro: { maxClients: Infinity, maxInvoicesPerMonth: Infinity },
} as const;

/** Active subscription statuses that grant Pro access. */
export const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "on_trial"];

/** Map a Lemon Squeezy subscription status to our internal status. */
export function mapLsStatus(
  lsStatus: string,
): { status: SubscriptionStatus; isActive: boolean } {
  switch (lsStatus) {
    case "active":
      return { status: "active", isActive: true };
    case "on_trial":
      return { status: "on_trial", isActive: true };
    case "past_due":
      return { status: "past_due", isActive: true }; // grace period
    case "paused":
      return { status: "paused", isActive: false };
    case "cancelled":
    case "cancelled_immediately":
      return { status: "canceled", isActive: false };
    case "expired":
      return { status: "expired", isActive: false };
    default:
      return { status: "free", isActive: false };
  }
}
