import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Coupon from "@/models/Coupon";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Admin Coupon Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { code, discountPercent, maxRedemptions, expiryDate } = await req.json();

    if (!code || !discountPercent) {
      return NextResponse.json({ error: "Code and Discount are required" }, { status: 400 });
    }

    await dbConnect();

    // Check if code already exists
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercent,
      maxRedemptions: maxRedemptions || 0,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error("Admin Coupon Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, active } = await req.json();

    await dbConnect();
    const coupon = await Coupon.findByIdAndUpdate(id, { active }, { new: true });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error("Admin Coupon Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await dbConnect();
    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Coupon Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
