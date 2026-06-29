// LAST UPDATED: 2026-04-10 13:43:00
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { sendTransactionalEmail, sendPasswordResetEmail } from "@/lib/email-service";
import { getBaseUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    // For security reasons, we do not want to explicitly reveal if a user exists or not.
    if (user) {
      // Generate a highly secure random token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      // Token expires in 1 Hour
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); 

      await user.save();

      // Dispatch Email
      const baseUrl = getBaseUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      await sendPasswordResetEmail(email, resetUrl);
    }

    // Always return a generic success message
    return NextResponse.json({ success: true, message: "If an account with that email exists, we have sent a password reset link." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 });
  }
}
