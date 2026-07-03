import { Clock } from "lucide-react";
import { getTimerData } from "./actions";
import { formatDuration, formatDate, msToHours } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TimerClock } from "@/components/timer/timer-clock";
import { TimerEntryRow } from "@/components/timer/timer-entry-row";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timer"
        description="Track time against projects. Saved entries are ready to invoice."
      />

      <TimerClock projects={projectOptions} hasProjects={projects.length > 0} />

      {totalMsToday > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Clock className="size-4 text-primary" />
          <span className="text-muted-foreground">Today:</span>
          <span className="font-semibold tabular-nums">
            {formatDuration(totalMsToday)}
          </span>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold">
            Recent entries
          </h2>
          {entries.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {entries.length} total
            </span>
          )}
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No time tracked yet"
            description="Start the timer above to log your first work session."
          />
        ) : (
          <div className="space-y-1.5">
            {entries.map((e) => {
              const rate = Number(e.project?.hourlyRate ?? 0);
              const hours = Number(msToHours(e.durationMs));
              const earned = (hours * rate).toFixed(2);
              return (
                <TimerEntryRow
                  key={e.id}
                  id={e.id}
                  projectName={e.project?.name ?? "—"}
                  clientName={e.project?.client?.name}
                  description={e.description ?? ""}
                  date={formatDate(e.startedAt)}
                  duration={formatDuration(e.durationMs)}
                  earned={rate > 0 ? formatMoney(earned) : null}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
