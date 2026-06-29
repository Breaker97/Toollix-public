import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let targetUrl = url;
    if (!url.startsWith("http")) {
      targetUrl = "https://" + url;
    }

    const startTime = performance.now();
    
    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        cache: "no-store",
        next: { revalidate: 0 }
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Extract more details
      const server = response.headers.get("server") || "N/A";
      const contentType = response.headers.get("content-type") || "N/A";
      const contentLength = response.headers.get("content-length") || "N/A";
      const isSecure = targetUrl.startsWith("https");

      // Generate a high-authority screenshot using Google PageSpeed Insights API (very unlikely to be blocked)
      let screenshotUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(targetUrl)}?w=1200`;
      
      try {
        const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&category=performance`;
        const psiResponse = await fetch(psiUrl);
        const psiData = await psiResponse.json();
        if (psiData?.lighthouseResult?.audits?.['final-screenshot']?.details?.data) {
          screenshotUrl = psiData.lighthouseResult.audits['final-screenshot'].details.data;
        }
      } catch (e) {
        // Fallback to WordPress mshots if PSI fails
      }

      return NextResponse.json({
        status: "up",
        statusCode: response.status,
        responseTime,
        screenshotUrl,
        details: {
          server,
          contentType,
          contentLength,
          isSecure,
          protocol: isSecure ? "HTTPS/TLS" : "HTTP",
        },
        lastChecked: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      return NextResponse.json({
        status: "down",
        responseTime: null,
        lastChecked: new Date().toLocaleTimeString(),
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
