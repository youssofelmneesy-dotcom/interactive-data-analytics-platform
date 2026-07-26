import { useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInsights, useGenerateInsights, useDeleteInsight } from "@/hooks/useInsights";
import { InsightCard } from "@/components/insights/InsightCard";
import type { Insight } from "@/types/insights";

interface InsightsPanelProps {
  datasetId: string;
}

const INSIGHT_TYPES = [
  { value: "summary", label: "Summary" },
  { value: "anomaly", label: "Anomalies" },
  { value: "correlation", label: "Correlations" },
  { value: "trend", label: "Trends" },
  { value: "outlier", label: "Outliers" },
];

export function InsightsPanel({ datasetId }: InsightsPanelProps): JSX.Element {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["summary", "anomaly", "trend"]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: insights, isLoading, error } = useInsights(datasetId);
  const { mutate: generateInsights, isPending: isGenerating } = useGenerateInsights();
  const { mutate: deleteInsight } = useDeleteInsight(datasetId);

  const handleGenerate = () => {
    generateInsights({
      datasetId,
      types: selectedTypes as Insight["type"][],
    });
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading insights...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="mb-2 h-5 w-5" />
        Failed to load insights: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Generation Controls */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Generate AI Insights</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {INSIGHT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => toggleType(t.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selectedTypes.includes(t.value)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || selectedTypes.length === 0}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
            "hover:bg-primary/90 disabled:opacity-50"
          )}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? "Analyzing..." : "Generate Insights"}
        </button>
      </div>

      {/* Insights List */}
      {insights && insights.length > 0 ? (
        <div className="flex flex-col gap-3">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              isExpanded={expandedId === insight.id}
              onToggle={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
              onDelete={() => deleteInsight(insight.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          <Sparkles className="mx-auto mb-3 h-8 w-8 opacity-50" />
          <p className="text-sm">No insights generated yet.</p>
          <p className="text-xs">Select insight types above and click Generate.</p>
        </div>
      )}
    </div>
  );
}

