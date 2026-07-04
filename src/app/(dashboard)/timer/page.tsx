import { getTimerData } from "./actions";
import { formatDuration, formatDate, msToHours } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/shared/page-header";
import { TimerView } from "@/components/timer/timer-view";

export default async function TimerPage() {
  const { projects, entries } = await getTimerData();

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.client ? `${p.name} · ${p.client.name}` : p.name,
  }));

  const totalMsToday = entries
    .filter((e) => {
      const d = new Date(e.startedAt);
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, e) => s + e.durationMs, 0);

  const entryRows = entries.map((e) => {
    const rate = Number(e.project?.hourlyRate ?? 0);
    const hours = Number(msToHours(e.durationMs));
    const earned = (hours * rate).toFixed(2);
    return {
      id: e.id,
      projectName: e.project?.name ?? "—",
      clientName: e.project?.client?.name,
      description: e.description ?? "",
      date: formatDate(e.startedAt),
      duration: formatDuration(e.durationMs),
      earned: rate > 0 ? formatMoney(earned) : null,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timer"
        description="Track time against projects. Saved entries are ready to invoice."
      />

      <TimerView
        projects={projectOptions}
        hasProjects={projects.length > 0}
        entries={entryRows}
        totalMsToday={totalMsToday}
      />
    </div>
  );
}
