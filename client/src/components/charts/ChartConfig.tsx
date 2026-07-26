import { useMemo } from "react";
import { BarChart3, LineChart as LineChartIcon, PieChart, Activity, ScatterChart as ScatterIcon, BoxSelect, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChartType, AggregationType, FilterCondition } from "@/types/chart";

interface ChartConfigProps {
  columns: string[];
  inferredTypes: Record<string, string>;
  config: {
    chartType: ChartType;
    title: string;
    xAxis: string;
    yAxis: string;
    aggregation: AggregationType;
    groupBy: string;
    colorBy: string;
    valueColumn: string;
    bins: number;
    mode: "correlation" | "pivot";
  };
  onChange: (field: string, value: string | number) => void;
  onAddFilter: () => void;
  onUpdateFilter: (index: number, filter: FilterCondition) => void;
  onRemoveFilter: (index: number) => void;
  filters: FilterCondition[];
}

const CHART_TYPES: { value: ChartType; label: string; icon: React.ReactNode }[] = [
  { value: "bar", label: "Bar", icon: <BarChart3 className="h-4 w-4" /> },
  { value: "line", label: "Line", icon: <LineChartIcon className="h-4 w-4" /> },
  { value: "pie", label: "Pie", icon: <PieChart className="h-4 w-4" /> },
  { value: "histogram", label: "Histogram", icon: <Activity className="h-4 w-4" /> },
  { value: "scatter", label: "Scatter", icon: <ScatterIcon className="h-4 w-4" /> },
  { value: "box", label: "Box Plot", icon: <BoxSelect className="h-4 w-4" /> },
  { value: "heatmap", label: "Heatmap", icon: <Grid3X3 className="h-4 w-4" /> },
];

const AGGREGATIONS: { value: AggregationType; label: string }[] = [
  { value: "count", label: "Count" },
  { value: "sum", label: "Sum" },
  { value: "mean", label: "Mean" },
  { value: "median", label: "Median" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
  { value: "std", label: "Std Dev" },
];

const FILTER_OPERATORS = [
  { value: "eq", label: "Equals" },
  { value: "ne", label: "Not Equals" },
  { value: "gt", label: "Greater Than" },
  { value: "gte", label: "Greater or Equal" },
  { value: "lt", label: "Less Than" },
  { value: "lte", label: "Less or Equal" },
  { value: "contains", label: "Contains" },
  { value: "isnull", label: "Is Null" },
  { value: "notnull", label: "Is Not Null" },
];

/**
 * Chart configuration panel with axis selectors, aggregations, and filters.
 */
export function ChartConfig({
  columns,
  inferredTypes,
  config,
  onChange,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
  filters,
}: ChartConfigProps): JSX.Element {
  const numericColumns = useMemo(
    () => columns.filter((c) => inferredTypes[c] === "integer" || inferredTypes[c] === "float"),
    [columns, inferredTypes]
  );

  const categoricalColumns = useMemo(
    () => columns.filter((c) => inferredTypes[c] === "string" || inferredTypes[c] === "boolean"),
    [columns, inferredTypes]
  );

  const needsYAxis = config.chartType !== "histogram" && config.chartType !== "pie";
  const needsAggregation = config.chartType !== "scatter" && config.chartType !== "box";
  const isHeatmap = config.chartType === "heatmap";

  return (
    <div className="flex flex-col gap-4">
      {/* Chart Type Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium">Chart Type</label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {CHART_TYPES.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => onChange("chartType", ct.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors",
                config.chartType === ct.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              )}
            >
              {ct.icon}
              <span>{ct.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Chart Title</label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Enter chart title..."
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Axis Configuration */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* X Axis */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">X Axis</label>
          <select
            value={config.xAxis}
            onChange={(e) => onChange("xAxis", e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select column...</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col} ({inferredTypes[col] || "unknown"})
              </option>
            ))}
          </select>
        </div>

        {/* Y Axis */}
        {needsYAxis && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Y Axis</label>
            <select
              value={config.yAxis}
              onChange={(e) => onChange("yAxis", e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select column...</option>
              {numericColumns.map((col) => (
                <option key={col} value={col}>
                  {col} (numeric)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Aggregation */}
        {needsAggregation && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Aggregation</label>
            <select
              value={config.aggregation}
              onChange={(e) => onChange("aggregation", e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {AGGREGATIONS.map((agg) => (
                <option key={agg.value} value={agg.value}>
                  {agg.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Group By */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Group By (Optional)</label>
          <select
            value={config.groupBy}
            onChange={(e) => onChange("groupBy", e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">None</option>
            {categoricalColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* Heatmap-specific: Value Column */}
        {isHeatmap && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Value Column</label>
            <select
              value={config.valueColumn}
              onChange={(e) => onChange("valueColumn", e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select...</option>
              {numericColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Heatmap-specific: Mode */}
        {isHeatmap && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Heatmap Mode</label>
            <select
              value={config.mode}
              onChange={(e) => onChange("mode", e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pivot">Pivot Table</option>
              <option value="correlation">Correlation</option>
            </select>
          </div>
        )}

        {/* Histogram-specific: Bins */}
        {config.chartType === "histogram" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Number of Bins</label>
            <input
              type="number"
              min={2}
              max={100}
              value={config.bins}
              onChange={(e) => onChange("bins", parseInt(e.target.value) || 10)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {/* Scatter-specific: Color By */}
        {config.chartType === "scatter" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Color By (Optional)</label>
            <select
              value={config.colorBy}
              onChange={(e) => onChange("colorBy", e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">None</option>
              {categoricalColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Filters</label>
          <button
            type="button"
            onClick={onAddFilter}
            className="text-xs text-primary hover:underline"
          >
            + Add Filter
          </button>
        </div>

        {filters.length === 0 && (
          <p className="text-xs text-muted-foreground">No filters applied.</p>
        )}

        {filters.map((filter, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select
              value={filter.column}
              onChange={(e) => onUpdateFilter(idx, { ...filter, column: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Column</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>

            <select
              value={filter.operator}
              onChange={(e) => onUpdateFilter(idx, { ...filter, operator: e.target.value as FilterCondition["operator"] })}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {FILTER_OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            {!["isnull", "notnull"].includes(filter.operator) && (
              <input
                type="text"
                value={String(filter.value || "")}
                onChange={(e) => onUpdateFilter(idx, { ...filter, value: e.target.value })}
                placeholder="Value"
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}

            <button
              type="button"
              onClick={() => onRemoveFilter(idx)}
              className="rounded-md p-1 text-muted-foreground hover:text-destructive"
              aria-label="Remove filter"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

