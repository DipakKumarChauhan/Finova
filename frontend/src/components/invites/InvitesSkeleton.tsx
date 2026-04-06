import { Skeleton } from '../ui/Skeleton'

export function InvitesSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="glass-panel p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-36" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}