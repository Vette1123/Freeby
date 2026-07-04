import {
  getProjects,
  getProjectClientOptions,
  updateProjectStatus,
  deleteProject,
} from "./actions";
import { ProjectsView } from "@/components/projects/projects-view";

export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([
    getProjects(),
    getProjectClientOptions(),
  ]);

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));

  return (
    <ProjectsView
      clientOptions={clientOptions}
      hasClients={clients.length > 0}
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        clientName: p.client?.name ?? null,
        hourlyRate: String(p.hourlyRate),
        totalMs: p.totalMs,
        status: p.status as "active" | "archived",
      }))}
      toggleStatus={updateProjectStatus}
      remove={deleteProject}
    />
  );
}
