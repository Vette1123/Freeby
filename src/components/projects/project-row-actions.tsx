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
  ) => Promise<{ ok: boolean; error?: string }>;
  remove: (id: string) => Promise<{ ok: boolean; error?: string }>;
};

export function ProjectRowActions({
  projectId,
  status,
  actions,
}: {
  projectId: string;
  status: "active" | "archived";
  actions: Actions;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = status === "active" ? "archived" : "active";
    const res = await actions.toggleStatus(projectId, next);
    setBusy(false);
    if (!res.ok) return toast.error(res.error ?? "Failed");
    toast.success(
      next === "archived" ? "Project archived." : "Project restored.",
    );
    router.refresh();
  }

  async function handleDelete() {
    setBusy(true);
    const res = await actions.remove(projectId);
    setBusy(false);
    setDeleteOpen(false);
    if (!res.ok) return toast.error(res.error ?? "Failed");
    toast.success("Project deleted.");
    router.refresh();
  }

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
