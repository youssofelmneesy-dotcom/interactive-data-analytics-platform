import { Loader2, CheckCircle2 } from "lucide-react";

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
  isSuccess: boolean;
  fileName?: string;
}

/**
 * Upload progress indicator with status states.
 */
export function UploadProgress({
  progress,
  isUploading,
  isSuccess,
  fileName,
}: UploadProgressProps): JSX.Element | null {
  if (!isUploading && !isSuccess) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          )}
          <span className="text-sm font-medium">
            {isSuccess ? "Upload complete" : `Uploading ${fileName || "file"}...`}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

