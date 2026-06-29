import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import ToolUsage from "@/models/ToolUsage";
import { getGlobalSettings } from "@/models/Settings";
import { sendProUpgradeEmail } from "@/lib/email-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const plan = searchParams.get("plan");
    const status = searchParams.get("status");

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (role && role !== "all") query.role = role;
    if (plan && plan !== "all") query.plan = plan;
    if (status === "restricted") query.isRestricted = true;
    if (status === "active") query.isRestricted = false;

    const rawUsers = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v -password")
      .lean();
      
    const total = await User.countDocuments(query);
    
    const settings = await getGlobalSettings();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const users = await Promise.all(rawUsers.map(async (u: any) => {
      const hourlyUsage = await ToolUsage.countDocuments({
        userId: u._id.toString(),
        createdAt: { $gte: oneHourAgo }
      });
      let hourlyLimit = u.plan === "pro" ? settings.proHourlyLimit : settings.freeHourlyLimit;
      const isExhausted = hourlyLimit !== -1 && hourlyUsage >= hourlyLimit;

      return {
        ...u,
        hourlyUsage,
        hourlyLimit,
        isExhausted
      };
    }));

    return NextResponse.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Admin Users Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, action, value } = await req.json();

    if (!userId || !action || value === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await dbConnect();

    const updateData: any = {};
    if (action === "role") updateData.role = value;
    else if (action === "plan") updateData.plan = value;
    else if (action === "restriction") updateData.isRestricted = value;
    else if (action === "limit") updateData.dailyLimitOverride = parseInt(value);
    else if (action === "reset-usage") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      await ToolUsage.deleteMany({
        userId: userId,
        createdAt: { $gte: oneHourAgo }
      });
      return NextResponse.json({ success: true, message: "Usage reset successfully." });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    // ── TRIGGER PRO UPGRADE EMAIL ───────────────────────────────────────────
    if (action === "plan" && value === "pro" && updatedUser?.email) {
      try {
        await sendProUpgradeEmail(updatedUser.email, updatedUser.name || "Member");
      } catch (emailError) {
        console.error("Failed to send Pro Upgrade email:", emailError);
        // We don't return an error to the admin UI, as the DB update succeeded.
      }
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Admin Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await dbConnect();
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
