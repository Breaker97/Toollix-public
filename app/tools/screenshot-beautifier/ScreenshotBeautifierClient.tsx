"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  Download, 
  Upload, 
  X, 
  Activity, 
  Palette,
  Maximize,
  Image as ImageIcon,
  AppWindow
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ScreenshotBeautifierClient() {
  const [image, setImage] = useState<string | null>(null);
  const [padding, setPadding] = useState(60);
  const [rounded, setRounded] = useState(24);
  const [shadow, setShadow] = useState(40);
  const [bgType, setBgType] = useState<"gradient" | "solid" | "mesh">("gradient");
  const [bgColor, setBgColor] = useState("#c5a059");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawBeautified = () => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const totalWidth = img.width + padding * 2;
      const totalHeight = img.height + padding * 2;

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // 1. Draw Background
      if (bgType === "gradient") {
        const grad = ctx.createLinearGradient(0, 0, totalWidth, totalHeight);
        grad.addColorStop(0, bgColor);
        grad.addColorStop(1, "#1a1a1a");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bgColor;
      }
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // 2. Draw Shadow
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = shadow;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = shadow / 2;

      // 3. Draw Image with Rounded Corners
      ctx.save();
      
      // Create rounded rect path
      ctx.beginPath();
      ctx.moveTo(padding + rounded, padding);
      ctx.lineTo(padding + img.width - rounded, padding);
      ctx.quadraticCurveTo(padding + img.width, padding, padding + img.width, padding + rounded);
      ctx.lineTo(padding + img.width, padding + img.height - rounded);
      ctx.quadraticCurveTo(padding + img.width, padding + img.height, padding + img.width - rounded, padding + img.height);
      ctx.lineTo(padding + rounded, padding + img.height);
      ctx.quadraticCurveTo(padding, padding + img.height, padding, padding + img.height - rounded);
      ctx.lineTo(padding, padding + rounded);
      ctx.quadraticCurveTo(padding, padding, padding + rounded, padding);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, padding, padding);
      ctx.restore();
    };
  };

  useEffect(() => {
    drawBeautified();
  }, [image, padding, rounded, shadow, bgType, bgColor]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    const link = document.createElement("a");
    link.download = "toollix-beautified-shot.png";
    link.href = canvasRef.current.toDataURL("image/png", 1.0);
    link.click();
    setIsProcessing(false);
    toast.success("Mockup exported successfully!");
  };

  return (
    <ToolLayout 
      title="Shot Beautifier" 
      description="Transform raw screenshots into professional marketing assets. Add lush gradients, smooth shadows, and rounded device-like corners in seconds."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className={cn(
              "suite-card rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 space-y-6 overflow-hidden relative min-h-[300px] sm:min-h-[600px] flex flex-col items-center justify-center transition-all",
              !image ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed border-2" : "bg-white dark:bg-zinc-900"
            )}>
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-4 cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-[#c5a059]/10 text-[#c5a059] rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                    <AppWindow className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Upload Screenshot</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1 italic">PNG or JPG Preferred</p>
                  </div>
                </div>
              ) : (
                <div className="relative group w-full flex justify-center">
                  <canvas 
                    ref={canvasRef} 
                    className="max-w-full h-auto rounded-xl shadow-2xl transition-all duration-500"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                       variant="destructive" 
                       size="icon" 
                       onClick={() => setImage(null)}
                       className="rounded-full shadow-xl"
                    >
                       <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            {image && (
              <div className="flex flex-col sm:flex-row gap-4">
                 <Button 
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex-1 h-14 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    {isProcessing ? "GENERATING..." : "EXPORT HD MOCKUP"}
                  </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Style Engine</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Aesthetic Controls</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Padding</label>
                       <span className="text-[10px] font-black text-[#c5a059]">{padding}px</span>
                    </div>
                    <input 
                      type="range" min="20" max="200" value={padding} 
                      onChange={(e) => setPadding(parseInt(e.target.value))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Corners</label>
                       <span className="text-[10px] font-black text-[#c5a059]">{rounded}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={rounded} 
                      onChange={(e) => setRounded(parseInt(e.target.value))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shadow</label>
                       <span className="text-[10px] font-black text-[#c5a059]">{shadow}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={shadow} 
                      onChange={(e) => setShadow(parseInt(e.target.value))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Canvas Fill</label>
                    <div className="grid grid-cols-2 gap-2">
                       <Button 
                          variant={bgType === "gradient" ? "default" : "outline"}
                          onClick={() => setBgType("gradient")}
                          className={cn("h-10 text-[9px] font-black uppercase", bgType === "gradient" ? "bg-[#c5a059]" : "")}
                       >Gradient</Button>
                       <Button 
                          variant={bgType === "solid" ? "default" : "outline"}
                          onClick={() => setBgType("solid")}
                          className={cn("h-10 text-[9px] font-black uppercase", bgType === "solid" ? "bg-[#c5a059]" : "")}
                       >Solid</Button>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                       <Palette className="w-4 h-4 text-[#c5a059]" />
                       <input 
                         type="color" value={bgColor} 
                         onChange={(e) => setBgColor(e.target.value)}
                         className="w-full h-6 rounded-md cursor-pointer border-none bg-transparent"
                       />
                    </div>
                  </div>
               </div>
            </div>

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Marketing Ready</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Ideal for App Store previews, SaaS landing pages, and social media posts. Exported at original DPI.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
