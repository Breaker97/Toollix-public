import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { buildFileResponse } from "@/lib/gcs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "Convert Image");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const targetFormat = (formData.get("format") as string) || "jpeg";
    const quality = parseInt(formData.get("quality") as string || "90", 10);

    if (!file) {
      return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let outputBuffer: Buffer;
    let mimeType: string;
    let ext: string;

    switch (targetFormat) {
      case "png":
        outputBuffer = await sharp(buffer).png().toBuffer();
        mimeType = "image/png"; ext = "png"; break;
      case "webp":
        outputBuffer = await sharp(buffer).webp({ quality }).toBuffer();
        mimeType = "image/webp"; ext = "webp"; break;
      case "avif":
        outputBuffer = await sharp(buffer).avif({ quality }).toBuffer();
        mimeType = "image/avif"; ext = "avif"; break;
      case "tiff":
        outputBuffer = await sharp(buffer).tiff({ quality }).toBuffer();
        mimeType = "image/tiff"; ext = "tiff"; break;
      case "gif":
        outputBuffer = await sharp(buffer).gif().toBuffer();
        mimeType = "image/gif"; ext = "gif"; break;
      case "jpg":
      default:
        outputBuffer = await sharp(buffer).jpeg({ quality }).toBuffer();
        mimeType = "image/jpeg"; ext = "jpg";
    }

    return await buildFileResponse(outputBuffer, `converted-toollix.${ext}`, mimeType);
  } catch (err) {
    console.error("Convert Error:", err);
    return NextResponse.json({ error: "Failed to convert image." }, { status: 500 });
  }
}
