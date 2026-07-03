// Create a Lemon Squeezy checkout session and return the hosted URL.
// Called from the pricing/billing page via a POST with { plan: "monthly" | "yearly" }.
import { NextResponse } from "next/server";
import { env } from "@/env";
import { requireSession } from "@/lib/get-session";
import { createCheckout, LemonSqueezyError } from "@/lib/lemonsqueezy/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await requireSession();

  let body: { plan?: string };
  try {
    body = (await req.json()) as { plan?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const variantId =
    body.plan === "yearly"
      ? env.LEMONSQUEEZY_VARIANT_YEARLY
      : env.LEMONSQUEEZY_VARIANT_MONTHLY;

  if (!variantId) {
    return NextResponse.json(
      { error: "Billing is not configured. Contact support." },
      { status: 503 },
    );
  }

  try {
    const url = await createCheckout({
      variantId,
      userId: session.user.id,
      userEmail: session.user.email,
    });
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof LemonSqueezyError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[ls-checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 },
    );
  }
}
