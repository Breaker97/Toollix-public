import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import sharp from "sharp";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isPro = session?.user?.plan === "pro";

    const rateLimitCheck = await rateLimit(req, "QR Generator");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }
    const formData = await req.formData();
    const text = formData.get("text") as string;
    const color = formData.get("color") as string || "#000000";
    const background = formData.get("background") as string || "#ffffff";
    const errorCorrectionLevel = (formData.get("errorCorrectionLevel") as "L" | "M" | "Q" | "H") || "M";
    const margin = parseInt(formData.get("margin") as string || "4", 10);
    const format = formData.get("format") as string || "png";
    const logoFile = formData.get("logo") as File | null;

    // Plan Verification for Premium Features
    if ((format === "svg" || logoFile) && !isPro) {
      return NextResponse.json({ 
        error: "Premium Feature Required: Please upgrade to Pro to unlock SVG exports and Logo embedding." 
      }, { status: 403 });
    }

    if (!text) {
      return NextResponse.json({ error: "Text or URL is required." }, { status: 400 });
    }

    // SVG Output Flow (No Logo compositing supported natively via sharp for pure SVG output)
    if (format === "svg" && !logoFile) {
      const svgString = await QRCode.toString(text, {
        type: "svg",
        color: { dark: color, light: background },
        errorCorrectionLevel,
        margin
      });
      return NextResponse.json({ dataUrl: `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}` });
    }

    // Default PNG Flow
    // If there's a logo, force high error correction to ensure scannability
    const finalErrLevel = logoFile ? "H" : errorCorrectionLevel;

    // Generate basic QR core as a Buffer
    const qrBuffer = await QRCode.toBuffer(text, {
      color: { dark: color, light: background },
      errorCorrectionLevel: finalErrLevel,
      margin,
      width: 800 // high res internally for crisp output
    });

    if (!logoFile) {
      return NextResponse.json({ dataUrl: `data:image/png;base64,${qrBuffer.toString('base64')}` });
    }

    // Advanced Pro Feature: Logo Compositing via Sharp
    const logoArrayBuffer = await logoFile.arrayBuffer();
    
    // Resize logo to be 20% of the QR code width (e.g. 160px for an 800px QR)
    const logoSize = Math.floor(800 * 0.22); 
    
    // Create a pristine logo overlay with a white background padding for contrast (optional, but highly recommended for QR logos)
    const processedLogo = await sharp(Buffer.from(logoArrayBuffer))
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    // Composite logo directly into the center
    const compositedBuffer = await sharp(qrBuffer)
      .composite([{
        input: processedLogo,
        gravity: 'center'
      }])
      .png()
      .toBuffer();

    return NextResponse.json({ dataUrl: `data:image/png;base64,${compositedBuffer.toString('base64')}` });

  } catch (error: any) {
    console.error("QR Generate Server Error:", error);
    return NextResponse.json({ error: "Server failed to generate QR Code." }, { status: 500 });
  }
}
