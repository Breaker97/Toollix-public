"use server";

import { PDFDocument, PageSizes } from "pdf-lib";
import sharp from "sharp";
import { rateLimit } from "@/lib/rate-limit";
import { serializeFileResponse } from "@/lib/gcs";
import { headers } from "next/headers";

export async function imageToPdfAction(formData: FormData) {
  try {
    const h = await headers();
    const rateLimitCheck = await rateLimit(h, "Image to PDF");
    if (!rateLimitCheck.success) {
      return { error: rateLimitCheck.message };
    }

    const files = formData.getAll("files") as File[];
    const pageSize = (formData.get("pageSize") as string) || "A4";

    if (!files || files.length === 0) {
      return { error: "No images uploaded." };
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

    return await serializeFileResponse(Buffer.from(pdfBytes), "images-to-pdf-toollix.pdf", "application/pdf");
  } catch (err) {
    console.error("Image to PDF Error:", err);
    return { error: "Failed to convert images to PDF." };
  }
}
