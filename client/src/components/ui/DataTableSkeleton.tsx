import { Skeleton } from "@/components/ui/Skeleton";

interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function DataTableSkeleton({ rows = 5, columns = 4 }: DataTableSkeletonProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2">
                <Skeleton className="h-4 w-4" />
              </th>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-3 py-2">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                <td className="px-3 py-2">
                  <Skeleton className="h-4 w-4" />
                </td>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-3 py-2">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

