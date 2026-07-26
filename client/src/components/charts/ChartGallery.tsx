import { useState } from "react";
import {
  Trash2,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  ScatterChart,
  BoxSelect,
  Grid3X3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { useSavedCharts, useDeleteChart, useChartData } from "@/hooks/useCharts";
import type { SavedChart, ChartType } from "@/types/chart";

interface ChartGalleryProps {
  datasetId: string;
}

const CHART_ICONS: Record<ChartType, React.ReactNode> = {
  bar: <BarChart3 className="h-4 w-4" />,
  line: <LineChart className="h-4 w-4" />,
  pie: <PieChart className="h-4 w-4" />,
  histogram: <Activity className="h-4 w-4" />,
  scatter: <ScatterChart className="h-4 w-4" />,
  box: <BoxSelect className="h-4 w-4" />,
  heatmap: <Grid3X3 className="h-4 w-4" />,
};

/**
 * Gallery displaying all saved charts for a dataset with delete action.
 * Each card fetches its own chart data on demand.
 */
export function ChartGallery({ datasetId }: ChartGalleryProps): JSX.Element {
  const { data: charts, isLoading, error } = useSavedCharts(datasetId);
  const { mutate: deleteChart } = useDeleteChart(datasetId);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (chartId: string) => {
    setDeletingId(chartId);
    deleteChart(chartId, {
      onSettled: () => setDeletingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Loading charts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load charts: {error.message}
      </div>
    );
  }

  if (!charts || charts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        <BarChart3 className="mx-auto mb-3 h-8 w-8 opacity-50" />
        <p className="text-sm">No charts saved yet.</p>
        <p className="text-xs">Create your first chart using the builder above.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {charts.map((chart) => (
        <ChartCard
          key={chart.id}
          chart={chart}
          onDelete={handleDelete}
          isDeleting={deletingId === chart.id}
        />
      ))}
    </div>
  );
}

interface ChartCardProps {
  chart: SavedChart;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function ChartCard({ chart, onDelete, isDeleting }: ChartCardProps): JSX.Element {
  const [showDelete, setShowDelete] = useState(false);

  // Fetch real chart data for this saved configuration
  const { data: chartResponse, isLoading, error } = useChartData(
    chart.xAxis
      ? {
          datasetId: chart.datasetId,
          chartType: chart.chartType,
          xAxis: chart.xAxis,
          yAxis: chart.yAxis,
          aggregation: chart.aggregation,
          groupBy: chart.groupBy,
          filters: chart.filters.length > 0 ? chart.filters : undefined,
          title: chart.title,
        }
      : null
  );

  const chartData = chartResponse?.data ?? [];

  return (
    <div
      className="group relative rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-primary">{CHART_ICONS[chart.chartType]}</span>
          <h4 className="truncate text-sm font-semibold" title={chart.title}>
            {chart.title}
          </h4>
        </div>
        {showDelete && (
          <button
            type="button"
            onClick={() => onDelete(chart.id)}
            disabled={isDeleting}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            aria-label="Delete chart"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Chart Preview */}
      <div className="h-48">
        {isLoading && (
          <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Loading...</span>
          </div>
        )}

        {error && (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load</span>
          </div>
        )}

        {!isLoading && !error && chartData.length > 0 && (
          <ChartRenderer
            data={chartData}
            chartType={chart.chartType}
            xLabel={chartResponse?.config.xLabel ?? chart.xAxis ?? ""}
            yLabel={chartResponse?.config.yLabel ?? chart.yAxis ?? ""}
            aggregation={chart.aggregation}
            groupBy={chart.groupBy}
            title=""
          />
        )}

        {!isLoading && !error && chartData.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No data available
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5">{chart.chartType}</span>
        {chart.xAxis && <span>X: {chart.xAxis}</span>}
        {chart.yAxis && <span>Y: {chart.yAxis}</span>}
      </div>
    </div>
  );
}

