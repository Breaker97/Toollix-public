"use server";

import sharp from "sharp";

export async function enhanceImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const brightness = parseFloat(formData.get("brightness") as string) || 1;
    const contrast = parseFloat(formData.get("contrast") as string) || 1;
    const saturation = parseFloat(formData.get("saturation") as string) || 1;
    const sharpness = parseFloat(formData.get("sharpness") as string) || 0;
    const autoFix = formData.get("autoFix") === "true";

    if (!file) throw new Error("No file provided.");

    const buffer = Buffer.from(await file.arrayBuffer());
    let image = sharp(buffer);

    // 1. Auto Fix (Normalization)
    if (autoFix) {
      image = image.normalize();
    }

    // 2. Brightness & Saturation
    image = image.modulate({
      brightness: brightness,
      saturation: saturation,
    });

    // 3. Contrast (Linear adjustment)
    if (contrast !== 1) {
      // contrast ratio: 1.0 is neutral
      // k = contrast, b = -(0.5 * k) + 0.5
      image = image.linear(contrast, -(0.5 * contrast) + 0.5);
    }

    // 4. Sharpness
    if (sharpness > 0) {
      // sharpness comes as 0-100 from client, sigma expects 0-10
      image = image.sharpen({
        sigma: Math.min(Math.max(sharpness / 10, 0.000001), 10),
      });
    }

    const outputBuffer = await image.toBuffer();
    const base64 = `data:${file.type};base64,${outputBuffer.toString("base64")}`;

    return { success: true, url: base64 };

  } catch (error: any) {
    console.error("Enhance Action Error:", error);
    return { success: false, error: error.message };
  }
}
