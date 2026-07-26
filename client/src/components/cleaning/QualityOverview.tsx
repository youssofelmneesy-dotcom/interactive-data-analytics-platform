import { AlertTriangle, Copy, Trash2, Columns3, FileWarning } from "lucide-react";
import type { DatasetQuality } from "@/types/dataset";

interface QualityOverviewProps {
  quality: DatasetQuality;
}

/**
 * Displays a comprehensive dataset quality overview.
 */
export function QualityOverview({ quality }: QualityOverviewProps): JSX.Element {
  const hasIssues =
    quality.missingValues.totalNullRows > 0 ||
    quality.duplicateRows.duplicateRowCount > 0 ||
    quality.constantColumns.length > 0 ||
    quality.emptyRows.emptyRowCount > 0 ||
    quality.highNullColumns.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QualityCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Missing Values"
          value={quality.missingValues.totalNullRows}
          total={quality.totalRows}
          color="warning"
        />
        <QualityCard
          icon={<Copy className="h-4 w-4" />}
          label="Duplicate Rows"
          value={quality.duplicateRows.duplicateRowCount}
          total={quality.totalRows}
          color="info"
        />
        <QualityCard
          icon={<Trash2 className="h-4 w-4" />}
          label="Empty Rows"
          value={quality.emptyRows.emptyRowCount}
          total={quality.totalRows}
          color="danger"
        />
        <QualityCard
          icon={<Columns3 className="h-4 w-4" />}
          label="Constant Columns"
          value={quality.constantColumns.length}
          total={quality.totalColumns}
          color="neutral"
        />
      </div>

      {/* Detailed Issues */}
      {hasIssues ? (
        <div className="flex flex-col gap-3">
          {/* Missing Values Detail */}
          {quality.missingValues.totalNullRows > 0 && (
            <IssueCard
              title="Missing Values"
              icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            >
              <div className="grid gap-1 text-sm">
                <p className="text-muted-foreground">
                  {quality.missingValues.totalNullRows.toLocaleString()} rows contain at least one missing value.
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(quality.missingValues.nullCounts)
                    .filter(([, count]) => count > 0)
                    .map(([col, count]) => (
                      <span
                        key={col}
                        className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      >
                        {col}: {count}
                      </span>
                    ))}
                </div>
              </div>
            </IssueCard>
          )}

          {/* Duplicate Rows Detail */}
          {quality.duplicateRows.duplicateRowCount > 0 && (
            <IssueCard
              title="Duplicate Rows"
              icon={<Copy className="h-4 w-4 text-blue-500" />}
            >
              <p className="text-sm text-muted-foreground">
                {quality.duplicateRows.duplicateRowCount.toLocaleString()} duplicate rows found
                across {quality.duplicateRows.totalDuplicateGroups.toLocaleString()} groups.
              </p>
            </IssueCard>
          )}

          {/* Empty Rows Detail */}
          {quality.emptyRows.emptyRowCount > 0 && (
            <IssueCard
              title="Empty Rows"
              icon={<Trash2 className="h-4 w-4 text-red-500" />}
            >
              <p className="text-sm text-muted-foreground">
                {quality.emptyRows.emptyRowCount.toLocaleString()} rows are completely empty
                ({quality.emptyRows.emptyRowPercentage}% of dataset).
              </p>
            </IssueCard>
          )}

          {/* Constant Columns Detail */}
          {quality.constantColumns.length > 0 && (
            <IssueCard
              title="Constant Columns"
              icon={<FileWarning className="h-4 w-4 text-purple-500" />}
            >
              <div className="flex flex-wrap gap-2">
                {quality.constantColumns.map((col) => (
                  <span
                    key={col.column}
                    className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                  >
                    {col.column}: {String(col.value)}
                  </span>
                ))}
              </div>
            </IssueCard>
          )}

          {/* High Null Columns Detail */}
          {quality.highNullColumns.length > 0 && (
            <IssueCard
              title="High-Null Columns (>50%)"
              icon={<Columns3 className="h-4 w-4 text-orange-500" />}
            >
              <div className="flex flex-wrap gap-2">
                {quality.highNullColumns.map((col) => (
                  <span
                    key={col.column}
                    className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                  >
                    {col.column}: {col.nullPercentage}% null
                  </span>
                ))}
              </div>
            </IssueCard>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          No quality issues detected. Dataset looks clean!
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface QualityCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  color: "warning" | "info" | "danger" | "neutral";
}

function QualityCard({ icon, label, value, total, color }: QualityCardProps): JSX.Element {
  const colorClasses = {
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    danger: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    neutral: "bg-muted text-muted-foreground",
  };

  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`rounded-md p-1.5 ${colorClasses[color]}`}>{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value.toLocaleString()}</span>
        {value > 0 && (
          <span className="text-xs text-muted-foreground">{percentage}%</span>
        )}
      </div>
    </div>
  );
}

interface IssueCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function IssueCard({ title, icon, children }: IssueCardProps): JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      {children}
    </div>
  );
}


