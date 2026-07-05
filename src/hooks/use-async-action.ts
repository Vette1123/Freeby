"use client";
// Reusable mutation hook for fire-and-forget server actions (delete, mark-paid,
// archive, send, stop-timer, …). It wraps React 19's useTransition so the call
// runs as a low-priority transition, and centralizes the success/error toast
// boilerplate that was duplicated across every row-action component.
//
// CRITICAL: any useOptimistic update tied to this action MUST run inside the
// same transition — that's what the `onOptimistic` callback is for. React only
// surfaces the optimistic value while the transition is pending, and the
// server action's revalidatePath (+ refresh below) delivers fresh props before
// the transition ends, so the change sticks.
//
// REVERT-ON-ERROR: on failure we deliberately call `refresh()` again so the
// server's true state flows back down and overrides the optimistic update.
// Without this, a failed delete would leave the row missing until the user
// navigated away and back.
//
// Usage:
//   const { run, isPending } = useAsyncAction({
//     onOptimistic: () => updateOptimistic({ op: "delete", id }),
//     refresh: () => router.refresh(),
//     successMessage: "Deleted.",
//   });
//   run(() => deleteClient(id));
import { useTransition } from "react";
import type { ActionResult } from "@/lib/actions";

type ActionFn<T> = () => Promise<ActionResult<T>>;

export interface UseAsyncActionOptions {
  /** Runs at the START of the transition — call updateOptimistic here. */
  onOptimistic?: () => void;
  /** Called when the action resolves ok (after any success toast). */
  onSuccess?: (message?: string) => void;
  /** Override default error toast. */
  onError?: (error: string) => void;
  /** Default success message if the action carries no payload. */
  successMessage?: string;
  /**
   * Reconcile fresh server data. Called BOTH on success (to commit) AND on
   * error (to revert the optimistic update back to server truth).
   */
  refresh?: () => void;
  /**
   * Optional undo for destructive actions. Renders as a toast action button
   * when the action succeeds. Pair with optimistic add to restore a deleted
   * row client-side without a server round-trip.
   */
  undo?: () => void;
}

/** Per-call overrides (onOptimistic for this specific invocation). */
export interface RunOptions {
  onOptimistic?: () => void;
}

export function useAsyncAction(options: UseAsyncActionOptions = {}) {
  const [isPending, startTransition] = useTransition();

  function run<T>(
    action: ActionFn<T>,
    runOptions?: RunOptions,
  ): Promise<ActionResult<T>> {
    return new Promise((resolve) => {
      startTransition(async () => {
        // Apply the optimistic update INSIDE the transition so React surfaces
        // it while the action is pending. Per-call override wins.
        (runOptions?.onOptimistic ?? options.onOptimistic)?.();
        let res: ActionResult<T>;
        try {
          res = await action();
        } catch {
          res = {
            ok: false,
            error: "Something went wrong. Please try again.",
          } as ActionResult<T>;
        }
        if (res.ok) {
          options.onSuccess?.(options.successMessage);
        } else {
          options.onError?.(res.error);
        }
        // Always reconcile: on success it commits the change, on error it
        // reverts the optimistic update by pulling server truth back down.
        options.refresh?.();
        resolve(res);
      });
    });
  }

  return { run, isPending };
}
