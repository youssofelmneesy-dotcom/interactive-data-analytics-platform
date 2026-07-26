import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Sparkles, BarChart3, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDatasets } from "@/hooks/useDataset";
import { InsightsPanel } from "@/components/insights/InsightsPanel";
import { ReportBuilder } from "@/components/report/ReportBuilder";

export function ReportPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const datasetId = searchParams.get("dataset") || "";
  const [activeTab, setActiveTab] = useState<"insights" | "reports">("insights");

  const { data: datasets, isLoading: isDatasetsLoading, error: datasetsError } = useDatasets();
  const selectedDataset = datasets?.find((d) => d.id === datasetId);

  const handleDatasetSelect = (id: string) => {
    setSearchParams(id ? { dataset: id } : {});
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate AI insights and export professional PDF reports.
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
              const select = document.getElementById("report-dataset-select") as HTMLSelectElement;
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
            id="report-dataset-select"
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

      {/* Empty State */}
      {!datasetId && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">No dataset selected</p>
            <p className="text-xs text-muted-foreground/70">
              Select a dataset to generate insights and reports.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {datasetId && selectedDataset && (
        <>
          <div className="flex items-center gap-1 border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab("insights")}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === "insights"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-4 w-4" />
              AI Insights
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reports")}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === "reports"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              PDF Reports
            </button>
          </div>

          {activeTab === "insights" && <InsightsPanel datasetId={datasetId} />}
          {activeTab === "reports" && <ReportBuilder datasetId={datasetId} />}
        </>
      )}

      {/* Error */}
      {datasetId && datasetsError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load report data. Please try again.</span>
        </div>
      )}
    </div>
  );
}
