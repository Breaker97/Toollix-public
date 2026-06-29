import { useState, useCallback } from "react";
import { uploadFile, type UploadProgress, type UploadStatus } from "@/lib/upload";

export function useUpload() {
  const [progress, setProgress] = useState<UploadProgress>({
    percent: 0,
    speed: 0,
    loaded: 0,
    total: 0,
    timeLeft: null,
  });
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (url: string, body: XMLHttpRequestBodyInit, options: any = {}) => {
    setProgress({
      percent: 0,
      speed: 0,
      loaded: 0,
      total: 0,
      timeLeft: null,
    });
    setError(null);
    setStatus("idle");

    try {
      const result = await uploadFile(url, body, {
        ...options,
        onProgress: setProgress,
        onStatusChange: setStatus,
      });
      return result;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
      setStatus("error");
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setProgress({
      percent: 0,
      speed: 0,
      loaded: 0,
      total: 0,
      timeLeft: null,
    });
    setStatus("idle");
    setError(null);
  }, []);

  return { upload, progress, status, error, reset };
}
