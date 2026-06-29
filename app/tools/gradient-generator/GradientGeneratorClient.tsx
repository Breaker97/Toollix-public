"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  CheckCircle2, 
  Shuffle, 
  Zap, 
  Smartphone, 
  Palette, 
  ShieldCheck, 
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function GradientGeneratorClient() {
  const [color1, setColor1] = useState("#4158D0");
  const [color2, setColor2] = useState("#C850C0");
  const [color3, setColor3] = useState("#FFCC70");
  const [useThird, setUseThird] = useState(true);
  
  const [angle, setAngle] = useState(45);
  const [type, setType] = useState<"linear" | "radial">("linear");
  
  const [copied, setCopied] = useState(false);

  const getGradientStyle = () => {
    if (type === "linear") {
      if (useThird) return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 46%, ${color3} 100%)`;
      return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
    } else {
      if (useThird) return `radial-gradient(circle, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
      return `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`;
    }
  };

  const copyToClipboard = () => {
    const cssText = `background-color: ${color1};\nbackground-image: ${getGradientStyle()};`;
    navigator.clipboard.writeText(cssText);
    setCopied(true);
    toast.success("Gradient manifest copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const randomize = () => {
    const randomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
    setColor1(randomHex());
    setColor2(randomHex());
    if (useThird) setColor3(randomHex());
    setAngle(Math.floor(Math.random() * 360));
    toast.info("Aesthetic randomized");
  };

  return (
    <ToolLayout 
      title="Spectrum Gradient Engine" 
      description="Professional CSS surface architect. Design multi-stop, high-fidelity gradients with real-time visual rendering and automated code extraction."
      fullWidth={true}
    >
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[420px_1fr] lg:gap-16 items-start w-full overflow-x-hidden">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:sticky lg:top-28 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            
            {/* Phase 01: Strategy */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 space-y-10 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Driver</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Matrix Protocol</p>
               </div>

               <div className="space-y-8 relative z-10">
                  <div className="flex bg-zinc-50 dark:bg-zinc-800/80 p-2 rounded-[2rem] shadow-inner-soft">
                    <button
                      onClick={() => setType("linear")}
                      className={cn(
                        "flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                        type === 'linear' ? "bg-[#c5a059] text-white shadow-xl scale-[1.02]" : "text-muted-foreground/40 hover:text-[#c5a059]"
                      )}
                    >LINEAR</button>
                    <button
                      onClick={() => setType("radial")}
                      className={cn(
                        "flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                        type === 'radial' ? "bg-[#c5a059] text-white shadow-xl scale-[1.02]" : "text-muted-foreground/40 hover:text-[#c5a059]"
                      )}
                    >RADIAL</button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Color Stop Vectors</label>
                       <button 
                         onClick={() => setUseThird(!useThird)}
                         className={cn(
                           "text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-full border",
                           useThird ? "bg-[#c5a059]/10 border-[#c5a059]/20 text-[#c5a059]" : "bg-zinc-100 border-zinc-200 text-muted-foreground"
                         )}
                       >
                         {useThird ? "3 STOPS" : "2 STOPS"}
                       </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                       {[
                         { val: color1, set: setColor1, label: "Origin" },
                         { val: color2, set: setColor2, label: "Transit" },
                         ...(useThird ? [{ val: color3, set: setColor3, label: "Exit" }] : [])
                       ].map((c, i) => (
                         <div key={i} className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <input 
                              type="color" 
                              value={c.val} 
                              onChange={e => c.set(e.target.value)} 
                              className="w-12 h-12 p-1 cursor-pointer rounded-xl bg-white dark:bg-zinc-800 shadow-sm shrink-0" 
                            />
                            <div className="flex-1">
                               <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic leading-none mb-1">{c.label}</p>
                               <code className="text-sm font-mono font-black text-[#c5a059] uppercase tracking-widest">{c.val}</code>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  {type === "linear" && (
                    <div className="space-y-4">
                       <div className="flex justify-between items-center px-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Trajectory Angle</label>
                          <span className="text-xs font-mono font-black text-[#c5a059]">{angle}°</span>
                       </div>
                       <div className="px-2">
                          <input 
                            type="range" min="0" max="360" value={angle} 
                            onChange={(e) => setAngle(parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#c5a059]" 
                          />
                       </div>
                    </div>
                  )}

                  <Button 
                    onClick={randomize} 
                    variant="outline" 
                    className="w-full h-16 rounded-2xl border-2 border-dashed border-[#c5a059]/10 text-muted-foreground hover:text-[#c5a059] hover:bg-[#c5a059]/5 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                  >
                     <Shuffle className="w-4 h-4 mr-3" /> Randomize Aesthetic
                  </Button>
               </div>
            </div>

            {/* Support Info: Ecosystem */}
            <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-10 shadow-xl rounded-[2.5rem] sm:rounded-[3.5rem] space-y-10 relative overflow-hidden group border border-[#c5a059]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                     <Palette className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Design Matrix</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Tracking</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {[
                    { icon: Zap, label: "Instant Sync", detail: "Active" },
                    { icon: Smartphone, label: "Responsive", detail: "Verified" },
                    { icon: ShieldCheck, label: "W3C Compliant", detail: "Secure" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-[#c5a059]/10 group/item hover:bg-[#c5a059]/5 transition-all">
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
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059] opacity-80">Spectrum Feed</p>
                  </div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" /> Live Rendering
                  </div>
               </div>

               <div className="flex-1 flex flex-col gap-12">
                  {/* Visual Preview Studio */}
                  <div className="relative group/studio w-full flex-1">
                     <div className="absolute -inset-4 bg-[#c5a059]/5 blur-3xl opacity-0 group-hover/studio:opacity-100 transition-opacity duration-1000" />
                     <div 
                        className="w-full h-full min-h-[400px] rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border-[12px] border-white dark:border-zinc-800 relative overflow-hidden transition-all duration-700 group-hover/studio:scale-[1.01]"
                        style={{ backgroundImage: getGradientStyle() }}
                     >
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
                        <div className="absolute bottom-10 right-10 flex gap-4">
                           <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-700">
                              <Maximize2 className="w-6 h-6 text-white/40" />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Extraction Hub */}
                  <div className="space-y-6">
                     <div className="flex justify-between items-center px-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic">Generated Manifest</label>
                     </div>
                     <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-10 rounded-[3rem] border border-[#c5a059]/20 shadow-xl relative overflow-hidden group/manifest">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                           <div className="flex-1 space-y-4">
                              <code className="block font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 selection:bg-[#c5a059]/40">
                                 <span className="text-[#c5a059]/60">background-color:</span> {color1};<br/>
                                 <span className="text-[#c5a059]/60">background-image:</span> {getGradientStyle()};
                              </code>
                           </div>
                           <Button 
                              onClick={copyToClipboard}
                              className="h-20 px-10 rounded-2xl bg-[#c5a059] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-[#c5a059]/90 transition-all shadow-xl shrink-0"
                           >
                              {copied ? <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500" /> : <Copy className="w-5 h-5 mr-3" />}
                              {copied ? "EXTRACTED" : "EXTRACT CODE"}
                           </Button>
                        </div>
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
