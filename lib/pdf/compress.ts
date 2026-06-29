import { getGlobalSettings } from "@/models/Settings";
import { compressPdfWithAdobe } from "./adobe-compress";

export type CompressionLevel = "low" | "medium" | "high";

/**
 * Main PDF Compression Router.
 * Exclusively uses Adobe PDF Services for high-tier professional results.
 * This ensures the best possible quality and file size reduction.
 */
export async function compressPdf(
  buffer: Buffer | null, 
  level: CompressionLevel = "medium",
  assetId?: string
) {
  const originalSize = buffer ? buffer.length : 0;
  
  try {
    const settings = await getGlobalSettings();
    
    // Check for Adobe credentials
    if (!settings.adobeClientId || !settings.adobeClientSecret) {
      throw new Error("Adobe PDF Services not configured. Please add Client ID and Secret in Admin Panel.");
    }

    // Map internal levels to Adobe SDK levels
    const adobeLevel = 
      level === "high" ? "HIGH" : 
      level === "medium" ? "MEDIUM" : "LOW";

    const adobeBuffer = await compressPdfWithAdobe(
      buffer, 
      { 
        clientId: settings.adobeClientId, 
        clientSecret: settings.adobeClientSecret,
        organizationId: settings.adobeOrganizationId
      },
      adobeLevel,
      assetId
    );
    
    const compSize = adobeBuffer.length;
    const pct = Math.max(0, Math.round(((originalSize - compSize) / originalSize) * 100));
    
    return {
      buffer: adobeBuffer,
      originalSize,
      compressedSize: compSize,
      savedPercent: pct,
      imagesProcessed: -1, // Adobe handles internally
      via: "Adobe Acrobat Services"
    };

  } catch (error: any) {
    console.error("Compression Engine Error:", error);
    // Re-throw to be caught by the API route
    throw new Error(error.message || "PDF Compression failed.");
  }
}
