import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { buildFileResponse } from "@/lib/gcs";
import { compressPdf, CompressionLevel } from "@/lib/pdf/compress";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "Compress PDF");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }

    const form = await req.formData();
    const file  = form.get("file") as File;
    const assetId = form.get("assetId") as string;
    const level = ((form.get("level") as string) || "medium") as CompressionLevel;

    if (!file && !assetId) return NextResponse.json({ error: "No file or asset uploaded." }, { status: 400 });

    const originalBuffer = file ? Buffer.from(await file.arrayBuffer()) : null;
    
    // ── Canonical Compression ───────────────────────────────────────────
    const result = await compressPdf(originalBuffer, level, assetId);

    return await buildFileResponse(result.buffer, "compressed-toollix.pdf", "application/pdf", {
      jsonMeta: {
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        savedPercent: result.savedPercent,
        imagesProcessed: result.imagesProcessed,
      },
      isPDFCompress: true,
      extraHeaders: {
        "X-Original-Size": String(result.originalSize),
        "X-Compressed-Size": String(result.compressedSize),
        "X-Saved-Percent": String(result.savedPercent),
        "X-Images-Processed": String(result.imagesProcessed),
        "Access-Control-Expose-Headers": "X-Original-Size, X-Compressed-Size, X-Saved-Percent, X-Images-Processed"
      }
    });
  } catch (err) {
    console.error("Compress PDF error:", err);
    return NextResponse.json({ error: "Failed to compress PDF." }, { status: 500 });
  }
}
