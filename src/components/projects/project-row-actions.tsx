"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAsyncAction } from "@/hooks/use-async-action";
import type { ActionResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Modal,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/dialog";

type Actions = {
  toggleStatus: (
    id: string,
    status: "active" | "archived",
  ) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
};

export function ProjectRowActions({
  projectId,
  status,
  actions,
  onToggled,
  onDeleted,
}: {
  projectId: string;
  status: "active" | "archived";
  actions: Actions;
  onToggled?: (id: string, next: "active" | "archived") => void;
  onDeleted?: (id: string) => void;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { run: runToggle, isPending: toggling } = useAsyncAction({
    onError: (e) => toast.error(e ?? "Failed"),
  });
  const { run: runDelete, isPending: deleting } = useAsyncAction({
    onError: (e) => toast.error(e ?? "Failed"),
  });

  async function toggle() {
    const next = status === "active" ? "archived" : "active";
    const res = await runToggle(() => actions.toggleStatus(projectId, next), {
      onOptimistic: () => onToggled?.(projectId, next),
    });
    if (res.ok) {
      toast.success(
        next === "archived" ? "Project archived." : "Project restored.",
      );
    }
    router.refresh();
  }

  async function handleDelete() {
    const res = await runDelete(() => actions.remove(projectId), {
      onOptimistic: () => onDeleted?.(projectId),
    });
    if (res.ok) toast.success("Project deleted.");
    setDeleteOpen(false);
    router.refresh();
  }

  const busy = toggling || deleting;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Actions"
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={toggle} disabled={busy}>
            {status === "active" ? (
              <>
                <Archive className="size-3.5" /> Archive
              </>
            ) : (
              <>
                <ArchiveRestore className="size-3.5" /> Restore
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal open={deleteOpen} onOpenChange={setDeleteOpen}>
        <ModalTitle>Delete this project?</ModalTitle>
        <ModalDescription>
          All time entries tracked against this project will also be deleted.
        </ModalDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setDeleteOpen(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={busy}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
