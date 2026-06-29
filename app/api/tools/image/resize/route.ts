import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { buildFileResponse } from "@/lib/gcs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "Resize Image");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const width = parseInt(formData.get("width") as string || "0", 10);
    const height = parseInt(formData.get("height") as string || "0", 10);
    const fit = (formData.get("fit") as string) || "inside";
    const format = (formData.get("format") as string) || "jpeg";

    if (!file) {
      return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
    }
    if (!width && !height) {
      return NextResponse.json({ error: "Please provide at least width or height." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resizeOptions: sharp.ResizeOptions = { fit: fit as any };
    if (width) resizeOptions.width = width;
    if (height) resizeOptions.height = height;

    let pipeline = sharp(buffer).resize(resizeOptions);

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

    const metadata = await sharp(outputBuffer).metadata();

    return await buildFileResponse(outputBuffer, `resized-toollix.${ext}`, mimeType, {
      jsonMeta: {
        width: metadata.width || 0,
        height: metadata.height || 0
      },
      extraHeaders: {
        "X-Width": String(metadata.width ?? 0),
        "X-Height": String(metadata.height ?? 0),
      }
    });
  } catch (err) {
    console.error("Resize Error:", err);
    return NextResponse.json({ error: "Failed to resize image." }, { status: 500 });
  }
}
