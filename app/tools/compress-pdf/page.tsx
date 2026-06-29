import { Metadata } from "next";
import { CompressPdfClient } from "./CompressPdfClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/compress-pdf");
  
  return {
    title: `${tool?.title || "Compress PDF"} - Reduce PDF Size Online | Toollix`,
    description: tool?.description || "Reduce PDF file size without losing quality. Our online compressor preserves text and images while shrinking your documents.",
    keywords: tool?.keywords || ["compress pdf", "reduce pdf size", "shrink pdf", "pdf compressor"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/compress-pdf",
      type: "website",
    }
  };
}

export default function Page() {
  return <CompressPdfClient />;
}
