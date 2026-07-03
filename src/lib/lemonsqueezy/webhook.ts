// Lemon Squeezy webhook signature verification + event processing.
//
// L.S. signs webhook payloads with HMAC-SHA256 using the webhook signing
// secret. The signature is sent in the `X-Signature` header as a hex string.
// Reference: https://docs.lemonsqueezy.com/api/webhooks#signing-requests
//
// We extract a tiny typed shape from the JSON:API payload — only the fields we
// use — to avoid coupling to L.S.'s full attribute surface.
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription, user } from "@/lib/db/schema";
import { ids } from "@/lib/ids";
import { mapLsStatus, type SubscriptionStatus } from "@/lib/subscription-types";

/** Verify the HMAC-SHA256 signature of a raw webhook body. */
export function verifyLsSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;

  // L.S. sends the signature as a hex digest of the raw body.
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");

  // Guard against length-mismatch before timingSafeEqual.
  if (digest.length !== signatureHeader.length) return false;

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

/** The L.S. webhook event name (the `meta.event_name` field). */
export type LsEvent =
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_expired"
  | "subscription_resumed"
  | "subscription_paused"
  | "subscription_unpaused"
  | "order_created";

/** The minimal shape we read from a subscription webhook payload. */
export interface LsSubscriptionPayload {
  data: {
    id: string; // L.S. subscription id
    attributes: {
      status: string;
      product_id?: string;
      variant_id?: string | number;
      customer_id: string; // L.S. customer id (string)
      order_id?: string | number;
      renews_at?: string | null;
      ends_at?: string | null;
      cancelled?: boolean;
      user_email?: string;
      user_name?: string;
      urls?: {
        update_payment_method?: string;
      };
    };
  };
  meta: {
    event_name: LsEvent;
    custom_data?: {
      user_id?: string;
    };
  };
}

/**
 * Determine which of our users this payload belongs to. We look up by our
 * `user_id` in custom_data first (set at checkout), then fall back to the L.S.
 * customer id stored on existing subscription rows.
 */
async function resolveUserId(payload: LsSubscriptionPayload): Promise<{
  userId: string | null;
}> {
  const customUserId = payload.meta.custom_data?.user_id;
  if (customUserId) return { userId: customUserId };

  const lsCustomerId = String(payload.data.attributes.customer_id);
  if (!lsCustomerId) return { userId: null };

  const existing = await db
    .select({ userId: subscription.userId })
    .from(subscription)
    .where(eq(subscription.lsCustomerId, lsCustomerId))
    .limit(1);
  return { userId: existing[0]?.userId ?? null };
}

/**
 * Persist a subscription webhook event into our `subscription` table.
 * Idempotent: upsert keyed on the L.S. subscription id.
 */
export async function processSubscriptionEvent(
  payload: LsSubscriptionPayload,
): Promise<void> {
  const lsSubId = payload.data.id;
  const attrs = payload.data.attributes;
  const { userId } = await resolveUserId(payload);
  if (!userId) {
    // We can't attribute this purchase to any user. This happens when a user
    // checks out without our custom_data (e.g. bought from a raw L.S. link).
    // Drop silently — there's nothing to attach to.
    return;
  }

  const lsCustomerId = String(attrs.customer_id);
  const { status } = mapLsStatus(attrs.status);
  const plan: "pro" | "free" = status === "free" ? "free" : "pro";
  const variantId =
    attrs.variant_id != null ? String(attrs.variant_id) : null;
  const lsOrderId =
    attrs.order_id != null ? String(attrs.order_id) : null;
  const currentPeriodEnd = attrs.renews_at
    ? new Date(attrs.renews_at)
    : attrs.ends_at
      ? new Date(attrs.ends_at)
      : null;

  // Link the user row to the L.S. customer id for portal/lookup later.
  await db
    .update(user)
    .set({ lemonsqueezyCustomerId: lsCustomerId })
    .where(eq(user.id, userId));

  // Upsert subscription row keyed on lsSubscriptionId (unique).
  const existing = await db
    .select()
    .from(subscription)
    .where(eq(subscription.lsSubscriptionId, lsSubId))
    .limit(1);

  const internalStatus: SubscriptionStatus = status;
  const values = {
    userId,
    lsCustomerId,
    lsSubscriptionId: lsSubId,
    lsOrderId,
    status: internalStatus,
    plan,
    variantId,
    currentPeriodEnd,
    cancelAtPeriodEnd: Boolean(attrs.cancelled),
  };

  if (existing[0]) {
    await db
      .update(subscription)
      .set(values)
      .where(eq(subscription.id, existing[0].id));
  } else {
    await db.insert(subscription).values({
      id: ids.subscription(),
      ...values,
    });
  }
}

/**
 * Top-level webhook dispatcher. Routes an event name to its handler.
 * Returns the event name so the route can log/ack appropriately.
 */
export async function handleLsWebhookEvent(
  payload: LsSubscriptionPayload,
): Promise<LsEvent> {
  const event = payload.meta.event_name;
  switch (event) {
    case "subscription_created":
    case "subscription_updated":
    case "subscription_cancelled":
    case "subscription_expired":
    case "subscription_resumed":
    case "subscription_paused":
    case "subscription_unpaused":
      await processSubscriptionEvent(payload);
      break;
    case "order_created":
      // One-time orders (if we add them later) — ignored for Phase 1.
      break;
    default:
      // Unknown event — acknowledge but take no action.
      break;
  }
  return event;
}
