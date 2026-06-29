import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import { getGlobalSettings } from "@/models/Settings";

export async function GET(req: NextRequest) {
  try {
    const placement = req.nextUrl.searchParams.get("placement");
    if (!placement) return NextResponse.json({ error: "Missing placement" }, { status: 400 });

    await dbConnect();
    const config = await getGlobalSettings();
    
    // Check if user is Pro (Manual ads are hidden for Pro members)
    const session = await getServerSession(authOptions);
    if (session?.user?.plan === "pro") {
      return NextResponse.json({ ad: null });
    }

    // Check if manual ads are disabled globally
    if (!config.showAds) {
      return NextResponse.json({ ad: null });
    }

    // Filter and find an active ad for the requested placement
    const activeAds = config.ads?.filter((ad: any) => ad.placement === placement && ad.active) || [];
    
    if (activeAds.length === 0) {
      return NextResponse.json({ ad: null });
    }

    // Pick one at random for rotation
    const selectedAd = activeAds[Math.floor(Math.random() * activeAds.length)];

    return NextResponse.json({
      ad: {
        code: selectedAd.code,
        name: selectedAd.name
      }
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30"
      }
    });
  } catch (error) {
    console.error("Public Ad Fetch Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
