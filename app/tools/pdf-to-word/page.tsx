import { Metadata } from "next";
import { PdfToWordClient } from "./PdfToWordClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/pdf-to-word");
  
  return {
    title: `${tool?.title || "PDF to Word"} - Convert PDF to DOCX Online | Toollix`,
    description: tool?.description || "Convert PDFs into editable Word documents instantly while preserving original formatting.",
    keywords: tool?.keywords || ["pdf to word", "convert pdf to word", "pdf to docx", "pdf converter"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/pdf-to-word",
      type: "website",
    }
  };
}

export default function Page() {
  return <PdfToWordClient />;
}
