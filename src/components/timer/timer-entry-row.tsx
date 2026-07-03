"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTimeEntry } from "@/app/(dashboard)/timer/actions";
import { Button } from "@/components/ui/button";

export function TimerEntryRow({
  id,
  projectName,
  clientName,
  description,
  date,
  duration,
  earned,
}: {
  id: string;
  projectName: string;
  clientName?: string;
  description: string;
  date: string;
  duration: string;
  earned: string | null;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteTimeEntry(id);
    setDeleting(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Entry deleted.");
    router.refresh();
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg bg-card px-3 py-2.5 ring-1 ring-foreground/10">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Clock className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {description || projectName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {description ? `${projectName}` : clientName}
          {clientName && description ? ` · ${clientName}` : ""} · {date}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {earned && (
          <span className="hidden text-sm font-medium tabular-nums text-muted-foreground sm:inline">
            {earned}
          </span>
        )}
        <span className="text-sm font-semibold tabular-nums">{duration}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete entry"
        >
          {deleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
