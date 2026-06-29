import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import EmailLog from "@/models/EmailLog";
import { sendMarketingEmail, sendTransactionalEmail } from "@/lib/email-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 403 });
    }

    const { audience, targetEmails, subject, html, emailType } = await req.json();

    if (!subject || !html || !emailType) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await dbConnect();

    let recipients: string[] = [];

    // Determine the recipients array 
    if (audience === "all") {
      const users = await User.find({}, 'email');
      recipients = users.map(u => u.email);
    } else if (audience === "pro") {
      const users = await User.find({ plan: "pro" }, 'email');
      recipients = users.map(u => u.email);
    } else if (audience === "free") {
        const users = await User.find({ plan: "free" }, 'email');
        recipients = users.map(u => u.email);
    } else if (audience === "selected" && Array.isArray(targetEmails)) {
      recipients = targetEmails;
    } else {
      return NextResponse.json({ error: "Invalid audience selection." }, { status: 400 });
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found." }, { status: 400 });
    }

    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    const BATCH_SIZE = 10;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (email) => {
            try {
                if (emailType === "marketing") {
                    const result = await sendMarketingEmail({ to: email, subject, html }) as any;
                    if (result?.skipped) skippedCount++;
                    else successCount++;
                } else {
                    await sendTransactionalEmail({ to: email, subject, html });
                    successCount++;
                }
            } catch (err) {
                console.error(`Failed to send email to ${email}:`, err);
                failedCount++;
            }
        }));
    }

    // Persist to History Log
    try {
        await EmailLog.create({
            subject,
            audience,
            emailType,
            stats: {
                total: recipients.length,
                success: successCount,
                failed: failedCount,
                skipped: skippedCount
            },
            htmlContent: html,
            sentBy: {
                name: session.user.name || "Admin",
                email: session.user.email || "admin@toollix.io"
            }
        });
    } catch (logErr) {
        console.error("Failed to log email archive:", logErr);
    }

    return NextResponse.json({ 
        message: "Email dispatch completed.", 
        stats: { total: recipients.length, successCount, skippedCount, failedCount } 
    });

  } catch (error: any) {
    console.error("Admin Email API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process emails." }, { status: 500 });
  }
}
