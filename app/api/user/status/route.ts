import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).select("+password");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ 
      hasPassword: !!user.password,
      isSocialOnly: !user.password,
      planExpiresAt: user.planExpiresAt
    });
  } catch (error: any) {
    console.error("[USER_STATUS_API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
