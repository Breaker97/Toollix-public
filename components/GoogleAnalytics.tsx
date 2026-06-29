"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

// Global type for window.gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

function AnalyticsContent({ ga_id }: { ga_id: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      window.gtag("config", ga_id, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, ga_id]);

  return null;
}

export function GoogleAnalytics({ ga_id }: { ga_id: string }) {
  if (!ga_id) return null;

  return (
    <Suspense fallback={null}>
      <AnalyticsContent ga_id={ga_id} />
    </Suspense>
  );
}

export function DeferredScripts({ 
  analyticsId, 
  adsenseId, 
  googleClientId,
  showAds,
  autoAds
}: { 
  analyticsId?: string; 
  adsenseId?: string; 
  googleClientId?: string;
  showAds?: boolean;
  autoAds?: boolean;
}) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      setShouldLoad(true);
      removeEventListeners();
    };

    const removeEventListeners = () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    window.addEventListener("scroll", handleInteraction, { passive: true });
    window.addEventListener("mousemove", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });

    // Fallback: Load after 4 seconds if no interaction
    const timer = setTimeout(() => {
      setShouldLoad(true);
      removeEventListeners();
    }, 4000);

    return () => {
      removeEventListeners();
      clearTimeout(timer);
    };
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      {showAds && adsenseId && autoAds && (
        <Script 
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`} 
          crossOrigin="anonymous" 
          strategy="lazyOnload" 
        />
      )}

      {analyticsId && (
        <>
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
          />
          <Script
            id="gtag-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
      )}
    </>
  );
}
