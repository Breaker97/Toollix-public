"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { Download, Layout, Type, Palette, QrCode as QrIcon, UtensilsCrossed, Sparkles, Loader2, Zap, Smartphone, Share2, ShieldCheck, Target, Printer, ImageIcon, Settings2, FileType, Trash2, Coffee, Wine, Pizza, Flame, ShoppingBag, Info, Square, Circle, Maximize2, Move, RefreshCw, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { jsPDF } from "jspdf";

const TEMPLATES = [
  { id: "modern", name: "Modern", bg: "#ffffff", text: "#000000", border: "#000000", radius: 60, padding: 48 },
  { id: "dark", name: "Midnight", bg: "#000000", text: "#ffffff", border: "#333333", radius: 60, padding: 48 },
  { id: "gold", name: "Gold", bg: "#ffffff", text: "#c5a059", border: "#c5a059", radius: 60, padding: 48 },
  { id: "royal", name: "Royal", bg: "#08081b", text: "#e0e7ff", border: "#4338ca", radius: 60, padding: 48 },
  { id: "sunset", name: "Sunset", bg: "#fff7ed", text: "#7c2d12", border: "#fdba74", radius: 60, padding: 48 }
];

const ICONS = [
  { id: "utensils", icon: UtensilsCrossed },
  { id: "coffee", icon: Coffee },
  { id: "wine", icon: Wine },
  { id: "pizza", icon: Pizza },
  { id: "flame", icon: Flame },
  { id: "bag", icon: ShoppingBag },
  { id: "qr", icon: QrIcon }
];

