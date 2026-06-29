"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Script from "next/script";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleOneTapProps {
  clientId: string;
}

export default function GoogleOneTap({ clientId }: GoogleOneTapProps) {
  const { data: session, status } = useSession();

  const initializeOneTap = () => {
    if (!window.google || status !== "unauthenticated" || !clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          await signIn("google-one-tap", {
            credential: response.credential,
            callbackUrl: "/",
            redirect: true,
          });
        },
        context: 'signin',
        itp_support: false, // Disable to reduce FedCM/ITP overhead on localhost
        use_fedcm_for_prompt: false,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log("[ONE-TAP] Prompt not displayed:", notification.getNotDisplayedReason());
        }
      });
    } catch (error) {
      console.error("[ONE-TAP] Initialization failed:", error);
    }
  };

  useEffect(() => {
    if (status !== "unauthenticated" || !clientId) return;

    if (window.google) {
      initializeOneTap();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initializeOneTap();
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [status, clientId]);

  return null;
}
