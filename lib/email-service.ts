import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Newsletter from '@/models/Newsletter';
import { getGlobalSettings } from '@/models/Settings';
import { getBaseUrl } from './utils';

const goldColor = "#c5a059";
const brandColor = "#0f172a";
const brandName = "Toollix";
const brandExtension = ".io";

/**
 * Utility to replace placeholders like {{name}}, {{date}}, {{email}}, and {{unsubscribe_link}}
 */
function replacePlaceholders(content: string, context: { name?: string; email: string; unsubscribeUrl?: string }) {
  const now = new Date();
  const simpleDate = new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(now);

  return content
    .replace(/{{name}}/g, context.name || "Valued Member")
    .replace(/{{email}}/g, context.email)
    .replace(/{{date}}/g, simpleDate)
    .replace(/{{unsubscribe_link}}/g, context.unsubscribeUrl || "#");
}

// High-Compatibility Icon Fallbacks (Emojis render perfectly in all clients)
const ICONS = {
  WRENCH: "🛠️",
  PDF: "📄",
  IMAGE: "📸",
  CODE: "💻",
  SHIELD: "🛡️",
  TROPHY: "🏆"
};

/**
 * Robust helper to get or create a unique unsubscribe token for any email recipient.
 * Searches both Users and Newsletter subscribers.
 */
async function getOrCreateUnsubscribeToken(email: string): Promise<string | undefined> {
  const cleanEmail = email.toLowerCase().trim();
  await dbConnect();
  
  const user = await User.findOne({ email: cleanEmail });
  const newsletter = !user ? await Newsletter.findOne({ email: cleanEmail }) : null;
  
  if (!user && !newsletter) return undefined;

  let token = (user?.unsubscribeToken || newsletter?.unsubscribeToken || "").trim();

  if (!token) {
    token = crypto.randomUUID();
    if (user) {
      user.unsubscribeToken = token;
      await user.save();
    } else if (newsletter) {
      newsletter.unsubscribeToken = token;
      await newsletter.save();
    }
  }
  
  return token;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function getTransporterAndFrom() {
  await dbConnect();
  const settings = await getGlobalSettings();
  
  const transporter = nodemailer.createTransport({
    host: settings.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: settings.smtpPort || Number(process.env.SMTP_PORT) || 587,
    secure: settings.smtpSecure ?? (process.env.SMTP_SECURE === 'true' || false), 
    auth: {
      user: settings.smtpUser || process.env.SMTP_USER,
      pass: settings.smtpPass || process.env.SMTP_PASS,
    },
  });

  const from = settings.smtpFrom || process.env.SMTP_FROM || '"Toollix" <support@toollix.io>';
  
  return { transporter, from };
}

function prepareHtmlContent(html: string): string {
  if (html.includes('<body') || html.includes('<html')) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      return bodyMatch[1];
    }
  }
  return html;
}

