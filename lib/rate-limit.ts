import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import dbConnect from "./mongoose";
import ToolUsage from "@/models/ToolUsage";
import User from "@/models/User";
import { getGlobalSettings } from "@/models/Settings";

// In a real production app, limit by IP for guests using headers, 
// but Next.js App Router relies on x-forwarded-for which isn't always reliable testing locally.
// We'll use a mocked IP fallback.

export async function rateLimit(req: NextRequest | Headers | null, toolName: string) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    let identifier = "";
    
    // Fetch limits from DB
    const settings = await getGlobalSettings();
    let dailyLimit = settings.guestDailyLimit;
    let hourlyLimit = settings.guestHourlyLimit;

    // Development bypass: allow unlimited requests while building/testing
    if (process.env.NODE_ENV === "development") {
      return { success: true };
    }

    if (session?.user) {
      identifier = session.user.id;
      
      // Fetch full user record to check for existence and restrictions/overrides
      const dbUser = await User.findById(identifier);
      
      if (!dbUser) {
        return { 
          success: false, 
          message: "Your account no longer exists or your session has been invalidated. Please log in again." 
        };
      }

      if (dbUser.isRestricted) {
        return { 
          success: false, 
          message: "Your account has been restricted by an administrator. Please contact support." 
        };
      }

      if (dbUser?.dailyLimitOverride !== undefined && dbUser.dailyLimitOverride > -1) {
        dailyLimit = dbUser.dailyLimitOverride;
      } else if (session.user.plan === "pro") {
        dailyLimit = 99999; // Effectively unlimited
        hourlyLimit = settings.proHourlyLimit;
      } else {
        dailyLimit = settings.freeDailyLimit;
        hourlyLimit = settings.freeHourlyLimit;
      }
    } else {
      // Check for custom Guest Session ID (localStorage based) first
      let guestId: string | null = null;
      let xForwardedFor: string | null = null;

      if (req instanceof Request || (req && 'headers' in req)) {
        // It's a Request object (API route)
        guestId = (req as NextRequest).headers.get("x-guest-id");
        xForwardedFor = (req as NextRequest).headers.get("x-forwarded-for");
      } else if (req instanceof Headers) {
        // It's a Headers object (Server Action passing headers)
        guestId = req.get("x-guest-id");
        xForwardedFor = req.get("x-forwarded-for");
      } else {
        // No request provided, try to get from next/headers
        try {
          const h = await headers();
          guestId = h.get("x-guest-id");
          xForwardedFor = h.get("x-forwarded-for");
        } catch {
          // Headers not available (outside request context)
        }
      }

      identifier = session ? session.user.id : (guestId || xForwardedFor || "127.0.0.1");
    }

    // 1. Check Hourly Limit
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hourlyUsage = await ToolUsage.countDocuments({
      userId: identifier,
      createdAt: { $gte: oneHourAgo },
    });

    if (hourlyLimit !== -1 && hourlyUsage >= hourlyLimit) {
      return { 
        success: false, 
        message: `Hourly limit reached (${hourlyLimit} req/hr). Please wait a few minutes or upgrade to a higher tier for more bandwidth.`
      };
    }

    // 2. Check Daily Limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyUsage = await ToolUsage.countDocuments({
      userId: identifier,
      createdAt: { $gte: today },
    });

    if (dailyLimit !== -1 && dailyUsage >= dailyLimit) {
      return { 
        success: false, 
        message: session?.user 
          ? `Daily limit reached (${dailyLimit} uses/day). Upgrade to Pro for unlimited access.`
          : `Guest daily limit reached (${dailyLimit} uses/day). Please sign up to continue.`
      };
    }

    // 3. Log New Usage
    await ToolUsage.create({
      userId: identifier,
      toolName: toolName,
    });

    return { success: true };

  } catch (error) {
    console.error("Rate Limit engine error, failing open:", error);
    return { success: true };
  }
}
