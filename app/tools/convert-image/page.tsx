import { Metadata } from "next";
import { ConvertImageClient } from "./ConvertImageClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/convert-image");
  
  return {
    title: `${tool?.title || "Image Converter"} - Convert JPG, PNG, WebP Online | Toollix`,
    description: tool?.description || "Free online image converter. Convert any image format (JPG, PNG, WebP, AVIF) with professional-grade quality controls and privacy-first processing.",
    keywords: tool?.keywords || ["image converter", "convert jpg to png", "convert png to webp", "online photo converter", "free image tools"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/convert-image",
      type: "website",
    }
  };
}

export default function Page() {
  return <ConvertImageClient />;
}
