"use client";

import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Image as ImageIcon, Crosshair, X, Palette, Zap, ShieldCheck, Target, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ColorPickerClient() {
  const [color, setColor] = useState("#c5a059");
  const [rgb, setRgb] = useState("");
  const [hsl, setHsl] = useState("");
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  
  // Image Upload States
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const hexToRgbArr = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0,0,0];
  };

  const hexToRgb = (hex: string) => {
    const r = hexToRgbArr(hex);
    return r ? `${r[0]}, ${r[1]}, ${r[2]}` : null;
  };

  const hexToHsl = (hex: string) => {
    const rArr = hexToRgbArr(hex);
    if (!rArr) return null;
    let r = rArr[0] / 255;
    let g = rArr[1] / 255;
    let b = rArr[2] / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h: number = 0, s: number = 0, l = (max + min) / 2;
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
  };

  useEffect(() => {
    if (color && /^#[0-9A-F]{6}$/i.test(color)) {
      setRgb(`rgb(${hexToRgb(color)})`);
      setHsl(`hsl(${hexToHsl(color)})`);
    }
  }, [color]);

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [type]: true }));
    toast.success(`${type.toUpperCase()} copied!`);
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setIsPicking(true);
      toast.info("Image loaded. Click to pick color.");
    }
  };

  const drawImageToCanvas = () => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      const parentWidth = canvas.parentElement?.clientWidth || 400;
      const ratio = img.width / img.height;
      const calcHeight = parentWidth / ratio;
      canvas.width = parentWidth;
      canvas.height = Math.min(calcHeight, 600);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  useEffect(() => {
    if (imageSrc) setTimeout(drawImageToCanvas, 50);
  }, [imageSrc]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPicking || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pixelMap = ctx.getImageData(x, y, 1, 1).data;
    const hex = "#" + [pixelMap[0], pixelMap[1], pixelMap[2]].map(x => x.toString(16).padStart(2, "0")).join("");
    setColor(hex.toUpperCase());
  };

  const clearImage = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setIsPicking(false);
  };

  return (
    <ToolLayout
      title="Chroma Discovery Engine"
      description="Professional color sampling & extraction suite. Sample colors with absolute precision from digital assets or high-resolution imagery."
      fullWidth={true}
    >
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[420px_1fr] lg:gap-16 items-start w-full overflow-x-hidden">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:sticky lg:top-28 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            
            {/* Phase 01: Strategy */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 space-y-8 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Inbound Source</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Luminance Target</p>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 italic">Active HEX Vector</label>
                    <div className="flex items-center gap-4">
                        <div className="relative group shrink-0">
                           <input 
                             type="color" 
                             value={color}
                             onChange={(e) => setColor(e.target.value.toUpperCase())}
                             className="w-16 h-16 p-1.5 cursor-pointer rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:scale-110 transition-transform shadow-lg"
                           />
                        </div>
                        <div className="relative flex-1">
                           <Input 
                             value={color.toUpperCase()}
                             onChange={(e) => setColor(e.target.value)}
                             className="h-16 font-mono text-xl font-black uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800/80 border-none rounded-2xl pl-12 text-[#c5a059] shadow-inner-soft focus-visible:ring-4 focus-visible:ring-[#c5a059]/10"
                             maxLength={7}
                           />
                           <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#c5a059]/40 font-mono text-xl font-black">#</span>
                        </div>
                    </div>
                  </div>

                  <div className="pt-4">
                     <input type="file" id="image-picker" accept="image/*" className="hidden" onChange={handleImageUpload} />
                     <label htmlFor="image-picker" className="cursor-pointer group">
                        <div className={cn(
                          "flex items-center justify-center gap-4 h-20 rounded-[2rem] border-4 border-dashed transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl",
                          imageSrc 
                            ? "border-[#c5a059] bg-[#c5a059]/5 text-[#c5a059] animate-pulse" 
                            : "border-zinc-100 dark:border-zinc-800 hover:border-[#c5a059]/30 bg-white dark:bg-zinc-900 text-muted-foreground hover:text-foreground"
                        )}>
                          {imageSrc ? <Crosshair className="w-8 h-8" /> : <ImageIcon className="w-8 h-8 opacity-40 group-hover:scale-110 transition-transform" />}
                          {imageSrc ? "EXTRACTION ACTIVE" : "EXTRACT FROM IMAGE"}
                        </div>
                     </label>
                  </div>
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
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Chroma Matrix</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Tracking</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {[
                    { label: "HEX Vector", value: color.toUpperCase(), key: "hex" },
                    { label: "RGB Matrix", value: rgb, key: "rgb" },
                    { label: "HSL Space", value: hsl, key: "hsl" }
                  ].map((format) => (
                    <div key={format.key} className="p-6 rounded-3xl bg-white/5 border border-white/5 group/item hover:bg-[#c5a059]/5 transition-all">
                       <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">{format.label}</span>
                          <button 
                             onClick={() => copyToClipboard(format.value, format.key)}
                             className="text-[#c5a059] opacity-40 hover:opacity-100 transition-opacity"
                          >
                             {copiedStates[format.key] ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                       </div>
                       <code className="text-sm font-mono font-black text-[#c5a059] tracking-widest">{format.value}</code>
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

               <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-10 lg:p-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-[3.5rem] border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group/workspace">
                  <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />
                  
                  <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-1000">
                    {!imageSrc ? (
                      <div className="w-full h-full flex items-center justify-center">
                         <div 
                           className="w-full max-w-2xl aspect-video rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white dark:border-zinc-800 transition-all duration-700 ease-out hover:scale-[1.02]"
                           style={{ backgroundColor: color }}
                         >
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none" />
                         </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-full border border-[#c5a059]/20 shadow-2xl">
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Extraction Active: Click to Sample</span>
                        </div>
                        
                        <div className="relative group/canvas">
                           <div className="absolute -inset-10 bg-[#c5a059]/10 blur-[80px] rounded-full opacity-0 group-hover/canvas:opacity-100 transition-opacity duration-1000" />
                           <canvas
                             ref={canvasRef}
                             onClick={handleCanvasClick}
                             className={cn(
                               "relative z-10 max-w-full max-h-[600px] object-contain shadow-2xl rounded-[2rem] border-8 border-white dark:border-zinc-800",
                               isPicking ? "cursor-crosshair" : "cursor-default"
                             )}
                           />
                        </div>

                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="absolute bottom-8 right-8 rounded-2xl h-14 w-14 bg-[#c5a059] text-white shadow-2xl border border-white/5 hover:bg-red-500 transition-all z-20 group/close"
                          onClick={clearImage}
                        >
                          <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                        </Button>
                        
                        {/* Dynamic Floating Magnifier Indicator */}
                        <div className="absolute bottom-8 left-8 flex items-center gap-6 p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 z-20 animate-in slide-in-from-bottom-8 duration-700">
                          <div className="w-16 h-16 rounded-2xl shadow-inner border-2 border-white/20" style={{ backgroundColor: color }} />
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#c5a059] italic leading-none">Sampled Vector</p>
                             <p className="text-xl font-mono font-black text-white uppercase tracking-widest">{color}</p>
                          </div>
                        </div>
                      </div>
                    )}
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
