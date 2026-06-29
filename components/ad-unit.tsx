"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface AdUnitProps {
  className?: string;
  placement: string; // e.g. "sidebar", "banner", "in_content"
  width?: number; // Optional for placeholder sizing
  height?: number; // Optional for placeholder sizing
}

export function AdUnit({ className = "", placement, width = 300, height = 250 }: AdUnitProps) {
  const { data: session } = useSession();
  const [ad, setAd] = useState<{ code: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  const isPro = session?.user?.plan === "pro";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Intersection Observer to detect when ad enters viewport
  useEffect(() => {
    if (isPro) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before it enters viewport
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [isPro]);

  useEffect(() => {
    // If Pro, we don't even fetch ads
    if (isPro) {
      setLoading(false);
      return;
    }

    // Only fetch if visible (lazy load)
    if (!isVisible) return;

    // Optimization: Don't fetch if this instance is hidden via responsive classes
    const isDesktopAd = width >= 728;
    if (isDesktopAd && isMobile) {
      setLoading(false);
      return;
    }
    if (!isDesktopAd && !isMobile && width < 728) {
      setLoading(false);
      return;
    }

    async function fetchAd() {
      try {
        const res = await fetch(`/api/public/ads?placement=${placement}`);
        const data = await res.json();
        
        if (data.ad) {
          setAd(data.ad);
        }
      } catch (err) {
        console.error(`Client ad error for [${placement}]:`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchAd();
  }, [placement, isPro, isMobile, width, isVisible]);

  // If Pro user, return nothing immediately
  if (isPro) {
    return null;
  }

  // If not visible yet, show a placeholder with the ref
  if (!isVisible) {
    return (
      <div 
        ref={adRef}
        className={`w-full flex justify-center ${className}`}
        style={{ minHeight: height }}
      >
        <div 
          className="bg-transparent rounded-2xl flex items-center justify-center overflow-hidden mx-auto"
          style={{ height: height, width: '100%', maxWidth: width }}
        />
      </div>
    );
  }

  // If loading, show a skeleton or placeholder to preserve space (CLS fix)
  if (loading) {
    return (
      <div 
        className={`w-full flex justify-center animate-pulse ${className}`}
        style={{ minHeight: height }}
      >
        <div 
          className="bg-muted/10 rounded-2xl flex items-center justify-center overflow-hidden mx-auto"
          style={{ height: height, width: '100%', maxWidth: width }}
        />
      </div>
    );
  }

  // If no ad is configured
  if (!ad) {
    // Show debug placeholder ONLY for non-pro users in development mode
    if (process.env.NODE_ENV === "development") {
      return (
        <div 
          className={`bg-muted/5 rounded-[2rem] flex flex-col items-center justify-center text-muted-foreground/30 p-8 transition-all hover:bg-muted/10 max-w-full overflow-hidden mx-auto ${className}`}
          style={{ minHeight: height, width: '100%', maxWidth: width }}
        >
          <div className="flex items-center gap-2 mb-2 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ad Component</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-center px-4 tracking-tight">Slot: {placement} ({width}×{height})</span>
          <p className="text-[9px] text-center mt-2 opacity-40 px-8 leading-tight font-medium">Injected via cloud configuration in production.</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div 
      className={`w-full overflow-hidden my-4 flex justify-center animate-in fade-in duration-500 ${className}`}
      style={{ minHeight: height }}
    >
      <div 
        className="ad-container w-full flex justify-center overflow-x-hidden"
        style={{ maxWidth: isMobile ? '100%' : width }}
        dangerouslySetInnerHTML={{ __html: ad.code }} 
      />
    </div>
  );
}
