"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  X,
  Maximize,
  Move,
  Layers,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function BoxShadowGeneratorClient() {
  const [hOffset, setHOffset] = useState(10);
  const [vOffset, setVOffset] = useState(10);
  const [blur, setBlur] = useState(20);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(0.2);
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);

  const [boxColor, setBoxColor] = useState("#c5a059");
  const [bgColor, setBgColor] = useState("#ffffff");

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const shadowString = `${inset ? "inset " : ""}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${hexToRgba(color, opacity)}`;

  const copyToClipboard = () => {
    const css = `box-shadow: ${shadowString};\n-webkit-box-shadow: ${shadowString};\n-moz-box-shadow: ${shadowString};`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    toast.success("CSS copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout 
      title="Shadow Architect" 
      description="Professional CSS box-shadow designer. Visually construct complex depth layers and elevation effects with real-time browser rendering."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                      <Terminal className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Live Preview Canvas</h3>
                </div>
              </div>

              <div 
                className="flex-1 rounded-[2rem] flex items-center justify-center transition-colors duration-500"
                style={{ backgroundColor: bgColor }}
              >
                 <div 
                    className="w-48 h-48 rounded-3xl transition-all duration-300"
                    style={{ 
                      backgroundColor: boxColor,
                      boxShadow: shadowString
                    }}
                 />
              </div>

              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                 <div className="flex justify-between items-center px-2 mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Generated CSS</label>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6 text-[#c5a059] hover:bg-[#c5a059]/10">
                       {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                 </div>
                 <pre className="bg-zinc-900 text-zinc-300 p-6 rounded-2xl font-mono text-[12px] leading-relaxed overflow-x-auto">
                    <code>{`box-shadow: ${shadowString};\n-webkit-box-shadow: ${shadowString};\n-moz-box-shadow: ${shadowString};`}</code>
                 </pre>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={copyToClipboard}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  {copied ? "COPIED TO CLIPBOARD" : "COPY CSS PROPERTIES"}
                </Button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Shadow Config</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Optics Protocol</p>
               </div>

               <div className="space-y-6">
                  {/* Horizontal Offset */}
                  <div className="space-y-3">
                     <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horizontal Offset</label>
                        <span className="text-[10px] font-bold text-[#c5a059]">{hOffset}px</span>
                     </div>
                     <input 
                        type="range" min="-100" max="100" step="1" 
                        value={hOffset} onChange={(e) => setHOffset(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                     />
                  </div>

                  {/* Vertical Offset */}
                  <div className="space-y-3">
                     <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vertical Offset</label>
                        <span className="text-[10px] font-bold text-[#c5a059]">{vOffset}px</span>
                     </div>
                     <input 
                        type="range" min="-100" max="100" step="1" 
                        value={vOffset} onChange={(e) => setVOffset(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                     />
                  </div>

                  {/* Blur Radius */}
                  <div className="space-y-3">
                     <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blur Radius</label>
                        <span className="text-[10px] font-bold text-[#c5a059]">{blur}px</span>
                     </div>
                     <input 
                        type="range" min="0" max="200" step="1" 
                        value={blur} onChange={(e) => setBlur(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                     />
                  </div>

                  {/* Spread Radius */}
                  <div className="space-y-3">
                     <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Spread Radius</label>
                        <span className="text-[10px] font-bold text-[#c5a059]">{spread}px</span>
                     </div>
                     <input 
                        type="range" min="-50" max="100" step="1" 
                        value={spread} onChange={(e) => setSpread(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                     />
                  </div>

                  {/* Opacity */}
                  <div className="space-y-3">
                     <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shadow Opacity</label>
                        <span className="text-[10px] font-bold text-[#c5a059]">{Math.round(opacity * 100)}%</span>
                     </div>
                     <input 
                        type="range" min="0" max="1" step="0.01" 
                        value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                     />
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Shadow Color</label>
                        <input 
                           type="color" value={color} onChange={(e) => setColor(e.target.value)}
                           className="w-full h-10 rounded-xl cursor-pointer bg-transparent border-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Box Color</label>
                        <input 
                           type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)}
                           className="w-full h-10 rounded-xl cursor-pointer bg-transparent border-none"
                        />
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                     <div className="flex items-center gap-3">
                        <Maximize className="w-4 h-4 text-[#c5a059]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300">Inset Shadow</span>
                     </div>
                     <input 
                        type="checkbox" 
                        checked={inset} 
                        onChange={(e) => setInset(e.target.checked)}
                        className="w-4 h-4 accent-[#c5a059]"
                     />
                  </div>
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Depth Perception</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Shadows create a sense of depth and hierarchy in UI design. Use subtle blurs for modern aesthetics.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
