/**
 * lib/gcs.ts
 *
 * Google Cloud Storage utility.
 * Gracefully degrades when GCS env vars are not configured —
 * tools fall back to returning binary blobs directly, unchanged.
 */

import { Storage } from "@google-cloud/storage";
import { getGlobalSettings } from "@/models/Settings";

export async function getGCSConfig() {
  const settings = await getGlobalSettings();
  
  const bucketName  = settings.gcsBucketName || process.env.GCS_BUCKET_NAME;
  const projectId   = settings.gcsProjectId || process.env.GCS_PROJECT_ID;
  const clientEmail = settings.gcsClientEmail || process.env.GCS_CLIENT_EMAIL;
  let privateKey    = settings.gcsPrivateKey || process.env.GCS_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  // The isEnabled check now only verifies if credentials exist.
  // Permission logic (which tool, toggle state) is handled in uploadToGCS.
  const isEnabled = !!bucketName && !!projectId && !!clientEmail && !!privateKey;

  let missing = [];
  if (!bucketName) missing.push("Bucket Name");
  if (!projectId) missing.push("Project ID");
  if (!clientEmail) missing.push("Client Email");
  if (!privateKey) missing.push("Private Key");

  return { bucketName, projectId, clientEmail, privateKey, isEnabled, error: isEnabled ? null : `Missing: ${missing.join(", ")}` };
}

function createStorage(projectId: string, clientEmail: string, privateKey: string): Storage {
  return new Storage({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

/**
 * Upload a buffer to GCS and return a 15-min signed download URL.
 * Returns null if GCS is not configured or upload fails.
 */
export async function uploadToGCS(
  buffer: Buffer,
  filename: string,
  contentType: string,
  options?: { isPDFCompress?: boolean; isCanvasStudio?: boolean }
): Promise<string | null> {
  // GCS is restricted to PDF Compression and Canvas Studio.
  // Other tools will not trigger GCS uploads regardless of settings.
  if (!options?.isPDFCompress && !options?.isCanvasStudio) return null;

  const config = await getGCSConfig();
  if (!config.isEnabled) return null;

  try {
    const storage = createStorage(config.projectId!, config.clientEmail!, config.privateKey!);
    const bucket  = storage.bucket(config.bucketName!);

    // Unique object path to avoid collisions
    const objectName = `processed/${Date.now()}-${Math.random().toString(36).slice(2)}-${filename}`;
    const file = bucket.file(objectName);

    await file.save(buffer, { metadata: { contentType }, resumable: false });

    // Canvas Studio assets need longer expiration (7 days max for V4 signed URLs)
    const expirationTime = options?.isCanvasStudio ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expirationTime);

    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: expiresAt,
      responseDisposition: options?.isCanvasStudio ? "inline" : `attachment; filename="${filename.replace(/"/g, '')}"`,
    });

    return signedUrl;
  } catch (error) {
    console.error("[GCS] Upload failed, falling back to binary response:", error);
    return null;
  }
}

/**
 * Build the HTTP response for a processed file.
 *
 * - GCS configured + upload succeeds → JSON { url, via: "gcs", ...jsonMeta }
 * - Otherwise                         → raw binary blob (original behaviour)
 *
 * @param jsonMeta  Extra fields merged into the GCS JSON response (e.g. stats)
 * @param extraHeaders  Extra headers included in the binary blob fallback
 */
export async function buildFileResponse(
  buffer: Buffer,
  filename: string,
  contentType: string,
  options?: {
    jsonMeta?: Record<string, string | number>;
    extraHeaders?: Record<string, string>;
    isPDFCompress?: boolean;
    isCanvasStudio?: boolean;
  }
): Promise<Response> {
  const signedUrl = await uploadToGCS(buffer, filename, contentType, { 
    isPDFCompress: options?.isPDFCompress,
    isCanvasStudio: options?.isCanvasStudio 
  });

  if (signedUrl) {
    return Response.json({ url: signedUrl, filename, via: "gcs", ...options?.jsonMeta });
  }

  // Fallback: binary blob — identical to what existed before
  return new Response(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Access-Control-Expose-Headers": "Content-Disposition, X-Original-Size, X-Compressed-Size, X-Saved-Percent, X-Images-Processed",
      ...options?.extraHeaders,
    },
  });
}

/**
 * Return a serializable object for Server Actions.
 */
export async function serializeFileResponse(
  buffer: Buffer,
  filename: string,
  contentType: string,
  options?: {
    jsonMeta?: Record<string, string | number>;
    extraHeaders?: Record<string, string>;
    isPDFCompress?: boolean;
    isCanvasStudio?: boolean;
  }
) {
  const signedUrl = await uploadToGCS(buffer, filename, contentType, { 
    isPDFCompress: options?.isPDFCompress,
    isCanvasStudio: options?.isCanvasStudio 
  });

  if (signedUrl) {
    return {
      success: true,
      url: signedUrl,
      filename,
      via: "gcs",
      ...options?.jsonMeta
    };
  }

  // Fallback: return binary as base64 string (ensures serializability across all environments)
  return {
    success: true,
    binary: buffer.toString("base64"),
    contentType,
    filename,
    via: "binary",
  };
}

/**
 * Cleanup files in the 'processed/' directory older than maxAgeMinutes.
 */
export async function cleanupProcessedFiles(maxAgeMinutes: number = 60) {
  const config = await getGCSConfig();
  if (!config.isEnabled) return { success: false, message: "GCS not configured" };

  try {
    const storage = createStorage(config.projectId!, config.clientEmail!, config.privateKey!);
    const bucket = storage.bucket(config.bucketName!);
    
    // List all files in the processed directory
    const [files] = await bucket.getFiles({ prefix: "processed/" });

    const now = Date.now();
    let deletedCount = 0;
    const cutoff = now - maxAgeMinutes * 60 * 1000;

    for (const file of files) {
      // Skip the directory itself if it exists as an object
      if (file.name === "processed/") continue;

      const [metadata] = await file.getMetadata();
      const createdTime = new Date(metadata.timeCreated || metadata.updated!).getTime();

      if (createdTime < cutoff) {
        await file.delete();
        deletedCount++;
      }
    }

    console.log(`[GCS] Cleanup complete. Deleted ${deletedCount} files.`);
    return { success: true, deletedCount, totalChecked: files.length };
  } catch (error) {
    console.error("[GCS] Cleanup failed:", error);
    return { success: false, error: (error as Error).message };
  }
}
