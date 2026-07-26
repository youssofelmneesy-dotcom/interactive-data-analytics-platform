import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

/**
 * Drag-and-drop file upload zone with file validation.
 */
export function FileDropzone({ onFileSelect, disabled }: FileDropzoneProps): JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const allowedExtensions = [".csv", ".xlsx", ".xls"];

  const isValidFile = (file: File): boolean => {
    if (allowedTypes.includes(file.type)) return true;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    return allowedExtensions.includes(ext);
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!isValidFile(file)) {
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const getFileIcon = (filename: string) => {
    const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
    if (ext === ".csv") return <FileText className="h-8 w-8 text-primary" />;
    return <FileSpreadsheet className="h-8 w-8 text-primary" />;
  };

  if (selectedFile) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getFileIcon(selectedFile.name)}
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            disabled={disabled}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-xl border-2 border-dashed p-12 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
      )}
    >
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleInputChange}
        disabled={disabled}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="Upload file"
      />

      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-medium">
            Drop your file here, or{" "}
            <span className="text-primary">click to browse</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Supports CSV, XLSX, and XLS files up to 50 MB
          </p>
        </div>
      </div>
    </div>
  );
}

