import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { getGlobalSettings } from "@/models/Settings";

export async function GET() {
  try {
    await dbConnect();
    const config = await getGlobalSettings();
    
    // Explicitly return ONLY the non-sensitive public keys needed for client-side drop-ins
    return NextResponse.json({ 
      dropboxAppKey: config.dropboxAppKey || null,
      googleDriveClientId: config.googleDriveClientId || null,
      proOriginalPrice: config.proOriginalPrice || 0,
      proCurrentPrice: config.proCurrentPrice || 0,
      priceCurrency: config.priceCurrency || "$"
    });
  } catch (error) {
    console.error("Public Settings GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch public integrations" }, { status: 500 });
  }
}
