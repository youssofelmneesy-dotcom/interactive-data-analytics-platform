import { Database, Rows3, Columns3, HardDrive } from "lucide-react";
import type { Dataset } from "@/types/dataset";

interface DataPreviewProps {
  dataset: Dataset;
}

/**
 * Dataset metadata preview card.
 */
export function DataPreview({ dataset }: DataPreviewProps): JSX.Element {
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{dataset.name}</h2>
          <p className="text-sm text-muted-foreground">
            Uploaded on {formatDate(dataset.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Rows3 className="h-4 w-4" />
            <span className="text-xs">Rows</span>
          </div>
          <p className="mt-1 text-xl font-semibold">{dataset.rowCount.toLocaleString()}</p>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Columns3 className="h-4 w-4" />
            <span className="text-xs">Columns</span>
          </div>
          <p className="mt-1 text-xl font-semibold">{dataset.columnCount}</p>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <HardDrive className="h-4 w-4" />
            <span className="text-xs">Size</span>
          </div>
          <p className="mt-1 text-xl font-semibold">—</p>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Database className="h-4 w-4" />
            <span className="text-xs">ID</span>
          </div>
          <p className="mt-1 truncate text-sm font-mono" title={dataset.id}>
            {dataset.id.slice(0, 8)}...
          </p>
        </div>
      </div>
    </div>
  );
}

