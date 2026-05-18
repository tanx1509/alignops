import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6 p-5 xl:p-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-10 w-80 max-w-full rounded-lg" />
        <Skeleton className="h-4 w-[28rem] max-w-full rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="premium-card space-y-5 p-4" key={index}>
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-40 rounded-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <div className="premium-card space-y-4 p-5">
          <Skeleton className="h-6 w-52 rounded-lg" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-3/4 rounded-full" />
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
          <Skeleton className="h-48 rounded-lg" />
        </div>
        <div className="premium-card space-y-4 p-5">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
