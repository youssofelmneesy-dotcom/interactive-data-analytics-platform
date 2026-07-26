/**
 * DashboardPage — Full dashboard implementation for Stage 4.
 *
 * Features:
 * - Dataset selector
 * - Chart recommendations
 * - Chart builder with live preview
 * - Saved charts grid
 * - Responsive layout
 */

import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDatasets } from "@/hooks/useDataset";
import { useSavedCharts, useDeleteChart } from "@/hooks/useCharts";
import { ChartRecommendations } from "@/components/charts/ChartRecommendations";
import { ChartBuilder } from "@/components/charts/ChartBuilder";
import { DashboardGrid } from "@/components/charts/DashboardGrid";
import type { ChartRecommendation } from "@/types/chart";

export function DashboardPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const datasetId = searchParams.get("dataset") || "";

  const [showBuilder, setShowBuilder] = useState(false);
  const [builderConfig, setBuilderConfig] = useState<ChartRecommendation | null>(null);

  const { data: datasets, isLoading: isDatasetsLoading, error: datasetsError } = useDatasets();
  const { data: savedCharts, isLoading: isChartsLoading } = useSavedCharts(datasetId || null);
  const { mutate: deleteChart } = useDeleteChart(datasetId);

  const selectedDataset = datasets?.find((d) => d.id === datasetId);

  // Derive columns and columnTypes from the selected dataset metadata.
  // The backend returns columnTypes from infer_column_types() during upload.
  const columns = selectedDataset?.columns ?? [];
  const columnTypes = selectedDataset?.columnTypes ?? {};

  const handleDatasetSelect = useCallback(
    (id: string) => {
      setSearchParams(id ? { dataset: id } : {});
      setShowBuilder(false);
      setBuilderConfig(null);
    },
    [setSearchParams]
  );

  const handleRecommendationSelect = useCallback((rec: ChartRecommendation) => {
    setBuilderConfig(rec);
    setShowBuilder(true);
  }, []);

  const handleDeleteChart = useCallback(
    (chartId: string) => {
      deleteChart(chartId);
    },
    [deleteChart]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Build interactive charts and visualizations from your data.
        </p>
      </div>

      {/* Dataset Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Select Dataset</label>
        <div className="relative">
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm",
              "transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            )}
            onClick={() => {
              const select = document.getElementById("dataset-select") as HTMLSelectElement;
              select?.click();
            }}
          >
            {selectedDataset ? (
              <span>
                {selectedDataset.name}{" "}
                <span className="text-muted-foreground">
                  ({selectedDataset.rowCount.toLocaleString()} rows)
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Choose a dataset...</span>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          <select
            id="dataset-select"
            value={datasetId}
            onChange={(e) => handleDatasetSelect(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            <option value="">Select a dataset...</option>
            {datasets?.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name}
              </option>
            ))}
          </select>
        </div>

        {isDatasetsLoading && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading datasets...
          </p>
        )}

        {datasetsError && (
          <p className="text-xs text-destructive">Failed to load datasets: {datasetsError.message}</p>
        )}
      </div>

      {/* Empty State — No Dataset Selected */}
      {!datasetId && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">No dataset selected</p>
            <p className="text-xs text-muted-foreground/70">
              Select a dataset above to see recommendations and build charts.
            </p>
          </div>
        </div>
      )}

      {/* Dataset Selected Content */}
      {datasetId && selectedDataset && (
        <>
          {/* Recommendations */}
          <ChartRecommendations
            datasetId={datasetId}
            onSelect={handleRecommendationSelect}
          />

          {/* Chart Builder Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowBuilder((prev) => !prev);
                setBuilderConfig(null);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                showBuilder
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border bg-card text-foreground hover:bg-accent"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              {showBuilder ? "Hide Builder" : "Build Custom Chart"}
            </button>
          </div>

          {/* Chart Builder */}
          {showBuilder && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">
                {builderConfig ? "Edit Recommended Chart" : "Build Custom Chart"}
              </h3>
              <ChartBuilder
                datasetId={datasetId}
                columns={columns}
                columnTypes={columnTypes}
              />
            </div>
          )}

          {/* Saved Charts */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved Charts</h2>
              {isChartsLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <DashboardGrid
              charts={savedCharts || []}
              onDeleteChart={handleDeleteChart}
            />
          </div>
        </>
      )}

      {/* Error State */}
      {datasetId && datasetsError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load dashboard data. Please try again.</span>
        </div>
      )}
    </div>
  );
}
