/**
 * AxisSelector — Dropdown for selecting chart axes with type hints.
 *
 * Reusable component for X-axis, Y-axis, and Group-by selectors.
 */

import { cn } from "@/lib/utils";

interface AxisSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  columns: string[];
  columnTypes: Record<string, string>;
  placeholder?: string;
  allowNone?: boolean;
  filter?: (col: string, type: string) => boolean;
  disabled?: boolean;
}

export function AxisSelector({
  label,
  value,
  onChange,
  columns,
  columnTypes,
  placeholder = "Select column...",
  allowNone = false,
  filter,
  disabled,
}: AxisSelectorProps): JSX.Element {
  const filteredColumns = filter
    ? columns.filter((col) => filter(col, columnTypes[col] || ""))
    : columns;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || filteredColumns.length === 0}
        className={cn(
          "rounded-md border border-border bg-background px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {allowNone && <option value="">None</option>}
        {!allowNone && <option value="">{placeholder}</option>}

        {filteredColumns.map((col) => (
          <option key={col} value={col}>
            {col} ({columnTypes[col] || "unknown"})
          </option>
        ))}
      </select>

      {filteredColumns.length === 0 && !disabled && (
        <p className="text-xs text-muted-foreground">No suitable columns available.</p>
      )}
    </div>
  );
}