export function QrMenuClient() {
  const [url, setUrl] = useState("https://www.toollix.io/menu");
  const [headline, setHeadline] = useState("Scan for Menu");
  const [subHeadline, setSubHeadline] = useState("Digital menu for your safe dining");
  const [brandColor, setBrandColor] = useState("#c5a059");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderRadius, setBorderRadius] = useState(60);
  const [innerPadding, setInnerPadding] = useState(48);
  const [activeIcon, setActiveIcon] = useState("utensils");
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(60);
  const [exportFormat, setExportFormat] = useState<"png" | "jpg" | "pdf">("png");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const SelectedIcon = ICONS.find(i => i.id === activeIcon)?.icon || UtensilsCrossed;

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setBgColor(t.bg); setTextColor(t.text); setBorderColor(t.border); setBorderRadius(t.radius); setInnerPadding(t.padding);
  };
  
  const frameRef = useRef<HTMLDivElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!frameRef.current) return;
    setLoading(true);
    try {
      const options = { quality: 1, pixelRatio: 4, backgroundColor: bgColor };
      if (exportFormat === "pdf") {
        const dataUrl = await toPng(frameRef.current, options);
        const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [480 * 4, 672 * 4] });
        pdf.addImage(dataUrl, "PNG", 0, 0, 480 * 4, 672 * 4);
        pdf.save(`qr-menu-toollix.pdf`);
      } else {
        const { toPng, toJpeg } = await import("html-to-image");
        const dataUrl = exportFormat === "png" ? await toPng(frameRef.current, options) : await toJpeg(frameRef.current, options);
        const link = document.createElement("a");
        link.download = `qr-menu-toollix.${exportFormat}`;
        link.href = dataUrl;
        link.click();
      }
      toast.success(`High-resolution ${exportFormat.toUpperCase()} exported!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate export.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout 
      title="QR Menu Builder" 
      description="Create professional QR code menu frames for your business. Design stylish templates and export for printing."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Preview Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/30">
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center">
                    <QrIcon className="w-5 h-5" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Studio Preview</h3>
              </div>

              {/* Design Canvas */}
              <div className="relative group transition-all duration-700 hover:scale-[1.02]">
                <div className="absolute -inset-10 bg-black/5 blur-[60px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
                
                <div 
                  ref={frameRef}
                  className="w-[280px] sm:w-[480px] aspect-[1/1.4] border-[8px] sm:border-[12px] flex flex-col items-center justify-between shadow-2xl overflow-hidden relative"
                  style={{ 
                    backgroundColor: bgColor, borderColor: borderColor,
                    borderRadius: `${borderRadius}px`, padding: `${innerPadding}px`
                  }}
                >
                   <div className="text-center space-y-4 w-full">
                      <div className="flex justify-center">
                         <SelectedIcon className="w-12 h-12" style={{ color: textColor }} />
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-black uppercase leading-[0.9] tracking-tighter" style={{ color: textColor }}>
                         {headline}
                      </h2>
                      <div className="h-1.5 w-16 mx-auto rounded-full opacity-20" style={{ backgroundColor: textColor }} />
                   </div>

                   <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-2xl relative z-10 border-4 border-white/10">
                      <div className="relative">
                         <QRCodeSVG 
                           value={url} 
                           size={mounted ? (typeof window !== 'undefined' && window.innerWidth < 640 ? 140 : 200) : 200} 
                           fgColor={brandColor}
                           level="H"
                         />
                         {logo && (
                           <div 
                             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-xl shadow-lg border"
                             style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                           >
                              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="text-center space-y-4 w-full">
                      <p className="text-lg sm:text-2xl font-black italic opacity-80 uppercase tracking-tight" style={{ color: textColor }}>
                         {subHeadline}
                      </p>
                      <div className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-black/5">
                         <span className="text-[10px] font-black tracking-widest uppercase opacity-40" style={{ color: textColor }}>
                            toollix.io
                         </span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Main Action (Mobile First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={handleDownload}
                  disabled={loading}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 mr-3 group-hover:translate-y-1 transition-transform" />}
                  {loading ? "GENERATING..." : `EXPORT AS ${exportFormat.toUpperCase()}`}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#c5a059] animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">High-Res Vector</span>
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

               <Tabs defaultValue="style" className="w-full">
                  <TabsList className="w-full bg-zinc-50 dark:bg-zinc-800 p-1 rounded-xl h-12">
                     <TabsTrigger value="content" className="flex-1 text-[9px] font-black uppercase tracking-widest">Info</TabsTrigger>
                     <TabsTrigger value="style" className="flex-1 text-[9px] font-black uppercase tracking-widest">Style</TabsTrigger>
                     <TabsTrigger value="logo" className="flex-1 text-[9px] font-black uppercase tracking-widest">Asset</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="pt-6 space-y-5">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Menu URL</label>
                        <Input value={url} onChange={(e) => setUrl(e.target.value)} className="h-12 bg-zinc-50/50 rounded-xl border-none font-black text-[#c5a059]" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Headline</label>
                        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="h-12 bg-zinc-50/50 rounded-xl border-none font-black text-xs" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Sub-headline</label>
                        <Input value={subHeadline} onChange={(e) => setSubHeadline(e.target.value)} className="h-12 bg-zinc-50/50 rounded-xl border-none font-black text-xs" />
                     </div>
                  </TabsContent>

                  <TabsContent value="style" className="pt-6 space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Back</label>
                           <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Text</label>
                           <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Radius & Padding</label>
                        <Slider value={[borderRadius]} onValueChange={(v) => setBorderRadius(v[0])} min={0} max={160} />
                        <Slider value={[innerPadding]} onValueChange={(v) => setInnerPadding(v[0])} min={20} max={80} />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Icons</label>
                        <div className="grid grid-cols-4 gap-2">
                           {ICONS.map(i => (
                              <button key={i.id} onClick={() => setActiveIcon(i.id)} className={cn("h-10 rounded-lg flex items-center justify-center transition-all", activeIcon === i.id ? "bg-[#c5a059] text-white" : "bg-zinc-50 dark:bg-zinc-800 text-slate-400")}>
                                 <i.icon className="w-4 h-4" />
                              </button>
                           ))}
                        </div>
                     </div>
                  </TabsContent>

                  <TabsContent value="logo" className="pt-6 space-y-6">
                     <div className="flex flex-col items-center gap-4 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                        {logo ? (
                           <div className="relative group/logo">
                              <img src={logo} alt="Logo" className="max-h-16 object-contain" />
                              <button onClick={() => setLogo(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                           </div>
                        ) : <Plus className="w-8 h-8 text-slate-200" />}
                        <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        <Button asChild variant="outline" size="sm" className="rounded-xl font-black text-[9px] uppercase tracking-widest"><label htmlFor="logo-upload">Select Asset</label></Button>
                     </div>
                     {logo && <Slider value={[logoSize]} onValueChange={(v) => setLogoSize(v[0])} min={30} max={120} />}
                  </TabsContent>
               </Tabs>

               <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Export Format</label>
                  <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-800/80 p-1 rounded-xl">
                     {["png", "jpg", "pdf"].map(f => (
                        <button key={f} onClick={() => setExportFormat(f as any)} className={cn("py-2 rounded-lg text-[9px] font-black uppercase transition-all", exportFormat === f ? "bg-white dark:bg-zinc-700 text-[#c5a059] shadow-sm" : "text-slate-400")}>
                           {f}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Printer className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Print Quality</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Maximize2 className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">4K Render</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
