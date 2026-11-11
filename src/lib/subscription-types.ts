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

/**
 * Free invoices carry the Freeby name; an active Pro plan removes it, as the
 * pricing page promises.
 */
export function showsBranding(e: Pick<Entitlement, "plan" | "isActive">): boolean {
  return !(e.plan === "pro" && e.isActive);
}

/** Active subscription statuses that grant Pro access. */
export const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "on_trial"];

/**
 * Turn a stored subscription row into what the user gets right now. The
 * webhook stores plan "pro" for every paid status, including expired, so
 * `plan` here is the *effective* plan: Pro only while access is live. A
 * cancelled subscription keeps access until the paid period ends, as Lemon
 * Squeezy does (it moves to "expired" at ends_at).
 */
export function deriveEntitlement(
  row: {
    plan: string;
    status: SubscriptionStatus;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date | null;
  },
  now: Date,
): Entitlement {
  const inPaidPeriod =
    row.status === "canceled" &&
    row.currentPeriodEnd !== null &&
    row.currentPeriodEnd > now;
  const isActive =
    row.plan === "pro" && (ACTIVE_STATUSES.includes(row.status) || inPaidPeriod);
  return {
    plan: isActive ? "pro" : "free",
    status: row.status,
    isActive,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd || inPaidPeriod,
    currentPeriodEnd: row.currentPeriodEnd,
  };
}

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
