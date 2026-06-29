import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import ToolUsage from "@/models/ToolUsage";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    // ── 1. KPI Totals ────────────────────────────────────────────────────────
    const totalUsers = await User.countDocuments();
    const totalUsage = await ToolUsage.countDocuments();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30 = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // ── 2. Recent Users Preview (Last 10) ───────────────────────────────────
    const recentUsers = await User.find({}, { name: 1, email: 1, plan: 1, createdAt: 1, role: 1 })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // ── 3. Recent Tool Activity Preview (Last 15) ───────────────────────────
    const recentActivity = await ToolUsage.find({})
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    return NextResponse.json({
      stats: {
        totalUsers,
        totalUsage,
        newUsersLast30,
      },
      recentUsers: recentUsers.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        plan: u.plan,
        createdAt: u.createdAt,
        role: u.role
      })),
      recentActivity: recentActivity.map(t => ({
        id: t._id,
        toolName: t.toolName,
        userId: t.userId,
        createdAt: t.createdAt
      }))
    });

  } catch (error) {
    console.error("Reports stats fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
