"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Contrast, 
  Download, 
  Upload, 
  X, 
  Activity, 
  Zap,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ImageInverterClient() {
  const [image, setImage] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(100);
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

  const drawInverted = () => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.filter = `invert(${intensity}%)`;
      ctx.drawImage(img, 0, 0);
    };
  };

  useEffect(() => {
    drawInverted();
  }, [image, intensity]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    const link = document.createElement("a");
    link.download = "toollix-inverted.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    setIsProcessing(false);
    toast.success("Negative image exported!");
  };

  return (
    <ToolLayout 
      title="Negative Engine" 
      description="Professional color inversion engine. Instantly flip photo colors into high-contrast negatives. Perfect for artistic effects or technical analysis."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className={cn(
              "suite-card rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 space-y-6 overflow-hidden relative min-h-[300px] sm:min-h-[500px] flex flex-col items-center justify-center transition-all",
              !image ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed border-2" : "bg-white dark:bg-zinc-900"
            )}>
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-4 cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-[#c5a059]/10 text-[#c5a059] rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                    <Contrast className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Select Image</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1 italic">Instant Local Processing</p>
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
                    {isProcessing ? "PROCESSING..." : "EXPORT NEGATIVE IMAGE"}
                  </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Flip Settings</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Intensity Protocol</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Effect Amount</label>
                       <span className="text-[10px] font-black text-[#c5a059]">{intensity}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={intensity} 
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>
               </div>
            </div>

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Native Filter</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Uses GPU-accelerated CSS filters via canvas for instantaneous feedback even on large files.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
