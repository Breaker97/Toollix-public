import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PageSizes } from "pdf-lib";
import sharp from "sharp";
import { buildFileResponse } from "@/lib/gcs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "Image to PDF");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const pageSize = (formData.get("pageSize") as string) || "A4";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images uploaded." }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      // Convert to PNG via sharp for consistent embedding
      const pngBuffer = await sharp(buffer).png().toBuffer();
      const metadata = await sharp(pngBuffer).metadata();

      const img = await pdfDoc.embedPng(pngBuffer);
      const imgW = metadata.width || img.width;
      const imgH = metadata.height || img.height;

      // Use page size based on selection
      let [pgW, pgH] = PageSizes.A4; // default
      if (pageSize === "Letter") [pgW, pgH] = PageSizes.Letter;
      else if (pageSize === "fit") { pgW = imgW; pgH = imgH; }

      const page = pdfDoc.addPage([pgW, pgH]);
      
      // Scale image to fit within page with padding
      const padding = pageSize === "fit" ? 0 : 20;
      const scale = Math.min((pgW - padding * 2) / imgW, (pgH - padding * 2) / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const x = (pgW - drawW) / 2;
      const y = (pgH - drawH) / 2;

      page.drawImage(img, { x, y, width: drawW, height: drawH });
    }

    const pdfBytes = await pdfDoc.save();

    return await buildFileResponse(Buffer.from(pdfBytes), "images-to-pdf-toollix.pdf", "application/pdf");
  } catch (err) {
    console.error("Image to PDF Error:", err);
    return NextResponse.json({ error: "Failed to convert images to PDF." }, { status: 500 });
  }
}
