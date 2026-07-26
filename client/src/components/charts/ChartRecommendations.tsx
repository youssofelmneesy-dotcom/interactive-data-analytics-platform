/**
 * ChartRecommendations — Auto-suggested chart cards.
 *
 * Displays recommended visualizations based on dataset column types.
 * Clicking a recommendation pre-fills the chart builder.
 */

import { useChartRecommendations } from "@/hooks/useCharts";
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  ScatterChart,
  BoxSelect,
  Grid3X3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChartType, ChartRecommendation } from "@/types/chart";

interface ChartRecommendationsProps {
  datasetId: string;
  onSelect: (rec: ChartRecommendation) => void;
}

const CHART_ICONS: Record<ChartType, React.ReactNode> = {
  bar: <BarChart3 className="h-5 w-5" />,
  line: <LineChart className="h-5 w-5" />,
  pie: <PieChart className="h-5 w-5" />,
  histogram: <Activity className="h-5 w-5" />,
  scatter: <ScatterChart className="h-5 w-5" />,
  box: <BoxSelect className="h-5 w-5" />,
  heatmap: <Grid3X3 className="h-5 w-5" />,
};

export function ChartRecommendations({
  datasetId,
  onSelect,
}: ChartRecommendationsProps): JSX.Element {
  const { data: recommendations, isLoading, error } = useChartRecommendations(datasetId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 animate-pulse" />
        Analyzing dataset for chart recommendations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
        Failed to load recommendations: {error.message}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        No chart recommendations available for this dataset.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        Recommended Charts
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(rec)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
              "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
            )}
          >
            <div className="flex items-center gap-2 text-primary">
              {CHART_ICONS[rec.chartType]}
              <span className="text-sm font-semibold capitalize">{rec.chartType}</span>
            </div>

            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">X:</span> {rec.xAxis}
              {rec.yAxis && (
                <>
                  {" "}
                  · <span className="font-medium text-foreground">Y:</span> {rec.yAxis}
                </>
              )}
              {" "}
              · <span className="font-medium text-foreground">Agg:</span> {rec.aggregation}
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {rec.reason}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

