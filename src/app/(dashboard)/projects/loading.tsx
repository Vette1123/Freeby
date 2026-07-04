import { Skeleton, CardGridSkeleton } from "@/components/shared/skeletons";

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
