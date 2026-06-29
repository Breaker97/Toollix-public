import { Metadata } from "next";
import { CronHumanizerClient } from "./CronHumanizerClient";
import { ALL_TOOLS } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/cron-humanizer");
  
  return {
    title: `${tool?.title || "Cron Job Humanizer"} - Crontab Expression Builder | Toollix`,
    description: tool?.description || "Visual cron expression builder and translator. Convert crontab syntax into human-readable English instantly.",
    keywords: tool?.keywords || ["cron builder", "cron decoder", "cron syntax", "crontab helper", "cron translator"],
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: "https://www.toollix.io/tools/cron-humanizer",
      type: "website",
    }
  };
}

export default function Page() {
  return <CronHumanizerClient />;
}
