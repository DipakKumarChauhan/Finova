import { Skeleton } from '../ui/Skeleton'

export function MembersTableSkeleton() {
  return (
    <div className="glass-panel overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              {['Email', 'Role', 'Joined', 'Actions'].map((label) => (
                <th key={label} className="px-4 py-3">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-4 py-4"><Skeleton className="h-4 w-44" /></td>
                <td className="px-4 py-4"><Skeleton className="h-10 w-40" /></td>
                <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                <td className="px-4 py-4"><Skeleton className="h-8 w-56" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}