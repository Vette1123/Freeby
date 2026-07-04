import { Skeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function InvoicesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
