import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters long." }, { status: 400 });
    }

    if (name.length > 50) {
      return NextResponse.json({ error: "Name must be less than 50 characters long." }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.name = name.trim();
    await user.save();

    return NextResponse.json({ 
      message: "Profile updated successfully.",
      user: { name: user.name }
    });

  } catch (error: any) {
    console.error("Profile Update API Error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
