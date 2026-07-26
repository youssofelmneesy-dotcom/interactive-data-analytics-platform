/**
 * ExportButton — Standalone PDF export button for reports.
 *
 * Can be used in any context where quick report generation is needed.
 */

import { useState, useCallback } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerateReport, downloadReport } from "@/hooks/useReports";

interface ExportButtonProps {
  datasetId: string;
  title?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ExportButton({
  datasetId,
  title = "Quick Export",
  variant = "default",
  size = "sm",
  className,
}: ExportButtonProps): JSX.Element {
  const { mutate: generateReport, isPending: isGenerating, data: report } = useGenerateReport();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExport = useCallback(async () => {
    if (report) {
      setIsDownloading(true);
      try {
        await downloadReport(datasetId, report.id, report.title);
      } finally {
        setIsDownloading(false);
      }
      return;
    }

    generateReport({
      datasetId,
      title,
      sectionTypes: ["summary", "chart", "insight", "table"],
      includeCharts: true,
      includeInsights: true,
    });
  }, [datasetId, title, report, generateReport]);

  const isLoading = isGenerating || isDownloading;

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-background hover:bg-accent",
    ghost: "hover:bg-accent",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-sm",
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isGenerating ? "Generating..." : isDownloading ? "Downloading..." : "Export PDF"}
    </button>
  );
}

