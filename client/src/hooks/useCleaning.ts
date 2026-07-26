import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type {
  QualityReport,
  CleaningJob,
  CleaningOperation,
  CleaningResult,
} from "@/types/dataset";

// ============================================================
// DATA QUALITY
// ============================================================

/**
 * Fetch the quality report for a dataset.
 */
export function useDatasetQuality(datasetId: string | null) {
  return useQuery<QualityReport>({
    queryKey: ["dataset-quality", datasetId],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/quality`),
    enabled: !!datasetId,
  });
}

// ============================================================
// CLEANING OPERATIONS
// ============================================================

interface CleanDatasetParams {
  datasetId: string;
  operation: CleaningOperation;
}

/**
 * Execute a cleaning operation on a dataset.
 */
export function useCleanDataset() {
  const queryClient = useQueryClient();

  return useMutation<CleaningJob, Error, CleanDatasetParams>({
    mutationFn: ({ datasetId, operation }) =>
      apiPost<CleaningJob, CleaningOperation>(
        `/api/datasets/${datasetId}/clean`,
        operation
      ),
    onSuccess: (_, { datasetId }) => {
      queryClient.invalidateQueries({
        queryKey: ["dataset-quality", datasetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dataset-preview", datasetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dataset-stats", datasetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dataset", datasetId],
      });
    },
  });
}

interface CleaningResponse extends CleaningResult {
  operation: string;
}

/**
 * Apply a cleaning operation to a bound dataset.
 */
export function useCleaning(datasetId: string) {
  const queryClient = useQueryClient();

  return useMutation<CleaningResponse, Error, CleaningOperation>({
    mutationFn: (operation) =>
      apiPost<CleaningResponse, CleaningOperation>(
        `/api/datasets/${datasetId}/clean`,
        operation
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dataset-quality", datasetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dataset-preview", datasetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dataset-stats", datasetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dataset", datasetId],
      });
    },
  });
}

/**
 * Fetch the list of cleaning jobs for a dataset.
 */
export function useCleaningJobs(datasetId: string | null) {
  return useQuery<CleaningJob[]>({
    queryKey: ["cleaning-jobs", datasetId],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/clean/jobs`),
    enabled: !!datasetId,
  });
}



