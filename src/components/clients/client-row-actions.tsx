"use client";
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteClient } from "@/app/(dashboard)/clients/actions";
import { useAsyncAction } from "@/hooks/use-async-action";
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
import { ClientForm, type ClientRow } from "@/components/clients/client-form";

type ClientSummary = {
  id: string;
  name: string;
  email: string;
  company: string;
  address: string;
  notes: string;
};

export function ClientRowActions({
  client,
  onDeleted,
  onUpdated,
}: {
  client: ClientSummary;
  onDeleted?: (id: string) => void;
  onUpdated?: (id: string, patch: Partial<ClientRow>) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { run, isPending } = useAsyncAction({
    successMessage: "Client deleted.",
    onOptimistic: () => onDeleted?.(client.id),
    onError: (e) => toast.error(e),
  });

  async function handleDelete() {
    await run(() => deleteClient(client.id));
    setDeleteOpen(false);
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
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal open={editOpen} onOpenChange={setEditOpen}>
        <ModalTitle>Edit client</ModalTitle>
        <ModalDescription>Update this client&apos;s details.</ModalDescription>
        <div className="mt-5">
          <ClientForm
            clientId={client.id}
            defaultValues={client}
            onUpdated={onUpdated}
            onDone={() => setEditOpen(false)}
          />
        </div>
      </Modal>

      <Modal open={deleteOpen} onOpenChange={setDeleteOpen}>
        <ModalTitle>Delete {client.name}?</ModalTitle>
        <ModalDescription>
          This permanently removes the client. Their invoices will also be
          deleted. This cannot be undone.
        </ModalDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setDeleteOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
