"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function UTMTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utmParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid"
    ];

    let hasNewParams = false;
    const currentUtm: Record<string, string> = {};

    utmParams.forEach((param) => {
      const value = searchParams.get(param);
      if (value) {
        currentUtm[param] = value;
        localStorage.setItem(`toollix_${param}`, value);
        hasNewParams = true;
      }
    });

    if (hasNewParams) {
      // Store the timestamp of the last UTM attribution
      localStorage.setItem("toollix_utm_timestamp", Date.now().toString());
      
      // Also store as a JSON object for easier retrieval
      const existing = localStorage.getItem("toollix_utm_all");
      const all = existing ? JSON.parse(existing) : {};
      const updated = { ...all, ...currentUtm, last_updated: new Date().toISOString() };
      localStorage.setItem("toollix_utm_all", JSON.stringify(updated));
      
      console.log("[UTMTracker] Captured attribution:", currentUtm);
    }
  }, [searchParams]);

  return null; // Side-effect only component
}
