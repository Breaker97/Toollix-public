import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    await dbConnect();

    // 1. Find user (including secret fields)
    const user = await User.findOne({ email }).select("+verificationCode +verificationCodeExpires");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: true, message: "Account already verified." });
    }

    // 2. Validate OTP
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    
    if (user.verificationCode !== hashedCode) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (new Date() > (user.verificationCodeExpires as Date)) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    // 3. Mark as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: "Email verified successfully! You can now log in." 
    });

  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Verification failed. Try again." }, { status: 500 });
  }
}
