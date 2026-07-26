/**
 * Type definitions for AI insights and report-related entities.
 */

export interface Insight {
  id: string;
  datasetId: string;
  type: "summary" | "anomaly" | "correlation" | "trend" | "outlier";
  title: string;
  description: string;
  confidence: number;
  severity?: "low" | "medium" | "high";
  relatedColumns?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface InsightRequest {
  datasetId: string;
  types?: Insight["type"][];
  columns?: string[];
  maxInsights?: number;
}

export interface Report {
  id: string;
  datasetId: string;
  title: string;
  description?: string;
  filePath?: string;
  sections: ReportSection[];
  status: "draft" | "generating" | "completed" | "failed";
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface ReportSection {
  id: string;
  type: "summary" | "chart" | "insight" | "table" | "text";
  title: string;
  content?: string;
  chartId?: string;
  insightId?: string;
  order: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  sections: Omit<ReportSection, "id">[];
}

export interface GenerateReportRequest {
  datasetId: string;
  title: string;
  description?: string;
  templateId?: string;
  sectionTypes?: ReportSection["type"][];
  includeCharts?: boolean;
  includeInsights?: boolean;
}

export interface ExportReportRequest {
  reportId: string;
  format: "pdf" | "html" | "markdown";
}