export async function sendTransactionalEmail(payload: EmailPayload) {
  const { transporter, from } = await getTransporterAndFrom();
  const settings = await getGlobalSettings();
  const baseUrl = getBaseUrl();
  
  const token = await getOrCreateUnsubscribeToken(payload.to);
  const unsubscribeUrl = token ? `${baseUrl}/unsubscribe?token=${token}` : undefined;

  const user = await User.findOne({ email: payload.to });
  const name = user?.name || undefined;

  const processedSubject = replacePlaceholders(payload.subject, { name, email: payload.to, unsubscribeUrl });
  const processedHtml = replacePlaceholders(payload.html, { name, email: payload.to, unsubscribeUrl });

  // Ensure the content is wrapped in the standard layout
  const preparedContent = prepareHtmlContent(processedHtml);
  
  const finalHtml = await getEmailLayout(
    processedSubject, 
    `<tr><td class="content" style="padding: 40px 50px;">${preparedContent}</td></tr>`, 
    unsubscribeUrl
  );

  const mailOptions = {
    from,
    to: payload.to,
    subject: processedSubject,
    html: finalHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Transactional sent to ${payload.to}:`, info.messageId);
    return info;
  } catch (err) {
    console.error(`[EMAIL] Transactional FAILED to ${payload.to}:`, err);
    throw err;
  }
}

export async function sendMarketingEmail(payload: EmailPayload) {
  await dbConnect();
  
  // Find the user to check if they are subscribed and to get their token
  const user = await User.findOne({ email: payload.to });
  
  if (!user) {
    throw new Error(`User not found: ${payload.to}`);
  }

  // Check their subscription status
  if (user.marketingSubscription === false) {
    console.log(`Skipping marketing email for ${payload.to} (unsubscribed)`);
    return { skipped: true, reason: 'unsubscribed' };
  }

  // Ensure user has an unsubscribe token
  if (!user.unsubscribeToken) {
    user.unsubscribeToken = crypto.randomUUID();
    await user.save();
  }

  // Construct unsubscribe link
  const settings = await getGlobalSettings();
  const baseUrl = (settings.baseUrl || getBaseUrl()).replace(/\/$/, "");
  const unsubscribeUrl = user.unsubscribeToken ? `${baseUrl}/unsubscribe?token=${user.unsubscribeToken}` : undefined;

  const processedSubject = replacePlaceholders(payload.subject, { name: user.name || undefined, email: payload.to, unsubscribeUrl });
  const processedHtml = replacePlaceholders(payload.html, { name: user.name || undefined, email: payload.to, unsubscribeUrl });

  const preparedHtml = prepareHtmlContent(processedHtml);
  
  const content = `
    <tr>
      <td class="content" style="padding: 40px 50px;">
        ${preparedHtml}
      </td>
    </tr>
  `;

  const finalHtml = await getEmailLayout(processedSubject, content, unsubscribeUrl);

  const { transporter, from } = await getTransporterAndFrom();

  const mailOptions = {
    from,
    to: payload.to,
    subject: processedSubject,
    html: finalHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Marketing sent to ${payload.to}:`, info.messageId);
    return info;
  } catch (err) {
    console.error(`[EMAIL] Marketing FAILED to ${payload.to}:`, err);
    throw err;
  }
}

// ... (constants moved to top)

export async function getEmailLayout(title: string, contentHtml: string, unsubscribeUrl?: string) {
  const settings = await getGlobalSettings();
  // Prioritize configured base URL, fall back to inferred
  const baseUrl = (settings.baseUrl || getBaseUrl()).replace(/\/$/, "");
  
  let logoUrl = settings.siteLogo || "/branding/logo.png";
  const logoWidth = settings.logoWidth || 120;

  // Convert relative path to absolute URL for email clients
  if (logoUrl && !logoUrl.startsWith("http")) {
    const cleanLogo = logoUrl.startsWith("/") ? logoUrl : `/${logoUrl}`;
    logoUrl = `${baseUrl}${cleanLogo}`;
  }

  const logoPart = logoUrl ? `<img src="${logoUrl}" alt="Logo" style="width: ${logoWidth}px; display: block;" />` : `<div style="background-color: ${goldColor}; padding: 10px; border-radius: 12px; color: #000; font-size: 20px;">${ICONS.WRENCH}</div>`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 60px; }
        .main { background-color: #ffffff; margin: 40px auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: 'Outfit', sans-serif; color: #1e293b; border-radius: 32px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.03); }
        .btn:hover { background-color: #000000 !important; }
        @media only screen and (max-width: 600px) {
          .content { padding: 32px 24px !important; }
          .feature-box { width: 100% !important; display: block !important; margin-bottom: 16px !important; }
          .main { border-radius: 20px !important; margin: 10px auto !important; }
        }
      </style>
    </head>
    <body style="background-color: #f8fafc; font-family: 'Outfit', sans-serif;">
      <center class="wrapper">
        <table class="main" width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse: collapse; max-width: 600px;">
          <!-- Header Logo -->
          <tr>
            <td style="padding: 40px 0 20px 0;" align="center">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px; border-radius: 12px; text-align: center;">
                    ${logoPart}
                  </td>
                  <td style="padding-left: 14px;">
                    <span style="color: ${brandColor}; font-size: 24px; font-weight: 800; letter-spacing: -2px; font-family: 'Outfit', sans-serif;">${brandName}<span style="color: ${goldColor};">${brandExtension}</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${contentHtml}

          <!-- Footer -->
          <tr>
            <td style="padding: 40px; border-top: 1px solid #f1f5f9; text-align: center; background-color: #fbfcfe;">
              <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 16px;">
                <tr>
                  <td style="padding: 5px; border-radius: 8px; text-align: center;">
                    ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="width: 32px; display: block;" />` : `<div style="background-color: ${goldColor}; padding: 4px; border-radius: 6px; color: #000; font-size: 14px;">${ICONS.WRENCH}</div>`}
                  </td>
                  <td style="padding-left: 10px;">
                    <span style="font-size: 16px; font-weight: 800; color: ${brandColor}; letter-spacing: -1px;">${brandName}<span style="color: ${goldColor};">${brandExtension}</span></span>
                  </td>
                </tr>
              </table>
              <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
                Precision engineering for developers. Effortless power for creators.<br>
                ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color: ${goldColor}; text-decoration: underline; font-weight: 700;">Unsubscribe</a>` : ""} ${unsubscribeUrl ? "• " : ""}<a href="${baseUrl}/articles/privacy-policy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
}

