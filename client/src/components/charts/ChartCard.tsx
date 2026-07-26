/**
 * ChartCard — Individual chart container with actions.
 *
 * Wraps ChartRenderer with title, actions (download PNG, delete),
 * and responsive sizing. Fetches real chart data on demand.
 */

import { useRef, useCallback } from "react";
import { Download, Trash2, Maximize2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import { useChartData } from "@/hooks/useCharts";
import type { SavedChart } from "@/types/chart";

interface ChartCardProps {
  chart: SavedChart;
  onDelete?: (chartId: string) => void;
  expandable?: boolean;
}

export function ChartCard({ chart, onDelete, expandable = true }: ChartCardProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch real chart data from the backend using the saved configuration
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

  const handleDownloadPng = useCallback(() => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const rect = svg.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${chart.title.replace(/\s+/g, "_")}.png`;
      link.href = pngUrl;
      link.click();
    };

    img.src = url;
  }, [chart.title]);

  const handleDownloadSvg = useCallback(() => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = `${chart.title.replace(/\s+/g, "_")}.svg`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  }, [chart.title]);

  const chartData = chartResponse?.data ?? [];
  const xLabel = chartResponse?.config.xLabel ?? chart.xAxis ?? "";
  const yLabel = chartResponse?.config.yLabel ?? chart.yAxis ?? "";

  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-card", expandable && "h-full")}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold" title={chart.title}>
            {chart.title}
          </h4>
          <p className="truncate text-xs text-muted-foreground">
            {chart.chartType} · {chart.xAxis || "—"}
            {chart.yAxis && ` / ${chart.yAxis}`} · {chart.aggregation}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isLoading || !!error || chartData.length === 0}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Download PNG"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            disabled={isLoading || !!error || chartData.length === 0}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Download SVG"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(chart.id)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Delete chart"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="flex-1 p-4">
        {isLoading && (
          <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading chart data...</span>
          </div>
        )}

        {error && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load chart data</span>
          </div>
        )}

        {!isLoading && !error && (
          <ChartRenderer
            chartType={chart.chartType}
            data={chartData}
            xLabel={xLabel}
            yLabel={yLabel}
            aggregation={chart.aggregation}
            groupBy={chart.groupBy}
            title={chart.title}
          />
        )}
      </div>
    </div>
  );
}

