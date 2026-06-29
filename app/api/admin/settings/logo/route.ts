import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import dbConnect from "@/lib/mongoose";
import Settings, { getGlobalSettings } from "@/models/Settings";
import { uploadToGCS } from "@/lib/gcs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'logo' or 'favicon'

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name) || (type === "logo" ? ".png" : ".ico");
    const fileName = `${type}${fileExtension}`;

    await dbConnect();
    const settings = await getGlobalSettings();

    let fileUrl = "";

    // Attempt GCS Upload first if enabled
    if (settings.gcsEnabled) {
      const gcsUrl = await uploadToGCS(buffer, fileName, file.type);
      if (gcsUrl) {
        fileUrl = gcsUrl;
      }
    }

    // Fallback to local storage if GCS failed or is disabled
    if (!fileUrl) {
      const uploadDir = path.join(process.cwd(), "public", "branding");
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      fileUrl = `/branding/${fileName}`;
    }

    // Update settings
    const fieldToUpdate = type === "logo" ? "siteLogo" : "siteFavicon";
    await Settings.findByIdAndUpdate(settings._id, { [fieldToUpdate]: fileUrl });

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Logo Upload Error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
