import { Metadata } from "next";
import EditPdfClient from "./EditPdfClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/edit-pdf");
  
  return {
    title: `${tool?.title || "Edit PDF"} - Free Online PDF Editor | Toollix`,
    description: tool?.description || "Edit PDFs online. Add text, images, and annotations to your PDF directly in your browser.",
    keywords: tool?.keywords || ["edit pdf", "pdf editor", "add text to pdf", "pdf annotation"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/edit-pdf",
      type: "website",
    }
  };
}

export default function EditPdfPage() {
  return <EditPdfClient />;
}
