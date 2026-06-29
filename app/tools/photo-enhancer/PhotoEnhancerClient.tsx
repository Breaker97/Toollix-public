"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  ImageIcon, Loader2, Download, Sparkles, RefreshCw, Zap, Maximize, Sun, Contrast, Droplets, Wand2, ShieldCheck, CheckCircle2, Database, BarChart3, Activity, X
} from "lucide-react";
import { enhanceImage } from "./actions";
import { cn } from "@/lib/utils";

export default function PhotoEnhancerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [sharpness, setSharpness] = useState(0);
  const [autoFix, setAutoFix] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "done" && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResultUrl(null); setStatus("idle"); setError(null);
      setBrightness(1); setContrast(1); setSaturation(1); setSharpness(0); setAutoFix(false);
    }
  };

  const resetAll = () => {
    setFile(null); if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setResultUrl(null); setStatus("idle"); setError(null);
    setBrightness(1); setContrast(1); setSaturation(1); setSharpness(0); setAutoFix(false);
  };

  const applyEnhancements = useCallback(async () => {
    if (!file) return;
    setStatus("processing");
    const formData = new FormData();
    formData.append("file", file); formData.append("brightness", brightness.toString());
    formData.append("contrast", contrast.toString()); formData.append("saturation", saturation.toString());
    formData.append("sharpness", sharpness.toString()); formData.append("autoFix", autoFix.toString());
    try {
      const result = await enhanceImage(formData);
      if (result.success && result.url) { setResultUrl(result.url); setStatus("done"); }
      else { setError(result.error); setStatus("error"); }
    } catch (e: any) { setError(e.message); setStatus("error"); }
  }, [file, brightness, contrast, saturation, sharpness, autoFix]);

  useEffect(() => {
    if (!file) return;
    const timer = setTimeout(() => { applyEnhancements(); }, 500);
    return () => clearTimeout(timer);
  }, [brightness, contrast, saturation, sharpness, autoFix, applyEnhancements]);

  return (
    <ToolLayout title="Photo Enhancer" description="Professional high-fidelity refinement studio." fullWidth={false}>
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 space-y-5 shadow-sm">
               <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Resource Buffer</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 01</p></div>
               {!file ? (
                  <label className="w-full group cursor-pointer block">
                     <div className="relative rounded-xl p-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-center space-y-3 transition-all hover:bg-white">
                       <ImageIcon className="w-4 h-4 text-[#c5a059]" />
                       <div className="space-y-0.5"><p className="text-[9px] font-black uppercase tracking-widest">Select Image</p><p className="text-[7px] font-bold text-muted-foreground uppercase leading-none opacity-50">JPG, PNG, WEBP</p></div>
                       <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                     </div>
                  </label>
               ) : (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg border border-zinc-100 flex items-center justify-between">
                     <div className="flex items-center gap-3 truncate">
                        <ImageIcon className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                        <div className="truncate"><p className="text-[9px] font-black uppercase tracking-tight truncate leading-none mb-0.5">{file.name}</p><p className="text-[8px] font-bold text-[#c5a059] uppercase italic opacity-60">Buffered</p></div>
                     </div>
                     <button onClick={resetAll} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
               )}
            </div>

            <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 rounded-[1.5rem] p-5 space-y-5 shadow-sm transition-all", !file && "opacity-40 grayscale blur-[1px]")}>
               <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                    <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Enhancement Matrix</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 02</p></div>
                    <button onClick={() => setAutoFix(!autoFix)} className={cn("px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 border", autoFix ? "bg-[#c5a059] text-white border-transparent" : "bg-zinc-50 text-muted-foreground")}><Sparkles className="w-2.5 h-2.5" /> {autoFix ? "AI ON" : "AUTO"}</button>
               </div>
               <div className="space-y-4">
                  {[
                    { label: 'Brightness', icon: Sun, val: brightness, min: 0.5, max: 2, set: setBrightness, color: 'text-orange-500' },
                    { label: 'Contrast', icon: Contrast, val: contrast, min: 0.5, max: 2, set: setContrast, color: 'text-[#c5a059]' },
                    { label: 'Saturation', icon: Droplets, val: saturation, min: 0, max: 2, set: setSaturation, color: 'text-pink-500' },
                    { label: 'Sharpness', icon: Maximize, val: sharpness, min: 0, max: 100, set: setSharpness, color: 'text-emerald-500', isSharp: true },
                  ].map((c, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2"><c.icon className={cn("w-3 h-3", c.color)} /><span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{c.label}</span></div>
                            <span className="text-[9px] font-mono font-black text-[#c5a059]">{c.isSharp ? Math.round(c.val) : Math.round(c.val * 100)}%</span>
                        </div>
                        <input type="range" min={c.min} max={c.max} step={c.isSharp ? 1 : 0.05} value={c.val} onChange={(e) => c.set(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-100 rounded-full appearance-none accent-[#c5a059]" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Safe Iso</span></div>
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><Zap className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Turbo Net</span></div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            {status === "done" && resultUrl && (
              <div ref={successRef} className="animate-in zoom-in-95 duration-700 w-full">
                 <div className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-[#c5a059]/30 flex flex-col gap-5 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
                       <div className="flex items-center gap-4 min-w-fit">
                          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner"><CheckCircle2 className="w-5 h-5" /></div>
                          <div><h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">Refinement Complete</h3><p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.3em] italic leading-none">Hardware Verified</p></div>
                       </div>
                       <div className="flex gap-2 w-full sm:w-auto items-center justify-center sm:justify-end">
                          <Button onClick={resetAll} variant="outline" className="h-10 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 shrink-0">NEW IMAGE</Button>
                          <Button onClick={() => { const a = document.createElement("a"); a.href = resultUrl; a.download = `enhanced-toollix.png`; a.click(); }} className="h-10 px-4 rounded-lg bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-md text-[9px] shrink-0">EXPORT ENHANCED</Button>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 rounded-[1.5rem] min-h-[400px] lg:min-h-[500px] p-5 flex flex-col relative shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                  <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Matrix</span><p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">Vision Optimization</p></div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" /> Live Feed</div>
               </div>
               <div className="flex-1 flex flex-col items-center justify-center">
                  {!file ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20"><Wand2 className="w-12 h-12 text-zinc-300 mb-4" /><p className="text-xs font-black uppercase tracking-widest italic text-zinc-400">Awaiting Resource</p></div>
                  ) : (
                    <div className="w-full flex-1 relative bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center p-6">
                        <img src={resultUrl || previewUrl!} alt="Preview" className={cn("max-h-[400px] w-auto object-contain rounded-xl shadow-2xl transition-all", status === "processing" && "opacity-40 blur-sm")} />
                        {status === "processing" && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"><Loader2 className="w-8 h-8 animate-spin text-[#c5a059]" /><span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#c5a059]">Optimizing...</span></div>}
                    </div>
                  )}
               </div>
            </div>
            {status === "done" && <Button onClick={resetAll} variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground font-black text-[8px] uppercase tracking-widest border-2 border-dashed">RESTART STUDIO</Button>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
