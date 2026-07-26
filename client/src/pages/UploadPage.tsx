import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, AlertCircle } from "lucide-react";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { useUpload } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";

/**
 * Upload page for importing CSV and Excel files.
 */
export function UploadPage(): JSX.Element {
  const navigate = useNavigate();
  const { mutate: uploadFile, isPending, isSuccess, error } = useUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleUpload = useCallback(() => {
    if (!selectedFile) return;

    uploadFile(
      { file: selectedFile },
      {
        onSuccess: (data) => {
          navigate(`/dataset?id=${data.id}`);
        },
      }
    );
  }, [selectedFile, uploadFile, navigate]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-muted-foreground">
          Upload CSV or Excel files to begin analysis.
        </p>
      </div>

      <FileDropzone
        onFileSelect={handleFileSelect}
        disabled={isPending}
      />

      {selectedFile && !isPending && !isSuccess && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isPending}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3",
            "text-sm font-medium text-primary-foreground transition-colors",
            "hover:bg-primary/90 disabled:opacity-50"
          )}
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
      )}

      <UploadProgress
        progress={isPending ? 50 : isSuccess ? 100 : 0}
        isUploading={isPending}
        isSuccess={isSuccess}
        fileName={selectedFile?.name}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
}
