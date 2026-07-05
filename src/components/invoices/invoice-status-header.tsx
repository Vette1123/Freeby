"use client";
// Owns the optimistic status badge for the invoice detail page. mark-paid /
// send flip the badge via useOptimistic (in the same transition as the server
// action), then router.refresh() reconciles the truth. Send is SLOW (PDF
// render + email via Resend, often 1-3s) so it gets a distinct "Sending…"
// badge state instead of an instant flip — flipping instantly to "sent" while
// the email is still in flight would be a lie if the send then fails.
import { useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal, ModalTitle, ModalDescription } from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/actions";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
type PendingAction = "sending" | "marking" | "deleting" | null;

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
  // mark-paid commits fast and is trivially reversible, so we optimistically
  // flip the badge. Send is slow and visible to the client, so we DON'T
  // optimistically flip to "sent" — we show a "Sending…" state instead.
  const [optimisticStatus, setOptimisticStatus] = useOptimistic<
    InvoiceStatus,
    InvoiceStatus
  >(status, (_prev, next) => next);
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState<PendingAction>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function markPaid() {
    startTransition(async () => {
      setOptimisticStatus("paid");
      setPending("marking");
      const res = await actions.markPaid(invoiceId);
      setPending(null);
      if (!res.ok) {
        toast.error(res.error);
        // router.refresh reverts the optimistic badge back to server truth.
      } else {
        toast.success("Marked as paid.");
      }
      router.refresh();
    });
  }

  function send() {
    startTransition(async () => {
      // Don't optimistically flip to "sent" — the email may fail. Show a
      // distinct pending state on the button + a sending hint instead.
      setPending("sending");
      const res = await actions.send(invoiceId);
      setPending(null);
      if (!res.ok) {
        toast.error(res.error);
      } else {
        toast.success("Invoice sent.", {
          description: clientEmail ? `Delivered to ${clientEmail}` : undefined,
        });
      }
      // refresh swaps the badge: to "sent" on success, back to "draft" on error.
      router.refresh();
    });
  }

  async function handleDelete() {
    setPending("deleting");
    const res = await actions.remove(invoiceId);
    setPending(null);
    setDeleteOpen(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Invoice deleted.");
    router.push("/invoices");
    router.refresh();
  }

  const sending = pending === "sending";
  const showStatus = sending ? "sent" : optimisticStatus;
  const anyBusy = pending !== null;

  return (
    <>
      <span className="flex flex-wrap items-center gap-3">
        {number}
        <Badge variant={statusVariant(showStatus)}>
          {sending ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin" />
              Sending…
            </span>
          ) : (
            showStatus
          )}
        </Badge>
        {showStatus !== "paid" && !sending && (
          <Button
            variant="outline"
            onClick={markPaid}
            disabled={anyBusy}
          >
            {pending === "marking" ? (
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
            disabled={anyBusy || !clientEmail}
            title={!clientEmail ? "Client has no email" : undefined}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {sending ? "Sending…" : "Send invoice"}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteOpen(true)}
          disabled={anyBusy}
          aria-label="Delete invoice"
        >
          <Trash2 className="size-4" />
        </Button>
      </span>

      {sending && (
        <p className="mt-1 text-xs text-muted-foreground">
          Generating PDF and emailing{" "}
          {clientEmail ? clientEmail : "your client"}…
        </p>
      )}

      <Modal open={deleteOpen} onOpenChange={setDeleteOpen}>
        <ModalTitle>Delete this invoice?</ModalTitle>
        <ModalDescription>This cannot be undone.</ModalDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setDeleteOpen(false)}
            disabled={pending === "deleting"}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending === "deleting"}
          >
            {pending === "deleting" && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
