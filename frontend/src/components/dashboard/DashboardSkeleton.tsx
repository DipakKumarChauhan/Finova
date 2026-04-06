import { Skeleton } from '../ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-panel space-y-3 p-5 sm:p-6">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-full max-w-3xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="glass-panel space-y-4 p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="glass-panel space-y-4 p-5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div className="glass-panel space-y-4 p-5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>

      <div className="glass-panel space-y-4 p-5">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  )
}