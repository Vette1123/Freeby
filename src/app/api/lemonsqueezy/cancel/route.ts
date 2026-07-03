// Cancel the current user's Lemon Squeezy subscription at period end.
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { requireSession } from "@/lib/get-session";
import {
  cancelSubscription,
  LemonSqueezyError,
} from "@/lib/lemonsqueezy/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await requireSession();

  const rows = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, session.user.id))
    .limit(1);

  const sub = rows[0];
  if (!sub?.lsSubscriptionId) {
    return NextResponse.json(
      { error: "No active subscription to cancel." },
      { status: 404 },
    );
  }

  try {
    await cancelSubscription(sub.lsSubscriptionId);
    await db
      .update(subscription)
      .set({ cancelAtPeriodEnd: true })
      .where(eq(subscription.id, sub.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof LemonSqueezyError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[ls-cancel]", err);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    );
  }
}
