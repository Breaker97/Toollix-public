import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // 1. Check if user exists
    const existingUser = await User.findOne({ email }).select("+password");
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({ error: "Account already exists. Please log in." }, { status: 400 });
      }
      // If user exists but not verified, we'll update them
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.verificationCode = otpHash;
      existingUser.verificationCodeExpires = otpExpiry;
      await existingUser.save();
    } else {
      await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationCode: otpHash,
        verificationCodeExpires: otpExpiry,
      });
    }

    // 3. Send Verification Email
    try {
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error("[SIGNUP] Email failed:", emailError);
    }

    // 4. Background: Auto-subscribe to Newsletter
    try {
       const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
       const host = req.headers.get("host") || "toollix.io";
       const baseUrl = `${protocol}://${host}`;
       
       fetch(`${baseUrl}/api/newsletter`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email }),
       }).catch(e => console.warn("[SIGNUP] Silent newsletter registration failed:", e));
    } catch (e) {
      console.warn("[SIGNUP] Newsletter fetch failed:", e);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Verification code sent to your email." 
    });

  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "Registration failed. Try again later." }, { status: 500 });
  }
}
