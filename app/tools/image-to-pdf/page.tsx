import { Metadata } from "next";
import { ImageToPdfClient } from "./ImageToPdfClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/image-to-pdf");
  
  return {
    title: `Image to PDF Converter - Convert JPG/PNG to PDF Free | Toollix`,
    description: `Professional image to PDF converter. Combine multiple JPG, PNG, or WebP images into a single high-quality PDF document instantly in your browser. Batch convert photos to PDF 100% free and private.`,
    keywords: ["image to pdf", "convert png to pdf", "jpg to pdf converter", "combine images to pdf", "free online pdf tools", "photo to pdf", "batch convert images to pdf", "picture to pdf", "create pdf from images", "jpeg to pdf"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/image-to-pdf",
      type: "website",
    }
  };
}

export default function Page() {
  return <ImageToPdfClient />;
}
