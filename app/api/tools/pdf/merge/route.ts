import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { buildFileResponse } from "@/lib/gcs";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "merge-pdf");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      console.error("Invalid content type for PDF merge:", contentType);
      return NextResponse.json({ error: "Invalid request format. Expected multipart/form-data." }, { status: 400 });
    }

    let formData;
    try {
      formData = await req.formData();
    } catch (e: any) {
      console.error("FormData parsing error:", e.message, "Content-Type:", contentType);
      return NextResponse.json({ error: "Failed to parse upload data. Please try again with smaller files or a more stable connection." }, { status: 400 });
    }

    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      return NextResponse.json({ error: "Please upload at least 2 PDF files to merge." }, { status: 400 });
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

    return await buildFileResponse(buffer, "merged-toollix.pdf", "application/pdf");

  } catch (error) {
    console.error("PDF Merge Error:", error);
    return NextResponse.json({ error: "Failed to merge PDFs." }, { status: 500 });
  }
}
