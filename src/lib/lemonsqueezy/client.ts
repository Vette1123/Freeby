// Lemon Squeezy REST client (typed, dependency-free).
//
// We talk to the L.S. API directly via fetch rather than pulling in an SDK —
// fewer deps, full control, and L.S.'s REST is straightforward.
//
// Docs: https://docs.lemonsqueezy.com/api
//
// The API is JSON:API shaped: { data: {...}, included: [...] }. We only consume
// the fields we need and type them loosely to avoid coupling to every detail.
import { env } from "@/env";

const API_BASE = "https://api.lemonsqueezy.com/v1";

export class LemonSqueezyError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "LemonSqueezyError";
  }
}

function assertConfigured(): void {
  if (!env.LEMONSQUEEZY_API_KEY) {
    throw new LemonSqueezyError(
      "LEMONSQUEEZY_API_KEY is not set. Configure billing env vars to enable checkout.",
      500,
    );
  }
}

interface ApiResponse<T> {
  data: T;
  included?: T[];
}

async function lsFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  assertConfigured();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`,
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new LemonSqueezyError(
      `Lemon Squeezy API error (${res.status}): ${body.slice(0, 300)}`,
      res.status,
    );
  }

  // Some endpoints (e.g. POST /checkouts) return the resource directly.
  const json = (await res.json()) as ApiResponse<T> | T;
  if (
    json &&
    typeof json === "object" &&
    ("data" in json || "included" in json)
  ) {
    return json as ApiResponse<T>;
  }
  return { data: json as T };
}

export interface LsCheckoutAttributes {
  url: string;
}

/**
 * Create a L.S. checkout and return the hosted checkout URL.
 *
 * L.S. checkouts are created per-variant. We pass a `checkout_data` object with
 * `custom` user metadata so the webhook can map the purchase back to our user.
 * `email` is pre-filled when known so the customer has less to type.
 *
 * Reference: https://docs.lemonsqueezy.com/api/checkouts#create-a-checkout
 */
export async function createCheckout(opts: {
  variantId: string;
  userId: string;
  userEmail: string;
  embed?: boolean;
}): Promise<string> {
  if (!env.LEMONSQUEEZY_STORE_ID) {
    throw new LemonSqueezyError(
      "LEMONSQUEEZY_STORE_ID is not set.",
      500,
    );
  }

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        // L.S. needs the store relationship at the top level for checkout creation.
        product_options: {
          redirect_url: `${env.NEXT_PUBLIC_APP_URL}/billing?upgraded=1`,
          receipt_link_url: `${env.NEXT_PUBLIC_APP_URL}/billing`,
          receipt_thank_you_note: "Thanks for upgrading to Freeby Pro!",
        },
        checkout_options: {
          embed: opts.embed ?? false,
          dark: false,
        },
        checkout_data: {
          email: opts.userEmail,
          custom: {
            user_id: opts.userId,
          },
          // L.S. will create a variant-switchable subscription from the variant.
        },
        preview: false,
      },
      relationships: {
        store: {
          data: {
            type: "stores",
            id: env.LEMONSQUEEZY_STORE_ID,
          },
        },
        variant: {
          data: {
            type: "variants",
            id: opts.variantId,
          },
        },
      },
    },
  };

  const { data } = await lsFetch<{
    id: string;
    attributes: LsCheckoutAttributes;
  }>("/checkouts", { method: "POST", body: JSON.stringify(body) });

  return data.attributes.url;
}

/**
 * Generate a "customer portal" / billing-management URL for a user.
 *
 * L.S. exposes per-customer management via the customer's "Update payment method"
 * link. If we only have a customer id, we return the L.S. customer portal URL.
 * For Phase 1 we link to the L.S. customer portal; full portal API generation
 * can be added later.
 */
export async function createCustomerPortalUrl(): Promise<string> {
  // L.S. customer portal: https://[store].lemonsqueezy.com/my-orders?customer_id=...
  // The simplest stable approach is the customer's hosted order management page.
  if (!env.LEMONSQUEEZY_STORE_ID) {
    throw new LemonSqueezyError("LEMONSQUEEZY_STORE_ID is not set.", 500);
  }
  return `https://app.lemonsqueezy.com/my-orders`;
}

/**
 * Cancel a subscription at period end via the L.S. API.
 * Reference: https://docs.lemonsqueezy.com/api/subscriptions#cancel-a-subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<void> {
  await lsFetch(`/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: {
        type: "subscriptions",
        id: subscriptionId,
        attributes: {
          cancelled: true,
        },
      },
    }),
  });
}
