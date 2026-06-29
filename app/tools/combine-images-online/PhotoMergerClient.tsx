"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Combine, 
  Download, 
  Upload, 
  X, 
  Activity, 
  Plus,
  ArrowRight,
  ArrowDown,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PhotoMergerClient() {
  const [images, setImages] = useState<string[]>([]);
  const [direction, setDirection] = useState<"vertical" | "horizontal">("vertical");
  const [spacing, setSpacing] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const drawMerged = () => {
    if (images.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loadedImages: HTMLImageElement[] = [];
    let imagesLoadedCount = 0;

    images.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedImages[index] = img;
        imagesLoadedCount++;

        if (imagesLoadedCount === images.length) {
          // Calculate dimensions
          let totalWidth = 0;
          let totalHeight = 0;

          if (direction === "horizontal") {
            totalWidth = loadedImages.reduce((sum, img) => sum + img.width, 0) + (images.length - 1) * spacing;
            totalHeight = Math.max(...loadedImages.map(img => img.height));
          } else {
            totalWidth = Math.max(...loadedImages.map(img => img.width));
            totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0) + (images.length - 1) * spacing;
          }

          canvas.width = totalWidth;
          canvas.height = totalHeight;

          // Clear canvas (transparent background)
          ctx.clearRect(0, 0, totalWidth, totalHeight);

          // Draw images
          let currentPos = 0;
          loadedImages.forEach(img => {
            if (direction === "horizontal") {
              ctx.drawImage(img, currentPos, (totalHeight - img.height) / 2);
              currentPos += img.width + spacing;
            } else {
              ctx.drawImage(img, (totalWidth - img.width) / 2, currentPos);
              currentPos += img.height + spacing;
            }
          });
        }
      };
    });
  };

  useEffect(() => {
    drawMerged();
  }, [images, direction, spacing]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    const link = document.createElement("a");
    link.download = "toollix-merged-photo.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    setIsProcessing(false);
    toast.success("Collage exported successfully!");
  };

  return (
    <ToolLayout 
      title="Image Stitcher" 
      description="Professional image merger engine. Combine multiple photos vertically or horizontally with customizable spacing and pixel-perfect alignment."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className={cn(
              "suite-card rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 space-y-8 overflow-hidden relative min-h-[300px] sm:min-h-[500px] transition-all",
              images.length === 0 ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed border-2 flex flex-col items-center justify-center" : "bg-white dark:bg-zinc-900"
            )}>
              {images.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-4 cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-[#c5a059]/10 text-[#c5a059] rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                    <Combine className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Start Combining Photos</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1 italic">Select multiple files at once</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                   <div className="flex flex-wrap gap-4">
                      {images.map((img, i) => (
                        <div key={i} className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 shadow-lg">
                           <img src={img} className="w-full h-full object-cover" />
                           <button 
                             onClick={() => removeImage(i)}
                             className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-slate-400 hover:text-[#c5a059] hover:border-[#c5a059] transition-all"
                      >
                         <Plus className="w-6 h-6" />
                         <span className="text-[8px] font-bold uppercase mt-1">Add More</span>
                      </button>
                   </div>

                   <div className="relative group w-full flex justify-center bg-zinc-50 dark:bg-zinc-800/50 p-8 rounded-3xl overflow-auto">
                      <canvas 
                        ref={canvasRef} 
                        className="max-w-full h-auto shadow-2xl transition-all duration-500"
                      />
                   </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
                multiple
              />
            </div>

            {images.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4">
                 <Button 
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex-1 h-14 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    {isProcessing ? "PROCESSING..." : "EXPORT MERGED IMAGE"}
                  </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Stitch Settings</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Alignment Logic</p>
               </div>

               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                     <button
                        onClick={() => setDirection("vertical")}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                          direction === "vertical" ? "bg-[#c5a059]/5 border-[#c5a059]/30 text-[#c5a059]" : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-slate-400"
                        )}
                     >
                        <ArrowDown className="w-5 h-5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Vertical</span>
                     </button>
                     <button
                        onClick={() => setDirection("horizontal")}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                          direction === "horizontal" ? "bg-[#c5a059]/5 border-[#c5a059]/30 text-[#c5a059]" : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-slate-400"
                        )}
                     >
                        <ArrowRight className="w-5 h-5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Horizontal</span>
                     </button>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gutter Spacing</label>
                       <span className="text-[10px] font-black text-[#c5a059]">{spacing}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={spacing} 
                      onChange={(e) => setSpacing(parseInt(e.target.value))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>
               </div>
            </div>

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Native Stitch</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Perfect for creating comparative "Before & After" shots, product grids, or panoramic sequences.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
