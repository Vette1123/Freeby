import { cn } from "@/lib/utils";

/**
 * A shimmer skeleton block. Uses an animated gradient sweep (not the flat
 * opacity pulse) so loading states read as "working on it" rather than a
 * static placeholder. Falls back to plain bg under reduced-motion.
 */
export function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted bg-[length:200%_100%] animate-[shimmer_1.6s_ease-in-out_infinite] [background-image:linear-gradient(90deg,transparent,color-mix(in_oklch,var(--foreground)_8%,transparent),transparent)] motion-reduce:animate-none motion-reduce:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

/** A 4-up grid of stat-card skeletons for the dashboard. */
export function StatCardSkeletons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start justify-between gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="w-full space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
          </div>
          <Skeleton className="size-9 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** A skeleton list for the dashboard activity columns. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg bg-card px-3 py-2.5 ring-1 ring-foreground/10"
        >
          <Skeleton className="size-8 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

/** Table skeleton that mirrors the clients/invoices table layout. */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <div className="space-y-px">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}

/** Card-grid skeleton mirroring the projects page. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}
