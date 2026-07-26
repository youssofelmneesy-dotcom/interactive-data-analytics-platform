import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Dataset, DatasetPreview, ColumnStats } from "@/types/dataset";

/**
 * Hook for fetching all datasets.
 */
export function useDatasets() {
  return useQuery<Dataset[]>({
    queryKey: ["datasets"],
    queryFn: () => apiGet("/api/datasets/"),
  });
}

/**
 * Hook for fetching a single dataset by ID.
 */
export function useDataset(datasetId: string | null) {
  return useQuery<Dataset>({
    queryKey: ["dataset", datasetId],
    queryFn: () => apiGet(`/api/datasets/${datasetId}`),
    enabled: !!datasetId,
  });
}

/**
 * Hook for fetching a paginated dataset preview.
 */
export function useDatasetPreview(datasetId: string | null, page: number = 1, pageSize: number = 50) {
  return useQuery<DatasetPreview>({
    queryKey: ["dataset-preview", datasetId, page, pageSize],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/preview?page=${page}&page_size=${pageSize}`),
    enabled: !!datasetId,
  });
}

/**
 * Hook for fetching column statistics for a dataset.
 */
export function useDatasetStats(datasetId: string | null) {
  return useQuery<ColumnStats[]>({
    queryKey: ["dataset-stats", datasetId],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/stats`),
    enabled: !!datasetId,
  });
}

