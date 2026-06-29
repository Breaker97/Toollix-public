/**
 * Shared fetch utility that auto-injects headers needed for:
 * - Ngrok tunnel bypass (development)
 * - Guest session tracking
 */

import { getGuestId } from "@/components/GuestSessionProvider";
import { toast } from "sonner";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "x-guest-id": getGuestId(),
    "ngrok-skip-browser-warning": "true",
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Optional Auto-Toast for non-OK responses if a flag is passed
    // (We'll keep it manual for most but provide a helper)
    return res;
  } catch (error: any) {
    console.error(`Fetch API Error [${url}]:`, error);
    throw error;
  }
}

/**
 * Enhanced fetcher that automatically toasts on error
 */
export async function toastFetch(url: string, options: FetchOptions = {}, errorTitle = "Action Failed") {
  try {
    const res = await apiFetch(url, options);
    if (!res.ok) {
       const data = await res.json().catch(() => ({}));
       const errMsg = data.error || data.message || `Server returned ${res.status}`;
       toast.error(errorTitle, { description: errMsg });
       return { ok: false, res, error: errMsg };
    }
    return { ok: true, res };
  } catch (err: any) {
    toast.error("Network Error", { description: "Please check your internet connection." });
    return { ok: false, error: err.message };
  }
}

/**
 * Smart file URL resolver — handles both response types:
 * - GCS enabled: JSON { url } → returns the signed GCS URL directly
 * - GCS disabled: binary blob → creates a local object URL (original behaviour)
 *
 * Also returns any extra JSON metadata (stats etc.) if present.
 */
export async function getFileUrl(res: Response): Promise<{ url: string; blob?: Blob; meta?: Record<string, any> }> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await res.json();
    const { url, filename, via, ...meta } = data;
    return { url, meta };
  }
  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), blob };
}

/**
 * Handle Server Action response (serialized object from serializeFileResponse)
 */
export function handleActionResponse(data: any): { url: string; blob?: Blob; meta?: Record<string, any> } {
  if (data.error) {
    throw new Error(data.error);
  }

  if (data.via === "gcs") {
    const { url, filename, via, ...meta } = data;
    return { url, meta };
  }

  if (data.via === "binary") {
    const { binary, contentType, filename, via, ...meta } = data;
    // Decode base64 string back to Uint8Array
    const binaryString = atob(binary);
    const uint8 = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([uint8], { type: contentType });
    return { url: URL.createObjectURL(blob), blob, meta };
  }

  if (data.via === "json") {
    // Return data as-is if it's already a JSON structure (e.g. for Split PDF individual mode)
    return data;
  }

  throw new Error("Unknown action response format");
}
