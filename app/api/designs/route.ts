import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Design from "@/models/Design";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    // Return designs belonging to the user, sorted by newest first
    const designs = await Design.find({ userId: session.user.id })
      .select("title width height thumbnail updatedAt createdAt")
      .sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, designs });
  } catch (error) {
    console.error("Designs GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await dbConnect();

    // Ensure we don't accidentally let users set the userId
    const design = await Design.create({
      ...data,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, design });
  } catch (error) {
    console.error("Design POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
