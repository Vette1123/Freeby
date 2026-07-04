import { Skeleton, ListSkeleton } from "@/components/shared/skeletons";

export default function ClientDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <ListSkeleton rows={3} />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <ListSkeleton rows={3} />
        </div>
      </div>
    </div>
  );
}
