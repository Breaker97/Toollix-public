"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { GuestSessionProvider } from "./GuestSessionProvider";
import { SessionWatcher } from "./SessionWatcher";

export function Providers({ 
  children, 
  posthogApiKey, 
  posthogHost, 
  ...props 
}: { 
  children: React.ReactNode, 
  posthogApiKey?: string, 
  posthogHost?: string, 
  [key: string]: any 
}) {
  React.useEffect(() => {
    const key = posthogApiKey || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    const host = posthogHost || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    
    if (typeof window === "undefined" || !key || (posthog as any).__loaded) return;

    const initPostHog = () => {
      posthog.init(key, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: false,
        autocapture: false,
        disable_session_recording: true,
      });
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener("scroll", initPostHog);
      window.removeEventListener("mousemove", initPostHog);
      window.removeEventListener("touchstart", initPostHog);
    };

    window.addEventListener("scroll", initPostHog, { passive: true });
    window.addEventListener("mousemove", initPostHog, { passive: true });
    window.addEventListener("touchstart", initPostHog, { passive: true });

    // Fallback: init after 5 seconds
    const timeout = setTimeout(initPostHog, 5000);

    return () => {
      removeListeners();
      clearTimeout(timeout);
    };
  }, [posthogApiKey, posthogHost]);

  return (
    <SessionProvider>
      <PostHogProvider client={posthog}>
        <SessionWatcher />
        <GuestSessionProvider>
          {children}
        </GuestSessionProvider>
      </PostHogProvider>
    </SessionProvider>
  );
}