export async function sendWelcomeEmail(to: string, name: string) {
  const baseUrl = getBaseUrl();
  const content = `
    <tr>
      <td class="content" style="padding: 0 50px 40px 50px; text-align: center;">
        <h1 style="font-size: 42px; font-weight: 800; line-height: 1.1; margin: 0; letter-spacing: -0.04em; color: #0f172a;">Your creative engine is <span style="color: ${goldColor};">live.</span></h1>
        <p style="font-size: 18px; color: #64748b; margin-top: 16px; line-height: 1.5;">Welcome to Toollix, ${name}. Your workspace is ready for high-performance engineering.</p>
      </td>
    </tr>

    <tr>
      <td class="content" style="padding: 0 50px 40px 50px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td class="feature-box" width="31%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px;">
              <div style="margin-bottom: 12px; font-size: 32px;">${ICONS.PDF}</div>
              <p style="margin: 0; font-weight: 800; font-size: 15px; color: #0f172a;">PDF Mastery</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.4;">High-performance merging & signing.</p>
            </td>
            <td width="3%">&nbsp;</td>
            <td class="feature-box" width="31%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px;">
              <div style="margin-bottom: 12px; font-size: 32px;">${ICONS.IMAGE}</div>
              <p style="margin: 0; font-weight: 800; font-size: 15px; color: #0f172a;">AI Imaging</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.4;">Remove backgrounds in one click.</p>
            </td>
            <td width="3%">&nbsp;</td>
            <td class="feature-box" width="31%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px;">
              <div style="margin-bottom: 12px; font-size: 32px;">${ICONS.CODE}</div>
              <p style="margin: 0; font-weight: 800; font-size: 15px; color: #0f172a;">Dev Utils</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.4;">JSON & Regex tools for pros.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 50px 50px 50px;">
        <table width="100%" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 24px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <p style="color: ${goldColor}; font-size: 11px; font-weight: 800; letter-spacing: 0.25em; margin: 0 0 16px 0; text-transform: uppercase;">Member Access</p>
              <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 28px 0; font-weight: 800; letter-spacing: -0.02em;">Enter your dashboard</h2>
              <a href="${baseUrl}/dashboard" style="background-color: #ffffff; color: #000000; padding: 18px 36px; border-radius: 14px; text-decoration: none; font-weight: 900; font-size: 14px; display: inline-block; transition: all 0.3s ease;">LAUNCH TOOLKIT &rarr;</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return sendTransactionalEmail({
    to,
    subject: "Elite Access: Welcome to Toollix",
    html: content,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const content = `
    <tr>
      <td class="content" style="padding: 0 50px 40px 50px; text-align: center;">
        <div style="margin-bottom: 24px; display: inline-block; background: #fdfaf1; padding: 20px; border-radius: 24px; color: ${goldColor}; font-size: 40px;">
          ${ICONS.SHIELD}
        </div>
        <h1 style="font-size: 36px; font-weight: 800; line-height: 1.1; margin: 0; letter-spacing: -0.04em; color: #0f172a;">Account Recovery</h1>
        <p style="font-size: 16px; color: #64748b; margin-top: 16px; line-height: 1.6;">We received a request to reset your password. If this was you, use the secure link below to proceed.</p>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 50px 50px 50px;">
        <table width="100%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 24px; text-align: center;">
          <tr>
            <td style="padding: 40px;">
              <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 18px 40px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 15px; display: inline-block;">Reset My Password</a>
              <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">This link will expire in 1 hour for your security.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 50px 40px 50px; text-align: center;">
        <p style="font-size: 13px; color: #64748b;">If you didn't request this, you can safely ignore this email. Your account remains secure.</p>
      </td>
    </tr>
  `;

  return sendTransactionalEmail({
    to,
    subject: "Action Required: Reset Your Password",
    html: content,
  });
}

export async function sendProUpgradeEmail(to: string, name: string) {
  const baseUrl = getBaseUrl();
  const content = `
    <tr>
      <td class="content" style="padding: 0 50px 40px 50px; text-align: center;">
        <div style="margin-bottom: 24px; display: inline-block; background: #fdfaf1; padding: 24px; border-radius: 30px; color: ${goldColor}; box-shadow: 0 10px 20px rgba(205, 154, 50, 0.1); font-size: 40px;">
          ${ICONS.TROPHY}
        </div>
        <h1 style="font-size: 42px; font-weight: 800; line-height: 1.1; margin: 0; letter-spacing: -0.04em; color: #0f172a;">Welcome to <span style="color: ${goldColor};">Pro.</span></h1>
        <p style="font-size: 18px; color: #64748b; margin-top: 16px; line-height: 1.5;">Congratulations, ${name}! Your account has been upgraded to Toollix Pro.</p>
      </td>
    </tr>

    <tr>
      <td class="content" style="padding: 0 50px 40px 50px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background: #0f172a; border-radius: 24px; padding: 32px; color: #ffffff;">
              <p style="color: ${goldColor}; font-size: 11px; font-weight: 800; letter-spacing: 0.2em; margin-bottom: 16px; text-transform: uppercase;">Pro Benefits Activated</p>
              <ul style="margin: 0; padding: 0; list-style: none; font-size: 14px; font-weight: 600;">
                <li style="margin-bottom: 12px; display: flex; items-center;">✔ Unlimited daily tool usage</li>
                <li style="margin-bottom: 12px; display: flex; items-center;">✔ High-performance batch processing</li>
                <li style="margin-bottom: 12px; display: flex; items-center;">✔ Zero advertisements</li>
                <li style="display: flex; items-center;">✔ Priority cloud processing</li>
              </ul>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 50px 50px 50px;">
        <a href="${baseUrl}/dashboard" style="width: 100%; box-sizing: border-box; background-color: ${goldColor}; color: #000000; padding: 20px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 16px; display: block; text-align: center; box-shadow: 0 10px 20px rgba(205, 154, 50, 0.2);">GO TO PRO DASHBOARD &rarr;</a>
      </td>
    </tr>
  `;

  return sendTransactionalEmail({
    to,
    subject: "Pro Activated: Welcome to the Elite",
    html: content,
  });
}
export async function sendVerificationEmail(to: string, code: string) {
  const content = `
    <tr>
      <td class="content" style="padding: 0 50px 40px 50px; text-align: center;">
        <div style="margin-bottom: 24px; display: inline-block; background: #fdfaf1; padding: 20px; border-radius: 24px; color: ${goldColor}; font-size: 40px;">
          ${ICONS.SHIELD}
        </div>
        <h1 style="font-size: 36px; font-weight: 800; line-height: 1.1; margin: 0; letter-spacing: -0.04em; color: #0f172a;">Verify Your Email</h1>
        <p style="font-size: 16px; color: #64748b; margin-top: 16px; line-height: 1.6;">Use the secure 6-digit code below to complete your Toollix registration.</p>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 50px 50px 50px;">
        <table width="100%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 24px; text-align: center;">
          <tr>
            <td style="padding: 40px;">
              <div style="font-family: monospace; font-size: 48px; font-weight: 900; color: #0f172a; letter-spacing: 12px; margin-bottom: 8px;">
                ${code}
              </div>
              <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">This code will expire in 15 minutes.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 50px 40px 50px; text-align: center;">
        <p style="font-size: 13px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
      </td>
    </tr>
  `;

  return sendTransactionalEmail({
    to,
    subject: `Your Verification Code: ${code}`,
    html: content,
  });
}

