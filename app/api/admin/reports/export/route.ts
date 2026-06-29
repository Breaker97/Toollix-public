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

    const type = req.nextUrl.searchParams.get("type");
    if (!type || !["users", "tools"].includes(type)) {
      return NextResponse.json({ error: "Invalid report type requested." }, { status: 400 });
    }

    await dbConnect();
    let csvData = "";

    if (type === "users") {
      const users = await User.find().lean();
      csvData = "User ID,Display Name,Email,Account Tier,Account Role,Join Date\n";
      users.forEach(u => {
        csvData += `${u._id},"${u.name || ''}","${u.email}","${u.plan}","${u.role}","${new Date(u.createdAt as Date).toLocaleString()}"\n`;
      });
    } else {
      const tools = await ToolUsage.find().lean();
      csvData = "Event ID,Tool Name,User Identifier,Timestamp\n";
      tools.forEach(t => {
        csvData += `${t._id},"${t.toolName}","${t.userId}","${new Date(t.createdAt).toLocaleString()}"\n`;
      });
    }

    const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Export generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
