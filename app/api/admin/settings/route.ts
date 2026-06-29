import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Settings, { getGlobalSettings } from "@/models/Settings";
import Log from "@/models/Log";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const config = await getGlobalSettings();
    return NextResponse.json({ success: true, settings: config });
  } catch (error) {
    console.error("Admin Settings GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates = await req.json();
    await dbConnect();

    let config = await getGlobalSettings();
    const updatedSettings = await Settings.findByIdAndUpdate(config._id, updates, { new: true });

    // Record Audit Log
    await Log.create({
      adminName: session.user.name || "Admin",
      adminEmail: session.user.email || "unknown@toollix.io",
      action: "Platform Settings Updated",
      details: `Changed fields: ${Object.keys(updates).join(", ")}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "unknown"
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error("Admin Settings PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
