/**
 * Type definitions for chart-related entities.
 *
 * Synchronized with:
 * - User requirement: ChartType standard is "box" (not "boxplot")
 * - User requirement: AggregationType excludes "avg" (only "mean")
 * - ChartConfig.tsx: FilterCondition operators include "isnull", "notnull"
 * - ChartConfig.tsx: FilterCondition value is optional (hidden for isnull/notnull)
 * - Backend chart_engine.py: CHART_TYPES = {bar, line, pie, histogram, scatter, box, heatmap}
 * - Backend chart_engine.py: AGGREGATIONS = {sum, count, mean, median, min, max, std}
 * - ChartGallery.tsx: SavedChart accessed fields (id, chartType, title, xAxis, yAxis, aggregation, groupBy)
 */

export type ChartType = "bar" | "line" | "pie" | "histogram" | "scatter" | "box" | "heatmap";

export type AggregationType = "sum" | "count" | "mean" | "median" | "min" | "max" | "std";

export interface FilterCondition {
  column: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "in" | "isnull" | "notnull";
  value?: string | number | boolean | (string | number | boolean)[];
}

export interface ChartConfig {
  id?: string;
  datasetId: string;
  chartType: ChartType;
  title: string;
  xAxis: string | null;
  yAxis: string | null;
  aggregation: AggregationType;
  groupBy?: string | null;
  filters?: FilterCondition[];
  bins?: number;
}

export interface ChartDataPoint {
  [key: string]: string | number | null | undefined;
}

export interface ChartResponse {
  chartType: ChartType;
  data: ChartDataPoint[];
  config: {
    title: string;
    xLabel: string;
    yLabel: string;
    aggregation: AggregationType;
    groupBy?: string | null;
    rowCount: number;
  };
}

export interface ChartRecommendation {
  chartType: ChartType;
  xAxis: string;
  yAxis: string | null;
  aggregation: AggregationType;
  reason: string;
}

/**
 * SavedChart represents a persisted chart configuration from the backend.
 *
 * Backend shape (from chart_service.py save_chart_config):
 * { id, datasetId, chartType, title, xAxis, yAxis, aggregation, groupBy, filters, createdAt }
 *
 * Used by ChartGallery.tsx which accesses:
 * chart.id, chart.chartType, chart.title, chart.xAxis, chart.yAxis, chart.aggregation, chart.groupBy
 */
export interface SavedChart {
  id: string;
  datasetId: string;
  chartType: ChartType;
  title: string;
  xAxis: string | null;
  yAxis: string | null;
  aggregation: AggregationType;
  groupBy: string | null;
  filters: FilterCondition[];
  createdAt: string;
}

