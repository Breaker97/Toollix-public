"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  Copy, 
  CheckCircle2, 
  Zap,
  Database,
  Terminal,
  Layers,
  Settings,
  Maximize,
  Move
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function BoxShadowClient() {
  const [hOffset, setHOffset] = useState(10);
  const [vOffset, setVOffset] = useState(10);
  const [blur, setBlur] = useState(20);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(0.2);
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [shadowCode, setShadowCode] = useState("");

  useEffect(() => {
    const rgba = hexToRgba(color, opacity);
    const code = `${inset ? "inset " : ""}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${rgba}`;
    setShadowCode(code);
  }, [hOffset, vOffset, blur, spread, color, opacity, inset]);

  function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const copyToClipboard = () => {
    const css = `box-shadow: ${shadowCode};\n-webkit-box-shadow: ${shadowCode};\n-moz-box-shadow: ${shadowCode};`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    toast.success("CSS Box Shadow copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout 
      title="Shadow Architect" 
      description="Visually design and calibrate professional CSS box-shadows. Real-time preview with cross-browser code export."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-12 flex flex-col items-center justify-center space-y-12 overflow-hidden relative min-h-[500px] bg-white dark:bg-zinc-950">
              
              {/* Preview Box */}
              <div 
                className="w-64 h-64 bg-[#c5a059] rounded-[2rem] transition-all duration-300"
                style={{ boxShadow: shadowCode }}
              />

              <div className="w-full max-w-lg space-y-6">
                 <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">CSS Manifest</label>
                       <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6 text-[#c5a059] hover:bg-[#c5a059]/10">
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                       </Button>
                    </div>
                    <div className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 font-mono text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed overflow-x-auto whitespace-nowrap">
                      <span className="text-[#c5a059]">box-shadow:</span> {shadowCode};
                    </div>
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={copyToClipboard}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <Palette className="w-5 h-5 mr-3" />
                  {copied ? "COPIED TO CLIPBOARD" : "EXPORT CSS PROPERTIES"}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Rendering Mode</span>
                      <span className="text-sm font-black text-[#c5a059]">GPU Accelerated</span>
                   </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Shadow Parameters</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Physical Calibration</p>
               </div>

               <div className="space-y-6">
                  {/* Slider Group */}
                  {[
                    { label: "Horizontal Offset", val: hOffset, set: setHOffset, min: -100, max: 100, icon: Move },
                    { label: "Vertical Offset", val: vOffset, set: setVOffset, min: -100, max: 100, icon: Move },
                    { label: "Blur Radius", val: blur, set: setBlur, min: 0, max: 100, icon: Maximize },
                    { label: "Spread Radius", val: spread, set: setSpread, min: -50, max: 50, icon: Layers },
                  ].map((s, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-center ml-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</label>
                        <span className="text-[10px] font-bold text-[#c5a059]">{s.val}px</span>
                      </div>
                      <input 
                        type="range" 
                        min={s.min} 
                        max={s.max} 
                        value={s.val}
                        onChange={(e) => s.set(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Color</label>
                      <input 
                        type="color" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-12 rounded-xl cursor-pointer bg-transparent border-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Opacity</label>
                      <input 
                        type="number" 
                        step="0.1"
                        min="0"
                        max="1"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-sm font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setInset(!inset)}
                    className={cn(
                      "w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between group",
                      inset
                        ? "bg-[#c5a059]/5 border-[#c5a059]/30 text-slate-900 dark:text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 text-slate-400"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className={cn("w-4 h-4", inset ? "text-[#c5a059]" : "text-slate-300")} />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">Inset Shadow</span>
                    </div>
                    <div className={cn("w-6 h-3 rounded-full relative transition-all", inset ? "bg-[#c5a059]" : "bg-zinc-300")}>
                      <div className={cn("absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all", inset ? "left-3.5" : "left-0.5")} />
                    </div>
                  </button>
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Geometry Lab</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Live CSS engine computes precise pixel coordinates for depth, soft lighting, and elevation.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Zap className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Render</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Database className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Local Lab</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
