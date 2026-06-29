import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { getGlobalSettings } from "@/models/Settings";

export async function GET() {
  let content = "User-agent: *\nAllow: /\nSitemap: https://www.toollix.io/sitemap.xml";
  try {
    await dbConnect();
    const settings = await getGlobalSettings();
    if (settings.robotsContent) {
       content = settings.robotsContent;
    }
  } catch (e) {
    console.error("Robots DB fetch failed");
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
