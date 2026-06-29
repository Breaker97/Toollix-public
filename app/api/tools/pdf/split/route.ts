import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { buildFileResponse } from "@/lib/gcs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "Split PDF");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mode = formData.get("mode") as string || "fixed"; // fixed | custom
    const interval = parseInt(formData.get("interval") as string) || 1;
    const rangesStr = formData.get("ranges") as string || "";

    if (!file) {
      return NextResponse.json({ error: "No PDF uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const srcDoc = await PDFDocument.load(buffer);
    const totalPages = srcDoc.getPageCount();

    // Strategy 1: Fixed Interval Split (Resulting in a ZIP)
    if (mode === "fixed") {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      
      for (let i = 0; i < totalPages; i += interval) {
        const newDoc = await PDFDocument.create();
        const pagesToCopy = Array.from({ length: Math.min(interval, totalPages - i) }, (_, k) => i + k);
        const copiedPages = await newDoc.copyPages(srcDoc, pagesToCopy);
        copiedPages.forEach(p => newDoc.addPage(p));
        const pdfBytes = await newDoc.save();
        zip.file(`part-${Math.floor(i/interval) + 1}.pdf`, pdfBytes);
      }
      
      const zipContent = await zip.generateAsync({ type: "nodebuffer" });
      return await buildFileResponse(zipContent, `split-${file.name.replace(".pdf", "")}.zip`, "application/zip");
    }

    // Strategy 2: Custom Ranges Split
    if (mode === "custom" && rangesStr) {
      const pageIndexes: number[] = [];
      const parts = rangesStr.split(",").map(s => s.trim());
      for (const part of parts) {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map(Number);
          for (let i = start; i <= end && i <= totalPages; i++) {
            pageIndexes.push(i - 1);
          }
        } else {
          const n = parseInt(part);
          if (!isNaN(n) && n >= 1 && n <= totalPages) pageIndexes.push(n - 1);
        }
      }

      if (pageIndexes.length === 0) {
        return NextResponse.json({ error: "Invalid ranges provided." }, { status: 400 });
      }

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndexes);
      copiedPages.forEach(p => newDoc.addPage(p));
      const pdfBytes = await newDoc.save();

      return await buildFileResponse(Buffer.from(pdfBytes), `extracted-${file.name}`, "application/pdf");
    }

    return NextResponse.json({ error: "Invalid split mode." }, { status: 400 });
  } catch (err) {
    console.error("Split PDF Error:", err);
    return NextResponse.json({ error: "Failed to split PDF." }, { status: 500 });
  }
}
