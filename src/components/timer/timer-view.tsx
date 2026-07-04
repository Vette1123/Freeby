"use client";
// Connects the live TimerClock to the entries list so stopping the timer
// surfaces a new row instantly, and deleting removes instantly — both via a
// single optimistic source of truth.
import { Clock } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { TimerClock } from "@/components/timer/timer-clock";
import { TimerEntryRow } from "@/components/timer/timer-entry-row";
import { EmptyState } from "@/components/shared/empty-state";
import { useOptimisticList } from "@/hooks/use-optimistic-list";
import type { SelectOption } from "@/lib/validations/freeby";
import { Clock as ClockIcon } from "lucide-react";

export interface TimerEntry {
  id: string;
  projectName: string;
  clientName?: string;
  description: string;
  date: string;
  duration: string;
  earned: string | null;
}

export function TimerView({
  projects,
  hasProjects,
  entries,
  totalMsToday,
}: {
  projects: SelectOption[];
  hasProjects: boolean;
  entries: TimerEntry[];
  totalMsToday: number;
}) {
  const { items, updateOptimistic } = useOptimisticList(entries);

  return (
    <>
      <TimerClock
        projects={projects}
        hasProjects={hasProjects}
        onEntrySaved={(entry) => updateOptimistic({ op: "add", data: entry })}
      />

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
          <h2 className="font-heading text-sm font-semibold">Recent entries</h2>
          {items.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {items.length} total
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={ClockIcon}
            title="No time tracked yet"
            description="Start the timer above to log your first work session."
          />
        ) : (
          <div className="space-y-1.5">
            {items.map((e) => (
              <TimerEntryRow
                key={e.id}
                id={e.id}
                projectName={e.projectName}
                clientName={e.clientName}
                description={e.description}
                date={e.date}
                duration={e.duration}
                earned={e.earned}
                onDeleted={(id) => updateOptimistic({ op: "delete", id })}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
