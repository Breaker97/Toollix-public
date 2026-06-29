import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { PDFDocument, BlendMode, StandardFonts, rgb } from "pdf-lib";
import { buildFileResponse } from "@/lib/gcs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "sign-pdf");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message, limited: true }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const auditTrail = formData.get("audit_trail") === "true";
    const sigCountStr = formData.get("sig_count") as string;
    const sigCount = parseInt(sigCountStr) || 0;

    if (!file) {
      return NextResponse.json({ error: "Missing PDF file." }, { status: 400 });
    }

    // Load PDF
    const arrayBuffer = await file.arrayBuffer();
    
    // Hash before modification if Audit Trail is enabled
    let fingerprint = "";
    if (auditTrail && session?.user?.plan === "pro") {
      const hash = crypto.createHash("sha256");
      hash.update(Buffer.from(arrayBuffer));
      fingerprint = hash.digest("hex");
    }

    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // Iterate through signatures and stamp them
    for (let i = 0; i < sigCount; i++) {
       const b64 = formData.get(`sig_data_${i}`) as string;
       const x = parseFloat(formData.get(`sig_x_${i}`) as string);
       const y = parseFloat(formData.get(`sig_y_${i}`) as string);
       const width = parseFloat(formData.get(`sig_w_${i}`) as string);
       const height = parseFloat(formData.get(`sig_h_${i}`) as string);
       const pageNum = parseInt(formData.get(`sig_page_${i}`) as string) || 1;

       if (!b64 || isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) continue;

       const targetPageIndex = Math.max(0, Math.min(pageNum - 1, pages.length - 1));
       const page = pages[targetPageIndex];
       const { width: pW, height: pH } = page.getSize();

       const isPng = b64.startsWith("data:image/png");
       let sigImage;
       if (isPng) {
         sigImage = await pdfDoc.embedPng(b64);
       } else {
         sigImage = await pdfDoc.embedJpg(b64);
       }

       page.drawImage(sigImage, {
         x: x * pW, 
         y: (1 - y - height) * pH, 
         width: width * pW, 
         height: height * pH,
         blendMode: BlendMode.Multiply
       });
    }

    // Handle Audit Trail Append
    // Audit trail removed based on user request

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');

    return await buildFileResponse(buffer, `signed-${safeName}`, "application/pdf");

  } catch (error: any) {
    console.error("Sign PDF Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sign PDF." }, { status: 500 });
  }
}
