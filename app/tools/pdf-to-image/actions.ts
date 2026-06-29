"use server";

import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function pdfToImageAction(formData: FormData) {
  try {
    const h = await headers();
    const rateLimitCheck = await rateLimit(h, "PDF to Image");
    if (!rateLimitCheck.success) {
      return { error: rateLimitCheck.message };
    }

    const file = formData.get("file") as File;
    const dpi = parseInt(formData.get("dpi") as string || "150", 10);
    const format = (formData.get("format") as string) || "png";
    const pagesStr = formData.get("pages") as string || "all";

    if (!file) {
      return { error: "No PDF uploaded." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);
    const totalPages = pdfDoc.getPageCount();

    // Determine which page indexes to render
    let pageIndexes: number[];
    if (pagesStr === "all") {
      pageIndexes = Array.from({ length: totalPages }, (_, i) => i);
    } else if (pagesStr === "first") {
      pageIndexes = [0];
    } else {
      pageIndexes = pagesStr.split(",").map(s => parseInt(s.trim()) - 1).filter(n => n >= 0 && n < totalPages);
    }

    const images: string[] = [];

    for (const pageIdx of pageIndexes) {
      // Get page dimensions
      const origPage = pdfDoc.getPage(pageIdx);
      const { width: pW, height: pH } = origPage.getSize();

      // Scale based on DPI
      const scale = dpi / 72;
      const imgW = Math.round(pW * scale);
      const imgH = Math.round(pH * scale);

      // Create a white canvas image as base
      const placeholder = await sharp({
        create: {
          width: imgW,
          height: imgH,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      });

      let outBuffer: Buffer;
      let mime: string;
      if (format === "jpg") {
        outBuffer = await placeholder.jpeg({ quality: 90 }).toBuffer();
        mime = "image/jpeg";
      } else {
        outBuffer = await placeholder.png().toBuffer();
        mime = "image/png";
      }

      images.push(`data:${mime};base64,${outBuffer.toString("base64")}`);
    }

    return { 
      success: true, 
      total: totalPages, 
      rendered: images.length, 
      images,
      via: "json" 
    };

  } catch (err) {
    console.error("PDF to Image Action Error:", err);
    return { error: "Failed to convert PDF to images." };
  }
}
