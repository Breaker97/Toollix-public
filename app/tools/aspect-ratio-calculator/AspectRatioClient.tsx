"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Maximize2, 
  RefreshCw, 
  Terminal, 
  Activity,
  Box,
  Monitor,
  Smartphone,
  Video,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AspectRatioClient() {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [ratioW, setRatioW] = useState(16);
  const [ratioH, setRatioH] = useState(9);
  const [lockRatio, setLockRatio] = useState(true);

  // Calculate GCD
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const calculateRatio = (w: number, h: number) => {
    if (!w || !h) return;
    const common = gcd(w, h);
    setRatioW(w / common);
    setRatioH(h / common);
  };

  const calculateHeight = (w: number, rw: number, rh: number) => {
    if (!w || !rw || !rh) return;
    setHeight(Math.round((w * rh) / rw));
  };

  const calculateWidth = (h: number, rw: number, rh: number) => {
    if (!h || !rw || !rh) return;
    setWidth(Math.round((h * rw) / rh));
  };

  const PRESETS = [
    { name: "Full HD", w: 1920, h: 1080, icon: Video },
    { name: "4K UHD", w: 3840, h: 2160, icon: Video },
    { name: "Instagram Post", w: 1080, h: 1080, icon: Smartphone },
    { name: "Instagram Story", w: 1080, h: 1920, icon: Smartphone },
    { name: "Old TV", w: 800, h: 600, icon: Monitor },
  ];

  return (
    <ToolLayout 
      title="Dimension Architect" 
      description="Professional aspect ratio and resolution calculator. Calculate perfect pixel dimensions for video production, web layouts, and social media exports."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 space-y-8 sm:space-y-12 overflow-hidden relative min-h-[250px] sm:min-h-[400px] flex flex-col items-center justify-center bg-zinc-50/30 dark:bg-zinc-900/30">
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                    <Maximize2 className="w-5 h-5" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Visual Field</h3>
              </div>

              {/* Aspect Ratio Preview */}
              <div className="w-full flex items-center justify-center p-8">
                 <div 
                    className="bg-[#c5a059]/10 border-4 border-[#c5a059] rounded-2xl sm:rounded-3xl flex items-center justify-center relative transition-all duration-500 shadow-2xl overflow-hidden"
                    style={{ 
                      aspectRatio: `${ratioW} / ${ratioH}`,
                      width: "100%",
                      maxWidth: "400px"
                    }}
                 >
                    <div className="flex flex-col items-center gap-1">
                       <span className="text-2xl font-black text-[#c5a059] italic">{ratioW}:{ratioH}</span>
                       <span className="text-[10px] font-bold text-[#c5a059]/60 uppercase tracking-widest">{width} × {height}</span>
                    </div>
                    {/* Corner accents */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#c5a059]/30" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#c5a059]/30" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#c5a059]/30" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#c5a059]/30" />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="suite-card p-8 rounded-[2rem] space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <Monitor className="w-5 h-5 text-[#c5a059]" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolution (Pixels)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Width</label>
                        <input 
                           type="number"
                           value={width}
                           onChange={(e) => {
                             const val = parseInt(e.target.value) || 0;
                             setWidth(val);
                             if (lockRatio) calculateHeight(val, ratioW, ratioH);
                             else calculateRatio(val, height);
                           }}
                           className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 sm:p-4 border border-zinc-100 dark:border-zinc-700 font-mono text-base sm:text-lg focus:outline-none focus:border-[#c5a059]"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Height</label>
                        <input 
                           type="number"
                           value={height}
                           onChange={(e) => {
                             const val = parseInt(e.target.value) || 0;
                             setHeight(val);
                             if (lockRatio) calculateWidth(val, ratioW, ratioH);
                             else calculateRatio(width, val);
                           }}
                           className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 sm:p-4 border border-zinc-100 dark:border-zinc-700 font-mono text-base sm:text-lg focus:outline-none focus:border-[#c5a059]"
                        />
                     </div>
                  </div>
               </div>

               <div className="suite-card p-8 rounded-[2rem] space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <Box className="w-5 h-5 text-[#c5a059]" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Ratio</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Ratio W</label>
                        <input 
                           type="number"
                           value={ratioW}
                           onChange={(e) => {
                             const val = parseInt(e.target.value) || 1;
                             setRatioW(val);
                             if (lockRatio) calculateHeight(width, val, ratioH);
                           }}
                           className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 sm:p-4 border border-zinc-100 dark:border-zinc-700 font-mono text-base sm:text-lg focus:outline-none focus:border-[#c5a059]"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Ratio H</label>
                        <input 
                           type="number"
                           value={ratioH}
                           onChange={(e) => {
                             const val = parseInt(e.target.value) || 1;
                             setRatioH(val);
                             if (lockRatio) calculateWidth(height, ratioW, val);
                           }}
                           className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 sm:p-4 border border-zinc-100 dark:border-zinc-700 font-mono text-base sm:text-lg focus:outline-none focus:border-[#c5a059]"
                        />
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Presets</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Standard Definitions</p>
               </div>

               <div className="space-y-3">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setWidth(p.w);
                        setHeight(p.h);
                        calculateRatio(p.w, p.h);
                      }}
                      className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 hover:border-[#c5a059]/50 hover:bg-[#c5a059]/5 flex items-center gap-4 group transition-all"
                    >
                       <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-400 group-hover:text-[#c5a059] transition-colors">
                          <p.icon className="w-4 h-4" />
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[9px] text-slate-400 italic">{p.w} × {p.h}</p>
                       </div>
                    </button>
                  ))}
               </div>

               <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => setLockRatio(!lockRatio)}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all flex items-center justify-between",
                      lockRatio ? "bg-[#c5a059]/5 border-[#c5a059]/30" : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100"
                    )}
                  >
                     <div className="flex items-center gap-3">
                        <Activity className={cn("w-4 h-4", lockRatio ? "text-[#c5a059]" : "text-slate-300")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Lock Aspect Ratio</span>
                     </div>
                     <div className={cn("w-6 h-3 rounded-full relative transition-all", lockRatio ? "bg-[#c5a059]" : "bg-zinc-300")}>
                        <div className={cn("absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all", lockRatio ? "left-3.5" : "left-0.5")} />
                     </div>
                  </button>
               </div>
            </div>

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Golden Ratio Logic</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Ensure your layouts and media maintain consistent proportions across different resolutions and devices.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
