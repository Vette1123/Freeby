import { Skeleton } from "@/components/shared/skeletons";

export default function InvoiceDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
