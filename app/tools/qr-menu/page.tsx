import { Metadata } from "next";
import { QrMenuClient } from "./QrMenuClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/qr-menu");
  
  return {
    title: `${tool?.title || "QR Menu Builder"} - Customizable Scan Me Frames | Toollix`,
    description: tool?.description || "Create professional QR code menu frames for your business. Design stylish 'Scan for Menu' templates and export them as high-quality PNGs for printing.",
    keywords: tool?.keywords || ["qr menu maker", "restaurant qr code", "qr frame builder", "custom qr code frame", "free qr menu tool"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/qr-menu",
      type: "website",
    }
  };
}

export default function Page() {
  return <QrMenuClient />;
}
