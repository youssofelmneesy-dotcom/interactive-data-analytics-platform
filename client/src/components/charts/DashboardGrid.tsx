/**
 * DashboardGrid — Responsive grid layout for multiple charts.
 *
 * Displays saved charts in a responsive grid with drag-free layout.
 */

import { LayoutDashboard } from "lucide-react";
import { ChartCard } from "@/components/charts/ChartCard";
import type { SavedChart } from "@/types/chart";

interface DashboardGridProps {
  charts: SavedChart[];
  onDeleteChart?: (chartId: string) => void;
}

export function DashboardGrid({ charts, onDeleteChart }: DashboardGridProps): JSX.Element {
  if (charts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
        <LayoutDashboard className="h-10 w-10 text-muted-foreground/50" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No saved charts yet</p>
          <p className="text-xs text-muted-foreground/70">
            Use the chart builder above to create and save visualizations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {charts.map((chart) => (
        <ChartCard
          key={chart.id}
          chart={chart}
          onDelete={onDeleteChart}
        />
      ))}
    </div>
  );
}
