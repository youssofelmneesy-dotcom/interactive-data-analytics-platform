import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiUploadFile } from "@/lib/api";
import type { Dataset } from "@/types/dataset";

interface UploadVariables {
  file: File;
  onProgress?: (progress: number) => void;
}

/**
 * Hook for handling file uploads with progress tracking.
 */
export function useUpload() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<Dataset, Error, UploadVariables>({
    mutationFn: async ({ file, onProgress }) => {
      return apiUploadFile<Dataset>("/api/upload/", file, (p) => {
        setProgress(p);
        onProgress?.(p);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      setProgress(0);
    },
    onError: () => {
      setProgress(0);
    },
  });

  return {
    ...mutation,
    progress,
  };
}

