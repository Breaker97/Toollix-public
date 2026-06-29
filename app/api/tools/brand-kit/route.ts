import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "brand-kit");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    let validUrl: URL;
    try {
      validUrl = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
    }

    const response = await fetch(validUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Website returned ${response.status}: ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Extract Colors (Heuristic approach)
    const colors: string[] = [];
    
    // Heuristic: Check common meta tags for theme-color
    const themeColor = $('meta[name="theme-color"]').attr("content") || $('meta[name="msapplication-TileColor"]').attr("content");
    if (themeColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(themeColor)) {
      colors.push(themeColor.toLowerCase());
    }

    // Heuristic: Scan <style> tags and inline styles for CSS variables
    const styleContent = $("style").text() + $('[style]').attr('style');
    const colorVarRegex = /--[a-z0-9-]+-?(?:color|primary|secondary|brand|accent)\s*:\s*(#[0-9a-f]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))/gi;
    let match;
    while ((match = colorVarRegex.exec(styleContent)) !== null) {
      const val = match[1].toLowerCase();
      if (!colors.includes(val)) colors.push(val);
    }

    // If no colors found, look for standard hex codes in the body
    if (colors.length < 4) {
      const bodyHexRegex = /#(?:[0-9a-f]{3,4}){1,2}(?!\w)/gi;
      const bodyText = html.slice(0, 50000); // Scan more of the page
      const hexMatches = bodyText.match(bodyHexRegex);
      if (hexMatches) {
          // Count occurrences to find dominant colors
          const counts: Record<string, number> = {};
          hexMatches.forEach(c => {
            const hex = c.toLowerCase();
            if (hex.length === 4 || hex.length === 7) {
              counts[hex] = (counts[hex] || 0) + 1;
            }
          });
          
          // Sort by frequency and add common ones that aren't too generic (like pure white/black if we have others)
          const sortedHex = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(e => e[0]);

          sortedHex.forEach(hex => {
            if (colors.length < 10 && !colors.includes(hex)) colors.push(hex);
          });
      }
    }

    // 2. Extract Logos
    const logos: string[] = [];
    
    // Exclude common payment/social icons that aren't the brand's logo
    const EXCLUDED_KEYWORDS = ['amex', 'visa', 'mastercard', 'paypal', 'apple-pay', 'google-pay', 'stripe', 'facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];

    const addLogo = (href: string | undefined | null) => {
      if (!href || typeof href !== 'string') return;
      if (EXCLUDED_KEYWORDS.some(kw => href.toLowerCase().includes(kw))) return;
      
      try {
        // Handle protocol-relative URLs
        const cleanHref = href.startsWith('//') ? `https:${href}` : href;
        const absoluteUrl = new URL(cleanHref, validUrl).toString();
        if (!logos.includes(absoluteUrl)) logos.push(absoluteUrl);
      } catch (e) {}
    };

    // JSON-LD (prioritize this)
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = JSON.parse($(el).html() || '');
            const findLogo = (obj: any) => {
                if (!obj || typeof obj !== 'object') return;
                if (obj.logo) {
                    if (typeof obj.logo === 'string') addLogo(obj.logo);
                    else if (obj.logo.url) addLogo(obj.logo.url);
                }
                if (obj.image) {
                    if (typeof obj.image === 'string') addLogo(obj.image);
                    else if (obj.image.url) addLogo(obj.image.url);
                }
                Object.values(obj).forEach(val => { if (typeof val === 'object') findLogo(val); });
            };
            if (Array.isArray(json)) json.forEach(findLogo);
            else findLogo(json);
        } catch (e) {}
    });

    // Inline SVG Logos
    $('svg').each((_, el) => {
        const className = $(el).attr('class') || '';
        const id = $(el).attr('id') || '';
        if (className.toLowerCase().includes('logo') || id.toLowerCase().includes('logo')) {
            try {
                const svgContent = $.html(el);
                const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
                if (!logos.includes(dataUri)) logos.push(dataUri);
            } catch (e) {}
        }
    });

    // Asset extraction loop
    $('img, source, picture source').each((_, el) => {
        const src = $(el).attr('src');
        const dataSrc = $(el).attr('data-src') || $(el).attr('data-original');
        const srcset = $(el).attr('srcset');
        const alt = $(el).attr('alt') || '';
        const className = $(el).attr('class') || '';
        const id = $(el).attr('id') || '';

        const isLogoLike = [className, id, alt, src].some(str => str?.toLowerCase().includes('logo'));
        
        if (isLogoLike || (el.tagName === 'source' && $(el).closest('picture').find('img[class*="logo"]').length > 0)) {
            if (src) addLogo(src);
            if (dataSrc) addLogo(dataSrc);
            if (srcset) {
                const parts = srcset.split(',').map(s => s.trim().split(' ')[0]);
                addLogo(parts[parts.length - 1]);
            }
        }
    });

    addLogo($('[itemprop="logo"]').attr("src") || $('[itemprop="logo"]').attr("content"));

    // 3. Metadata
    const title = $("title").text() || $('meta[property="og:title"]').attr("content") || $('meta[name="title"]').attr("content") || "";
    const description = $('meta[name="description"]').attr("content") || 
                        $('meta[property="og:description"]').attr("content") || 
                        $('meta[name="twitter:description"]').attr("content") || "";

    return NextResponse.json({
      success: true,
      data: {
        title: title.trim(),
        description: description.trim(),
        url: validUrl.origin,
        colors: colors.slice(0, 12),
        logos: Array.from(new Set(logos)).slice(0, 8)
      }
    });

  } catch (error: any) {
    console.error("Brand Kit Extraction Error:", error);
    return NextResponse.json({ error: "Failed to parse brand assets." }, { status: 500 });
  }
}
