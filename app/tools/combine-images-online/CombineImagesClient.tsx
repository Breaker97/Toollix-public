"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Download, 
  Upload, 
  X, 
  Activity, 
  Layout,
  LayoutGrid,
  ArrowRight,
  ArrowDown,
  Trash2,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

interface ImageItem {
  id: string;
  url: string;
  width: number;
  height: number;
}

export default function CombineImagesClient() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [direction, setDirection] = useState<"vertical" | "horizontal" | "grid">("vertical");
  const [spacing, setSpacing] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
          setImages(prev => [
            ...prev,
            {
              id: Math.random().toString(36).substring(7),
              url,
              width: img.width,
              height: img.height
            }
          ]);
        };
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const drawCombined = () => {
    if (images.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let totalWidth = 0;
    let totalHeight = 0;

    if (direction === "vertical") {
      totalWidth = Math.max(...images.map(img => img.width));
      totalHeight = images.reduce((sum, img) => sum + img.height, 0) + (images.length - 1) * spacing;
    } else if (direction === "horizontal") {
      totalWidth = images.reduce((sum, img) => sum + img.width, 0) + (images.length - 1) * spacing;
      totalHeight = Math.max(...images.map(img => img.height));
    } else {
      // Grid (2 columns)
      const cols = 2;
      const rows = Math.ceil(images.length / cols);
      const cellWidth = Math.max(...images.map(img => img.width));
      const cellHeight = Math.max(...images.map(img => img.height));
      totalWidth = cellWidth * cols + (cols - 1) * spacing;
      totalHeight = cellHeight * rows + (rows - 1) * spacing;
    }

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Draw Background (White)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    let currentX = 0;
    let currentY = 0;

    images.forEach((imgItem, index) => {
      const img = new window.Image();
      img.src = imgItem.url;
      
      if (direction === "vertical") {
        ctx.drawImage(img, (totalWidth - imgItem.width) / 2, currentY);
        currentY += imgItem.height + spacing;
      } else if (direction === "horizontal") {
        ctx.drawImage(img, currentX, (totalHeight - imgItem.height) / 2);
        currentX += imgItem.width + spacing;
      } else {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const cellWidth = (totalWidth - spacing) / 2;
        const cellHeight = (totalHeight - (Math.ceil(images.length / 2) - 1) * spacing) / Math.ceil(images.length / 2);
        
        ctx.drawImage(img, col * (cellWidth + spacing), row * (cellHeight + spacing));
      }
    });
  };

  useEffect(() => {
    drawCombined();
  }, [images, direction, spacing]);

  const handleDownload = () => {
    if (!canvasRef.current || images.length === 0) return;
    setIsProcessing(true);
    const link = document.createElement("a");
    link.download = "toollix-merged-photo.png";
    link.href = canvasRef.current.toDataURL("image/png", 1.0);
    link.click();
    setIsProcessing(false);
    toast.success("Combined image exported!");
  };

  return (
    <ToolLayout 
      title="Photo Merger" 
      description="Combine multiple images vertically, horizontally, or in a grid. Perfect for comparisons, side-by-side shots, and collage creation."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className={cn(
              "suite-card rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 space-y-6 overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center transition-all",
              images.length === 0 ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed border-2" : "bg-zinc-100 dark:bg-zinc-800/50"
            )}>
              {images.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-4 cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-[#c5a059]/10 text-[#c5a059] rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                    <Plus className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Add Images to Merge</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1 italic">Select multiple photos</p>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-8">
                  {/* Canvas Preview */}
                  <div className="relative group w-full flex justify-center bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-inner-soft overflow-auto max-h-[600px]">
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full h-auto shadow-2xl transition-all duration-500"
                    />
                  </div>

                  {/* Image List (Sortable-like) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 group shadow-lg">
                        <Image src={img.url} alt="Uploaded" fill className="object-cover" />
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
                    >
                      <Plus className="w-6 h-6 text-[#c5a059] group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Add More</span>
                    </button>
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
                    {isProcessing ? "PROCESSING..." : "EXPORT COMBINED PHOTO"}
                  </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Layout Engine</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Fusion Settings</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merge Direction</label>
                    <div className="grid grid-cols-3 gap-2">
                       <Button 
                          variant={direction === "vertical" ? "default" : "outline"}
                          onClick={() => setDirection("vertical")}
                          className={cn("h-12 flex flex-col gap-1 text-[9px] font-black uppercase", direction === "vertical" ? "bg-[#c5a059]" : "")}
                       >
                         <ArrowDown className="w-3 h-3" />
                         Vertical
                       </Button>
                       <Button 
                          variant={direction === "horizontal" ? "default" : "outline"}
                          onClick={() => setDirection("horizontal")}
                          className={cn("h-12 flex flex-col gap-1 text-[9px] font-black uppercase", direction === "horizontal" ? "bg-[#c5a059]" : "")}
                       >
                         <ArrowRight className="w-3 h-3" />
                         Horizontal
                       </Button>
                       <Button 
                          variant={direction === "grid" ? "default" : "outline"}
                          onClick={() => setDirection("grid")}
                          className={cn("h-12 flex flex-col gap-1 text-[9px] font-black uppercase", direction === "grid" ? "bg-[#c5a059]" : "")}
                       >
                         <LayoutGrid className="w-3 h-3" />
                         Grid
                       </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Spacing</label>
                       <span className="text-[10px] font-black text-[#c5a059]">{spacing}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={spacing} 
                      onChange={(e) => setSpacing(parseInt(e.target.value))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button 
                      variant="outline" 
                      onClick={() => setImages([])}
                      className="w-full h-10 text-[10px] font-black uppercase text-red-500 border-red-500/20 hover:bg-red-500/5"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Clear All
                    </Button>
                  </div>
               </div>
            </div>

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Collage Mode</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Easily create side-by-side comparisons or vertical stacks for social media and documentation.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
