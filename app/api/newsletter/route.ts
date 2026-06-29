import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { getGlobalSettings } from "@/models/Settings";
import Newsletter from "@/models/Newsletter";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await dbConnect();
    
    // Get client IP for security/logging
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    // ── 0. Internal Storage (Always save locally) ───────────────────────────
    try {
      await Newsletter.findOneAndUpdate(
        { email: email.toLowerCase() },
        { 
          $set: { status: "active", ip },
          $setOnInsert: { 
            source: "footer",
            unsubscribeToken: crypto.randomUUID()
          } 
        },
        { upsert: true }
      );
      console.log(`[NEWSLETTER] Persisted to database: ${email}`);
    } catch (e) {
      console.error("[NEWSLETTER] Local persistence failure:", e);
    }

    const settings = await getGlobalSettings();

    let subscribed = false;

    // ── 1. Mailchimp Integration ─────────────────────────────────────────────
    if (settings.mailchimpApiKey && settings.newsletterListId) {
      try {
        // Mailchimp API key format: "key-dcXX" where dcXX is the datacenter
        const dc = settings.mailchimpApiKey.split("-").pop();
        const mcRes = await fetch(
          `https://${dc}.api.mailchimp.com/3.0/lists/${settings.newsletterListId}/members`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `apikey ${settings.mailchimpApiKey}`,
            },
            body: JSON.stringify({
              email_address: email,
              status: "subscribed",
            }),
          }
        );
        const mcData = await mcRes.json();
        if (mcRes.ok || mcData.title === "Member Exists") {
          subscribed = true;
          console.log(`[MAILCHIMP] Subscribed: ${email}`);
        } else {
          console.warn("[MAILCHIMP] Failed:", mcData.detail);
        }
      } catch (e) {
        console.error("[MAILCHIMP] Error:", e);
      }
    }

    // ── 2. Brevo (Sendinblue) Integration ────────────────────────────────────
    if (settings.brevoApiKey && settings.newsletterListId) {
      try {
        const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": settings.brevoApiKey,
          },
          body: JSON.stringify({
            email,
            listIds: [parseInt(settings.newsletterListId)],
            updateEnabled: true,
          }),
        });
        if (brevoRes.ok || brevoRes.status === 204) {
          subscribed = true;
          console.log(`[BREVO] Subscribed: ${email}`);
        } else {
          const brevoData = await brevoRes.json();
          console.warn("[BREVO] Failed:", brevoData.message);
        }
      } catch (e) {
        console.error("[BREVO] Error:", e);
      }
    }

    // ── Fallback: just log if no keys configured ──────────────────────────
    if (!settings.mailchimpApiKey && !settings.brevoApiKey) {
      console.log(`[NEWSLETTER] New signup (no provider configured): ${email}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Subscribed successfully!",
      provider: subscribed ? (settings.mailchimpApiKey ? "mailchimp" : "brevo") : "none"
    });

  } catch (error) {
    console.error("Newsletter API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
