import { Metadata } from "next";
import { PdfToImageClient } from "./PdfToImageClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/pdf-to-image");
  
  return {
    title: `${tool?.title || "PDF to Image"} - Extract PDF Pages as PNG/JPG | Toollix`,
    description: tool?.description || "High-resolution PDF to image converter. Extract pages from any PDF document as high-quality PNG or JPG files instantly in your browser.",
    keywords: tool?.keywords || ["pdf to image", "pdf to jpg", "pdf to png", "extract pdf pages", "pdf converter"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/pdf-to-image",
      type: "website",
    }
  };
}

export default function Page() {
  return <PdfToImageClient />;
}
