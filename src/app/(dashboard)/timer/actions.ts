"use server";
import { revalidatePath } from "next/cache";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { project, timeEntry } from "@/lib/db/schema";
import { ids } from "@/lib/ids";
import { fail, ok, requireUser, type ActionResult } from "@/lib/actions";
import { timeEntrySchema } from "@/lib/validations/freeby";

export async function getTimerData() {
  const { userId } = await requireUser();
  const projects = await db.query.project.findMany({
    where: and(eq(project.userId, userId), eq(project.status, "active")),
    with: { client: true },
  });
  const entries = await db.query.timeEntry.findMany({
    where: eq(timeEntry.userId, userId),
    with: { project: { with: { client: true } } },
    orderBy: [desc(timeEntry.startedAt)],
    limit: 50,
  });
  return { projects, entries };
}

export async function saveTimeEntry(
  input: {
    projectId: string;
    description: string;
    durationMs: number;
    startedAt: Date;
    endedAt: Date;
  },
): Promise<ActionResult<{ id: string }>> {
  const { userId } = await requireUser();
  const parsed = timeEntrySchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid entry.");
  }

  const id = ids.timeEntry();
  await db.insert(timeEntry).values({
    id,
    userId,
    projectId: parsed.data.projectId,
    description: parsed.data.description || null,
    durationMs: parsed.data.durationMs,
    startedAt: parsed.data.startedAt,
    endedAt: parsed.data.endedAt,
  });
  revalidatePath("/timer");
  revalidatePath("/dashboard");
  return ok({ id });
}

export async function deleteTimeEntry(id: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  await db
    .delete(timeEntry)
    .where(and(eq(timeEntry.id, id), eq(timeEntry.userId, userId)));
  revalidatePath("/timer");
  revalidatePath("/dashboard");
  return ok(undefined);
}
