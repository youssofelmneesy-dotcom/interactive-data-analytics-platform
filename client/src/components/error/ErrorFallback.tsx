import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps): JSX.Element {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-destructive/50 bg-destructive/10 p-8 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div>
        <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
        <p className="mt-1 text-sm text-destructive/80">
          {error?.message || "An unexpected error occurred while rendering this page."}
        </p>
      </div>
      {resetErrorBoundary && (
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  );
}

