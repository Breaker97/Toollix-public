"use client";

import { useEffect } from "react";
import { AdUnit } from "./ad-unit";
import { getGuestId } from "./GuestSessionProvider";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ALL_TOOLS } from "@/lib/tools-data";
import { Button } from "./ui/button";
import { Sparkles, Lock, Zap, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ToolIcon } from "@/lib/tool-icons";
import { cn } from "@/lib/utils";
import { FAQSection } from "./faq-section";
import { getFaqsForTool } from "@/lib/tool-faqs";
import { ToolDocumentation } from "./tool-documentation";

// Icon map for related tools
const ICON_MAP: Record<string, React.ElementType> = {
  FileText, Scissors: FileText, Minimize2: FileText, ImageIcon: FileText,
  Code2: FileText, QrCode: FileText, Palette: FileText, RefreshCw: FileText,
  AlignJustify: FileText, Lock, ScanLine: FileText, Wand2: FileText, 
  Table: FileText, ShieldCheck, MessageSquare: FileText, Share2: FileText,
  Link: FileText, Terminal: FileText, LockOpen: FileText, Database: FileText,
  Image: FileText,
};

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  isClientOnly?: boolean;
  fullWidth?: boolean;
}

export function ToolLayout({ title, description, children, isClientOnly, fullWidth }: ToolLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const currentTool = ALL_TOOLS.find(t => t.href === pathname) || 
                      ALL_TOOLS.find(t => t.title === title) ||
                      ALL_TOOLS.find(t => t.href.includes(title.toLowerCase().replace(/ /g, '-')));
  
  const isPro = session?.user?.plan === "pro";
  const isRestricted = currentTool?.proOnly && !isPro;

  useEffect(() => {
    if (isClientOnly && !isRestricted) {
      fetch("/api/tools/log", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-guest-id": getGuestId()
        },
        body: JSON.stringify({ toolName: title }),
      }).catch(console.error);
    }
  }, [title, isClientOnly, isRestricted]);

  // Split title: last word gets gold accent
  const titleWords = title.split(" ");
  const lastWord = titleWords.pop() || "";
  const leadingWords = titleWords.join(" ");

  // Get related tools from same category
  const relatedTools = currentTool 
    ? ALL_TOOLS
        .filter(t => t.category === currentTool.category && t.href !== pathname && !t.comingSoon)
        .slice(0, 4)
    : [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-zinc-950 flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      <main className={cn(
        "mx-auto w-full pt-10 md:pt-16 pb-24 px-4 sm:px-6 flex-1",
        fullWidth ? "max-w-[1600px] px-2 sm:px-6" : "max-w-6xl"
      )}>
        
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* ── Left Column: Hero + Tool ── */}
          <div className={fullWidth ? "lg:col-span-12 min-w-0" : "lg:col-span-7 min-w-0"}>
            <div className="mb-8 md:mb-10 text-center md:text-left">
              <div className="flex justify-center md:justify-start items-center mb-5">
                <span className="inline-flex font-mono text-[10px] uppercase tracking-[0.25em] text-primary font-semibold bg-amber-50 dark:bg-primary/10 px-3 py-1 rounded-full">
                  Professional PDF & Image Suite
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight break-words">
                  {leadingWords}{leadingWords ? " " : ""}<span className="text-primary">{lastWord}.</span>
                </h1>
                {currentTool?.proOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-primary to-amber-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20">
                    <Sparkles className="w-3 h-3" /> Pro
                  </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-lg leading-relaxed max-w-2xl break-words mx-auto md:mx-0">
                {description}
              </p>
            </div>
            
            {/* Tool Content Area */}
            {isRestricted ? (
              <div className="suite-card rounded-2xl p-10 md:p-16 text-center space-y-8">
                <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl flex items-center justify-center mx-auto">
                  <Lock className="w-9 h-9 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Pro Access Required</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    <strong className="text-primary">{title}</strong> is available exclusively for Pro members. Upgrade to unlock all premium tools.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <Link href="/pricing" className="flex-1">
                    <Button className="w-full h-12 rounded-xl font-bold text-sm btn-suite border-none">
                      Upgrade to Pro
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold text-sm border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300">
                      Back to Tools
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="min-h-[400px]">
                {children}
              </div>
            )}

            {/* Dynamic SEO Documentation Section */}
            {pathname !== "/tools/flip-coin" && (
              <ToolDocumentation 
                title={title} 
                description={description} 
                category={currentTool?.category || "Utility"} 
                seoDescription={currentTool?.seoDescription} 
                faqs={getFaqsForTool(pathname, title)} 
              />
            )}
          </div>

          {/* ── Right Column: Sidebar ── */}
          {!fullWidth && (
            <aside className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
              
              {/* Privacy & Security Card */}
              <div className="feature-card p-7 rounded-2xl border-l-4 border-l-primary">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Your Privacy</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-5">
                  We take your security seriously. Your files are processed safely in our secure system and are never saved permanently. Your data stays yours.
                </p>
                <div className="flex items-center text-xs font-bold text-slate-900 dark:text-white space-x-4">
                  <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Turbo Speed</div>
                  <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Certified Clean</div>
                </div>
              </div>

              {/* The Toollix Standard */}
              <div className="px-1">
                <h3 className="text-xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">The Toollix Standard</h3>
                <div className="space-y-7">
                  <div className="flex space-x-5">
                    <span className="font-mono text-primary font-bold text-lg opacity-40 shrink-0">01.</span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">Easy to Use</h4>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">A clean, simple interface designed so you can get your work done quickly.</p>
                    </div>
                  </div>
                  <div className="flex space-x-5">
                    <span className="font-mono text-primary font-bold text-lg opacity-40 shrink-0">02.</span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">High Quality</h4>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">Your output will look exactly like your original files, processed with care.</p>
                    </div>
                  </div>
                  <div className="flex space-x-5">
                    <span className="font-mono text-primary font-bold text-lg opacity-40 shrink-0">03.</span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">Always Free</h4>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">Core tools are free to use, no registration required. Pro unlocks advanced power.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Ad */}
              <div className="hidden lg:block">
                <AdUnit width={300} height={250} placement="tool_sidebar" className="rounded-xl overflow-hidden" />
              </div>
            </aside>
          )}
        </div>

        {/* ── Optional Bottom Info (when fullWidth) ── */}
        {fullWidth && (
          <section className="mt-16 pt-16 border-t border-slate-100 dark:border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Privacy & Security Card */}
              <div className="feature-card p-8 rounded-3xl border-l-4 border-l-primary flex flex-col justify-center">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Your Privacy</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mb-6">
                  We take your security seriously. Your files are processed safely in our secure system and are never saved permanently. Your data stays yours.
                </p>
                <div className="flex items-center text-xs font-bold text-slate-900 dark:text-white space-x-6">
                  <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Turbo Speed</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Certified Clean</div>
                </div>
              </div>

              {/* The Toollix Standard */}
              <div className="px-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight text-slate-900 dark:text-white">The Toollix Standard</h3>
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { num: "01", title: "Easy to Use", desc: "A clean, simple interface designed so you can get your work done quickly." },
                    { num: "02", title: "High Quality", desc: "Your output will look exactly like your original files, processed with care." },
                    { num: "03", title: "Always Free", desc: "Core tools are free to use, no registration required. Pro unlocks advanced power." }
                  ].map((item) => (
                    <div key={item.num} className="flex space-x-5 group">
                      <span className="font-mono text-primary font-bold text-xl opacity-40 shrink-0 group-hover:opacity-100 transition-opacity">{item.num}.</span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1 shadow-sm px-2 py-0.5 bg-primary/5 rounded-lg w-fit text-xs uppercase tracking-widest">{item.title}</h4>
                        <p className="text-[13px] text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ Section ── */}
        <FAQSection 
          toolName={title} 
          faqs={getFaqsForTool(pathname, title)} 
        />

        {/* ── More Tools Section ── */}
        {relatedTools.length > 0 && (
          <section className="mt-20 md:mt-28">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-100 dark:border-zinc-800 pb-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">More {currentTool?.category || "Tools"}</h2>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Explore our other helpful tools for your projects</p>
              </div>
              <div className="mt-3 md:mt-0">
                <Link href="/" className="text-xs font-black text-primary hover:underline underline-offset-4 flex items-center gap-1.5 uppercase tracking-widest">
                  View All Tools <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTools.map((tool) => (
                <Link key={tool.href} href={tool.href} className="tool-link-card p-5 rounded-2xl flex items-center space-x-4 group bg-zinc-50/50 dark:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all hover:shadow-lg">
                  <div className="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
                    <ToolIcon slug={tool.href.split('/').pop() || ""} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm mb-0.5 text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{tool.title}</h4>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 line-clamp-1 font-medium">{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer Ad ── */}
        <section className="mt-16 pt-10 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex justify-center">
            <div className="opacity-60 hover:opacity-100 transition-opacity duration-500">
              <AdUnit width={728} height={90} placement="tool_footer" className="hidden md:flex rounded-xl overflow-hidden" />
              <AdUnit width={320} height={50} placement="tool_footer" className="flex md:hidden rounded-lg overflow-hidden" />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
