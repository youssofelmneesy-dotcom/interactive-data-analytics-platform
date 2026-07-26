import { Hash, Type, AlertTriangle, Fingerprint } from "lucide-react";
import type { ColumnStats as ColumnStatsType } from "@/types/dataset";

interface ColumnStatsProps {
  stats: ColumnStatsType[];
}

/**
 * Displays column statistics cards for a dataset.
 */
export function ColumnStats({ stats }: ColumnStatsProps): JSX.Element {
  if (stats.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
        No column statistics available.
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    if (type.includes("int") || type.includes("float")) return <Hash className="h-4 w-4" />;
    if (type.includes("bool")) return <Type className="h-4 w-4" />;
    return <Type className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    if (type.includes("int")) return "Integer";
    if (type.includes("float")) return "Float";
    if (type.includes("bool")) return "Boolean";
    if (type.includes("datetime")) return "DateTime";
    return "String";
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
        >
          <div className="mb-3 flex items-center justify-between">
            <h4 className="truncate text-sm font-semibold" title={stat.name}>
              {stat.name}
            </h4>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {getTypeIcon(stat.type)}
              {getTypeLabel(stat.type)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              <span>{stat.totalRows.toLocaleString()} rows</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Fingerprint className="h-3.5 w-3.5" />
              <span>{stat.uniqueCount.toLocaleString()} unique</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{stat.nullCount.toLocaleString()} nulls ({stat.nullPercentage}%)</span>
            </div>
          </div>

          {stat.mean !== undefined && stat.mean !== null && (
            <div className="mt-3 border-t border-border pt-2 text-xs">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <span className="text-muted-foreground">Mean:</span>
                <span className="text-right font-medium">{stat.mean.toFixed(2)}</span>
                {stat.median !== undefined && stat.median !== null && (
                  <>
                    <span className="text-muted-foreground">Median:</span>
                    <span className="text-right font-medium">{stat.median.toFixed(2)}</span>
                  </>
                )}
                {stat.min !== undefined && stat.min !== null && (
                  <>
                    <span className="text-muted-foreground">Min:</span>
                    <span className="text-right font-medium">{String(stat.min)}</span>
                  </>
                )}
                {stat.max !== undefined && stat.max !== null && (
                  <>
                    <span className="text-muted-foreground">Max:</span>
                    <span className="text-right font-medium">{String(stat.max)}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {stat.mostFrequent && (
            <div className="mt-3 border-t border-border pt-2 text-xs">
              <span className="text-muted-foreground">Most frequent: </span>
              <span className="font-medium">{stat.mostFrequent}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}



