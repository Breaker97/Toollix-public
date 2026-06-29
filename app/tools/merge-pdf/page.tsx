import { Metadata } from "next";
import { MergePdfClient } from "./MergePdfClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/merge-pdf");
  
  return {
    title: `Merge PDF - Combine PDF Files Online Free | Toollix`,
    description: `Professional PDF merger. Combine multiple PDF files into one structured document instantly in your browser. Fast, secure, and preserves 100% original quality. No installation required.`,
    keywords: ["merge pdf", "combine pdf", "pdf joiner", "free online pdf tools", "join pdf files", "merge multiple pdfs", "pdf combiner", "put pdfs together", "merge pdf online"],
    alternates: {
      canonical: "/tools/merge-pdf",
    },
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/merge-pdf",
      type: "website",
    }
  };
}

export default function Page() {
  return <MergePdfClient />;
}
