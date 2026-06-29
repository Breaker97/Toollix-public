import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Contact from "@/models/Contact";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await dbConnect();

    // Simple IP-based Rate Limiting (3 messages per 24 hours)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const count = await Contact.countDocuments({
      ip,
      createdAt: { $gte: twentyFourHoursAgo }
    });

    if (count >= 3) {
      return NextResponse.json({ 
        error: "Message limit reached. Please try again in 24 hours." 
      }, { status: 429 });
    }

    const newMessage = await Contact.create({
      name,
      email,
      subject,
      message,
      ip
    });

    return NextResponse.json({ success: true, message: "Your message has been sent!" });
  } catch (error) {
    console.error("Contact Submission Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
