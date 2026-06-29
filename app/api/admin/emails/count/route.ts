import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 403 });
    }

    const { audience, targetEmails, emailType } = await req.json();

    if (!audience || !emailType) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await dbConnect();

    let recipients: string[] = [];

    // Determine the recipients array 
    if (audience === "all") {
      const users = await User.find({}, 'email marketingSubscription');
      recipients = users.filter(u => emailType !== "marketing" || u.marketingSubscription !== false).map(u => u.email);
    } else if (audience === "pro") {
      const users = await User.find({ plan: "pro" }, 'email marketingSubscription');
      recipients = users.filter(u => emailType !== "marketing" || u.marketingSubscription !== false).map(u => u.email);
    } else if (audience === "free") {
      const users = await User.find({ plan: "free" }, 'email marketingSubscription');
      recipients = users.filter(u => emailType !== "marketing" || u.marketingSubscription !== false).map(u => u.email);
    } else if (audience === "selected" && Array.isArray(targetEmails)) {
      // For selected emails, we must still respect marketing unsubscribes if applicable
      if (emailType === "marketing") {
         const users = await User.find({ email: { $in: targetEmails } }, 'email marketingSubscription');
         recipients = users.filter(u => u.marketingSubscription !== false).map(u => u.email);
      } else {
         recipients = targetEmails;
      }
    } else {
      return NextResponse.json({ error: "Invalid audience selection." }, { status: 400 });
    }

    return NextResponse.json({ 
        success: true, 
        count: recipients.length 
    });

  } catch (error: any) {
    console.error("Admin Email Count API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to calculate audience." }, { status: 500 });
  }
}
