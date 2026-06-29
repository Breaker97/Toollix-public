"use server";

import { getGlobalSettings } from "@/models/Settings";
import dbConnect from "@/lib/mongoose";

export async function upscaleImage(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    const scale = formData.get("scale") as string;
    
    if (!file) throw new Error("No image file provided.");

    // 1. Get API Token from Database
    await dbConnect();
    const settings = await getGlobalSettings();
    const hfToken = settings.hfAccessToken;

    if (!hfToken) {
      throw new Error("Hugging Face API token is missing. Please configure it in Admin Settings.");
    }

    // 2. Prepare Model
    // We use models that are highly reliable on the HF Inference API
    const modelId = scale === "4" 
        ? "cvnlab/Real-ESRGAN-x4plus" 
        : "caidas/swin2SR-classical-sr-x2-64";

    const arrayBuffer = await file.arrayBuffer();
    
    // 3. Call Hugging Face Inference API
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": file.type || "image/png",
        },
        method: "POST",
        body: arrayBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API Error:", errorText);
      
      if (response.status === 503) {
          throw new Error("The AI engine is warming up. Please try again in 30 seconds.");
      }
      
      if (response.status === 413) {
          throw new Error("Image size too large for AI processing. Try a smaller file.");
      }
      
      throw new Error(`Cloud Processing Error (${response.status}): ${response.statusText}`);
    }

    // 4. Convert Binary Response to Base64
    const resultBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(resultBuffer).toString("base64");
    const mimeType = response.headers.get("content-type") || "image/png";

    return {
      success: true,
      data: `data:${mimeType};base64,${base64}`,
    };

  } catch (error: any) {
    console.error("Upscale Action Error:", error);
    return {
      success: false,
      error: error.message || "Failed to process image on server.",
    };
  }
}
