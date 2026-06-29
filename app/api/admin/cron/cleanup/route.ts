import { NextResponse } from "next/server";
import { cleanupProcessedFiles } from "@/lib/gcs";

/**
 * Hourly cron job to cleanup compressed PDF files from GCS.
 * 
 * To schedule this on Vercel, add to vercel.json:
 * "crons": [
 *   {
 *     "path": "/api/admin/cron/cleanup",
 *     "schedule": "0 * * * *"
 *   }
 * ]
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  // Security check:
  // 1. Check for CRON_SECRET environment variable
  // 2. Allow if it's a Vercel Cron request (verified by header)
  const expectedSecret = process.env.CRON_SECRET;
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  
  // If a secret is configured but not provided, and it's not a Vercel Cron, deny.
  if (expectedSecret && secret !== expectedSecret && !isVercelCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[CRON] Starting GCS cleanup...");
  const result = await cleanupProcessedFiles(60); // Cleanup files older than 60 minutes

  if (result.success) {
    return NextResponse.json({
      message: "Cleanup successful",
      ...result
    });
  } else {
    return NextResponse.json({
      message: "Cleanup failed",
      ...result
    }, { status: 500 });
  }
}
