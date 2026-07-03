import { FolderKanban } from "lucide-react";
import { getProjects, getProjectClientOptions, updateProjectStatus, deleteProject } from "./actions";
import { formatMoney } from "@/lib/money";
import { formatDuration } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { ProjectRowActions } from "@/components/projects/project-row-actions";

export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([
    getProjects(),
    getProjectClientOptions(),
  ]);

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Group tracked time by client and set hourly rates for billing."
        actions={<ProjectFormDialog clients={clientOptions} />}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            clients.length === 0
              ? "Add a client first, then create a project to start tracking time."
              : "Create a project to start tracking time against it."
          }
          action={
            <ProjectFormDialog
              clients={clientOptions}
              triggerLabel="Create project"
            />
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-heading font-semibold">
                    {p.name}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {p.client?.name ?? "—"}
                  </p>
                </div>
                <ProjectRowActions
                  projectId={p.id}
                  status={p.status as "active" | "archived"}
                  actions={{
                    toggleStatus: updateProjectStatus,
                    remove: deleteProject,
                  }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatMoney(p.hourlyRate)}
                  <span className="text-xs">/hr</span>
                </span>
                <span className="font-medium tabular-nums">
                  {formatDuration(p.totalMs)}
                </span>
              </div>

              <div className="mt-3">
                {p.status === "archived" ? (
                  <Badge variant="muted">Archived</Badge>
                ) : (
                  <Badge variant="success">Active</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
