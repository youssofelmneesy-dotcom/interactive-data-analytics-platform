import { useState } from "react";
import { FileText, Loader2, Download, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReports, useGenerateReport, useDeleteReport, downloadReport } from "@/hooks/useReports";
import type { Report, GenerateReportRequest } from "@/types/insights";

interface ReportBuilderProps {
  datasetId: string;
}

const SECTION_OPTIONS = [
  { value: "summary", label: "Executive Summary" },
  { value: "chart", label: "Saved Charts" },
  { value: "insight", label: "AI Insights" },
  { value: "table", label: "Data Preview" },
  { value: "text", label: "Custom Text" },
];

export function ReportBuilder({ datasetId }: ReportBuilderProps): JSX.Element {
  const [title, setTitle] = useState("Data Analysis Report");
  const [description, setDescription] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>(["summary", "chart", "insight", "table"]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);

  const { data: reports, isLoading, error } = useReports(datasetId);
  const { mutate: generateReport, isPending: isGenerating, data: newReport } = useGenerateReport();
  const { mutate: deleteReport } = useDeleteReport(datasetId);

  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleGenerate = () => {
    generateReport({
      datasetId,
      title,
      description: description || undefined,
      sectionTypes: selectedSections as GenerateReportRequest["sectionTypes"],
      includeCharts,
      includeInsights,
    });
  };

  const handleDownload = async (report: Report) => {
    await downloadReport(datasetId, report.id, report.title);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Configuration */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Configure Report</h3>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Report Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Sections</label>
            <div className="flex flex-wrap gap-2">
              {SECTION_OPTIONS.map((section) => (
                <button
                  key={section.value}
                  type="button"
                  onClick={() => toggleSection(section.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    selectedSections.includes(section.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground hover:bg-accent"
                  )}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Include Charts
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeInsights}
                onChange={(e) => setIncludeInsights(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Include AI Insights
            </label>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || selectedSections.length === 0}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors",
              "hover:bg-primary/90 disabled:opacity-50"
            )}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isGenerating ? "Generating PDF..." : "Generate Report"}
          </button>

          {newReport && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Report generated successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Generated Reports */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Generated Reports</h3>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading reports...</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mb-2 h-5 w-5" />
            Failed to load reports: {error.message}
          </div>
        )}

        {reports && reports.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold">{report.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    Generated on {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDownload(report)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReport(report.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Delete report"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-8 w-8 opacity-50" />
            <p className="text-sm">No reports generated yet.</p>
            <p className="text-xs">Configure and generate your first report above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

