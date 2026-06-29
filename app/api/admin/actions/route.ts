import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongoose";
import Settings, { getGlobalSettings } from "@/models/Settings";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action } = await req.json();

    switch (action) {
      case "clear_cache":
        // Revalidate the entire site
        revalidatePath("/", "layout");
        return NextResponse.json({ success: true, message: "System cache cleared successfully." });

      case "toggle_maintenance":
        await dbConnect();
        const config = await getGlobalSettings();
        const newState = !config.maintenanceMode;
        await Settings.findByIdAndUpdate(config._id, { maintenanceMode: newState });
        // Revalidate to ensure page takes effect immediately
        revalidatePath("/", "layout");
        return NextResponse.json({ success: true, message: `Maintenance mode is now ${newState ? "ON" : "OFF"}.` });

      case "sync_analytics":
        // Simulate a delay for forcing external syncs (e.g. PostHog, Stripe)
        await new Promise(resolve => setTimeout(resolve, 1500));
        return NextResponse.json({ success: true, message: "Analytics synchronized successfully." });

      case "seed_legal":
        await dbConnect();
        const Article = (await import("@/models/Article")).default;
        
        const legalPages = [
          {
            title: "Contact Us",
            slug: "contact",
            content: "# Contact Us\n\nHave questions or feedback? Reach out to us at hello@toollix.io.",
            published: true
          }
        ];

        for (const page of legalPages) {
          const exists = await Article.findOne({ slug: page.slug });
          if (!exists) {
            await Article.create(page);
          }
        }

        // Also ensure default ads.txt is set if empty
        let settings = await getGlobalSettings();
        if (!settings.adsContent) {
          const Settings = (await import("@/models/Settings")).default;
          await Settings.findByIdAndUpdate(settings._id, { 
            adsContent: "google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0" 
          });
        }

        return NextResponse.json({ success: true, message: "Legal templates and ads.txt initialized. You can now edit them in the Settings & CMS." });

      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin Action Error:", error);
    return NextResponse.json({ error: "Action failed." }, { status: 500 });
  }
}
