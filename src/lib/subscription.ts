// Subscription state + freemium gating.
//
// Source of truth is the `subscription` table, synced from Lemon Squeezy
// webhooks (see src/lib/lemonsqueezy/webhook.ts). This module reads it and
// exposes a single `getEntitlement(userId)` used by server actions and pages.
//
// Pure types/helpers live in subscription-types.ts (no DB import) so they can
// be unit-tested in isolation.
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import {
  deriveEntitlement,
  type Entitlement,
  type Plan,
  type SubscriptionStatus,
} from "@/lib/subscription-types";

export type { Entitlement, Plan, SubscriptionStatus };
export { LIMITS, mapLsStatus, showsBranding } from "@/lib/subscription-types";

const FREE_DEFAULT: Entitlement = {
  plan: "free",
  status: "free",
  isActive: false,
  cancelAtPeriodEnd: false,
  currentPeriodEnd: null,
};

/**
 * Read a user's entitlement from the DB. Returns the free entitlement if the
 * user has no subscription row yet (every user starts free).
 */
export async function getEntitlement(userId: string): Promise<Entitlement> {
  const rows = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);
  const row = rows[0];
  if (!row) return FREE_DEFAULT;

  return deriveEntitlement(
    {
      plan: row.plan,
      status: row.status as SubscriptionStatus,
      cancelAtPeriodEnd: row.cancelAtPeriodEnd ?? false,
      currentPeriodEnd: row.currentPeriodEnd
        ? new Date(row.currentPeriodEnd)
        : null,
    },
    new Date(),
  );
}
