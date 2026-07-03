"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal, ModalTitle, ModalDescription } from "@/components/ui/dialog";

type Actions = {
  send: (id: string) => Promise<{ ok: boolean; error?: string }>;
  markPaid: (id: string) => Promise<{ ok: boolean; error?: string }>;
  remove: (id: string) => Promise<{ ok: boolean; error?: string }>;
};

export function InvoiceActions({
  invoiceId,
  status,
  clientEmail,
  actions,
}: {
  invoiceId: string;
  status: string;
  clientEmail: string | null;
  actions: Actions;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"send" | "paid" | "delete" | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleSend() {
    setBusy("send");
    const res = await actions.send(invoiceId);
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    toast.success("Invoice sent.");
    router.refresh();
  }

  async function handleMarkPaid() {
    setBusy("paid");
    const res = await actions.markPaid(invoiceId);
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    toast.success("Marked as paid.");
    router.refresh();
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

  return (
    <div className="flex items-center gap-2">
      {status !== "paid" && (
        <Button
          variant="outline"
          onClick={handleMarkPaid}
          disabled={busy !== null}
        >
          {busy === "paid" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Mark paid
        </Button>
      )}

      {status === "draft" && (
        <Button
          onClick={handleSend}
          disabled={busy !== null || !clientEmail}
          title={!clientEmail ? "Client has no email" : undefined}
        >
          {busy === "send" ? (
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
        disabled={busy !== null}
        aria-label="Delete invoice"
      >
        <Trash2 className="size-4" />
      </Button>

      <Modal open={deleteOpen} onOpenChange={setDeleteOpen}>
        <ModalTitle>Delete this invoice?</ModalTitle>
        <ModalDescription>This cannot be undone.</ModalDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={busy === "delete"}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={busy === "delete"}>
            {busy === "delete" && <Loader2 className="size-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
