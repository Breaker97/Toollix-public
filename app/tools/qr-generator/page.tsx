import { Metadata } from "next";
import { QrGeneratorClient } from "./QrGeneratorClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/qr-generator");
  
  return {
    title: `${tool?.title || "QR Code Generator"} - Create Custom QR Codes | Toollix`,
    description: tool?.description || "Professional QR code generator. Create custom QR codes for URLs, Wi-Fi, vCards, and more with your brand logo. High-resolution PNG and SVG formats available.",
    keywords: tool?.keywords || ["qr generator", "create qr code", "custom qr code", "branding qr code", "free online qr maker"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/qr-generator",
      type: "website",
    }
  };
}

export default function Page() {
  return <QrGeneratorClient />;
}
