"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Trash2, ExternalLink, Globe, Zap, Layout, Share2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UtmBuilderClient() {
  const [baseUrl, setBaseUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [finalUrl, setFinalUrl] = useState("");

  const buildUrl = () => {
    if (!baseUrl.trim()) {
      setFinalUrl("");
      return;
    }

    try {
      let pureUrl = baseUrl.trim();
      if (!pureUrl.startsWith("http://") && !pureUrl.startsWith("https://")) {
        pureUrl = "https://" + pureUrl;
      }

      const urlObj = new URL(pureUrl);
      
      if (source) urlObj.searchParams.set("utm_source", source);
      if (medium) urlObj.searchParams.set("utm_medium", medium);
      if (campaign) urlObj.searchParams.set("utm_campaign", campaign);
      if (term) urlObj.searchParams.set("utm_term", term);
      if (content) urlObj.searchParams.set("utm_content", content);

      setFinalUrl(urlObj.toString());
    } catch (e) {
      setFinalUrl("");
    }
  };

  useEffect(() => {
    buildUrl();
  }, [baseUrl, source, medium, campaign, term, content]);

  const handleCopy = () => {
    if (!finalUrl) return;
    navigator.clipboard.writeText(finalUrl);
    toast.success("UTM link copied to clipboard!");
  };

  const handleClear = () => {
    setBaseUrl("");
    setSource("");
    setMedium("");
    setCampaign("");
    setTerm("");
    setContent("");
    toast.info("Form cleared");
  };

  return (
    <ToolLayout 
      title="UTM Link Architect" 
      description="Professional marketing attribution engine. Generate trackable campaign links with zero-loss precision for advanced analytics and ROI monitoring."
      fullWidth={true}
    >
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAIN AREA: Input & Parameters */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Phase 01: Destination Vector */}
            <div className="suite-card rounded-[2.5rem] p-8 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Phase 01</p>
                        <h3 className="text-sm font-black text-[#c5a059] uppercase tracking-widest mt-1 italic">Destination Vector</h3>
                     </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={handleClear} 
                    className="h-10 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
                  >
                     <Trash2 className="w-3.5 h-3.5 mr-2" /> Clear All
                  </Button>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-4 italic">Target URL</label>
                  <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
                      <Input 
                        placeholder="https://your-website.com" 
                        className="pl-12 h-18 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none font-bold placeholder:font-medium focus-visible:ring-4 focus-visible:ring-[#c5a059]/10 shadow-inner text-[#c5a059]"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                      />
                  </div>
               </div>
            </div>

            {/* Phase 02: Parameter Matrix */}
            <div className="suite-card rounded-[2.5rem] p-8 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
               <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center">
                     <Layout className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Phase 02</p>
                     <h3 className="text-sm font-black text-[#c5a059] uppercase tracking-widest mt-1 italic">Parameter Matrix</h3>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column Parameters */}
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4 italic">Campaign Source</label>
                        <Input 
                          placeholder="google, newsletter..." 
                          className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none font-black text-sm text-[#c5a059] shadow-inner focus-visible:ring-4 focus-visible:ring-[#c5a059]/10"
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4 italic">Campaign Medium</label>
                        <Input 
                          placeholder="cpc, email, social..." 
                          className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none font-black text-sm text-[#c5a059] shadow-inner focus-visible:ring-4 focus-visible:ring-[#c5a059]/10"
                          value={medium}
                          onChange={(e) => setMedium(e.target.value)}
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4 italic">Campaign Name</label>
                        <Input 
                           placeholder="summer_sale_2024" 
                           className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none font-black text-sm text-[#c5a059] shadow-inner focus-visible:ring-4 focus-visible:ring-[#c5a059]/10"
                           value={campaign}
                           onChange={(e) => setCampaign(e.target.value)}
                        />
                     </div>
                  </div>

                  {/* Right Column Parameters */}
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4 italic">Campaign Term</label>
                        <Input 
                          placeholder="running+shoes" 
                          className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none font-black text-sm text-[#c5a059] shadow-inner focus-visible:ring-4 focus-visible:ring-[#c5a059]/10"
                          value={term}
                          onChange={(e) => setTerm(e.target.value)}
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4 italic">Campaign Content</label>
                        <Input 
                          placeholder="banner_ad_1" 
                          className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-none font-black text-sm text-[#c5a059] shadow-inner focus-visible:ring-4 focus-visible:ring-[#c5a059]/10"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                     </div>
                     
                     <div className="p-6 rounded-[2rem] bg-[#c5a059]/5 border border-dashed border-[#c5a059]/20 flex items-center justify-center h-16 mt-auto">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c5a059]/60 italic">Attribution ready</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* SIDEBAR: Output & Launch */}
          <div className="lg:col-span-4 space-y-6 sticky top-24 animate-in fade-in slide-in-from-right-4 duration-700">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 overflow-hidden bg-zinc-900 text-white border-none shadow-2xl relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="space-y-1 relative z-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Output Stream</h4>
                  <p className="text-xl font-bold tracking-tight">Final Link</p>
               </div>

               <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 break-all min-h-[140px] flex flex-col justify-center transition-all shadow-inner relative z-10">
                  {finalUrl ? (
                     <p className="text-[13px] font-mono leading-relaxed text-zinc-300 selection:bg-[#c5a059]/40">
                        {finalUrl}
                     </p>
                  ) : (
                     <p className="text-[11px] text-zinc-600 font-black uppercase tracking-[0.2em] text-center italic leading-relaxed">
                        Awaiting destination <br /> vector initialization...
                     </p>
                  )}
               </div>

               <div className="space-y-4 relative z-10">
                  <Button 
                     onClick={handleCopy} 
                     disabled={!finalUrl}
                     className="w-full h-20 bg-[#c5a059] hover:bg-[#b08d4a] text-white rounded-[2rem] font-black shadow-[0_20px_50px_-10px_rgba(197,160,89,0.4)] transition-all active:scale-95 border-none"
                  >
                     <div className="flex items-center justify-center gap-3">
                        <Copy className="w-5 h-5 opacity-40" />
                        <span className="text-sm uppercase tracking-[0.2em]">EXTRACT LINK</span>
                     </div>
                  </Button>
                  <Button 
                     variant="ghost" 
                     disabled={!finalUrl}
                     onClick={() => window.open(finalUrl, '_blank')}
                     className="w-full h-14 rounded-2xl border-2 border-white/10 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                  >
                     <ExternalLink className="w-4 h-4 mr-2" />
                     Launch Simulation
                  </Button>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-[2rem] flex flex-col items-center text-center gap-2">
                  <Zap className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Turbo Link</span>
               </div>
               <div className="suite-card p-6 rounded-[2rem] flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure Meta</span>
               </div>
            </div>

            <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center gap-3">
               <Share2 className="w-6 h-6 text-[#c5a059] opacity-20" />
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attribution Hub</h4>
               <p className="text-[9px] text-slate-400 font-medium uppercase tracking-[0.1em] italic">Status: Tracking Active</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
