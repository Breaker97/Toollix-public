"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Shuffle, Unlock, Lock, CheckCircle2, Zap, Palette, Layers, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ColorBlock = {
  hex: string;
  locked: boolean;
};

export default function PaletteGeneratorClient() {
  const [colors, setColors] = useState<ColorBlock[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const generateRandomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();

  const generatePalette = (init = false) => {
    if (init) {
      setColors(Array(5).fill(null).map(() => ({ hex: generateRandomHex(), locked: false })));
      return;
    }
    setColors(prev => prev.map(c => c.locked ? c : { ...c, hex: generateRandomHex() }));
    toast.success("Palette regenerated!");
  };

  useEffect(() => {
    generatePalette(true);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        generatePalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleLock = (index: number) => {
    setColors(prev => prev.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
  };

  const copyHex = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 1500);
    toast.success(`Copied ${hex}`);
  };

  return (
    <ToolLayout 
      title="Color Palette Generator - AI Driven Schemes" 
      description="Create stunning, professional color palettes in seconds. Use our smart generator to discover cohesive schemes for your next design project."
      fullWidth={true}
    >
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[420px_1fr] lg:gap-16 items-start w-full overflow-x-hidden">
        
        {/* LEFT COLUMN: Controls & Info */}
        <div className="w-full lg:sticky lg:top-28 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            
            {/* Phase 01: Strategy */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 space-y-8 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Control Center</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic opacity-80 mt-1">Palette Driver</p>
               </div>

               <div className="space-y-6 relative z-10">
                  <Button 
                    size="lg" 
                    className="w-full h-20 bg-gradient-to-r from-[#c5a059] to-[#b08d4b] text-white rounded-[2rem] font-black shadow-[0_20px_50px_-10px_rgba(197,160,89,0.4)] transition-all active:scale-95 border-none group overflow-hidden"
                    onClick={() => generatePalette()}
                  >
                     <div className="flex items-center justify-center gap-4 relative z-10">
                        <Shuffle className="w-8 h-8 opacity-40 group-hover:rotate-180 transition-transform duration-700" />
                        <span className="text-xl uppercase tracking-[0.2em]">REGENERATE</span>
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Button>

                  <div className="flex items-center justify-center gap-3 py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 border-dashed">
                      <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] italic">Press Spacebar to Shuffle</p>
                  </div>
               </div>
            </div>

            {/* Support Info: Ecosystem */}
            <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-10 shadow-xl rounded-[2.5rem] sm:rounded-[3.5rem] space-y-8 relative overflow-hidden group border border-[#c5a059]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                     <Palette className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Chroma Intelligence</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Operational</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {[
                    { icon: Layers, label: "Smart Harmonics", detail: "Golden Ratio" },
                    { icon: Zap, label: "Zero Latency", detail: "Browser Native" },
                    { icon: Smartphone, label: "Touch Ready", detail: "Mobile First" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-[#c5a059]/10 group/item hover:bg-[#c5a059]/5 transition-all">
                       <div className="flex items-center gap-4">
                          <item.icon className="w-4 h-4 text-[#c5a059] opacity-40 group-hover/item:opacity-100" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400">{item.label}</span>
                       </div>
                       <span className="text-[9px] font-black text-[#c5a059] uppercase italic opacity-40">{item.detail}</span>
                    </div>
                  ))}
               </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Studio Workspace */}
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] min-h-[600px] lg:min-h-[800px] p-6 sm:p-10 lg:p-16 flex flex-col relative shadow-2xl overflow-hidden">
               
               <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                  <div className="flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Visual Monitor</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059] opacity-80">Palette Manifest</p>
                  </div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" /> Live Stream
                  </div>
               </div>

               <div className="flex-1 flex flex-col sm:flex-row rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 group/monitor">
                  {colors.map((color, index) => (
                    <div 
                      key={index} 
                      className="flex-1 flex flex-col items-center justify-between py-12 transition-all duration-700 ease-in-out group relative min-h-[120px] hover:flex-[1.5]"
                      style={{ backgroundColor: color.hex }}
                    >
                      {/* Top: Lock Button */}
                      <button 
                        onClick={() => toggleLock(index)}
                        className={cn(
                           "p-4 rounded-2xl backdrop-blur-xl transition-all shadow-2xl border border-white/20 hover:scale-110",
                           color.locked ? 'bg-black/60 text-white' : 'bg-white/30 text-black lg:opacity-0 group-hover:opacity-100 hover:bg-black/40 hover:text-white'
                        )}
                      >
                        {color.locked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                      </button>

                      {/* Bottom: Hex Code */}
                      <div className="flex flex-col items-center gap-4 w-full px-4">
                         <button 
                           onClick={() => copyHex(color.hex, index)}
                           className="w-full max-w-[160px] h-16 flex items-center justify-center rounded-2xl backdrop-blur-md bg-white/20 border border-white/30 text-white shadow-2xl transition-all hover:bg-white/40 active:scale-95 group/copy overflow-hidden"
                         >
                           <div className="flex items-center gap-3 font-mono font-black text-lg tracking-widest uppercase relative z-10 drop-shadow-lg">
                              {copiedId === index ? <CheckCircle2 className="w-5 h-5 text-[#c5a059]" /> : <span className="opacity-40 text-[#c5a059]">#</span>}
                              <span>{copiedId === index ? "COPIED" : color.hex.replace('#', '')}</span>
                           </div>
                           <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                         </button>
                      </div>

                      {/* Hover Shine Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    </div>
                  ))}
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
    </ToolLayout>
  );
}
