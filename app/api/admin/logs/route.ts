import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Log from "@/models/Log";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    
    // Fetch logs, newest first
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Admin Logs GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action, details } = await req.json();
    await dbConnect();

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const log = await Log.create({
      adminName: session.user.name || "Unknown Admin",
      adminEmail: session.user.email || "unknown@toollix.io",
      action,
      details,
      ipAddress: ip,
      userAgent
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Admin Logs POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
