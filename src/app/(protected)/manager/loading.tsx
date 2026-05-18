import { Skeleton } from "@/components/ui/skeleton"

export default function ManagerLoading() {
  return (
    <div className="space-y-6 p-5 xl:p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Metrics Skeleton */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </section>

      {/* Main Panel Skeleton */}
      <Skeleton className="h-[180px] rounded-xl w-full" />

      {/* Two Column Skeleton */}
      <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </section>
    </div>
  )
}
