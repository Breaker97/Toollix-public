"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ShieldAlert, Zap, Eye, AlertCircle, CheckCircle2, Layout, Smartphone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContrastCheckerClient() {
  const [fgColor, setFgColor] = useState("#FFFFFF");
  const [bgColor, setBgColor] = useState("#c5a059");

  const [ratio, setRatio] = useState<number>(0);
  const [scores, setScores] = useState({ AA_Large: false, AA_Normal: false, AAA_Large: false, AAA_Normal: false });

  const getLuminance = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  useEffect(() => {
    try {
      if (/^#[0-9A-F]{6}$/i.test(fgColor) && /^#[0-9A-F]{6}$/i.test(bgColor)) {
        const l1 = getLuminance(fgColor);
        const l2 = getLuminance(bgColor);
        const calcRatio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        setRatio(parseFloat(calcRatio.toFixed(2)));
        setScores({
          AA_Large: calcRatio >= 3.0,
          AA_Normal: calcRatio >= 4.5,
          AAA_Large: calcRatio >= 4.5,
          AAA_Normal: calcRatio >= 7.0,
        });
      }
    } catch {}
  }, [fgColor, bgColor]);

  const grade = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail";
  const gradeColor = ratio >= 4.5 ? "text-emerald-500" : ratio >= 3 ? "text-amber-500" : "text-red-500";
  const gradeBg = ratio >= 4.5 ? "bg-emerald-500/10 border-emerald-500/20" : ratio >= 3 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 italic">{label}</label>
      <div className="flex items-center gap-6 p-6 bg-zinc-50 dark:bg-zinc-800/80 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-inner-soft group transition-all focus-within:border-[#c5a059]/30">
        <div className="relative shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="w-16 h-16 rounded-2xl border-4 border-white dark:border-zinc-700 p-0 cursor-pointer bg-transparent shadow-xl"
          />
        </div>
        <div className="flex-1">
          <Input
            value={value.toUpperCase()}
            onChange={(e) => onChange(e.target.value)}
            className="h-16 font-mono text-xl font-black uppercase bg-white dark:bg-zinc-900 border-none focus-visible:ring-4 focus-visible:ring-[#c5a059]/10 rounded-2xl shadow-sm text-[#c5a059]"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      title="Accessibility Contrast Engine"
      description="Validate color harmony against global WCAG standards. Ensure your brand remains inclusive and legible across the entire digital spectrum."
      fullWidth={true}
    >
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[420px_1fr] lg:gap-16 items-start w-full overflow-x-hidden">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:sticky lg:top-28 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            
            {/* Phase 01: Inbound Parameters */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 space-y-10 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Inbound Params</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic opacity-80 mt-1">Luminance Source</p>
               </div>

               <div className="space-y-8 relative z-10">
                  <ColorInput label="Foreground Vector" value={fgColor} onChange={setFgColor} />
                  <ColorInput label="Background Base" value={bgColor} onChange={setBgColor} />
               </div>
            </div>

            {/* Support Info: Accessibility Status */}
            <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-10 shadow-xl rounded-[2.5rem] sm:rounded-[3.5rem] space-y-10 relative overflow-hidden group border border-[#c5a059]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                     <ShieldCheck className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Validation Hub</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Scanning</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {[
                    { label: "Normal Typography", aa: scores.AA_Normal, aaa: scores.AAA_Normal },
                    { label: "Large Typography", aa: scores.AA_Large, aaa: scores.AAA_Large },
                  ].map((cat) => (
                    <div key={cat.label} className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-6">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">{cat.label}</p>
                       <div className="flex items-center gap-3">
                          {[
                            { level: "AA", pass: cat.aa },
                            { level: "AAA", pass: cat.aaa }
                          ].map((l) => (
                            <div key={l.level} className={cn(
                                "flex-1 py-3 px-4 rounded-xl border text-center transition-all",
                                l.pass ? "bg-[#c5a059]/10 border-[#c5a059]/20 text-[#c5a059]" : "bg-red-500/10 border-red-500/20 text-red-500 opacity-40"
                            )}>
                               <p className="text-[11px] font-black tracking-widest uppercase">{l.level}</p>
                               <p className="text-[8px] font-black uppercase italic mt-0.5">{l.pass ? "PASS" : "FAIL"}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Studio Workspace */}
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
            
            {/* Main Preview Hub */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] min-h-[600px] lg:min-h-[800px] p-6 sm:p-10 lg:p-16 flex flex-col relative shadow-2xl overflow-hidden">
               
               <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                  <div className="flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Visual Monitor</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059] opacity-80">Extraction Feed</p>
                  </div>
                  <div className={cn(
                      "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 shadow-lg transition-all duration-700",
                      gradeBg, gradeColor
                  )}>
                     {ratio >= 4.5 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                     COMPLIANCE: {grade}
                  </div>
               </div>

               <div className="flex-1 flex flex-col gap-12">
                  {/* The Large Ratio Display */}
                  <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-12 rounded-[3.5rem] border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                     <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 mb-2 italic">Calculated Ratio</p>
                        <h2 className={cn("text-8xl font-black tracking-tighter tabular-nums", gradeColor)}>{ratio}:1</h2>
                     </div>
                     <div className="relative z-10 flex items-center gap-8 border-l border-zinc-200 dark:border-zinc-700 pl-8 md:pl-12">
                        <div className="text-center">
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mb-4">W3C GUIDELINE</p>
                           <div className={cn(
                               "w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12 duration-700",
                               gradeBg, gradeColor
                           )}>
                              {ratio >= 4.5 ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* The Studio Workspace Live Preview */}
                  <div 
                    className="flex-1 flex flex-col justify-center p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden border-8 border-white dark:border-zinc-800 group/preview transition-all duration-700"
                    style={{ backgroundColor: bgColor, color: fgColor }}
                  >
                     <div className="absolute top-8 left-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Environment Simulator</span>
                     </div>

                     <div className="space-y-8 relative z-10 max-w-2xl">
                        <h3 className="text-6xl font-black tracking-tighter leading-[0.9]">The quick brown fox jumps over.</h3>
                        <p className="text-xl font-bold leading-relaxed opacity-80">
                           Professional identity engine. Design, optimize, and deploy multi-platform brand assets for the modern web with zero latency. Optimized for Web Standards 2024.
                        </p>
                        <div className="flex gap-4 pt-4">
                           <div className="h-12 px-8 rounded-2xl border-2 border-current flex items-center justify-center font-black text-xs uppercase tracking-widest">Secondary Trigger</div>
                           <div className="h-12 px-8 rounded-2xl bg-current text-[canvas] flex items-center justify-center font-black text-xs uppercase tracking-widest" style={{ color: bgColor }}>Primary Action</div>
                        </div>
                     </div>

                     {/* Studio Context Icons */}
                     <div className="absolute bottom-8 left-8 flex items-center gap-6 opacity-20">
                        <Smartphone className="w-5 h-5" />
                        <Layout className="w-5 h-5" />
                        <Globe className="w-5 h-5" />
                     </div>
                  </div>

                  {/* Ratio visual gradient bar */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] p-10 border border-zinc-100 dark:border-zinc-800">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-6">
                        <span className="flex items-center gap-2"><AlertCircle className="w-3 h-3" /> POOR (1:1)</span>
                        <span className="flex items-center gap-2">AA LARGE (3:1)</span>
                        <span className="flex items-center gap-2 text-[#c5a059]">AA (4.5:1)</span>
                        <span className="flex items-center gap-2 text-emerald-500">AAA (7:1)</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> PERFECT (21:1)</span>
                     </div>
                     <div className="relative h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner-soft">
                        <div
                           className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(197,160,89,0.3)]", ratio >= 4.5 ? "bg-emerald-500" : ratio >= 3 ? "bg-amber-500" : "bg-red-500")}
                           style={{ width: `${Math.min((ratio / 21) * 100, 100)}%` }}
                        />
                        {/* Dynamic Markers */}
                        <div className="absolute left-[14.28%] inset-y-0 w-px bg-white/20" title="3:1" />
                        <div className="absolute left-[21.42%] inset-y-0 w-px bg-white/20" title="4.5:1" />
                        <div className="absolute left-[33.33%] inset-y-0 w-px bg-white/20" title="7:1" />
                     </div>
                  </div>
               </div>

               {/* Footer Branding Overlay */}
               <div className="absolute bottom-12 right-12 flex items-center gap-4 hidden sm:flex">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none mb-1">Session Protocol</p>
                        <p className="text-[10px] font-mono font-black text-[#c5a059] uppercase leading-none">{Math.random().toString(36).substring(7)}</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
                    <Zap className="w-5 h-5 text-[#c5a059]" />
               </div>
            </div>
        </div>
      </div>
      
      <style jsx global>{`
        .shadow-inner-soft {
           box-shadow: inset 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </ToolLayout>
  );
}
