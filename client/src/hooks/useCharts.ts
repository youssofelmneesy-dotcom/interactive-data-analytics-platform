import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type {
  ChartConfig,
  ChartResponse,
  ChartRecommendation,
  SavedChart,
  FilterCondition,
} from "@/types/chart";

// ============================================================
// CHART RECOMMENDATIONS
// ============================================================

/**
 * Fetch automatic chart recommendations for a dataset.
 */
export function useChartRecommendations(datasetId: string | null) {
  return useQuery<ChartRecommendation[]>({
    queryKey: ["chart-recommendations", datasetId],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/charts/recommendations`),
    enabled: !!datasetId,
  });
}

// ============================================================
// CHART DATA GENERATION
// ============================================================

interface GenerateChartParams {
  datasetId: string;
  chartType: ChartConfig["chartType"];
  xAxis: string | null;
  yAxis: string | null;
  aggregation: ChartConfig["aggregation"];
  groupBy?: string | null;
  filters?: FilterCondition[];
  title?: string;
  bins?: number;
}

/**
 * Generate chart data on-demand for preview.
 */
export function useChartData(params: GenerateChartParams | null) {
  return useQuery<ChartResponse>({
    queryKey: [
      "chart-data",
      params?.datasetId,
      params?.chartType,
      params?.xAxis,
      params?.yAxis,
      params?.aggregation,
      params?.groupBy,
      params?.filters,
      params?.bins,
    ],
    queryFn: () =>
      apiPost<ChartResponse, Omit<GenerateChartParams, "datasetId">>(
        `/api/datasets/${params!.datasetId}/charts`,
        {
          chartType: params!.chartType,
          xAxis: params!.xAxis,
          yAxis: params!.yAxis,
          aggregation: params!.aggregation,
          groupBy: params!.groupBy,
          filters: params!.filters,
          title: params!.title,
          bins: params?.bins,
        }
      ),
    enabled: !!params,
  });
}

// ============================================================
// SAVED CHART CONFIGURATIONS
// ============================================================

/**
 * List all saved chart configurations for a dataset.
 */
export function useSavedCharts(datasetId: string | null) {
  return useQuery<SavedChart[]>({
    queryKey: ["saved-charts", datasetId],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/charts`),
    enabled: !!datasetId,
  });
}

interface SaveChartParams {
  datasetId: string;
  chartType: ChartConfig["chartType"];
  title: string;
  xAxis: string | null;
  yAxis: string | null;
  aggregation: ChartConfig["aggregation"];
  groupBy?: string | null;
  filters?: FilterCondition[];
}

/**
 * Save a chart configuration for later reuse.
 */
export function useSaveChart() {
  const queryClient = useQueryClient();

  return useMutation<SavedChart, Error, SaveChartParams>({
    mutationFn: (params) =>
      apiPost<SavedChart, Omit<SaveChartParams, "datasetId">>(
        `/api/datasets/${params.datasetId}/charts/save`,
        {
          chartType: params.chartType,
          title: params.title,
          xAxis: params.xAxis,
          yAxis: params.yAxis,
          aggregation: params.aggregation,
          groupBy: params.groupBy,
          filters: params.filters,
        }
      ),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: ["saved-charts", params.datasetId],
      });
    },
  });
}

/**
 * Delete a saved chart configuration.
 */
export function useDeleteChart(datasetId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (chartId) => apiDelete(`/api/datasets/${datasetId}/charts/${chartId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["saved-charts", datasetId],
      });
    },
  });
}

