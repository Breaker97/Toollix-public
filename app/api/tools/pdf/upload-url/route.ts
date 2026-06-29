import { NextRequest, NextResponse } from "next/server";
import { getGlobalSettings } from "@/models/Settings";
import { createAdobeUploadAsset } from "@/lib/pdf/adobe-compress";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "Adobe Upload URL");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }

    const settings = await getGlobalSettings();
    
    if (!settings.adobeClientId || !settings.adobeClientSecret) {
       return NextResponse.json({ error: "Adobe PDF Services not configured." }, { status: 500 });
    }

    const assetData = await createAdobeUploadAsset({
      clientId: settings.adobeClientId,
      clientSecret: settings.adobeClientSecret,
      organizationId: settings.adobeOrganizationId
    });

    return NextResponse.json(assetData);
  } catch (error: any) {
    console.error("Failed to generate Adobe Upload URL:", error);
    return NextResponse.json({ error: error.message || "Failed to generate upload URL." }, { status: 500 });
  }
}
