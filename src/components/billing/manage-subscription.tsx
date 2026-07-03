"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal, ModalTitle, ModalDescription } from "@/components/ui/dialog";

export function ManageSubscription({
  cancelAtPeriodEnd,
}: {
  cancelAtPeriodEnd: boolean;
}) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  async function handleCancel() {
    setCanceling(true);
    try {
      const res = await fetch("/api/lemonsqueezy/cancel", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel");
      toast.success(
        "Your subscription will cancel at the end of the billing period.",
      );
      setCancelOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setCanceling(false);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div>
          <p className="font-medium">Manage subscription</p>
          <p className="text-sm text-muted-foreground">
            {cancelAtPeriodEnd
              ? "Already set to cancel at period end."
              : "Cancel anytime — you keep access until the period ends."}
          </p>
        </div>
        {!cancelAtPeriodEnd && (
          <Button
            variant="outline"
            onClick={() => setCancelOpen(true)}
          >
            Cancel subscription
          </Button>
        )}
      </div>

      <Modal open={cancelOpen} onOpenChange={setCancelOpen}>
        <ModalTitle>Cancel your Pro subscription?</ModalTitle>
        <ModalDescription>
          You&apos;ll keep Pro access until the end of your current billing period,
          then drop to the Free plan. This cannot be undone.
        </ModalDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setCancelOpen(false)}
            disabled={canceling}
          >
            Keep Pro
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={canceling}
          >
            {canceling && <Loader2 className="size-4 animate-spin" />}
            Cancel subscription
          </Button>
        </div>
      </Modal>
    </section>
  );
}
