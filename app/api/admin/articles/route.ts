import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Log from "@/models/Log";
import { pingSearchEngines } from "@/lib/seo-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await dbConnect();
    const articles = await Article.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, articles });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { z } from "zod";

const ArticleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.boolean().optional(),
  relatedTools: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = await req.json();
    
    // Validate and sanitize input payload
    const validatedData = ArticleSchema.parse(data);
    
    await dbConnect();
    const article = await Article.create(validatedData);

    // Record Audit Log
    await Log.create({
      adminName: session.user.name || "Admin",
      adminEmail: session.user.email || "unknown@toollix.io",
      action: `New Article Created: ${article.title}`,
      details: `Slug: ${article.slug} | Published: ${article.published}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "unknown"
    });

    // Trigger SEO Indexing if published
    if (article.published) {
      pingSearchEngines(`https://www.toollix.io/blog/${article.slug}`);
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error("Article construction error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.format() }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
