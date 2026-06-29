"use client";

import { useEffect } from "react";

export function GuestSessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const existingId = localStorage.getItem("toollix_guest_id");
      if (!existingId) {
        localStorage.setItem("toollix_guest_id", crypto.randomUUID());
      }
    }
  }, []);

  return <>{children}</>;
}

export function getGuestId() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("toollix_guest_id") || "anonymous";
  }
  return "anonymous";
}
