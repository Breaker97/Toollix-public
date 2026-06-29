import { Metadata } from "next";
import { BrandKitClient } from "./BrandKitClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/brand-kit");
  
  return {
    title: `${tool?.title || "Brand Kit Extractor"} - Scrape Website Colors & Logos | Toollix`,
    description: tool?.description || "Extract brand assets from any URL. Automatically scrape primary colors, hex codes, logos, and mission statements for designers and developers.",
    keywords: tool?.keywords || ["brand extractor", "brand scraper", "extract colors from website", "logo finder", "brand kit maker"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/brand-kit",
      type: "website",
    }
  };
}

export default function Page() {
  return <BrandKitClient />;
}
