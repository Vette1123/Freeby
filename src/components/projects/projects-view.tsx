"use client";
// Projects grid with optimistic archive / delete / create.
import { FolderKanban } from "lucide-react";
import { useOptimisticList } from "@/hooks/use-optimistic-list";
import { formatMoney } from "@/lib/money";
import { formatDuration } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  ProjectFormDialog,
  type CreatedProject,
} from "@/components/projects/project-form-dialog";
import { ProjectRowActions } from "@/components/projects/project-row-actions";
import type { ActionResult } from "@/lib/actions";

export interface ProjectItem {
  id: string;
  name: string;
  clientName: string | null;
  hourlyRate: string;
  totalMs: number;
  status: "active" | "archived";
}

type ToggleFn = (
  id: string,
  status: "active" | "archived",
) => Promise<ActionResult>;
type RemoveFn = (id: string) => Promise<ActionResult>;

export function ProjectsView({
  projects,
  clientOptions,
  hasClients,
  toggleStatus,
  remove,
}: {
  projects: ProjectItem[];
  clientOptions: { value: string; label: string }[];
  hasClients: boolean;
  toggleStatus: ToggleFn;
  remove: RemoveFn;
}) {
  const { items, updateOptimistic } = useOptimisticList(projects);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Group tracked time by client and set hourly rates for billing."
        actions={
          <ProjectFormDialog
            clients={clientOptions}
            onCreated={(p: CreatedProject) =>
              updateOptimistic({
                op: "add",
                data: { ...p, clientName: p.clientName ?? null, totalMs: 0 },
              })
            }
          />
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            !hasClients
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
          {items.map((p) => (
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
                    {p.clientName ?? "—"}
                  </p>
                </div>
                <ProjectRowActions
                  projectId={p.id}
                  status={p.status}
                  actions={{ toggleStatus, remove }}
                  onToggled={(id, next) =>
                    updateOptimistic({
                      op: "update",
                      id,
                      data: { status: next },
                    })
                  }
                  onDeleted={(id) => updateOptimistic({ op: "delete", id })}
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
