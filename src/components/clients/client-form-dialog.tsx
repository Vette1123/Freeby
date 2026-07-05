"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, ModalTitle, ModalDescription } from "@/components/ui/dialog";
import { ClientForm, type ClientRow } from "@/components/clients/client-form";

export function ClientFormDialog({
  triggerLabel = "New client",
  onCreated,
  open,
  onOpenChange,
}: {
  triggerLabel?: string;
  onCreated?: (row: ClientRow) => void;
  /** Controlled open state. If omitted, the dialog manages its own state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {triggerLabel}
      </Button>
      <Modal open={isOpen} onOpenChange={setOpen}>
        <ModalTitle>New client</ModalTitle>
        <ModalDescription>
          Add a client you bill. You can edit details later.
        </ModalDescription>
        <div className="mt-5">
          <ClientForm
            onCreated={onCreated}
            onDone={() => setOpen(false)}
          />
        </div>
      </Modal>
    </>
  );
}
