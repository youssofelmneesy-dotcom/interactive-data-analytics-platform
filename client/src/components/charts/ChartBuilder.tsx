/**
 * ChartBuilder — Chart configuration panel.
 *
 * Allows users to select chart type, axes, aggregation,
 * group-by, and filters. Live preview with ChartRenderer.
 */

import { useState, useCallback, useMemo } from "react";
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  ScatterChart,
  BoxSelect,
  Grid3X3,
  Wand2,
  Save,
  Loader2,
  X,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChartData, useSaveChart } from "@/hooks/useCharts";
import { ChartRenderer } from "@/components/charts/ChartRenderer";
import type {
  ChartType,
  AggregationType,
  FilterCondition,
} from "@/types/chart";

interface ChartBuilderProps {
  datasetId: string;
  columns: string[];
  columnTypes: Record<string, string>;
}

const CHART_TYPES: { id: ChartType; label: string; icon: React.ReactNode }[] = [
  { id: "bar", label: "Bar", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "line", label: "Line", icon: <LineChart className="h-4 w-4" /> },
  { id: "pie", label: "Pie", icon: <PieChart className="h-4 w-4" /> },
  { id: "histogram", label: "Histogram", icon: <Activity className="h-4 w-4" /> },
  { id: "scatter", label: "Scatter", icon: <ScatterChart className="h-4 w-4" /> },
  { id: "box", label: "Box Plot", icon: <BoxSelect className="h-4 w-4" /> },
  { id: "heatmap", label: "Heatmap", icon: <Grid3X3 className="h-4 w-4" /> },
];

const AGGREGATIONS: { value: AggregationType; label: string }[] = [
  { value: "sum", label: "Sum" },
  { value: "count", label: "Count" },
  { value: "mean", label: "Mean" },
  { value: "median", label: "Median" },
  { value: "min", label: "Min" },
  { value: "max", label: "Max" },
  { value: "std", label: "Std Dev" },
];

const FILTER_OPERATORS: { value: FilterCondition["operator"]; label: string }[] = [
  { value: "eq", label: "=" },
  { value: "ne", label: "!=" },
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "contains", label: "Contains" },
];

/** Numeric operators that should cast filter values to numbers. */
const NUMERIC_OPERATORS = new Set<FilterCondition["operator"]>([
  "eq", "ne", "gt", "gte", "lt", "lte",
]);

/** Check if a column type is numeric. */
function isNumericColumn(columnType: string | undefined): boolean {
  if (!columnType) return false;
  const t = columnType.toLowerCase();
  return t.includes("int") || t.includes("float") || t.includes("number") || t.includes("double");
}

/** Cast filter value based on column type and operator. */
function castFilterValue(
  value: string,
  operator: FilterCondition["operator"],
  columnType: string | undefined
): string | number {
  if (NUMERIC_OPERATORS.has(operator) && isNumericColumn(columnType)) {
    const num = Number(value);
    return isNaN(num) ? value : num;
  }
  return value;
}

