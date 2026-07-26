import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { Report, GenerateReportRequest } from "@/types/insights";

// ============================================================
// REPORT QUERIES
// ============================================================

/**
 * Fetch all generated reports for a dataset.
 */
export function useReports(datasetId: string | null) {
  return useQuery<Report[]>({
    queryKey: ["reports", datasetId],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/reports`),
    enabled: !!datasetId,
  });
}

/**
 * Fetch a single report by ID.
 */
export function useReport(datasetId: string | null, reportId: string | null) {
  return useQuery<Report>({
    queryKey: ["report", datasetId, reportId],
    queryFn: () => apiGet(`/api/datasets/${datasetId}/reports/${reportId}`),
    enabled: !!datasetId && !!reportId,
  });
}

// ============================================================
// REPORT GENERATION
// ============================================================

/**
 * Generate a new PDF report.
 */
export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation<Report, Error, GenerateReportRequest>({
    mutationFn: ({ datasetId, title, description, sectionTypes, includeCharts, includeInsights }) =>
      apiPost<Report, Omit<GenerateReportRequest, "datasetId">>(
        `/api/datasets/${datasetId}/reports`,
        { title, description, sectionTypes, includeCharts, includeInsights }
      ),
    onSuccess: (_, { datasetId }) => {
      queryClient.invalidateQueries({
        queryKey: ["reports", datasetId],
      });
    },
  });
}

// ============================================================
// REPORT DOWNLOAD
// ============================================================

/**
 * Download a generated PDF report.
 * Returns a blob URL for the downloaded file.
 */
export async function downloadReport(datasetId: string, reportId: string, title: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/datasets/${datasetId}/reports/${reportId}/download`
  );

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// ============================================================
// REPORT DELETION
// ============================================================

/**
 * Delete a report.
 */
export function useDeleteReport(datasetId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (reportId) =>
      apiDelete(`/api/datasets/${datasetId}/reports/${reportId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reports", datasetId],
      });
    },
  });
}

