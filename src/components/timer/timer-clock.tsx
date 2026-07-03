"use client";
// The live timer. Keeps a running session in component state + localStorage so
// a refresh doesn't lose an in-progress entry. On "Stop" it persists to the DB
// via a server action and clears local state.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveTimeEntry } from "@/app/(dashboard)/timer/actions";
import type { SelectOption } from "@/lib/validations/freeby";
import { formatStopwatch, formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "freeby:active-timer";

interface ActiveTimerState {
  projectId: string;
  description: string;
  startedAt: number; // epoch ms
}

export function TimerClock({
  projects,
  hasProjects,
}: {
  projects: SelectOption[];
  hasProjects: boolean;
}) {
  const router = useRouter();

  // Lazy-initialise from localStorage so we avoid a setState-in-effect on mount.
  const [initial] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ActiveTimerState;
      // Don't restore stale timers older than 24h.
      if (Date.now() - parsed.startedAt >= 24 * 3600 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [active, setActive] = useState<ActiveTimerState | null>(initial);
  const [elapsed, setElapsed] = useState(() =>
    initial ? Date.now() - initial.startedAt : 0,
  );
  const [projectId, setProjectId] = useState(
    initial?.projectId ?? projects[0]?.value ?? "",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick while running.
  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const update = () =>
      setElapsed(Date.now() - (active?.startedAt ?? Date.now()));
    update();
    intervalRef.current = setInterval(update, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  function start() {
    if (!projectId) {
      toast.error("Select a project first.");
      return;
    }
    const state: ActiveTimerState = {
      projectId,
      description,
      startedAt: Date.now(),
    };
    setActive(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async function stop() {
    if (!active) return;
    setSaving(true);
    const res = await saveTimeEntry({
      projectId: active.projectId,
      description: active.description,
      durationMs: Date.now() - active.startedAt,
      startedAt: new Date(active.startedAt),
      endedAt: new Date(),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Time entry saved.");
    setActive(null);
    setDescription("");
    localStorage.removeItem(STORAGE_KEY);
    router.refresh();
  }

  const display = active ? formatStopwatch(elapsed) : "00:00:00";

  return (
    <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
      {/* Stopwatch display */}
      <div
        className={cn(
          "text-center font-heading text-6xl font-semibold tabular-nums tracking-tight transition-colors sm:text-7xl",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        {display}
      </div>

      {/* Controls */}
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            options={projects}
            placeholder={hasProjects ? "Select project" : "No projects yet"}
            value={active ? active.projectId : projectId}
            disabled={!hasProjects || !!active}
            onChange={(e) => setProjectId(e.target.value)}
          />
          <Input
            placeholder="What are you working on?"
            value={active ? active.description : description}
            disabled={!!active}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {active ? (
          <Button
            variant="destructive"
            size="lg"
            onClick={stop}
            disabled={saving}
            className="h-10 px-6"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Square className="size-4 fill-current" />
            )}
            Stop
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={start}
            disabled={!hasProjects || !projectId}
            className="h-10 px-6"
          >
            <Play className="size-4 fill-current" />
            Start
          </Button>
        )}
      </div>

      {active && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Started {new Date(active.startedAt).toLocaleTimeString()} — running
          for {formatDuration(elapsed)}
        </p>
      )}
    </div>
  );
}
