"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ToolLayout } from "@/components/tool-layout";
import { validateUpload } from "@/lib/upload-limits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Download, Loader2, Image as ImageIcon, Link2, Unlink2, Zap, Check, RefreshCw, Maximize2, ShieldCheck } from "lucide-react";
import { useUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";

export function ResizeImageClient() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [linked, setLinked] = useState(true);
  const [fit, setFit] = useState("inside");
  const [format, setFormat] = useState("jpg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { upload, reset: resetUpload } = useUpload();
  const { data: session } = useSession();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const validation = validateUpload([f], session);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setFile(f);
    setResult(null);
    setError(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
    
    const img = new Image();
    img.onload = () => {
      setOrigDims({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
      setStep(2);
    };
    img.src = url;
  };

  const handleWidthChange = (v: string) => {
    setWidth(v);
    if (linked && origDims && v) {
      const ratio = origDims.h / origDims.w;
      setHeight(String(Math.round(parseInt(v) * ratio)));
    }
  };

  const handleHeightChange = (v: string) => {
    setHeight(v);
    if (linked && origDims && v) {
      const ratio = origDims.w / origDims.h;
      setWidth(String(Math.round(parseInt(v) * ratio)));
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (result) URL.revokeObjectURL(result.url);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setOrigDims(null);
    setStep(1);
    resetUpload();
  };

  const handleResize = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("width", width);
      fd.append("height", height);
      fd.append("fit", fit);
      fd.append("format", format);

      const resData = await upload("/api/tools/image/resize", fd);
      
      const resW = resData.meta?.width || parseInt(width);
      const resH = resData.meta?.height || parseInt(height);
      setResult({ url: resData.url, w: resW, h: resH, name: `resized-toollix.${format}` });
      setStep(3);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout 
      title="Resize Image" 
      description="Professional dimension engine. Scale, crop, or fill images to exact pixel specifications with high-fidelity resampling."
      fullWidth={true}
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Workspace */}
          <div className="lg:col-span-8 space-y-6">
            <div className={cn("suite-card rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative min-h-[600px] flex flex-col items-center", step > 1 ? "justify-start" : "justify-center", "bg-zinc-50 dark:bg-zinc-800/30")}>
               
               {step < 3 && (
                <div className="absolute top-8 left-8 flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Resize Studio</h3>
                </div>
               )}

               {step === 1 ? (
                  <div className="flex flex-col items-center gap-6 py-12">
                     <div className="w-20 h-20 bg-[#c5a059]/10 text-[#c5a059] rounded-2xl flex items-center justify-center animate-bounce">
                        <Upload className="w-10 h-10" />
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-xl font-black uppercase tracking-widest">Load Source Image</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">JPG, PNG, WEBP • Auto-Detecting Dimensions</p>
                     </div>
                     <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={handleFile} />
                     <Button asChild className="h-16 px-10 rounded-2xl bg-[#c5a059] text-white font-black uppercase tracking-[0.2em] shadow-xl">
                        <label htmlFor="image-upload">Browse Assets</label>
                     </Button>
                  </div>
               ) : step === 2 && preview ? (
                  <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
                     <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] italic">Analysis Verified • {origDims?.w}×{origDims?.h}px</p>
                        </div>
                        <Button onClick={reset} variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500">
                           <RefreshCw className="w-3 h-3 mr-2" /> Change Image
                        </Button>
                     </div>
                     <div className="flex-1 w-full relative flex items-center justify-center bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 p-8 min-h-[400px]">
                        <img src={preview} alt="Original" className="max-h-[500px] w-auto object-contain rounded-xl drop-shadow-2xl" />
                     </div>
                  </div>
               ) : step === 3 && result && (
                  <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
                     <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border-2 border-[#c5a059]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                              <Check className="w-8 h-8" />
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Resizing Verified</h3>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest italic opacity-80">
                                 OUTPUT: {result.w} × {result.h} PX • {format.toUpperCase()}
                              </p>
                           </div>
                        </div>
                        <Button asChild className="h-14 px-10 rounded-xl bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 outline-none border-none">
                           <a href={result.url} download={result.name}>Download Image</a>
                        </Button>
                     </div>
                     <div className="flex-1 w-full relative flex items-center justify-center bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 p-12 min-h-[400px]"
                          style={{ backgroundImage: "linear-gradient(45deg, #f8f8f8 25%, transparent 25%), linear-gradient(-45deg, #f8f8f8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f8f8 75%), linear-gradient(-45deg, transparent 75%, #f8f8f8 75%)", backgroundSize: "24px 24px", backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px" }}
                     >
                        <img src={result.url} alt="Resized" className="max-h-[500px] w-auto object-contain rounded-xl drop-shadow-2xl" />
                     </div>
                  </div>
               )}
            </div>

            {/* Main Action (Mobile First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               {step === 2 && (
                  <Button 
                    onClick={handleResize}
                    disabled={loading || !width || !height}
                    className="w-full h-20 rounded-[2.5rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[13px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_-10px_rgba(197,160,89,0.4)] group transition-all relative overflow-hidden border-none"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <div className="relative z-10 flex items-center justify-center gap-4">
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />}
                       {loading ? "SCALING DIMENSIONS..." : "RESIZE ASSET"}
                    </div>
                  </Button>
               )}
               {step === 3 && (
                  <Button onClick={reset} variant="outline" className="w-full h-20 px-10 rounded-[2.5rem] border-zinc-200 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all">
                     Scale Another
                  </Button>
               )}
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className={cn("suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500", step === 1 && "opacity-40 pointer-events-none grayscale")}>
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Studio Driver</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Identity Specs</p>
               </div>

               <div className="space-y-8">
                  {/* Dimensions */}
                  <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Geometric Matrix (PX)</label>
                      <div className="space-y-3">
                          <div className="relative">
                              <Input value={width} onChange={e => handleWidthChange(e.target.value)} type="number" placeholder="Width" className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl font-black text-sm px-6 focus-visible:ring-2 focus-visible:ring-[#c5a059]" />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">WIDTH</span>
                          </div>
                          <div className="flex justify-center -my-3 relative z-20">
                              <button onClick={() => setLinked(!linked)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white dark:bg-zinc-900 border-2 shadow-lg", linked ? "border-[#c5a059] text-[#c5a059]" : "border-zinc-100 text-slate-300")}>
                                 {linked ? <Link2 className="w-4 h-4" /> : <Unlink2 className="w-4 h-4" />}
                              </button>
                          </div>
                          <div className="relative">
                              <Input value={height} onChange={e => handleHeightChange(e.target.value)} type="number" placeholder="Height" className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl font-black text-sm px-6 focus-visible:ring-2 focus-visible:ring-[#c5a059]" />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">HEIGHT</span>
                          </div>
                      </div>
                  </div>

                  {/* Format */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Target Lexicon</label>
                     <div className="grid grid-cols-3 gap-2">
                        {["jpg", "png", "webp"].map(fmt => (
                          <button key={fmt} onClick={() => setFormat(fmt)} className={cn("h-11 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all", format === fmt ? "bg-[#c5a059] text-white shadow-lg" : "bg-zinc-50 dark:bg-zinc-800 text-slate-400")}>
                            {fmt}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Fit Mode */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Fit Strategy</label>
                     <div className="grid grid-cols-2 gap-2">
                        {["inside", "cover", "fill", "contain"].map(m => (
                          <button key={m} onClick={() => setFit(m)} className={cn("h-11 text-[9px] font-black rounded-xl uppercase tracking-widest transition-all", fit === m ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-zinc-50 dark:bg-zinc-800 text-slate-400")}>
                            {m}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Maximize2 className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">High Res</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Privacy Scan</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
