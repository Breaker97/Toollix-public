import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";
import { getEmailLayout } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 403 });
    }

    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFrom } = await req.json();

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ error: "Missing required SMTP configuration." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 587,
      secure: smtpSecure === true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const from = smtpFrom || `"Toollix Diagnostics" <${smtpUser}>`;
    
    const htmlContent = `
      <tr>
        <td class="content" style="padding: 40px 50px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px;">
             <h2 style="margin-top: 0; color: #0f172a;">SMTP Connection Test Success</h2>
             <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
               This email confirms that your SMTP configuration for <b>${smtpHost}</b> is operational. 
               The Platform Engine has successfully authenticated and dispatched this diagnostic payload.
             </p>
             <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.1em;">Test Parameters</p>
                <p style="margin: 8px 0 0 0; font-size: 13px; font-family: monospace; color: #64748b;">
                  User: ${smtpUser}<br>
                  From: ${from}<br>
                  Secure: ${smtpSecure ? "Yes (SSL/TLS)" : "No (STARTTLS)"}
                </p>
             </div>
          </div>
        </td>
      </tr>
    `;

    const mailOptions = {
      from,
      to: session.user.email as string,
      subject: "Toollix SMTP Diagnostic Test",
      html: await getEmailLayout("Diagnostic Success", htmlContent),
    };

    // Verify connection first
    await transporter.verify();

    // Send test email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: "Test email sent successfully!",
      messageId: info.messageId,
      response: info.response
    });

  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to send test email.",
      code: error.code,
      command: error.command
    }, { status: 500 });
  }
}
