import { Skeleton, ListSkeleton } from "@/components/shared/skeletons";

export default function TimerLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <ListSkeleton rows={4} />
      </div>
    </div>
  );
}