export function ChartBuilder({
  datasetId,
  columns,
  columnTypes,
}: ChartBuilderProps): JSX.Element {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [xAxis, setXAxis] = useState<string>("");
  const [yAxis, setYAxis] = useState<string>("");
  const [aggregation, setAggregation] = useState<AggregationType>("sum");
  const [groupBy, setGroupBy] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Build preview params with properly cast filter values
  const previewParams = useMemo(() => {
    if (!showPreview || !xAxis) return null;

    const castedFilters = filters.length > 0
      ? filters.map((f) => ({
          ...f,
          value: castFilterValue(String(f.value), f.operator, columnTypes[f.column]),
        }))
      : undefined;

    return {
      datasetId,
      chartType,
      xAxis: xAxis || null,
      yAxis: yAxis || null,
      aggregation,
      groupBy: groupBy || null,
      filters: castedFilters,
      title: title || undefined,
    };
  }, [datasetId, chartType, xAxis, yAxis, aggregation, groupBy, filters, title, showPreview, columnTypes]);

  const { data: chartData, isLoading: isChartLoading } = useChartData(previewParams);

  const { mutate: saveChart, isPending: isSaving } = useSaveChart();

  const numericColumns = useMemo(
    () => columns.filter((c) => columnTypes[c]?.includes("int") || columnTypes[c]?.includes("float") || columnTypes[c]?.includes("number")),
    [columns, columnTypes]
  );

  const categoricalColumns = useMemo(
    () => columns.filter((c) => !columnTypes[c]?.includes("int") && !columnTypes[c]?.includes("float") && !columnTypes[c]?.includes("number")),
    [columns, columnTypes]
  );

  const needsYAxis = chartType !== "histogram";
  const needsNumericY = chartType !== "heatmap";
  const canGroupBy = chartType === "bar" || chartType === "line" || chartType === "scatter";

  const handleGenerate = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!xAxis) return;

    const castedFilters = filters.length > 0
      ? filters.map((f) => ({
          ...f,
          value: castFilterValue(String(f.value), f.operator, columnTypes[f.column]),
        }))
      : undefined;

    saveChart({
      datasetId,
      chartType,
      title: title || `${chartType} chart of ${xAxis}`,
      xAxis: xAxis || null,
      yAxis: yAxis || null,
      aggregation,
      groupBy: groupBy || null,
      filters: castedFilters,
    });
  }, [datasetId, chartType, xAxis, yAxis, aggregation, groupBy, title, filters, columnTypes, saveChart]);

  const addFilter = useCallback(() => {
    setFilters((prev) => [...prev, { column: columns[0] || "", operator: "eq", value: "" }]);
  }, [columns]);

  const updateFilter = useCallback((index: number, updates: Partial<FilterCondition>) => {
    setFilters((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Chart Type Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium">Chart Type</label>
        <div className="flex flex-wrap gap-2">
          {CHART_TYPES.map((ct) => (
            <button
              key={ct.id}
              type="button"
              onClick={() => {
                setChartType(ct.id);
                setShowPreview(false);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                chartType === ct.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-accent"
              )}
            >
              {ct.icon}
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Axis Configuration */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">X-Axis</label>
          <select
            value={xAxis}
            onChange={(e) => {
              setXAxis(e.target.value);
              setShowPreview(false);
            }}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select column...</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col} ({columnTypes[col] || "unknown"})
              </option>
            ))}
          </select>
        </div>

        {needsYAxis && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Y-Axis</label>
            <select
              value={yAxis}
              onChange={(e) => {
                setYAxis(e.target.value);
                setShowPreview(false);
              }}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select column...</option>
              {(needsNumericY ? numericColumns : columns).map((col) => (
                <option key={col} value={col}>
                  {col} ({columnTypes[col] || "unknown"})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Aggregation</label>
          <select
            value={aggregation}
            onChange={(e) => {
              setAggregation(e.target.value as AggregationType);
              setShowPreview(false);
            }}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {AGGREGATIONS.map((agg) => (
              <option key={agg.value} value={agg.value}>
                {agg.label}
              </option>
            ))}
          </select>
        </div>

        {canGroupBy && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Group By (optional)</label>
            <select
              value={groupBy}
              onChange={(e) => {
                setGroupBy(e.target.value);
                setShowPreview(false);
              }}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">None</option>
              {categoricalColumns.map((col) => (
                <option key={col} value={col}>
                  {col} ({columnTypes[col] || "unknown"})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
          <label className="text-sm font-medium">Chart Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chart title..."
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Filters</label>
          <button
            type="button"
            onClick={addFilter}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
          >
            <Filter className="h-3 w-3" />
            Add Filter
          </button>
        </div>

        {filters.map((filter, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
            <select
              value={filter.column}
              onChange={(e) => updateFilter(index, { column: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            >
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>

            <select
              value={filter.operator}
              onChange={(e) => updateFilter(index, { operator: e.target.value as FilterCondition["operator"] })}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            >
              {FILTER_OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            <input
              type={isNumericColumn(columnTypes[filter.column]) && NUMERIC_OPERATORS.has(filter.operator) ? "number" : "text"}
              value={String(filter.value)}
              onChange={(e) => updateFilter(index, { value: e.target.value })}
              placeholder="Value..."
              className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />

            <button
              type="button"
              onClick={() => removeFilter(index)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!xAxis || isChartLoading}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5",
            "text-sm font-medium text-primary-foreground transition-colors",
            "hover:bg-primary/90 disabled:opacity-50"
          )}
        >
          {isChartLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          {isChartLoading ? "Generating..." : "Generate Preview"}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!xAxis || isSaving}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5",
            "text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          )}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Chart"}
        </button>
      </div>

      {/* Preview */}
      {showPreview && chartData && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-semibold">
            {chartData.config.title || "Chart Preview"}
          </h3>
          <ChartRenderer
            chartType={chartData.chartType}
            data={chartData.data}
            xLabel={chartData.config.xLabel}
            yLabel={chartData.config.yLabel}
            aggregation={chartData.config.aggregation}
            groupBy={chartData.config.groupBy}
            title={chartData.config.title}
          />
        </div>
      )}
    </div>
  );
}

