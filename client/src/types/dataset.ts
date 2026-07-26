/**
 * Type definitions for dataset-related entities.
 *
 * Synchronized with actual component usage only.
 * No invented fields.
 */

// ============================================================
// DATASET (inferred from architecture + DataPreview/DataTable usage)
// ============================================================

export interface Dataset {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  columns: string[];
  columnTypes: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetPreview {
  columns: string[];
  rows: Record<string, unknown>[];
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
}

// ============================================================
// COLUMN STATS (inferred from ColumnStats.tsx)
// ============================================================

/**
 * Column statistics as consumed by ColumnStats.tsx.
 *
 * Field usage provenance:
 * - name: ColumnStats.tsx line ~22 (key={stat.name}), ~24 (title={stat.name}), ~27 (display)
 * - type: ColumnStats.tsx line ~31 (getTypeIcon(stat.type)), ~35 (getTypeLabel(stat.type))
 * - totalRows: ColumnStats.tsx line ~42 ({stat.totalRows.toLocaleString()})
 * - uniqueCount: ColumnStats.tsx line ~46 ({stat.uniqueCount.toLocaleString()})
 * - nullCount: ColumnStats.tsx line ~50 ({stat.nullCount.toLocaleString()})
 * - nullPercentage: ColumnStats.tsx line ~50 ({stat.nullPercentage}%)
 * - mean: ColumnStats.tsx line ~56 (conditional), ~64 ({stat.mean.toFixed(2)})
 * - median: ColumnStats.tsx line ~68 (conditional), ~69 ({stat.median.toFixed(2)})
 * - min: ColumnStats.tsx line ~74 (conditional), ~75 (String(stat.min))
 * - max: ColumnStats.tsx line ~80 (conditional), ~81 (String(stat.max))
 * - mostFrequent: ColumnStats.tsx line ~89 (conditional), ~90 (display)
 */
export interface ColumnStats {
  name: string;
  type: string;
  totalRows: number;
  uniqueCount: number;
  nullCount: number;
  nullPercentage: number;
  mean?: number | null;
  median?: number | null;
  min?: number | string | null;
  max?: number | string | null;
  mostFrequent?: string | number | null;
}

export interface DatasetStats {
  datasetId: string;
  columns: ColumnStats[];
}

// ============================================================
// DATASET QUALITY (inferred from QualityOverview.tsx + DatasetPage.tsx)
// ============================================================

/**
 * Represents a constant column entry.
 * Inferred from QualityOverview.tsx line ~115-117:
 *   quality.constantColumns.map((col) => ...)
 *   col.column (string), col.value (unknown)
 */
export interface ConstantColumnEntry {
  column: string;
  value: unknown;
}

/**
 * Represents a high-null column entry.
 * Inferred from QualityOverview.tsx line ~129-131:
 *   quality.highNullColumns.map((col) => ...)
 *   col.column (string), col.nullPercentage (number)
 */
export interface HighNullColumnEntry {
  column: string;
  nullPercentage: number;
}

/**
 * Dataset quality report.
 *
 * Imported by QualityOverview.tsx as DatasetQuality.
 * Also consumed by DatasetPage.tsx which accesses quality.inferredTypes.
 *
 * Field usage provenance from QualityOverview.tsx:
 * - totalRows: line ~32 (QualityCard value/total), ~39, ~46
 * - totalColumns: line ~53 (QualityCard value/total)
 * - missingValues.totalNullRows: line ~31 (hasIssues), ~66 (conditional), ~69 (display)
 * - missingValues.nullCounts: line ~72 (Object.entries(...).filter(...))
 * - duplicateRows.duplicateRowCount: line ~38 (hasIssues), ~90 (conditional), ~93 (display)
 * - duplicateRows.totalDuplicateGroups: line ~94 (display)
 * - emptyRows.emptyRowCount: line ~45 (hasIssues), ~101 (conditional), ~104 (display)
 * - emptyRows.emptyRowPercentage: line ~105 (display)
 * - constantColumns: line ~52 (hasIssues), ~112 (conditional), ~115 (map)
 * - highNullColumns: line ~126 (conditional), ~129 (map)
 *
 * Field usage provenance from DatasetPage.tsx:
 * - inferredTypes: line ~99 (Object.keys(quality.inferredTypes)), ~102 (passed to CleaningPanel)
 */
export interface DatasetQuality {
  datasetId: string;
  totalRows: number;
  totalColumns: number;
  missingValues: {
    totalNullRows: number;
    nullCounts: Record<string, number>;
  };
  duplicateRows: {
    duplicateRowCount: number;
    totalDuplicateGroups: number;
  };
  emptyRows: {
    emptyRowCount: number;
    emptyRowPercentage: number;
  };
  constantColumns: ConstantColumnEntry[];
  highNullColumns: HighNullColumnEntry[];
  inferredTypes: Record<string, string>;
}

/**
 * Alias for backward compatibility with hooks that may reference QualityReport.
 */
export type QualityReport = DatasetQuality;

// ============================================================
// CLEANING (inferred from CleaningPanel.tsx)
// ============================================================

/**
 * Cleaning result as consumed by CleaningPanel.tsx.
 *
 * Field usage provenance:
 * - originalRows: CleaningPanel.tsx ({result.originalRows.toLocaleString()})
 * - newRows: CleaningPanel.tsx ({result.newRows.toLocaleString()})
 * - rowsRemoved: CleaningPanel.tsx ({result.rowsRemoved > 0 && ...})
 */
export interface CleaningResult {
  originalRows: number;
  newRows: number;
  rowsRemoved: number;
}

export interface CleaningJob {
  id: string;
  datasetId: string;
  operation: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: CleaningResult;
  createdAt: string;
  completedAt?: string;
}

export type CleaningOperationType =
  | "remove_duplicates"
  | "remove_empty_rows"
  | "fill_mean"
  | "fill_median"
  | "fill_mode"
  | "fill_constant"
  | "drop_missing_rows"
  | "drop_missing_columns"
  | "rename_column"
  | "change_type";

export interface CleaningOperation {
  operation: CleaningOperationType;
  column?: string;
  value?: string | number;
  newName?: string;
  newType?: string;
}


