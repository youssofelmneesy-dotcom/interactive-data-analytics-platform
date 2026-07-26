import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  page: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}

/**
 * Paginated data table for dataset preview.
 */
export function DataTable({
  columns,
  rows,
  page,
  totalPages,
  totalRows,
  onPageChange,
}: DataTableProps): JSX.Element {
  const formatCell = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") {
      return Number.isInteger(value) ? value.toString() : value.toFixed(4);
    }
    if (value instanceof Date) return value.toISOString();
    return String(value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="sticky left-0 bg-muted px-3 py-2 text-left font-medium text-muted-foreground">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="transition-colors hover:bg-muted/50"
              >
                <td className="sticky left-0 bg-background px-3 py-2 text-muted-foreground">
                  {(page - 1) * rows.length + rowIndex + 1}
                </td>
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-2 whitespace-nowrap"
                  >
                    {formatCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">{(page - 1) * rows.length + 1}</span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(page * rows.length, totalRows)}
          </span>{" "}
          of <span className="font-medium">{totalRows}</span> rows
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className={cn(
              "rounded-md p-2 transition-colors",
              page <= 1
                ? "text-muted-foreground/50"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={cn(
              "rounded-md p-2 transition-colors",
              page <= 1
                ? "text-muted-foreground/50"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="px-3 text-sm">
            Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={cn(
              "rounded-md p-2 transition-colors",
              page >= totalPages
                ? "text-muted-foreground/50"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className={cn(
              "rounded-md p-2 transition-colors",
              page >= totalPages
                ? "text-muted-foreground/50"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

