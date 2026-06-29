import { Metadata } from "next";
import { RemoveBackgroundClient } from "./RemoveBackgroundClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/bg-remover");
  
  return {
    title: tool?.seoTitle || "AI Background Remover - Toollix",
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
  return <RemoveBackgroundClient />;
}
