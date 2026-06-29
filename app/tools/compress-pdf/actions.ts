"use server";

import { rateLimit } from "@/lib/rate-limit";
import { serializeFileResponse } from "@/lib/gcs";
import { headers } from "next/headers";
import { compressPdf, CompressionLevel } from "@/lib/pdf/compress";

export async function compressPdfAction(formData: FormData) {
  try {
    const h = await headers();
    const rateCheck = await rateLimit(h, "Compress PDF");
    if (!rateCheck.success) {
      return { error: rateCheck.message };
    }

    const file = formData.get("file") as File;
    const level = ((formData.get("level") as string) || "medium") as CompressionLevel;

    if (!file) return { error: "No file uploaded." };

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    
    // ── Canonical Compression ───────────────────────────────────────────
    const result = await compressPdf(originalBuffer, level);

    return await serializeFileResponse(result.buffer, "compressed-toollix.pdf", "application/pdf", {
      jsonMeta: {
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        savedPercent: result.savedPercent,
        imagesProcessed: result.imagesProcessed,
      }
    });
  } catch (err) {
    console.error("Compress PDF action error:", err);
    return { error: "Failed to compress PDF." };
  }
}
