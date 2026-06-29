"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Type, 
  Ruler, 
  Settings2, 
  Activity,
  Maximize,
  ChevronRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TextPixelClient() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [fontWeight, setFontWeight] = useState("400");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const metrics = context.measureText(text);
        const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        setDimensions({
          width: Math.round(metrics.width * 100) / 100,
          height: Math.round(actualHeight * 100) / 100 || fontSize // Fallback for height
        });
      }
    }
  }, [text, fontSize, fontFamily, fontWeight]);

  const FONT_FAMILIES = [
    "sans-serif", "serif", "monospace", "Arial", "Verdana", "Times New Roman", "Georgia", "Courier New", "Inter", "Roboto"
  ];

  const FONT_WEIGHTS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];

  return (
    <ToolLayout 
      title="Typography Architect" 
      description="Professional text dimension measurement engine. Calculate exact pixel widths and heights for any string of text based on specific typography settings."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 space-y-8 overflow-hidden relative bg-zinc-50/30 dark:bg-zinc-900/30 border-2 border-zinc-100 dark:border-zinc-800">
              
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                    <Ruler className="w-5 h-5" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Measurement Stage</h3>
              </div>

              <div className="w-full space-y-8 pt-12 sm:pt-0">
                 <div className="relative group">
                    <div className="absolute -top-6 left-0 flex items-center gap-2">
                       <Type className="w-3 h-3 text-[#c5a059]" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Input String</span>
                    </div>
                    <textarea 
                       className="w-full h-32 sm:h-48 bg-white dark:bg-zinc-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-zinc-100 dark:border-zinc-700 text-xl sm:text-2xl font-medium focus:outline-none focus:border-[#c5a059] shadow-xl transition-all resize-none"
                       placeholder="Enter text to measure..."
                       value={text}
                       onChange={(e) => setText(e.target.value)}
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-white dark:bg-zinc-800 rounded-3xl border-2 border-zinc-100 dark:border-zinc-700 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-xl transition-all">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pixel Width</p>
                       <p className="text-5xl font-black text-[#c5a059] tracking-tighter">{dimensions.width}<span className="text-lg ml-1 opacity-40">px</span></p>
                    </div>
                    <div className="p-8 bg-white dark:bg-zinc-800 rounded-3xl border-2 border-zinc-100 dark:border-zinc-700 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-xl transition-all">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pixel Height</p>
                       <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{dimensions.height}<span className="text-lg ml-1 opacity-40">px</span></p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="suite-card p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex flex-col sm:flex-row gap-4 sm:gap-6">
               <Info className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
               <div className="space-y-2">
                  <h4 className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Measurement Notice</h4>
                  <p className="text-[11px] font-medium text-amber-700/70 dark:text-amber-400/70 leading-relaxed uppercase tracking-wider italic">
                     These measurements are calculated using the browser's Canvas API. Results may vary slightly across different OS rendering engines (Windows ClearType vs macOS Quartz).
                  </p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Font Config</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Typography Settings</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Font Family</label>
                     <select 
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 text-sm focus:outline-none"
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                     >
                        {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                     </select>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Size</label>
                        <span className="text-[10px] font-bold text-[#c5a059]">{fontSize}px</span>
                     </div>
                     <input 
                        type="range" min="8" max="200" value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full accent-[#c5a059]"
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight</label>
                     <div className="flex flex-wrap gap-2">
                        {["300", "400", "600", "700", "900"].map(w => (
                          <button
                            key={w}
                            onClick={() => setFontWeight(w)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                              fontWeight === w ? "bg-[#c5a059] text-white border-[#c5a059]" : "bg-zinc-50 dark:bg-zinc-800 text-slate-400 border-zinc-100 dark:border-zinc-700"
                            )}
                          >
                            {w}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Metric Intelligence</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Crucial for UI developers to prevent text overflow and ensure perfect alignment in dynamic layouts.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
