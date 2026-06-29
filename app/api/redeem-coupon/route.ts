import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Coupon from "@/models/Coupon";
import User from "@/models/User";
import Log from "@/models/Log";
import { sendProUpgradeEmail } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Please sign in to redeem codes." }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "No code provided." }, { status: 400 });
    }

    await dbConnect();

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon code." }, { status: 404 });
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
    }

    // Check usage limit
    if (coupon.maxRedemptions !== undefined && coupon.maxRedemptions > 0 && (coupon.timesUsed || 0) >= coupon.maxRedemptions) {
      return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
    }

    // Check if user already redeemed it
    const alreadyRedeemed = coupon.redemptions.some(r => r.userId === session.user.id);
    if (alreadyRedeemed) {
      return NextResponse.json({ error: "You have already redeemed this coupon." }, { status: 400 });
    }

    // Handle 100% discount as automatic 30-day upgrade
    let isAutoUpgrade = false;
    if (coupon.discountPercent === 100) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      
      await User.findByIdAndUpdate(session.user.id, {
        plan: 'pro',
        planExpiresAt: expirationDate
      });
      isAutoUpgrade = true;
      
      // Fire-and-forget Pro Welcome Email
      if (session.user.email) {
        sendProUpgradeEmail(session.user.email, session.user.name || "Member").catch(err => 
          console.error("[MONETIZATION] Failed to send Pro welcome email:", err)
        );
      }
    }

    // Log redemption
    coupon.redemptions.push({
      userId: session.user.id,
      email: session.user.email || "unknown",
      usedAt: new Date()
    });
    coupon.timesUsed += 1;
    await coupon.save();

    // Audit Log
    await Log.create({
      adminName: `Redemption: ${session.user.name || "User"}`,
      adminEmail: session.user.email || "unknown",
      action: "Coupon Applied",
      details: `Code: ${coupon.code} | Discount: ${coupon.discountPercent}%${isAutoUpgrade ? " | Auto-PRO Upgrade (30 Days)" : ""}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "unknown"
    });

    const standardMsg = `Coupon ${coupon.code} applied! Your ${coupon.discountPercent}% discount request has been logged. Our team will contact you for manual upgrade.`;
    const autoMsg = `Coupon ${coupon.code} applied! Your account has been upgraded to PRO for 30 days! Enjoy unlimited access.`;

    return NextResponse.json({ 
      success: true, 
      message: isAutoUpgrade ? autoMsg : standardMsg,
      discountPercent: coupon.discountPercent
    });

  } catch (error) {
    console.error("Redeem Coupon Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
