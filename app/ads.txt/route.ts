import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { getGlobalSettings } from "@/models/Settings";

export async function GET() {
  try {
    await dbConnect();
    const settings = await getGlobalSettings();
    
    return new NextResponse(settings.adsContent || "", {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59"
      },
    });
  } catch (error) {
    return new NextResponse("Service Unavailable", { status: 503 });
  }
}
