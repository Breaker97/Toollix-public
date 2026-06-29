import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FooterWrapper } from "@/components/FooterWrapper";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import Script from "next/script";
import dbConnect from "@/lib/mongoose";
import { getGlobalSettings } from "@/models/Settings";
import { GoogleAnalytics, DeferredScripts } from "@/components/GoogleAnalytics";
import { AdUnit } from "@/components/ad-unit";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { cache } from "react";

// Optimized settings fetch for request-level memoization
const getCachedSettings = cache(async () => {
  await dbConnect();
  return await getGlobalSettings();
});

const fontClass = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getCachedSettings();
    const baseUrl = settings?.baseUrl || process.env.NEXTAUTH_URL || "https://www.toollix.io";
    
    return {
      metadataBase: new URL(baseUrl),
      title: settings.siteTitle || "Toollix",
      description: settings.siteDescription || "All-in-one toolkit",
      keywords: settings.seoKeywords,
      alternates: {
        canonical: "./",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      verification: {
        google: settings.googleSearchConsoleId || undefined,
        other: {
          "msvalidate.01": settings.bingWebmasterId ? [settings.bingWebmasterId] : [],
        }
      },
      icons: {
        icon: [
          { url: settings.siteFavicon || "/branding/favicon.png" },
          { url: settings.siteFavicon || "/branding/favicon.png", sizes: "32x32", type: "image/png" },
          { url: settings.siteFavicon || "/branding/favicon.png", sizes: "16x16", type: "image/png" },
        ],
        shortcut: [settings.siteFavicon || "/branding/favicon.png"],
        apple: [
          { url: settings.siteFavicon || "/branding/favicon.png", sizes: "180x180", type: "image/png" },
        ],
      }
    };
  } catch (e) {
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.toollix.io";
    return {
       metadataBase: new URL(baseUrl),
       title: "toollix.io - All in one free online tools",
       description: "Merge PDF, compress images, generate QR codes, and access 40+ other free professional online tools. Toollix provides fast, secure, and easy-to-use digital utilities with zero logs to boost your productivity.",
       alternates: {
         canonical: "./",
       },
       icons: { icon: "/branding/favicon.png" }
    };
  }
}

import GoogleOneTap from "@/components/GoogleOneTap";
import { UTMTracker } from "@/components/UTMTracker";
import { Suspense } from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Parallelize critical initial data fetching
  const [session, settingsResult] = await Promise.all([
    getServerSession(authOptions),
    getCachedSettings().catch(e => {
       console.error("Failed to load settings in layout", e);
       return null;
    })
  ]);
  
  let analyticsId = "";
  let adsenseId = "";
  let autoAdsEnabled = false;
  let hideAdsForPro = true;
  let enableCookies = false;
  let terms = "";
  let privacy = "";
  let googleClientId = "";

  let brandingProps = { siteLogo: "", logoWidth: 120 };

  // PostHog dynamic settings
  let posthogApiKey = "";
  let posthogHost = "https://us.i.posthog.com";

  if (settingsResult) {
      const settings = settingsResult;
      analyticsId = settings?.googleAnalyticsId || "";
      adsenseId = settings?.googleAdsenseId || "";
      autoAdsEnabled = settings?.autoAdsEnabled || false;
      hideAdsForPro = settings?.hideAdsForPro ?? true;
      enableCookies = settings?.cookieConsentEnabled || false;
      terms = settings?.termsOfServiceUrl || "/articles/terms-of-service";
      privacy = settings?.privacyPolicyUrl || "/articles/privacy-policy";
      googleClientId = settings?.googleClientId || "";
      
      brandingProps = {
        siteLogo: settings?.siteLogo || "",
        logoWidth: settings?.logoWidth || 120
      };

      posthogApiKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || "";
      posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  }

  const headCode = settingsResult?.headCode || "";
  const bodyStartCode = settingsResult?.bodyStartCode || "";
  const bodyEndCode = settingsResult?.bodyEndCode || "";

    // Logic to determine if ads should be shown
    const isPro = session?.user?.plan === "pro";
    const shouldShowAds = !isPro || !hideAdsForPro;

    return (
      <html
        lang="en"
        suppressHydrationWarning
        className={`${fontClass.variable} light h-full antialiased overflow-x-hidden`}
      >
        <head>
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
          <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* Custom Code Injections */}
          {headCode && <script dangerouslySetInnerHTML={{ __html: `</script>${headCode}<script>` }} suppressHydrationWarning />}
        </head>
        <body suppressHydrationWarning className="min-h-screen flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
          {bodyStartCode && <div dangerouslySetInnerHTML={{ __html: bodyStartCode }} />}
          <Providers 
            posthogApiKey={posthogApiKey}
            posthogHost={posthogHost}
          >
            {/* Third-party scripts moved inside Providers to ensure they don't block critical hydration */}
            <Suspense fallback={null}>
              <DeferredScripts 
                analyticsId={analyticsId} 
                adsenseId={adsenseId} 
                googleClientId={googleClientId} 
                showAds={shouldShowAds}
                autoAds={autoAdsEnabled}
              />
            </Suspense>
            <Suspense fallback={null}>
              <UTMTracker />
            </Suspense>
            <GoogleOneTap clientId={googleClientId} />
            <Navbar branding={brandingProps} />
            {shouldShowAds && (
              <div className="w-full flex justify-center py-6 bg-transparent">
                <AdUnit placement="header" width={728} height={90} className="hidden md:flex rounded-2xl overflow-hidden opacity-40 hover:opacity-100 transition-opacity" />
                <AdUnit placement="header" width={320} height={50} className="flex md:hidden rounded-xl overflow-hidden opacity-40 hover:opacity-100 transition-opacity" />
              </div>
            )}
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            {shouldShowAds && (
              <div className="w-full flex justify-center py-10 bg-transparent">
                <AdUnit placement="footer" width={728} height={90} className="hidden md:flex rounded-2xl overflow-hidden opacity-40 hover:opacity-100 transition-opacity" />
                <AdUnit placement="footer" width={320} height={50} className="flex md:hidden rounded-xl overflow-hidden opacity-40 hover:opacity-100 transition-opacity" />
              </div>
            )}
            <Footer />
            {enableCookies && <CookieConsentBanner termsUrl={terms} privacyUrl={privacy} />}
            <Suspense fallback={null}>
              <GoogleAnalytics ga_id={analyticsId} />
              <Analytics />
            </Suspense>
            <Toaster position="top-center" expand={true} richColors closeButton />
          </Providers>
          {bodyEndCode && <div dangerouslySetInnerHTML={{ __html: bodyEndCode }} />}
        </body>
      </html>
    );
}
