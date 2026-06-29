"use client";

import { useState, useRef, useEffect } from 'react';
import { Download, Palette, Type, Globe, Shield, Layout, Smartphone, Share2, Loader2, Sparkles, Smile, Square, Circle, ChevronLeft, ChevronRight, RefreshCw, UploadCloud, Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { ToolLayout } from "@/components/tool-layout";
import { cn } from "@/lib/utils";

const FONTS = [
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Montserrat", value: "'Montserrat', sans-serif" },
  { name: "Ubuntu", value: "'Ubuntu', sans-serif" },
  { name: "Outfit", value: "'Outfit', sans-serif" },
  { name: "Fira Code", value: "'Fira Code', monospace" },
  { name: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
];

const SHAPES = [
  { name: "Square", value: "square", icon: Square },
  { name: "Circle", value: "circle", icon: Circle },
  { name: "Squircle", value: "squircle", radius: "22%", icon: Square },
];

const GRADIENTS = [
  { name: "Brand Gold", value: "linear-gradient(135deg, #c5a059 0%, #b08d4b 100%)" },
  { name: "Indigo Night", value: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
  { name: "Midnight", value: "linear-gradient(135deg, #0f172a 0%, #334155 100%)" },
  { name: "Crimson", value: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" },
  { name: "Emerald", value: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
  { name: "Solid Black", value: "#000000" },
  { name: "Solid White", value: "#FFFFFF" },
];

export default function FaviconStudioClient() {
  const [text, setText] = useState("A");
  const [symbolMode, setSymbolMode] = useState<'text' | 'image'>('text');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState(FONTS[0].value);
  const [selectedShape, setSelectedShape] = useState(SHAPES[0].value);
  const [selectedBg, setSelectedBg] = useState(GRADIENTS[0].value);
  const [customBgColor, setCustomBgColor] = useState("#c5a059");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [customTextColor, setCustomTextColor] = useState("#FFFFFF");
  const [exporting, setExporting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image too large", { description: "Please upload an image under 2MB." });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setSymbolMode('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const drawFaviconAsync = (size: number): Promise<string | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      // Background
      if (selectedBg === 'custom') {
        ctx.fillStyle = customBgColor;
      } else if (selectedBg.includes('gradient')) {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        if (selectedBg.includes('#c5a059')) {
          gradient.addColorStop(0, '#c5a059'); gradient.addColorStop(1, '#b08d4b');
        } else if (selectedBg.includes('#6366f1')) {
          gradient.addColorStop(0, '#6366f1'); gradient.addColorStop(1, '#a855f7');
        } else if (selectedBg.includes('#ef4444')) {
          gradient.addColorStop(0, '#ef4444'); gradient.addColorStop(1, '#b91c1c');
        } else if (selectedBg.includes('#10b981')) {
          gradient.addColorStop(0, '#10b981'); gradient.addColorStop(1, '#059669');
        } else {
          gradient.addColorStop(0, '#0f172a'); gradient.addColorStop(1, '#334155');
        }
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = selectedBg;
      }
      
      // Draw Shape
      ctx.beginPath();
      if (selectedShape === 'circle') {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else if (selectedShape === 'squircle') {
        const r = size * 0.22;
        ctx.moveTo(r, 0); ctx.lineTo(size - r, 0);
        ctx.quadraticCurveTo(size, 0, size, r);
        ctx.lineTo(size, size - r);
        ctx.quadraticCurveTo(size, size, size - r, size);
        ctx.lineTo(r, size);
        ctx.quadraticCurveTo(0, size, 0, size - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
      } else {
        ctx.rect(0, 0, size, size);
      }
      ctx.fill();

      if (symbolMode === 'image' && uploadedImage) {
        const img = new Image();
        img.onload = () => {
          const padding = size * 0.15;
          const drawSize = size - (padding * 2);
          ctx.drawImage(img, padding, padding, drawSize, drawSize);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = uploadedImage;
      } else {
        ctx.fillStyle = textColor === 'custom' ? customTextColor : textColor;
        const fontSize = size * 0.6;
        ctx.font = `bold ${fontSize}px ${selectedFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text.slice(0, 2), size / 2, size / 2 + size * 0.05);
        resolve(canvas.toDataURL('image/png'));
      }
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      const sizes = [16, 32, 48, 180, 192, 512];
      for (const size of sizes) {
        const dataUrl = await drawFaviconAsync(size);
        if (dataUrl) {
          const base64Data = dataUrl.split(',')[1];
          let filename = `favicon-${size}x${size}.png`;
          if (size === 180) filename = 'apple-touch-icon.png';
          zip.file(filename, base64Data, { base64: true });
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "favicon-pack-toollix.zip";
      link.click();
      toast.success("Favicon pack generated successfully!");
    } catch (e) {
      toast.error("Failed to generate favicon pack.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <ToolLayout 
      title="Favicon Studio" 
      description="Professional identity engine. Design, optimize, and deploy multi-platform brand assets."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Canvas Preview Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-12 overflow-hidden relative min-h-[500px] flex flex-col justify-center">
              <div className="absolute top-8 left-8 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4 w-full max-w-[200px]">
                 <div className="w-8 h-8 bg-[#c5a059]/10 text-[#c5a059] rounded-lg flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                 </div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Studio Preview</h3>
              </div>

              {/* Large Matrix Preview Area */}
              <div className="flex items-center justify-center pt-12">
                 <div className="relative group">
                    <div className="absolute inset-0 bg-[#c5a059]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div 
                       className="w-48 h-48 sm:w-64 sm:h-64 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] transition-all duration-700 flex items-center justify-center overflow-hidden border-8 border-white dark:border-zinc-800 relative z-10"
                       style={{ 
                         background: selectedBg === 'custom' ? customBgColor : selectedBg, 
                         borderRadius: selectedShape === 'circle' ? '50%' : selectedShape === 'squircle' ? '22%' : '0',
                         fontSize: '96px',
                         fontWeight: '900',
                         color: textColor === 'custom' ? customTextColor : textColor,
                         fontFamily: selectedFont
                       }}
                    >
                       {symbolMode === 'image' && uploadedImage ? (
                         <img src={uploadedImage} alt="Large Preview" className="w-full h-full object-cover p-8" />
                       ) : <span className="animate-in zoom-in-50 duration-700" style={{ fontSize: 'inherit' }}>{text.slice(0, 2)}</span>}
                    </div>
                 </div>
              </div>

              {/* Browser Tabs Simulation (Small) */}
              <div className="flex justify-center pt-8">
                 <div className="bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl p-4 flex items-center gap-6 border border-zinc-100 dark:border-zinc-700">
                    {[16, 32, 48].map(size => (
                       <div key={size} className="flex flex-col items-center gap-2">
                          <div 
                             className="shadow-sm border border-white dark:border-zinc-800"
                             style={{ 
                               width: size, height: size,
                               background: selectedBg === 'custom' ? customBgColor : selectedBg, 
                               borderRadius: selectedShape === 'circle' ? '50%' : selectedShape === 'squircle' ? '4px' : '0',
                               fontSize: size * 0.6, fontWeight: '900',
                               color: textColor === 'custom' ? customTextColor : textColor,
                               display: 'flex', alignItems: 'center', justifyContent: 'center'
                             }}
                          >
                             {symbolMode === 'image' && uploadedImage ? <img src={uploadedImage} className="w-full h-full p-[10%]" /> : text.slice(0, 1)}
                          </div>
                          <span className="text-[8px] font-black text-slate-400">{size}px</span>
                       </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Main Action (Mobile First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 mr-3 group-hover:translate-y-1 transition-transform" />}
                  {exporting ? "GENERATING ASSETS..." : "DOWNLOAD FAVICON PACK"}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pack Units</span>
                      <span className="text-xl font-black text-[#c5a059]">6 SIZES</span>
                   </div>
                </div>
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Design Driver</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Identity Configuration</p>
               </div>

               <div className="space-y-6">
                  {/* Mode Toggle */}
                  <div className="grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                     <button 
                        onClick={() => setSymbolMode('text')}
                        className={cn(
                           "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           symbolMode === 'text' ? "bg-white dark:bg-zinc-700 text-[#c5a059] shadow-sm" : "text-slate-400 dark:text-zinc-500 hover:bg-zinc-100/50"
                        )}
                     >Text</button>
                     <button 
                        onClick={() => setSymbolMode('image')}
                        className={cn(
                           "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           symbolMode === 'image' ? "bg-white dark:bg-zinc-700 text-[#c5a059] shadow-sm" : "text-slate-400 dark:text-zinc-500 hover:bg-zinc-100/50"
                        )}
                     >Image</button>
                  </div>

                  {/* Input Block */}
                  {symbolMode === 'text' ? (
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Display Text</label>
                        <Input 
                           value={text} 
                           onChange={(e) => setText(e.target.value.slice(0, 2))}
                           className="h-16 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl border-none text-2xl font-black text-center text-[#c5a059]"
                           placeholder="A"
                        />
                     </div>
                  ) : (
                     <div className="space-y-4">
                        <input type="file" id="icon-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <Button asChild variant="outline" className="w-full h-16 rounded-2xl border-dashed border-2 hover:bg-[#c5a059]/10 hover:text-[#c5a059] hover:border-[#c5a059]/20 transition-all cursor-pointer">
                           <label htmlFor="icon-upload" className="cursor-pointer flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                              <Plus className="w-4 h-4" /> {uploadedImage ? "CHANGE LOGO" : "UPLOAD LOGO"}
                           </label>
                        </Button>
                     </div>
                  )}

                  {/* Shapes Grid */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mask Shape</label>
                     <div className="grid grid-cols-3 gap-2">
                        {SHAPES.map(s => (
                           <button 
                              key={s.value}
                              onClick={() => setSelectedShape(s.value)}
                              className={cn(
                                 "h-12 rounded-xl flex items-center justify-center border transition-all",
                                 selectedShape === s.value ? "bg-[#c5a059] text-white border-[#c5a059]" : "bg-zinc-50 dark:bg-zinc-800 text-slate-400 border-zinc-100 dark:border-zinc-700"
                              )}
                           >
                              <s.icon className="w-4 h-4" />
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Colors Grid */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Background Palette</label>
                     <div className="grid grid-cols-4 gap-2">
                        {GRADIENTS.slice(0, 7).map(g => (
                           <button 
                              key={g.name}
                              onClick={() => setSelectedBg(g.value)}
                              className={cn(
                                 "aspect-square rounded-lg border-2 transition-all",
                                 selectedBg === g.value ? "border-[#c5a059] scale-110" : "border-transparent"
                              )}
                              style={{ background: g.value }}
                           />
                        ))}
                        <button 
                           onClick={() => { setSelectedBg('custom'); document.getElementById('bg-picker')?.click(); }}
                           className={cn(
                              "aspect-square rounded-lg border-2 border-dashed flex items-center justify-center transition-all",
                              selectedBg === 'custom' ? "border-[#c5a059] scale-110" : "border-zinc-200 dark:border-zinc-700"
                           )}
                        >
                           <Palette className="w-3.5 h-3.5 text-[#c5a059]" />
                        </button>
                        <input id="bg-picker" type="color" value={customBgColor} onChange={(e) => { setCustomBgColor(e.target.value); setSelectedBg('custom'); }} className="hidden" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mobile Ready</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Check className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">WCAG Valid</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
