import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { getGlobalSettings } from "@/models/Settings";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const settings = await getGlobalSettings();
    
    // Return ONLY public branding and SEO data
    return NextResponse.json({
      siteLogo: settings.siteLogo || "",
      logoWidth: settings.logoWidth || 120,
      siteFavicon: settings.siteFavicon || "",
      siteTitle: settings.siteTitle || "Toollix",
      siteDescription: settings.siteDescription || ""
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch public settings" }, { status: 500 });
  }
}
