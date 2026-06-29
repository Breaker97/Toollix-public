"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * SessionWatcher monitors the NextAuth session status.
 * If the session is invalidated by the server (e.g., user deleted),
 * it ensures the client is logged out and redirected.
 */
export function SessionWatcher() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If we were supposedly loading or authenticated, but the session is now explicitly null
    // (which happens when our lib/auth.ts session callback returns user: null for deleted users)
    if (status === "authenticated" && !session?.user) {
      console.warn("[AUTH] Session invalidated by server. Redirecting to login...");
      signOut({ callbackUrl: "/login?error=SessionInvalidated" });
    }
  }, [session, status, router]);

  return null;
}
