import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { rateLimit } from "@/lib/rate-limit";
import { buildFileResponse } from "@/lib/gcs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "compress-image");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const qualityStr = formData.get('quality') as string;
    const outputFormat = (formData.get('format') as string) || null;

    if (!file) {
      return NextResponse.json({ error: "Please upload an image." }, { status: 400 });
    }

    const quality = Math.max(1, Math.min(100, qualityStr ? parseInt(qualityStr) : 80));
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine output format
    const metadata = await sharp(buffer).metadata();
    const sourceFormat = metadata.format || 'jpeg';
    const targetFormat = outputFormat || sourceFormat;

    let compressedBuffer: Buffer;
    let mimeType: string;
    let ext: string;

    try {
      switch (targetFormat) {
        case 'png':
          compressedBuffer = await sharp(buffer).png({ quality }).toBuffer();
          mimeType = 'image/png';
          ext = 'png';
          break;
        case 'webp':
          compressedBuffer = await sharp(buffer).webp({ quality }).toBuffer();
          mimeType = 'image/webp';
          ext = 'webp';
          break;
        case 'avif':
          compressedBuffer = await sharp(buffer).avif({ quality }).toBuffer();
          mimeType = 'image/avif';
          ext = 'avif';
          break;
        case 'gif':
          compressedBuffer = await sharp(buffer).gif().toBuffer();
          mimeType = 'image/gif';
          ext = 'gif';
          break;
        case 'tiff':
          compressedBuffer = await sharp(buffer).tiff({ quality }).toBuffer();
          mimeType = 'image/tiff';
          ext = 'tiff';
          break;
        default: // jpeg/jpg
          compressedBuffer = await sharp(buffer).jpeg({ quality }).toBuffer();
          mimeType = 'image/jpeg';
          ext = 'jpg';
          break;
      }
    } catch (fmtErr: any) {
      console.error(`Format conversion error (${targetFormat}):`, fmtErr);
      return NextResponse.json({ error: `Cannot convert to ${targetFormat.toUpperCase()}: ${fmtErr.message || 'Format not supported on this server.'}` }, { status: 400 });
    }

    // Replace the original extension with the new one
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const outputName = `${baseName}.${ext}`;

    return await buildFileResponse(compressedBuffer, outputName, mimeType);

  } catch (error) {
    console.error("Image Compress API Error:", error);
    return NextResponse.json({ error: "Failed to compress image." }, { status: 500 });
  }
}
