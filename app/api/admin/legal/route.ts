import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import LegalContent from "@/models/LegalContent";
import Log from "@/models/Log";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await dbConnect();
    const contents = await LegalContent.find().sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, contents });
  } catch (error) {
    console.error("Legal Content Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = await req.json();
    const { slug, title, sections, lastUpdated, showInFooter } = data;

    if (!slug || !title) {
       return NextResponse.json({ error: "Slug and title are required." }, { status: 400 });
    }

    await dbConnect();
    
    // Upsert legal content by slug
    const content = await LegalContent.findOneAndUpdate(
      { slug },
      { 
        title, 
        sections: sections || [], 
        lastUpdated: lastUpdated || new Date(),
        showInFooter: showInFooter !== undefined ? showInFooter : true
      },
      { upsert: true, new: true }
    );

    // Record Audit Log
    await Log.create({
      adminName: session.user.name || "Admin",
      adminEmail: session.user.email || "unknown@toollix.io",
      action: `Legal Content Updated: ${title}`,
      details: `Slug: ${slug} | Sections Count: ${sections?.length || 0} | Show in Footer: ${showInFooter}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "unknown"
    });

    // Revalidate the public legal route
    revalidatePath(`/legal/${slug}`);
    revalidatePath("/", "layout"); // Revalidate home/layout for footer changes

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Legal content update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    // Protection for critical policies
    if (["privacy-policy", "terms-of-service", "cookie-policy"].includes(slug)) {
      return NextResponse.json({ error: "Critical policies cannot be deleted." }, { status: 403 });
    }

    await dbConnect();
    await LegalContent.deleteOne({ slug });

    // Record Audit Log
    await Log.create({
      adminName: session.user.name || "Admin",
      adminEmail: session.user.email || "unknown@toollix.io",
      action: `Legal Content DELETED: ${slug}`,
      details: `Slug: ${slug}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "unknown"
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Deletion failed." }, { status: 500 });
  }
}
