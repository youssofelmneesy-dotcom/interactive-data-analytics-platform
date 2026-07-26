import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/types/insights";

interface InsightCardProps {
  insight: Insight;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

const SEVERITY_STYLES = {
  high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
};

export function InsightCard({ insight, isExpanded, onToggle, onDelete }: InsightCardProps): JSX.Element {
  const severity = insight.severity || "info";
  const severityClass = SEVERITY_STYLES[severity as keyof typeof SEVERITY_STYLES] || SEVERITY_STYLES.info;

  return (
    <div className="rounded-xl border border-border bg-card transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between p-4">
        <div className="flex-1 cursor-pointer" onClick={onToggle}>
          <div className="mb-2 flex items-center gap-2">
            <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", severityClass)}>
              {insight.type}
            </span>
            {insight.confidence && (
              <span className="text-xs text-muted-foreground">
                {(insight.confidence * 100).toFixed(0)}% confidence
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold">{insight.title}</h4>
          <p className={cn("mt-1 text-sm text-muted-foreground", !isExpanded && "line-clamp-2")}>
            {insight.description}
          </p>
        </div>
        <div className="ml-4 flex items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-sm leading-relaxed text-foreground">{insight.description}</p>
          {insight.relatedColumns && insight.relatedColumns.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {insight.relatedColumns.map((col) => (
                <span key={col} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {col}
                </span>
              ))}
            </div>
          )}
          {insight.metadata && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <pre className="overflow-x-auto text-xs text-muted-foreground">
                {JSON.stringify(insight.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

