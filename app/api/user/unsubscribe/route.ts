import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Newsletter from "@/models/Newsletter";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token provided." }, { status: 400 });
    }

    await dbConnect();

    // 1. Search in Users
    const user = await User.findOne({ unsubscribeToken: token });
    if (user) {
      user.marketingSubscription = false;
      await user.save();
      return NextResponse.json({ success: true, message: "Unsubscribed successfully from marketing updates." });
    }

    // 2. Search in Newsletter
    const newsletter = await Newsletter.findOne({ unsubscribeToken: token });
    if (newsletter) {
      newsletter.status = "unsubscribed";
      await newsletter.save();
      return NextResponse.json({ success: true, message: "Newsletter subscription removed successfully." });
    }

    return NextResponse.json({ error: "User not found or token invalid." }, { status: 404 });

  } catch (err: any) {
    console.error("Unsubscribe API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
