import { Metadata } from "next";
import { SplitPdfClient } from "./SplitPdfClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/split-pdf");
  
  return {
    title: `${tool?.title || "Split PDF"} - Separate PDF Pages Online | Toollix`,
    description: tool?.description || "Extract pages from your PDF documents instantly. Use our split tool to separate specific page ranges or extract every page into individual PDFs effortlessly.",
    keywords: tool?.keywords || ["split pdf", "separate pdf pages", "extract pdf", "pdf splitter", "free online pdf tools"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/split-pdf",
      type: "website",
    }
  };
}

export default function Page() {
  return <SplitPdfClient />;
}
