/**
 * Utility for handling file uploads with real-time progress and speed tracking.
 */

export interface UploadProgress {
  percent: number;
  speed: number; // Bytes per second
  loaded: number;
  total: number;
  timeLeft: number | null; // Seconds
}

export type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onStatusChange?: (status: UploadStatus) => void;
  method?: string;
  headers?: Record<string, string>;
}

export async function uploadFile(
  url: string,
  body: XMLHttpRequestBodyInit,
  options: UploadOptions = {}
): Promise<any> {
  const { 
    onProgress, 
    onStatusChange, 
    method = "POST", 
    headers = {} 
  } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();
    
    // Moving average for speed calculation
    const SAMPLE_SIZE = 10;
    const samples: { loaded: number; timestamp: number }[] = [];

    onStatusChange?.("uploading");

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const now = Date.now();
        samples.push({ loaded: event.loaded, timestamp: now });

        // Keep samples within the last 1 second
        if (samples.length > SAMPLE_SIZE) samples.shift();

        let currentSpeed = 0;
        if (samples.length > 1) {
          const first = samples[0];
          const last = samples[samples.length - 1];
          const timeDelta = (last.timestamp - first.timestamp) / 1000;
          const loadDelta = last.loaded - first.loaded;
          currentSpeed = timeDelta > 0 ? loadDelta / timeDelta : 0;
        }

        const percent = Math.round((event.loaded / event.total) * 100);
        // timeLeft = bytesRemaining / speed
        const timeLeft = currentSpeed > 0 ? (event.total - event.loaded) / currentSpeed : null;

        onProgress?.({
          percent,
          speed: currentSpeed,
          loaded: event.loaded,
          total: event.total,
          timeLeft,
        });

        // The moment we hit 100% on the upload stream, we move to processing phase.
        // This is the "hand-off" to the server.
        if (percent === 100) {
          onStatusChange?.("processing");
        }
      }
    });

    xhr.responseType = "blob";

    xhr.addEventListener("load", async () => {
      // If we finished the request, we are done (or have an error)
      if (xhr.status >= 200 && xhr.status < 300) {
        onStatusChange?.("done");
        try {
          const contentType = xhr.getResponseHeader("content-type");
          if (contentType?.includes("application/json")) {
            const text = await xhr.response.text();
            resolve(JSON.parse(text));
          } else {
            const url = URL.createObjectURL(xhr.response);
            
            // Extract custom metadata headers safely
            const safeGetHeader = (name: string) => {
              try { return xhr.getResponseHeader(name) || "0"; } catch (e) { return "0"; }
            };

            const originalSize   = parseInt(safeGetHeader("X-Original-Size"));
            const compressedSize = parseInt(safeGetHeader("X-Compressed-Size"));
            const savedPercent   = parseInt(safeGetHeader("X-Saved-Percent"));
            const processedCount = parseInt(safeGetHeader("X-Images-Processed"));

            resolve({ 
              url, 
              blob: xhr.response, 
              via: "binary",
              originalSize,
              compressedSize,
              savedPercent,
              processedCount,
              filename: xhr.getResponseHeader("Content-Disposition")?.split('filename="')[1]?.split('"')[0] || "download.pdf"
            });
          }
        } catch (e) {
          const url = URL.createObjectURL(xhr.response);
          resolve({ url, blob: xhr.response, via: "unknown" });
        }
      } else {
        onStatusChange?.("error");
        try {
          const text = await xhr.response.text();
          const errorData = JSON.parse(text);
          reject(new Error(errorData.error || errorData.message || `Server error (${xhr.status})`));
        } catch (e) {
          reject(new Error(`Server returned status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      onStatusChange?.("error");
      reject(new Error("Network connection failed."));
    });

    xhr.addEventListener("abort", () => {
      onStatusChange?.("idle");
      reject(new Error("Upload cancelled."));
    });

    xhr.open(method, url);

    const guestId = typeof window !== "undefined" ? localStorage.getItem("toollix_guest_id") : "";
    if (guestId) xhr.setRequestHeader("x-guest-id", guestId);
    xhr.setRequestHeader("ngrok-skip-browser-warning", "true");

    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.send(body);
  });
}

/**
 * Helper to format bytes to human readable string
 */
export function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return `${parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatTime(seconds: number): string {
  if (seconds === Infinity || isNaN(seconds)) return "calculating...";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}
