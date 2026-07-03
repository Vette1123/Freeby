// Server-action helpers shared across all Freeby CRUD actions.
//
// Convention (introduced for Freeby): all mutations are Next.js server actions
// in `app/(dashboard)/<feature>/actions.ts`, each returning a typed result.
// This keeps a clean server/client boundary and works great with the Neon
// serverless driver. Auth is enforced via requireSession().
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { client, invoice } from "@/lib/db/schema";
import { getEntitlement, LIMITS, type Entitlement } from "@/lib/subscription";

/** A discriminated result every action returns. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}
export function fail(
  error: string,
  fieldErrors?: Record<string, string>,
): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/**
 * Resolve the current user+entitlement inside a server action. Throws on
 * unauthenticated so the action bails before any DB work.
 */
export async function requireUser(): Promise<{
  userId: string;
  email: string;
  entitlement: Entitlement;
}> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("UNAUTHORIZED");
  const entitlement = await getEntitlement(session.user.id);
  return { userId: session.user.id, email: session.user.email, entitlement };
}

/** Count a user's clients (used for the free-tier client limit). */
export async function countClients(userId: string): Promise<number> {
  const rows = await db
    .select({ id: client.id })
    .from(client)
    .where(eq(client.userId, userId));
  return rows.length;
}

/** Count invoices issued this calendar month (for the free-tier limit). */
export async function countInvoicesThisMonth(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const rows = await db
    .select({ createdAt: invoice.createdAt })
    .from(invoice)
    .where(eq(invoice.userId, userId));
  return rows.filter((r) => new Date(r.createdAt) >= startOfMonth).length;
}

/**
 * Enforce the free-tier client limit. Returns null if allowed, or an error
 * message string if the limit is exceeded.
 */
export async function enforceClientLimit(
  entitlement: Entitlement,
  userId: string,
): Promise<string | null> {
  const limit = LIMITS[entitlement.plan].maxClients;
  if (limit === Infinity) return null;
  const count = await countClients(userId);
  if (count >= limit) {
    return `The Free plan allows ${limit} client. Upgrade to Pro for unlimited clients.`;
  }
  return null;
}
