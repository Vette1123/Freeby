// @ts-check
/**
 * Freeby — Lemon Squeezy setup script.
 *
 * Run:  pnpm setup
 *
 * IMPORTANT: Lemon Squeezy DEPRECATED creating products and variants via the
 * API (POST /products and POST /variants now return 405). Products and variants
 * must be created in the dashboard. This script handles everything the API
 * still allows and wires your existing product/variants into the app:
 *
 *   1. Fetches your store and writes LEMONSQUEEZY_STORE_ID.
 *   2. Lists your products + variants and maps them to monthly/yearly by
 *      billing interval, writing LEMONSQUEEZY_VARIANT_MONTHLY and
 *      LEMONSQUEEZY_VARIANT_YEARLY.
 *   3. Creates a webhook endpoint for subscription events (still supported via
 *      API) and writes LEMONSQUEEZY_WEBHOOK_SECRET.
 *
 * If you don't yet have subscription variants, this script prints exact
 * step-by-step dashboard instructions for creating them, then you re-run it.
 *
 * It is idempotent: safe to run multiple times.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ENV_PATH = resolve(ROOT, ".env");

const API = "https://api.lemonsqueezy.com/v1";

// ---------------------------------------------------------------------------
// Tiny .env parser/writer (no dependency).
// ---------------------------------------------------------------------------
function parseEnv(text) {
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    map[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return map;
}

function readEnv() {
  if (!existsSync(ENV_PATH)) return {};
  return parseEnv(readFileSync(ENV_PATH, "utf8"));
}

function upsertEnvValue(updates) {
  let text = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(text)) {
      text = text.replace(re, `${key}=${value}`);
    } else {
      text = `${text.trimEnd()}\n${key}=${value}\n`;
    }
  }
  writeFileSync(ENV_PATH, text, "utf8");
}

// ---------------------------------------------------------------------------
// LS API helpers.
// ---------------------------------------------------------------------------
async function lsFetch(path, init = {}, apiKey) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
      ...init.headers,
    },
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(
      `Lemon Squeezy API error ${res.status} on ${path}:\n${body.slice(0, 500)}`,
    );
  }
  return body ? JSON.parse(body) : null;
}

async function getStores(apiKey) {
  const json = await lsFetch("/stores", {}, apiKey);
  return json.data;
}

async function getProducts(apiKey, storeId) {
  const json = await lsFetch(
    `/products?filter[store_id]=${storeId}&per_page=100`,
    {},
    apiKey,
  );
  return json.data || [];
}

async function getVariants(apiKey, productId) {
  const json = await lsFetch(
    `/variants?filter[product_id]=${productId}&per_page=100`,
    {},
    apiKey,
  );
  return json.data || [];
}

async function createWebhook(apiKey, storeId, targetUrl, signingSecret) {
  const json = await lsFetch(
    "/webhooks",
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "webhooks",
          attributes: {
            url: targetUrl,
            secret: signingSecret,
            events: [
              "subscription_created",
              "subscription_updated",
              "subscription_cancelled",
              "subscription_expired",
              "subscription_resumed",
            ],
          },
          relationships: {
            store: { data: { type: "stores", id: String(storeId) } },
          },
        },
      }),
    },
    apiKey,
  );
  return json.data;
}

function money(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("\n  Freeby — Lemon Squeezy setup\n  ────────────────────────────\n");

  const env = readEnv();
  const apiKey = env.LEMONSQUEEZY_API_KEY;

  if (!apiKey) {
    console.error(
      "  ✗ LEMONSQUEEZY_API_KEY is not set in .env\n\n" +
        "  Get one from https://app.lemonsqueezy.com/settings/api\n" +
        '  (click "Create new API key"), then add it to .env:\n\n' +
        "    LEMONSQUEEZY_API_KEY=eyJ0eXA...\n\n" +
        "  Re-run: pnpm setup\n",
    );
    process.exit(1);
  }

  // 1. Resolve the store.
  let storeId = env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    console.log("  • No LEMONSQUEEZY_STORE_ID — fetching your stores…");
    const stores = await getStores(apiKey);
    if (!stores.length) {
      console.error(
        "  ✗ No stores found. Create a store in Lemon Squeezy first:\n" +
          "    https://app.lemonsqueezy.com/stores\n",
      );
      process.exit(1);
    }
    storeId = stores[0].id;
    console.log(`    Using store: ${stores[0].attributes.name} (${storeId})`);
  } else {
    console.log(`  • Using store from .env: ${storeId}`);
  }
  const envUpdates = { LEMONSQUEEZY_STORE_ID: String(storeId) };

  // 2. Discover products + variants. The API can no longer create these, so we
  //    map what exists and guide the user to create anything missing.
  const products = await getProducts(apiKey, storeId);

  // Collect every subscription variant across all products.
  const subVariants = [];
  for (const p of products) {
    const variants = await getVariants(apiKey, p.id);
    for (const v of variants) {
      if (v.attributes?.is_subscription) {
        subVariants.push({
          id: v.id,
          name: v.attributes.name,
          price: v.attributes.price,
          interval: v.attributes.interval,
          productName: p.attributes.name,
          productId: p.id,
        });
      }
    }
  }

  console.log(
    `  • Found ${products.length} product(s), ${subVariants.length} subscription variant(s).`,
  );

  // Prefer variants already pinned in .env; otherwise pick by interval.
  let monthly =
    env.LEMONSQUEEZY_VARIANT_MONTHLY ||
    subVariants.find((v) => v.interval === "month")?.id;
  let yearly =
    env.LEMONSQUEEZY_VARIANT_YEARLY ||
    subVariants.find((v) => v.interval === "year")?.id;

  // Print what we found.
  if (subVariants.length) {
    console.log("\n    Subscription variants available:");
    for (const v of subVariants) {
      const tag =
        v.id === monthly
          ? "  ← monthly"
          : v.id === yearly
            ? "  ← yearly"
            : "";
      console.log(
        `      • ${v.id} | ${v.productName} / ${v.name} | ${money(v.price)}/${v.interval || "—"}${tag}`,
      );
    }
  }

  if (!monthly || !yearly) {
    console.log(
      "\n  ⚠ Not enough subscription variants to wire both monthly and yearly.",
    );
    console.log(
      "    Lemon Squeezy no longer allows creating products/variants via API,\n" +
        "    so create them in the dashboard:\n\n" +
        "    1. Go to https://app.lemonsqueezy.com/products\n" +
        '    2. Click "+ New Product" → name it "Freeby Pro"\n' +
        "    3. Add a Monthly variant: $19.00, billing interval = Monthly\n" +
        "    4. Add a Yearly variant: $190.00, billing interval = Yearly\n" +
        "    5. Save, then re-run: pnpm setup\n",
    );
    // Still persist what we have so far.
    if (monthly) envUpdates.LEMONSQUEEZY_VARIANT_MONTHLY = String(monthly);
    if (yearly) envUpdates.LEMONSQUEEZY_VARIANT_YEARLY = String(yearly);
    upsertEnvValue(envUpdates);
    console.log("  ✓ Partial update written to .env. Re-run after creating variants.\n");
    process.exit(2);
  }

  envUpdates.LEMONSQUEEZY_VARIANT_MONTHLY = String(monthly);
  envUpdates.LEMONSQUEEZY_VARIANT_YEARLY = String(yearly);
  console.log(`    → Monthly variant: ${monthly}`);
  console.log(`    → Yearly variant:  ${yearly}`);

  // 3. Webhook — only for production URLs (localhost can't receive webhooks
  //    without a tunnel).
  const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${appUrl}/api/lemonsqueezy/webhook`;
  if (/^https?:\/\/localhost/.test(appUrl)) {
    console.log(
      `  • Skipping webhook creation (NEXT_PUBLIC_APP_URL is localhost).\n` +
        `    To test webhooks locally, use a tunnel (ngrok/cloudflare) and\n` +
        `    re-run with NEXT_PUBLIC_APP_URL set to the tunnel URL, or create\n` +
        `    the webhook manually in the LS dashboard.`,
    );
  } else if (env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    console.log(
      "  • LEMONSQUEEZY_WEBHOOK_SECRET already set in .env — skipping webhook creation.",
    );
  } else {
    console.log(`  • Creating webhook for ${webhookUrl}…`);
    const signingSecret = randomBytes(16).toString("hex");
    await createWebhook(apiKey, storeId, webhookUrl, signingSecret);
    envUpdates.LEMONSQUEEZY_WEBHOOK_SECRET = signingSecret;
    console.log("    Created webhook.");
  }

  // 4. Write everything back to .env.
  upsertEnvValue(envUpdates);

  console.log("\n  ✓ Done. Updated .env with:\n");
  for (const [k, v] of Object.entries(envUpdates)) {
    console.log(`    ${k}=${v}`);
  }
  console.log("\n  Next: pnpm db:push && pnpm dev\n");
}

main().catch((err) => {
  console.error("\n  ✗ Setup failed:\n");
  console.error(err.message || err);
  process.exit(1);
});
