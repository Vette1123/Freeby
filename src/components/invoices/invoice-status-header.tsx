"use client";
// Owns the optimistic status badge for the invoice detail page. mark-paid /
// send flip the badge instantly via useOptimistic (in the same transition as
// the server action), then router.refresh() reconciles the truth.
import { useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal, ModalTitle, ModalDescription } from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/actions";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

type Actions = {
  send: (id: string) => Promise<ActionResult>;
  markPaid: (id: string) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
};

function statusVariant(status: InvoiceStatus) {
  return status === "paid"
    ? "success"
    : status === "overdue"
      ? "danger"
      : status === "sent"
        ? "warning"
        : "muted";
}

export function InvoiceStatusHeader({
  number,
  invoiceId,
  status,
  clientEmail,
  actions,
}: {
  number: string;
  invoiceId: string;
  status: InvoiceStatus;
  clientEmail: string | null;
  actions: Actions;
}) {
  const router = useRouter();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic<
    InvoiceStatus,
    InvoiceStatus
  >(status, (_prev, next) => next);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"send" | "paid" | "delete" | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function markPaid() {
    startTransition(async () => {
      setOptimisticStatus("paid");
      const res = await actions.markPaid(invoiceId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Marked as paid.");
      router.refresh();
    });
  }

  function send() {
    startTransition(async () => {
      setOptimisticStatus("sent");
      const res = await actions.send(invoiceId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Invoice sent.");
      router.refresh();
    });
  }

  async function handleDelete() {
    setBusy("delete");
    const res = await actions.remove(invoiceId);
    setBusy(null);
    setDeleteOpen(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Invoice deleted.");
    router.push("/invoices");
    router.refresh();
  }

  const showStatus = optimisticStatus;

  return (
    <>
      <span className="flex flex-wrap items-center gap-3">
        {number}
        <Badge variant={statusVariant(showStatus)}>{showStatus}</Badge>
        {showStatus !== "paid" && (
          <Button
            variant="outline"
            onClick={markPaid}
            disabled={pending || busy !== null}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Mark paid
          </Button>
        )}
        {showStatus === "draft" && (
          <Button
            onClick={send}
            disabled={pending || busy !== null || !clientEmail}
            title={!clientEmail ? "Client has no email" : undefined}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Send invoice
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteOpen(true)}
          disabled={pending || busy !== null}
          aria-label="Delete invoice"
        >
          <Trash2 className="size-4" />
        </Button>
      </span>

      <Modal open={deleteOpen} onOpenChange={setDeleteOpen}>
        <ModalTitle>Delete this invoice?</ModalTitle>
        <ModalDescription>This cannot be undone.</ModalDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setDeleteOpen(false)}
            disabled={busy === "delete"}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={busy === "delete"}
          >
            {busy === "delete" && <Loader2 className="size-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
