import { Metadata } from "next";
import { ResizeImageClient } from "./ResizeImageClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/resize-image");
  
  return {
    title: `Image Resizer - Resize Photo Dimensions Online Free | Toollix`,
    description: `Professional online image resizer. Instantly change pixel dimensions of JPG, PNG, or WebP images while maintaining perfect aspect ratio. Resize photos for social media, print, or web design 100% free.`,
    keywords: ["resize image", "image resizer", "photo resizer", "online resize tools", "free image resizer", "change image resolution", "resize photo online", "reduce image dimensions", "scale image", "social media image resizer"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/resize-image",
      type: "website",
    }
  };
}

export default function Page() {
  return <ResizeImageClient />;
}
