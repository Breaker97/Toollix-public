import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Log from "@/models/Log";
import { pingSearchEngines } from "@/lib/seo-utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    
    const { id } = await params;
    const data = await req.json();
    await dbConnect();
    
    const article = await Article.findByIdAndUpdate(id, data, { new: true });

    // Record Audit Log
    await Log.create({
      adminName: session.user.name || "Admin",
      adminEmail: session.user.email || "unknown@toollix.io",
      action: `Article Updated: ${article?.title || id}`,
      details: `Article ID: ${id} | Published: ${article?.published}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "unknown"
    });

    // Trigger SEO Indexing if published
    if (article?.published) {
      pingSearchEngines(`https://toollix.io/blog/${article.slug}`);
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    
    const { id } = await params;
    await dbConnect();
    const article = await Article.findByIdAndDelete(id);

    // Record Audit Log
    await Log.create({
      adminName: session.user.name || "Admin",
      adminEmail: session.user.email || "unknown@toollix.io",
      action: `Article Deleted`,
      details: `Deleted Article ID: ${id}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "unknown"
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
