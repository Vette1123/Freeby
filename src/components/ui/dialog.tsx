"use client";
// Dialog built on Base UI (@base-ui/react/dialog), styled to match the
// starter's shadcn/Base UI aesthetic. Provides a controlled-or-uncontrolled
// modal with backdrop, escape-to-close, and focus trapping (Base UI handles
// a11y and focus management internally).
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

function Modal({
  open,
  onOpenChange,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity duration-200"
        />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-xl ring-1 ring-foreground/10 outline-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 transition",
            className,
          )}
        >
          {children}
          <Dialog.Close
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ModalTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <Dialog.Title
      className={cn("font-heading text-lg font-semibold", className)}
      {...(props as object)}
    />
  );
}

function ModalDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <Dialog.Description
      className={cn("mt-1.5 text-sm text-muted-foreground", className)}
      {...(props as object)}
    />
  );
}

export { Modal, ModalTitle, ModalDescription };
