import { useState, useCallback } from "react";
import {
  Copy,
  Trash2,
  Calculator,
  AlignCenter,
  Hash,
  Type,
  Eraser,
  Columns3,
  Wand2,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCleaning } from "@/hooks/useCleaning";
import type { CleaningOperationType } from "@/types/dataset";

interface CleaningPanelProps {
  datasetId: string;
  columns: string[];
  inferredTypes: Record<string, string>;
}

interface CleaningAction {
  id: CleaningOperationType;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresColumn: boolean;
  requiresValue: boolean;
  valueLabel?: string;
  valueType?: "text" | "select";
  valueOptions?: string[];
}

/**
 * Cleaning panel with all available cleaning operations.
 */
export function CleaningPanel({ datasetId, columns, inferredTypes }: CleaningPanelProps): JSX.Element {
  const { mutate: applyCleaning, isPending, isSuccess, error, data: result } = useCleaning(datasetId);
  const [selectedAction, setSelectedAction] = useState<CleaningOperationType | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const actions: CleaningAction[] = [
    {
      id: "remove_duplicates",
      label: "Remove Duplicates",
      description: "Remove duplicate rows, keeping the first occurrence",
      icon: <Copy className="h-4 w-4" />,
      requiresColumn: false,
      requiresValue: false,
    },
    {
      id: "remove_empty_rows",
      label: "Remove Empty Rows",
      description: "Delete rows where all values are null or empty",
      icon: <Trash2 className="h-4 w-4" />,
      requiresColumn: false,
      requiresValue: false,
    },
    {
      id: "fill_mean",
      label: "Fill Missing (Mean)",
      description: "Fill nulls with the column average",
      icon: <Calculator className="h-4 w-4" />,
      requiresColumn: true,
      requiresValue: false,
    },
    {
      id: "fill_median",
      label: "Fill Missing (Median)",
      description: "Fill nulls with the column median",
      icon: <AlignCenter className="h-4 w-4" />,
      requiresColumn: true,
      requiresValue: false,
    },
    {
      id: "fill_mode",
      label: "Fill Missing (Mode)",
      description: "Fill nulls with the most frequent value",
      icon: <Hash className="h-4 w-4" />,
      requiresColumn: true,
      requiresValue: false,
    },
    {
      id: "fill_constant",
      label: "Fill Missing (Custom)",
      description: "Fill nulls with a custom value",
      icon: <Type className="h-4 w-4" />,
      requiresColumn: true,
      requiresValue: true,
      valueLabel: "Fill value",
      valueType: "text",
    },
    {
      id: "drop_missing_rows",
      label: "Drop Missing Rows",
      description: "Remove rows with null values",
      icon: <Eraser className="h-4 w-4" />,
      requiresColumn: false,
      requiresValue: false,
    },
    {
      id: "drop_missing_columns",
      label: "Drop Missing Columns",
      description: "Remove columns with >50% nulls",
      icon: <Columns3 className="h-4 w-4" />,
      requiresColumn: false,
      requiresValue: false,
    },
    {
      id: "rename_column",
      label: "Rename Column",
      description: "Change a column name",
      icon: <Type className="h-4 w-4" />,
      requiresColumn: true,
      requiresValue: true,
      valueLabel: "New name",
      valueType: "text",
    },
    {
      id: "change_type",
      label: "Change Type",
      description: "Convert column data type",
      icon: <Wand2 className="h-4 w-4" />,
      requiresColumn: true,
      requiresValue: true,
      valueLabel: "Target type",
      valueType: "select",
      valueOptions: ["integer", "float", "string", "boolean", "datetime"],
    },
  ];

  const selectedActionConfig = actions.find((a) => a.id === selectedAction);

  const handleApply = useCallback(() => {
    if (!selectedAction) return;

    const operation: { operation: CleaningOperationType; column?: string; value?: string | number } = {
      operation: selectedAction,
    };

    if (selectedActionConfig?.requiresColumn && selectedColumn) {
      operation.column = selectedColumn;
    }

    if (selectedActionConfig?.requiresValue && inputValue) {
      // Try to parse numeric values for fill_constant
      if (selectedAction === "fill_constant") {
        const numValue = Number(inputValue);
        operation.value = !isNaN(numValue) && inputValue.trim() !== "" ? numValue : inputValue;
      } else {
        operation.value = inputValue;
      }
    }

    applyCleaning(operation as Parameters<typeof applyCleaning>[0]);
  }, [selectedAction, selectedActionConfig, selectedColumn, inputValue, applyCleaning]);

  const handleActionSelect = useCallback((actionId: CleaningOperationType) => {
    setSelectedAction(actionId);
    setSelectedColumn("");
    setInputValue("");
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Data Cleaning</h2>

      {/* Action Grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleActionSelect(action.id)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
              selectedAction === action.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/30 hover:bg-accent/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-primary">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">{action.description}</span>
          </button>
        ))}
      </div>

      {/* Configuration Panel */}
      {selectedActionConfig && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Configure: {selectedActionConfig.label}</h3>

          <div className="flex flex-col gap-3">
            {selectedActionConfig.requiresColumn && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">Column</label>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a column...</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col} ({inferredTypes[col] || "unknown"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedActionConfig.requiresValue && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">
                  {selectedActionConfig.valueLabel}
                </label>
                {selectedActionConfig.valueType === "select" ? (
                  <select
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select...</option>
                    {selectedActionConfig.valueOptions?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Enter ${selectedActionConfig.valueLabel?.toLowerCase()}...`}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleApply}
              disabled={
                isPending ||
                (selectedActionConfig.requiresColumn && !selectedColumn) ||
                (selectedActionConfig.requiresValue && !inputValue)
              }
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2",
                "text-sm font-medium text-primary-foreground transition-colors",
                "hover:bg-primary/90 disabled:opacity-50"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Apply Cleaning
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {isSuccess && result && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Cleaning applied successfully</p>
            <p className="text-xs opacity-80">
              {result.operation}: {result.originalRows.toLocaleString()} →{" "}
              {result.newRows.toLocaleString()} rows
              {result.rowsRemoved > 0 && ` (${result.rowsRemoved} removed)`}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
}


