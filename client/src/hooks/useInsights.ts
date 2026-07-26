import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { Insight, InsightRequest } from "@/types/insights";

// ============================================================
// INSIGHTS QUERIES
// ============================================================

/**
 * Fetch all AI-generated insights for a dataset.
 */
export function useInsights(datasetId: string | null) {
  return useQuery<Insight[]>({
    queryKey: ["insights", datasetId],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/insights`),
    enabled: !!datasetId,
  });
}

/**
 * Fetch insights filtered by type.
 */
export function useInsightsByType(datasetId: string | null, type: string | null) {
  return useQuery<Insight[]>({
    queryKey: ["insights", datasetId, type],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/insights?type=${type}`),
    enabled: !!datasetId && !!type,
  });
}

/**
 * Fetch a single insight by ID.
 */
export function useInsight(datasetId: string | null, insightId: string | null) {
  return useQuery<Insight>({
    queryKey: ["insight", datasetId, insightId],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/insights/${insightId}`),
    enabled: !!datasetId && !!insightId,
  });
}

// ============================================================
// INSIGHT GENERATION
// ============================================================

/**
 * Generate AI insights for a dataset.
 */
export function useGenerateInsights() {
  const queryClient = useQueryClient();

  return useMutation<Insight[], Error, InsightRequest>({
    mutationFn: ({ datasetId, types, maxInsights }) =>
      apiPost<Insight[], { types?: string[]; maxInsights?: number }>(
        `/api/datasets/${datasetId}/insights/generate`,
        { types, maxInsights }
      ),
    onSuccess: (_, { datasetId }) => {
      queryClient.invalidateQueries({
        queryKey: ["insights", datasetId],
      });
    },
  });
}

// ============================================================
// INSIGHT DELETION
// ============================================================

/**
 * Delete an insight.
 */
export function useDeleteInsight(datasetId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (insightId) =>
      apiDelete(`/api/datasets/${datasetId}/insights/${insightId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["insights", datasetId],
      });
    },
  });
}

