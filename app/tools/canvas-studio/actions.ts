"use server";

import { serializeFileResponse } from "@/lib/gcs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function uploadCanvasAsset(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create user-specific filename/path
    const userId = session.user.id;
    const filename = `uploads/${userId}/${Date.now()}-${file.name}`;

    const result = await serializeFileResponse(buffer, filename, file.type, {
      isCanvasStudio: true
    });
    return result;
  } catch (error) {
    console.error("[Canvas Action] Upload failed:", error);
    return { success: false, error: "Upload failed" };
  }
}
