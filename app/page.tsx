import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { AdUnit } from "@/components/ad-unit";
import { ToolsGrid } from "@/components/tools-grid";
import AuthHeroAction from "../components/AuthHeroAction";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import WordRotator from "@/components/WordRotator";
import { FloatingIcons } from "@/components/FloatingIcons";

export const metadata: Metadata = {
  title: "toollix.io - Convert PDF, Edit Text & Free Online Image Tools",
  description: "Convert PDF, compress images, and edit text with 40+ free professional online tools. Toollix provides fast, secure, and easy-to-use digital utilities with zero logs, helping you streamline your daily workflow.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Toollix",
    "url": "https://www.toollix.io",
    "description": "Convert PDF, edit text, and compress images with 40+ free professional online tools.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative">
        <FloatingIcons />
        <div className="absolute inset-0 bg-grid-black/[0.01] bg-[size:50px_50px] z-0" />
        
        {/* ── Hero ── */}
        <section className="w-full pt-16 pb-16 md:pt-32 md:pb-28 lg:pt-40 lg:pb-32 relative flex flex-col items-center justify-center z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] opacity-40 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[128px] pointer-events-none" />
          
          <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center space-y-10">
            <div className="inline-flex items-center rounded-full px-5 py-2 text-[10px] sm:text-xs font-bold text-[#c5a059] bg-[#c5a059]/5 border border-[#c5a059]/10 shadow-[0_4px_20px_-10px_rgba(197,160,89,0.2)] animate-in fade-in slide-in-from-top-4 duration-1000">
              <Sparkles className="mr-2 h-3.5 w-3.5 fill-[#c5a059] text-[#c5a059]" />
              <span className="uppercase tracking-[0.2em]">40+ Professional Online Tools</span>
            </div>

            <div className="space-y-6 max-w-5xl mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] px-2 sm:px-0">
                Convert, Edit & Design <br className="hidden md:block" /> 
                <span className="text-[#c5a059] tracking-tighter italic whitespace-nowrap">Online Tools for <WordRotator /></span>
              </h1>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[300px] h-32 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
              <p className="mx-auto max-w-[800px] text-muted-foreground text-base sm:text-xl md:text-2xl leading-relaxed font-light px-4 sm:px-0 relative z-10">
                Access 40+ professional online tools to convert PDF, enhance any image, and edit text with ease. Our free online tools are fast, secure, and designed to boost your daily digital productivity.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <Link href="#tools">
                <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-12 text-sm sm:text-base font-bold rounded-2xl bg-[#c5a059] text-white hover:bg-[#c5a059]/90 shadow-[0_20px_40px_-10px_rgba(197,160,89,0.4)] transition-all hover:scale-105 active:scale-95 group border-none uppercase tracking-widest">
                  EXPLORE ALL TOOLS <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <AuthHeroAction />
            </div>
          </div>
        </section>

        {/* ── Catalog Heading Section ── */}
        <section className="w-full pt-20 pb-0 relative z-10">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tighter mb-4 px-4">
               Convert & Edit Image, PDF, and Text Files
            </h2>
            <p className="text-zinc-500 max-w-3xl mx-auto text-base md:text-lg leading-relaxed px-4">
               Discover our comprehensive catalog of professional online tools. From high-quality image conversion and PDF management to advanced text editing and developer utilities, find the perfect free online solution to streamline your workflow and boost productivity with 40+ tools.
            </p>
          </div>
        </section>
      </div>

      {/* ── Ad Banner ── */}
      <div className="w-full flex justify-center py-8 relative z-20">
        <AdUnit width={728} height={90} placement="home_middle_top" className="hidden md:flex" />
        <AdUnit width={320} height={50} placement="home_middle_top" className="flex md:hidden" />
      </div>

      {/* ── Tools Section ── */}
      <section id="tools" className="w-full pb-10 md:pb-20 pt-0 relative z-20 min-h-[1000px]">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="w-full py-24 flex flex-col items-center justify-center space-y-4">
              <div className="h-8 w-64 bg-zinc-100 rounded-full animate-pulse" />
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-64 rounded-[32px] bg-zinc-50 animate-pulse" />
                ))}
              </div>
            </div>
          }>
            <ToolsGrid />
          </Suspense>
        </div>
      </section>



      {/* ── Ad Banner Bottom ── */}
      <div className="w-full flex justify-center pb-24">
        <AdUnit width={728} height={90} placement="home_middle_bottom" className="hidden md:flex" />
        <AdUnit width={300} height={250} placement="home_middle_bottom" className="flex md:hidden" />
      </div>

    </div>
  );
}
