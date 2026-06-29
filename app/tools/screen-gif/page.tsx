import { Metadata } from "next";
import { ScreenGifClient } from "./ScreenGifClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/screen-gif");
  
  return {
    title: `${tool?.title || "Screen-to-GIF Recorder"} - In-Browser Screen Capture | Toollix`,
    description: tool?.description || "Record your screen and convert it to GIF instantly 100% in your browser. Fast, private, and secure screen-to-gif recording without installing software.",
    keywords: tool?.keywords || ["screen to gif online", "browser screen recorder", "free gif recorder", "convert display to gif", "online screen capture"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/screen-gif",
      type: "website",
    }
  };
}

export default function Page() {
  return <ScreenGifClient />;
}
