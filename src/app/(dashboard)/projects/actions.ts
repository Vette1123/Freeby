"use server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { client, project, timeEntry } from "@/lib/db/schema";
import { ids } from "@/lib/ids";
import { fail, ok, requireUser, type ActionResult } from "@/lib/actions";
import { projectSchema } from "@/lib/validations/freeby";

export async function getProjects() {
  const { userId } = await requireUser();
  const projects = await db.query.project.findMany({
    where: eq(project.userId, userId),
    with: { client: true },
  });
  // Attach tracked time per project.
  return Promise.all(
    projects.map(async (p) => {
      const entries = await db
        .select({ durationMs: timeEntry.durationMs })
        .from(timeEntry)
        .where(eq(timeEntry.projectId, p.id));
      const totalMs = entries.reduce((s, e) => s + e.durationMs, 0);
      return { ...p, totalMs };
    }),
  );
}

export async function getProjectClientOptions() {
  const { userId } = await requireUser();
  return db.query.client.findMany({
    where: eq(client.userId, userId),
    columns: { id: true, name: true },
  });
}

export async function createProject(
  input: Parameters<typeof projectSchema.parse>[0],
): Promise<ActionResult<{ id: string }>> {
  const { userId } = await requireUser();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return fail("Please fix the errors below.", fieldErrors);
  }

  const id = ids.project();
  await db.insert(project).values({
    id,
    userId,
    clientId: parsed.data.clientId,
    name: parsed.data.name,
    hourlyRate: parsed.data.hourlyRate,
    status: parsed.data.status,
  });
  revalidatePath("/projects");
  return ok({ id });
}

export async function updateProjectStatus(
  id: string,
  status: "active" | "archived",
): Promise<ActionResult> {
  const { userId } = await requireUser();
  await db
    .update(project)
    .set({ status })
    .where(and(eq(project.id, id), eq(project.userId, userId)));
  revalidatePath("/projects");
  return ok(undefined);
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  await db
    .delete(project)
    .where(and(eq(project.id, id), eq(project.userId, userId)));
  revalidatePath("/projects");
  return ok(undefined);
}
