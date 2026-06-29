"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Zap, Trash2, Sparkles, ArrowRight, Info, CheckCircle2, ShieldCheck, Activity, BarChart3, Database, Image as ImageIcon, Maximize2, X, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { upscaleImage as upscaleImageAction } from "./actions";

export default function AIUpscalerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentScale, setCurrentScale] = useState<number | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "done" && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResultUrl(null); setStatus("idle"); setError(null); setCurrentScale(null);
    }
  };

  const handleUpscale = async (scaleFactor: 2 | 4) => {
    if (!file) return;
    try {
      setStatus("processing"); setError(null); setCurrentScale(scaleFactor);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("scale", scaleFactor.toString());
      const result = await upscaleImageAction(formData);
      if (result.success && result.data) {
        setResultUrl(result.data); setStatus("done");
      } else {
        throw new Error(result.error || "Upscale failed.");
      }
    } catch (err: any) {
      setError(err.message || "Cloud engine failure."); setStatus("error");
    }
  };

  const resetAll = () => {
    setFile(null); setPreviewUrl(null); setResultUrl(null); setStatus("idle"); setError(null); setSliderPosition(50);
  };

  const handleMove = (e: any) => {
    if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
    setSliderPosition(pos);
  };

  return (
    <ToolLayout title="AI Image Enhancer" description="High-resolution neural upscaling studio." fullWidth={false}>
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 space-y-5 shadow-sm">
               <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Resource Buffer</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 01</p></div>
               {!file ? (
                  <label className="w-full group cursor-pointer block">
                     <div className="relative rounded-xl p-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-center space-y-3 transition-all hover:bg-white">
                       <Zap className="w-4 h-4 text-[#c5a059]" />
                       <div className="space-y-0.5"><p className="text-[9px] font-black uppercase tracking-widest">Select Asset</p><p className="text-[7px] font-bold text-muted-foreground uppercase leading-none opacity-50">JPG, PNG, WEBP</p></div>
                       <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                     </div>
                  </label>
               ) : (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg border border-zinc-100 flex items-center justify-between">
                     <div className="flex items-center gap-3 truncate">
                        <ImageIcon className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                        <div className="truncate"><p className="text-[9px] font-black uppercase tracking-tight truncate leading-none mb-0.5">{file.name}</p><p className="text-[8px] font-bold text-[#c5a059] uppercase italic opacity-60">Asset Loaded</p></div>
                     </div>
                     <button onClick={resetAll} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
               )}
            </div>

            <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 rounded-[1.5rem] p-5 space-y-5 shadow-sm transition-all", !file && "opacity-40 grayscale blur-[1px]")}>
               <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Neural Scaling</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 02</p></div>
               <div className="grid grid-cols-1 gap-2">
                  {[2, 4].map((s) => (
                    <Button key={s} onClick={() => handleUpscale(s as 2|4)} disabled={status === "processing" || !file} className={cn("w-full h-12 flex justify-between px-4 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md", s === 4 ? "bg-purple-600 hover:bg-purple-700" : "bg-[#c5a059] hover:bg-[#b08d4a]")}>
                      <span>{s}x Scale</span>
                      {status === "processing" && currentScale === s ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </Button>
                  ))}
               </div>
            </div>

            {error && <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-[9px] text-red-600 font-black uppercase tracking-widest text-center animate-in zoom-in-95">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Safe Enc</span></div>
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><Zap className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Turbo Syn</span></div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            {status === "done" && resultUrl && (
              <div ref={successRef} className="animate-in zoom-in-95 duration-700 w-full">
                 <div className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-[#c5a059]/30 flex flex-col gap-5 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
                       <div className="flex items-center gap-4 min-w-fit">
                          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner"><CheckCircle2 className="w-5 h-5" /></div>
                          <div><h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">Scaling Complete</h3><p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.3em] italic leading-none">Hardware Verified</p></div>
                       </div>
                       <div className="flex gap-2 w-full sm:w-auto items-center justify-center sm:justify-end">
                          <Button onClick={resetAll} variant="outline" className="h-10 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 shrink-0">NEW ASSET</Button>
                          <Button onClick={() => { const a = document.createElement("a"); a.href = resultUrl; a.download = `enhanced-${currentScale}x-${file!.name}`; a.click(); }} className="h-10 px-4 rounded-lg bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-md text-[9px] shrink-0">DOWNLOAD IMAGE</Button>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Stability", value: "99.9%", icon: BarChart3, highlight: true },
                          { label: "Upscale", value: `${currentScale}x Pro`, icon: Maximize2 },
                          { label: "Engine", value: "Real-ESRGAN", icon: Database },
                          { label: "Security", value: "Isolated", icon: ShieldCheck }
                        ].map((stat, i) => (
                          <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 flex flex-col gap-1">
                             <div className="flex items-center justify-between"><stat.icon className={cn("w-3 h-3 opacity-20", stat.highlight && "text-[#c5a059] opacity-50")} /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/50">{stat.label}</span></div>
                             <p className={cn("text-xs font-black tracking-tight", stat.highlight ? "text-[#c5a059]" : "text-foreground")}>{stat.value}</p>
                          </div>
                        ))}
                    </div>
                 </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 rounded-[1.5rem] min-h-[450px] lg:min-h-[550px] p-5 flex flex-col relative shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                  <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Matrix</span><p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">Inference Feed</p></div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full bg-[#c5a059]", status === "processing" && "animate-pulse")} /> {status === "processing" ? "SYNTHESIZING" : "LIVE"}
                  </div>
               </div>
               
               <div className="flex-1 flex flex-col items-center justify-center">
                  {!file ? (
                    <div className="opacity-20 flex flex-col items-center gap-6"><Maximize2 className="w-16 h-16 text-zinc-300 mb-2" /><p className="text-xs font-black uppercase tracking-widest italic text-zinc-400 text-center">Awaiting Source Asset<br/><span className="text-[8px] opacity-50">Cloud processing enabled</span></p></div>
                  ) : (
                    <div className="w-full flex-1 relative bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none" ref={containerRef} onMouseMove={handleMove} onTouchMove={handleMove} onMouseDown={() => resultUrl && setIsResizing(true)} onMouseUp={() => setIsResizing(false)} onMouseLeave={() => setIsResizing(false)} onTouchStart={() => resultUrl && setIsResizing(true)} onTouchEnd={() => setIsResizing(false)}>
                        <img src={previewUrl!} alt="Original" className={cn("max-h-[400px] w-auto object-contain rounded-xl shadow-2xl transition-all", status === "processing" && "blur-xl opacity-30 scale-95")} />
                        
                        {resultUrl && (
                          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-6">
                            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}>
                               <img src={resultUrl} alt="Enhanced" className="h-full w-full object-contain p-2 sm:p-6" />
                            </div>
                            <div className="absolute top-0 bottom-0 w-0.5 bg-[#c5a059] shadow-xl z-10 pointer-events-none" style={{ left: `${sliderPosition}%` }}>
                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-2xl border-2 border-[#c5a059] flex items-center justify-center gap-0.5">
                                  <div className="w-0.5 h-3 bg-[#c5a059]/30 rounded-full" /><div className="w-0.5 h-3 bg-[#c5a059]/30 rounded-full" />
                               </div>
                            </div>
                          </div>
                        )}

                        {status === "processing" && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                             <div className="w-16 h-16 rounded-full border-4 border-[#c5a059]/10 border-t-[#c5a059] animate-spin flex items-center justify-center"><Sparkles className="w-6 h-6 text-[#c5a059] animate-pulse" /></div>
                             <div className="text-center space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]">Applying Neural Upscale</p>
                                <p className="text-[8px] font-bold text-muted-foreground/60 uppercase">Hardware Node: {currentScale}x Studio</p>
                             </div>
                          </div>
                        )}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.1); border-radius: 4px; }`}</style>
    </ToolLayout>
  );
}
