"use server";

import sharp from "sharp";
import { rateLimit } from "@/lib/rate-limit";
import { serializeFileResponse } from "@/lib/gcs";
import { headers } from "next/headers";

export async function resizeImageAction(formData: FormData) {
  try {
    const h = await headers();
    const rateLimitCheck = await rateLimit(h, "Resize Image");
    if (!rateLimitCheck.success) {
      return { error: rateLimitCheck.message };
    }

    const file = formData.get("file") as File;
    const width = parseInt(formData.get("width") as string || "0", 10);
    const height = parseInt(formData.get("height") as string || "0", 10);
    const fit = (formData.get("fit") as string) || "inside";
    const format = (formData.get("format") as string) || "jpeg";

    if (!file) {
      return { error: "No image uploaded." };
    }
    if (!width && !height) {
      return { error: "Please provide at least width or height." };
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

    return await serializeFileResponse(outputBuffer, `resized-toollix.${ext}`, mimeType, {
      jsonMeta: {
        width: metadata.width || 0,
        height: metadata.height || 0
      }
    });
  } catch (err) {
    console.error("Resize Error:", err);
    return { error: "Failed to resize image." };
  }
}
