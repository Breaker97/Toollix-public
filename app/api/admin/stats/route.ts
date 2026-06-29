import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import ToolUsage from "@/models/ToolUsage";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const [totalUsers, totalToolsUsed, proUsers] = await Promise.all([
      User.countDocuments(),
      ToolUsage.countDocuments(),
      User.countDocuments({ plan: "pro" }),
    ]);

    // Optional: get basic tool popularity
    const toolStats = await ToolUsage.aggregate([
      { $group: { _id: "$toolName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return NextResponse.json({
      totalUsers,
      totalToolsUsed,
      proUsers,
      freeUsers: totalUsers - proUsers,
      topTools: toolStats.map(t => ({ name: t._id, count: t.count })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
