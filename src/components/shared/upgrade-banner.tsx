import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/** Inline banner nudging free users to upgrade. Shown when hitting a limit. */
export function UpgradeBanner({
  message = "You're on the Free plan.",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 text-sm">
        <Sparkles className="size-4 shrink-0 text-primary" />
        <span>{message}</span>
      </div>
      <Link
        href="/billing"
        className={cn(
          buttonVariants({ size: "sm" }),
          "shrink-0",
        )}
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
