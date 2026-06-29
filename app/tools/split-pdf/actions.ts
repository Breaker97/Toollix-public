"use server";

import { PDFDocument } from "pdf-lib";
import { rateLimit } from "@/lib/rate-limit";
import { serializeFileResponse } from "@/lib/gcs";
import { headers } from "next/headers";

export async function splitPdfAction(formData: FormData) {
  try {
    const h = await headers();
    const rateLimitCheck = await rateLimit(h, "Split PDF");
    if (!rateLimitCheck.success) {
      return { error: rateLimitCheck.message };
    }

    const file = formData.get("file") as File;
    const mode = formData.get("mode") as string || "individual"; // individual | range
    const rangeStr = formData.get("range") as string || "";

    if (!file) {
      return { error: "No PDF uploaded." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const srcDoc = await PDFDocument.load(buffer);
    const totalPages = srcDoc.getPageCount();

    // Determine pages to extract
    let pageIndexes: number[];

    if (mode === "range" && rangeStr) {
      // Parse "1-3, 5, 7-9" type notation
      pageIndexes = [];
      const parts = rangeStr.split(",").map(s => s.trim());
      for (const part of parts) {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map(Number);
          for (let i = start; i <= end && i <= totalPages; i++) {
            pageIndexes.push(i - 1);
          }
        } else {
          const n = parseInt(part);
          if (!isNaN(n) && n >= 1 && n <= totalPages) {
            pageIndexes.push(n - 1);
          }
        }
      }
    } else {
      // Individual split: return each page as its own PDF, bundled as JSON of base64 strings
      const pdfPages: string[] = [];
      for (let i = 0; i < totalPages; i++) {
        const singleDoc = await PDFDocument.create();
        const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
        singleDoc.addPage(copiedPage);
        const pdfBytes = await singleDoc.save();
        pdfPages.push(Buffer.from(pdfBytes).toString("base64"));
      }
      return { 
        success: true, 
        mode: "individual", 
        total: totalPages, 
        pages: pdfPages,
        via: "json" 
      };
    }

    // Range mode: create single PDF with specified pages
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndexes);
    copiedPages.forEach(p => newDoc.addPage(p));
    const pdfBytes = await newDoc.save();

    return await serializeFileResponse(Buffer.from(pdfBytes), "split-toollix.pdf", "application/pdf");
  } catch (err) {
    console.error("Split PDF Action Error:", err);
    return { error: "Failed to split PDF." };
  }
}
