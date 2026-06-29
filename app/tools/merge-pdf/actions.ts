"use server";

import { PDFDocument } from "pdf-lib";
import { rateLimit } from "@/lib/rate-limit";
import { serializeFileResponse } from "@/lib/gcs";
import { headers } from "next/headers";

export async function mergePdfAction(formData: FormData) {
  try {
    const h = await headers();
    const rateLimitCheck = await rateLimit(h, "merge-pdf");
    if (!rateLimitCheck.success) {
      return { error: rateLimitCheck.message };
    }

    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      return { error: "Please upload at least 2 PDF files to merge." };
    }

    // Initialize a new empty PDFDocument
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    const mergedPdfBytes = await mergedPdf.save();
    const buffer = Buffer.from(mergedPdfBytes);

    return await serializeFileResponse(buffer, "merged-toollix.pdf", "application/pdf");

  } catch (error) {
    console.error("PDF Merge Error:", error);
    return { error: "Failed to merge PDFs." };
  }
}
