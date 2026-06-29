"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Palette, Globe, ImageIcon, Copy, Check, Download, ExternalLink, Sparkles, Zap, Layout, Share2, ShieldCheck, Target, RefreshCw, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BrandData {
  title: string;
  description: string;
  url: string;
  colors: string[];
  logos: string[];
}

export function BrandKitClient() {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!urlInput.trim()) return;
    
    setLoading(true);
    setBrandData(null);
    try {
      const res = await fetch(`/api/tools/brand-kit?url=${encodeURIComponent(urlInput)}`);
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || "Failed to extract brand assets");
      
      setBrandData(json.data);
      toast.success("Identity Matrix Synchronized");
    } catch (err: any) {
      toast.error("Extraction Failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    toast.success(`Copied ${text}`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <ToolLayout
      title="Brand Identity Extractor"
      description="Extract mission-critical color palettes, visual assets, and identity narratives from any digital domain."
      fullWidth
    >
      <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">
        
        {/* Command Input Section */}
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="relative group p-2 bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl focus-within:border-[#c5a059] transition-all duration-500">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Globe className={cn(
                            "absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors duration-500",
                            loading ? "text-[#c5a059] animate-pulse" : "text-slate-300 group-focus-within:text-[#c5a059]"
                        )} />
                        <Input 
                            placeholder="Enter domain (e.g. apple.com)" 
                            className="pl-20 h-20 border-none bg-transparent font-black text-xl text-[#c5a059] placeholder:text-slate-200 dark:placeholder:text-zinc-800 focus-visible:ring-0"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                        />
                    </div>
                    <Button 
                        onClick={handleExtract}
                        disabled={loading || !urlInput.trim()}
                        className="h-20 sm:h-auto px-12 rounded-[2.5rem] bg-[#c5a059] text-white hover:bg-black dark:hover:bg-white dark:hover:text-black text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-500 group"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />}
                        {loading ? "SCANNIG..." : "DEEP SCAN"}
                    </Button>
                </div>
            </div>
            <div className="flex justify-center gap-8 opacity-40">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Protocol Secured</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Real-time Analysis</span>
                </div>
            </div>
        </div>

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Results Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="suite-card rounded-[3rem] p-8 sm:p-12 min-h-[700px] relative overflow-hidden flex flex-col bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#c5a059]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8 mb-12">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">Extraction Studio</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059]">Asset Extraction Feed</p>
                 </div>
                 {brandData && (
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2 animate-pulse">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                       Signal Locked
                    </div>
                 )}
              </div>

              {brandData ? (
                 <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    
                    {/* Brand Profile Card */}
                    <div className="group relative bg-zinc-50 dark:bg-zinc-950 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-2xl hover:border-[#c5a059]/20">
                       <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                          <div className="w-32 h-32 rounded-[2rem] bg-white p-6 shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                             {brandData.logos[0] ? (
                                <img src={brandData.logos[0]} alt="Logo" className="w-full h-full object-contain" />
                             ) : (
                                <ImageIcon className="w-10 h-10 text-slate-200" />
                             )}
                          </div>
                          <div className="space-y-6 text-center md:text-left flex-1">
                             <div className="space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                   <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none italic uppercase">{brandData.title}</h2>
                                   <a href={brandData.url} target="_blank" className="p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-100 dark:border-zinc-800 hover:text-[#c5a059] transition-all active:scale-95">
                                      <ExternalLink className="w-4 h-4" />
                                   </a>
                                </div>
                                <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-[0.3em]">Identity Narrative</p>
                             </div>
                             <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic max-w-2xl">
                                {brandData.description}
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* Color Palette Matrix */}
                    <div className="space-y-8">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-950 shadow-xl flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                                <Palette className="w-5 h-5 text-[#c5a059]" />
                             </div>
                             <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Color Spectrum</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hexadecimal Extraction</p>
                             </div>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
                          {brandData.colors.map((color, idx) => (
                             <div key={idx} className="group space-y-3 cursor-pointer" onClick={() => copyToClipboard(color)}>
                                <div className="relative aspect-square rounded-3xl shadow-2xl border-4 border-white dark:border-zinc-900 overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-[#c5a059]/10" style={{ backgroundColor: color }}>
                                   <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px] bg-black/5 transition-all">
                                      {copiedColor === color ? <Check className="w-6 h-6 text-white" /> : <Copy className="w-6 h-6 text-white" />}
                                   </div>
                                </div>
                                <div className="text-center">
                                   <p className="text-[10px] font-mono font-black text-slate-400 group-hover:text-[#c5a059] transition-colors uppercase tracking-widest">{color}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Visual Asset Vault */}
                    <div className="space-y-8">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-950 shadow-xl flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                                <ImageIcon className="w-5 h-5 text-[#c5a059]" />
                             </div>
                             <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Visual Asset Vault</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logo & Icon Discovery</p>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          {brandData.logos.map((logo, idx) => (
                             <div key={idx} className="group bg-zinc-50 dark:bg-zinc-950 p-8 rounded-[3rem] border-2 border-zinc-100 dark:border-zinc-800 flex flex-col gap-8 transition-all hover:border-[#c5a059]/30 shadow-lg hover:shadow-2xl">
                                <div className="h-48 w-full bg-white dark:bg-zinc-900 rounded-[2rem] flex items-center justify-center p-10 border shadow-inner overflow-hidden relative group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50 transition-all duration-500">
                                   <img src={logo} alt="Asset" className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" />
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                                </div>
                                <Button 
                                    className="w-full h-16 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                                    onClick={() => window.open(logo, '_blank')}
                                >
                                   <Download className="w-4 h-4 mr-3" /> EXPORT ASSET
                                </Button>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-10 animate-in fade-in zoom-in duration-1000">
                    <div className="relative">
                        <div className="absolute -inset-10 bg-[#c5a059]/5 blur-[60px] rounded-full animate-pulse" />
                        <Globe className="w-32 h-32 text-[#c5a059]/20" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-300">Awaiting Target Signal</p>
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest italic">Enter a domain above to initialize extraction</p>
                    </div>
                 </div>
              )}
            </div>
          </div>

          {/* Configuration & Matrix Sidebar */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[3rem] p-10 space-y-10 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Identity Matrix</h2>
                  <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic leading-none mt-2">Capabilities Registry</p>
               </div>

               <div className="space-y-4">
                  {[
                    { icon: Palette, label: "Color Profiles", detail: "HEX / RGB" },
                    { icon: ImageIcon, label: "Logo Discovery", detail: "SVG / PNG" },
                    { icon: Layout, label: "Identity Narrative", detail: "Mission" },
                    { icon: Share2, label: "Social Assets", detail: "OpenGraph" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 group/item hover:bg-white dark:hover:bg-zinc-900 transition-all shadow-sm hover:shadow-xl hover:border-[#c5a059]/20">
                       <div className="flex items-center gap-4">
                          <item.icon className="w-4 h-4 text-[#c5a059] opacity-40 group-hover/item:opacity-100 transition-opacity" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors">{item.label}</span>
                       </div>
                       <span className="text-[8px] font-black text-[#c5a059] uppercase italic opacity-40">{item.detail}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div className="suite-card p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-4 bg-[#c5a059]/5 border border-[#c5a059]/10 group hover:bg-[#c5a059]/10 transition-all cursor-default shadow-xl">
                  <ShieldCheck className="w-10 h-10 text-[#c5a059] opacity-40 group-hover:scale-110 transition-transform" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Deep Scan Active</span>
                    <p className="text-[9px] font-medium text-slate-500 uppercase italic leading-tight">Advanced crawler analyzing root CSS and meta directives.</p>
                  </div>
               </div>
               <div className="suite-card p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl group hover:border-[#c5a059]/30 transition-all cursor-default">
                  <RefreshCw className="w-10 h-10 text-slate-200 group-hover:text-[#c5a059] group-hover:rotate-180 transition-all duration-700" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">Auto Synchronize</span>
                    <p className="text-[9px] font-medium text-slate-400 uppercase italic leading-tight">Identity assets stored in local session for rapid recall.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
