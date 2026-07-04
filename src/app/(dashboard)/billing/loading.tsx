import { Skeleton } from "@/components/shared/skeletons";

export default function BillingLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
