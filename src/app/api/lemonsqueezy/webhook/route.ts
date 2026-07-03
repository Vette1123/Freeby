// Lemon Squeezy webhook receiver.
//
// IMPORTANT: the raw request body must be read before any JSON parsing, because
// the signature is computed over the exact bytes L.S. sent. We therefore set
// `export const runtime` and read text() directly, then parse.
import { NextResponse } from "next/server";
import { env } from "@/env";
import {
  handleLsWebhookEvent,
  verifyLsSignature,
  type LsSubscriptionPayload,
} from "@/lib/lemonsqueezy/webhook";

export const runtime = "nodejs";
// Webhooks must be processed dynamically, never cached.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody = await req.text();

  // If the webhook secret isn't configured, we can't verify — reject.
  const secret = env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[ls-webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-signature");
  if (!verifyLsSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: LsSubscriptionPayload;
  try {
    payload = JSON.parse(rawBody) as LsSubscriptionPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const event = await handleLsWebhookEvent(payload);
    return NextResponse.json({ received: true, event });
  } catch (err) {
    console.error("[ls-webhook] processing error", err);
    // Return 500 so L.S. retries.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
