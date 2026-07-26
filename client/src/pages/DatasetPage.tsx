import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { DataPreview } from "@/components/data/DataPreview";
import { DataTable } from "@/components/data/DataTable";
import { ColumnStats } from "@/components/data/ColumnStats";
import { QualityOverview } from "@/components/cleaning/QualityOverview";
import { CleaningPanel } from "@/components/cleaning/CleaningPanel";
import { useDataset, useDatasetPreview, useDatasetStats } from "@/hooks/useDataset";
import { useDatasetQuality } from "@/hooks/useCleaning";

/**
 * Dataset page for previewing, analyzing, and cleaning uploaded data.
 */
export function DatasetPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get("id");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const {
    data: dataset,
    isLoading: isDatasetLoading,
    error: datasetError,
  } = useDataset(datasetId);

  const {
    data: preview,
    isLoading: isPreviewLoading,
    error: previewError,
  } = useDatasetPreview(datasetId, page, pageSize);

  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useDatasetStats(datasetId);

  const {
    data: quality,
    isLoading: isQualityLoading,
    error: qualityError,
  } = useDatasetQuality(datasetId);

  // Reset page when dataset changes
  useEffect(() => {
    setPage(1);
  }, [datasetId]);

  if (!datasetId) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dataset</h1>
          <p className="text-muted-foreground">
            No dataset selected. Upload a file first.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = isDatasetLoading || isPreviewLoading || isStatsLoading || isQualityLoading;
  const error = datasetError || previewError || statsError || qualityError;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dataset</h1>
        <p className="text-muted-foreground">
          Preview, analyze, and clean your uploaded datasets.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading dataset...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {dataset && !isLoading && (
        <>
          <DataPreview dataset={dataset} />

          {/* Column Statistics */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Column Statistics</h2>
            {stats && <ColumnStats stats={stats} />}
          </div>

          {/* Quality Overview */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Quality Overview</h2>
            {quality && <QualityOverview quality={quality} />}
          </div>

          {/* Cleaning Panel */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Cleaning Operations</h2>
            {quality && (
              <CleaningPanel
                datasetId={dataset.id}
                columns={Object.keys(quality.inferredTypes)}
                inferredTypes={quality.inferredTypes}
              />
            )}
          </div>

          {/* Data Preview */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Data Preview</h2>
            {preview && (
              <DataTable
                columns={preview.columns}
                rows={preview.rows}
                page={preview.page}
                totalPages={preview.totalPages}
                totalRows={preview.totalRows}
                onPageChange={setPage}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
