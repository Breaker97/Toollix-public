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

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    // ── 1. 30-Day Timeline ──────────────────────────────────────────────────
    const timelineData = await ToolUsage.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // ── 2. Audience Split (registered userId = 24-char Mongo ObjectId) ──────
    const allUsages = await ToolUsage.find({}, { userId: 1 });
    let registeredUsage = 0, guestUsage = 0;
    allUsages.forEach(u => {
      if (u.userId && u.userId.length === 24) registeredUsage++;
      else guestUsage++;
    });
    const totalUsage = registeredUsage + guestUsage;

    // ── 3. Users Stats ──────────────────────────────────────────────────────
    const totalUsers = await User.countDocuments();
    const newUsersLast30 = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const proUsers = await User.countDocuments({ plan: "pro" });

    // ── 4. Top 5 Tools ──────────────────────────────────────────────────────
    const topToolsData = await ToolUsage.aggregate([
      { $group: { _id: "$toolName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // ── 5. Week-over-week comparison ────────────────────────────────────────
    const thisWeekCount  = await ToolUsage.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const lastWeekCount  = await ToolUsage.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } });
    const weeklyGrowthPct = lastWeekCount === 0
      ? (thisWeekCount > 0 ? 100 : 0)
      : Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);

    return NextResponse.json({
      timeline: timelineData.map(d => ({ date: d._id, usage: d.count })),
      usageSplit: { registered: registeredUsage, guest: guestUsage, total: totalUsage },
      users: { total: totalUsers, newLast30: newUsersLast30, pro: proUsers },
      topTools: topToolsData.map(t => ({ name: t._id, count: t.count })),
      weeklyGrowthPct,
      thisWeekCount,
      lastWeekCount,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
