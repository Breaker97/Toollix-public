import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { toolName } = await req.json();
    if (!toolName) {
      return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
    }

    // This handles both logging the usage for analytics AND checking/enforcing limits
    const rateLimitCheck = await rateLimit(req, toolName);
    
    if (!rateLimitCheck.success) {
      return NextResponse.json({ 
        error: rateLimitCheck.message,
        limited: true 
      }, { status: 429 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
