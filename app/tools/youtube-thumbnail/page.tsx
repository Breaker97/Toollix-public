import { Metadata } from "next";
import YoutubeThumbnailClient from "./YoutubeThumbnailClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/youtube-thumbnail");
  
  return {
    title: tool?.seoTitle || `${tool?.title} - Toollix`,
    description: tool?.seoDescription || tool?.description,
    keywords: tool?.keywords,
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: `https://www.toollix.io${tool?.href}`,
      type: "website",
    }
  };
}

export default function Page() {
  return <YoutubeThumbnailClient />;
}
