"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  ImageIcon, 
  Download, 
  Type, 
  Zap,
  Terminal,
  ShieldCheck,
  Upload,
  Palette,
  Maximize,
  Layers,
  Move,
  RefreshCw,
  X,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ThumbnailMakerPage() {
  const [text, setText] = useState("Your Title Here");
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(80);
  const [yPos, setYPos] = useState(50); // percentage
  const [xPos, setXPos] = useState(50); // percentage
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawCanvas();
  }, [text, color, fontSize, yPos, xPos, bgImage, overlayOpacity]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    if (bgImage) {
      const img = new Image();
      img.src = bgImage;
      img.onload = () => {
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        drawOverlayAndText(ctx, canvas);
      };
    } else {
      ctx.fillStyle = "#18181b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawOverlayAndText(ctx, canvas);
    }
  };

  const drawOverlayAndText = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgba(0,0,0,0)`);
    gradient.addColorStop(1, `rgba(0,0,0,${overlayOpacity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = color;
    ctx.font = `black ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const maxWidth = canvas.width * 0.8;
    const lines = getLines(ctx, text, maxWidth);
    const startY = (canvas.height * yPos) / 100 - ((lines.length - 1) * fontSize * 1.2) / 2;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, (canvas.width * xPos) / 100, startY + (i * fontSize * 1.2));
    });
  };

  const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBgImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const downloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "thumbnail-toollix.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Thumbnail exported successfully!");
  };

  return (
    <ToolLayout 
      title="Studio Thumbnail Engine" 
      description="Professional visual composition engine. Design high-fidelity video thumbnails with real-time hardware-accelerated rendering."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Canvas Preview Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center">
                       <Palette className="w-5 h-5" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Studio Preview</h3>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 opacity-40">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-widest italic">Live GPU Render</span>
                    </div>
                    {bgImage && (
                       <Button variant="ghost" size="icon" onClick={() => setBgImage(null)} className="text-red-500 hover:bg-red-50">
                          <X className="w-4 h-4" />
                       </Button>
                    )}
                 </div>
              </div>

              <div className="flex items-center justify-center py-4">
                 <div className="relative group w-full max-w-[800px]">
                    <div className="absolute inset-0 bg-[#c5a059]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-2xl">
                       <canvas 
                          ref={canvasRef} 
                          width={1280} 
                          height={720} 
                          className="w-full aspect-video rounded-[2.2rem] object-contain bg-zinc-950"
                       />
                    </div>
                 </div>
              </div>

              <div className="flex justify-center items-center gap-8 pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                 <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4 text-[#c5a059]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1280x720 HD</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#c5a059]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Composite Matrix</span>
                 </div>
              </div>
            </div>

            {/* Main Action (Mobile First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={downloadThumbnail}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <Download className="w-5 h-5 mr-3 group-hover:translate-y-1 transition-transform" />
                  EXPORT STUDIO ASSET
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">File Type</span>
                      <span className="text-xl font-black text-[#c5a059]">PNG</span>
                   </div>
                </div>
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Design Driver</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Composition Controls</p>
               </div>

               <div className="space-y-6">
                  {/* Text Input */}
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Display Text</label>
                     <textarea 
                        className="w-full h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800 text-[13px] font-bold focus:outline-none focus:border-[#c5a059] resize-none"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                     />
                  </div>

                  {/* Formatting Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Color</label>
                        <input 
                           type="color" 
                           value={color} 
                           onChange={(e) => setColor(e.target.value)}
                           className="w-full h-12 rounded-xl cursor-pointer border-zinc-100 dark:border-zinc-800"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Size</label>
                        <input 
                           type="number" 
                           value={fontSize} 
                           onChange={(e) => setFontSize(parseInt(e.target.value))}
                           className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-[12px] font-black"
                        />
                     </div>
                  </div>

                  {/* Positioning */}
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vertical Axis</label>
                           <span className="text-[10px] font-black text-[#c5a059]">{yPos}%</span>
                        </div>
                        <input 
                           type="range" min="0" max="100" 
                           value={yPos} onChange={(e) => setYPos(parseInt(e.target.value))}
                           className="w-full accent-[#c5a059]"
                        />
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Horizontal Axis</label>
                           <span className="text-[10px] font-black text-[#c5a059]">{xPos}%</span>
                        </div>
                        <input 
                           type="range" min="0" max="100" 
                           value={xPos} onChange={(e) => setXPos(parseInt(e.target.value))}
                           className="w-full accent-[#c5a059]"
                        />
                     </div>
                  </div>

                  {/* File Upload */}
                  <div className="pt-4">
                     <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
                     <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 hover:bg-[#c5a059]/10 hover:text-[#c5a059] hover:border-[#c5a059]/20 transition-all cursor-pointer">
                        <label htmlFor="bg-upload" className="cursor-pointer flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                           <Plus className="w-4 h-4" /> {bgImage ? "CHANGE BACKGROUND" : "UPLOAD BACKGROUND"}
                        </label>
                     </Button>
                  </div>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Maximize className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">16:9 Aspect</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Auto Save</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
