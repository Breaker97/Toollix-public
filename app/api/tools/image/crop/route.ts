import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { buildFileResponse } from "@/lib/gcs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "Crop Image");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const left = parseInt(formData.get("left") as string || "0", 10);
    const top = parseInt(formData.get("top") as string || "0", 10);
    const width = parseInt(formData.get("width") as string || "0", 10);
    const height = parseInt(formData.get("height") as string || "0", 10);
    const format = (formData.get("format") as string) || "jpeg";

    if (!file) {
      return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
    }
    if (!width || !height) {
      return NextResponse.json({ error: "Crop dimensions required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let pipeline = sharp(buffer).extract({ left, top, width, height });

    let outputBuffer: Buffer;
    let mimeType: string;
    let ext: string;

    switch (format) {
      case "png":
        outputBuffer = await pipeline.png().toBuffer();
        mimeType = "image/png"; ext = "png"; break;
      case "webp":
        outputBuffer = await pipeline.webp({ quality: 90 }).toBuffer();
        mimeType = "image/webp"; ext = "webp"; break;
      default:
        outputBuffer = await pipeline.jpeg({ quality: 90 }).toBuffer();
        mimeType = "image/jpeg"; ext = "jpg";
    }

    return await buildFileResponse(outputBuffer, `cropped-toollix.${ext}`, mimeType);
  } catch (err) {
    console.error("Crop Error:", err);
    return NextResponse.json({ error: "Failed to crop image." }, { status: 500 });
  }
}
