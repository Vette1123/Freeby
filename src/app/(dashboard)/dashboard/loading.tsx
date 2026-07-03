import { StatCardSkeletons, ListSkeleton } from "@/components/shared/skeletons";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>
      <StatCardSkeletons />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <ListSkeleton rows={4} />
        </div>
        <div className="space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <ListSkeleton rows={4} />
        </div>
      </div>
    </div>
  );
}
