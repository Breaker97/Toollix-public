"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function FooterWrapper() {
  const pathname = usePathname();
  const isCanvasStudio = pathname?.startsWith("/tools/canvas-studio");

  if (isCanvasStudio) return null;

  return <Footer />;
}
