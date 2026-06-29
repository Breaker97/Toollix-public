"use client";

import { apiFetch, getFileUrl } from "@/lib/fetcher";
import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { UploadCloud, Crop as CropIcon, Download, Loader2, RotateCcw, Check, Image as ImageIcon, CheckCircle2, Zap, ShieldCheck, Layers, Database, Activity, BarChart3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactCrop, { type Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function CropImageClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [aspectStr, setAspectStr] = useState<string>("free");
  const [format, setFormat] = useState("jpg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [result]);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    setCompletedCrop(null);
    setCrop(undefined);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    let initialAspect = undefined;
    if (aspectStr === "1:1") initialAspect = 1;
    else if (aspectStr === "16:9") initialAspect = 16 / 9;
    else if (aspectStr === "4:3") initialAspect = 4 / 3;
    if (initialAspect) {
      setCrop(centerAspectCrop(width, height, initialAspect));
    } else {
      setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
    }
  };

  const applyAspect = (newAspectStr: string) => {
    setAspectStr(newAspectStr);
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    if (newAspectStr === "free") {
      setCrop(prev => prev ? { ...prev } : undefined);
      return;
    }
    let a = 1;
    if (newAspectStr === "16:9") a = 16 / 9;
    if (newAspectStr === "4:3") a = 4 / 3;
    if (newAspectStr === "1:1") a = 1;
    setCrop(centerAspectCrop(width, height, a));
  };

  const handleCrop = async () => {
    if (!file || !completedCrop || !imgRef.current) return;
    setLoading(true); setError(null); setResult(null);
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const realCrop = {
      left: Math.round(completedCrop.x * scaleX),
      top: Math.round(completedCrop.y * scaleY),
      width: Math.round(completedCrop.width * scaleX),
      height: Math.round(completedCrop.height * scaleY),
    };
    if (realCrop.width === 0 || realCrop.height === 0) {
      setError("Invalid region."); setLoading(false); return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("left", String(realCrop.left));
      fd.append("top", String(realCrop.top));
      fd.append("width", String(realCrop.width));
      fd.append("height", String(realCrop.height));
      fd.append("format", format);
      const res = await apiFetch("/api/tools/image/crop", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Crop failed");
      const { url } = await getFileUrl(res);
      setResult(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setCrop(undefined);
    setCompletedCrop(null);
  };

  return (
    <ToolLayout title="Crop Image" description="Pixel-perfect geometric extraction studio." fullWidth={false}>
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 lg:sticky lg:top-24">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 space-y-5 shadow-sm">
               <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Resource Buffer</span>
                    <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 01</p>
               </div>
               {!file ? (
                  <label className="w-full group cursor-pointer block">
                     <div className="relative rounded-xl p-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-center space-y-3 transition-all hover:bg-white">
                       <UploadCloud className="w-4 h-4 text-[#c5a059]" />
                       <div className="space-y-0.5">
                         <p className="text-[9px] font-black uppercase tracking-widest">Select Image</p>
                         <p className="text-[7px] font-bold text-muted-foreground uppercase leading-none opacity-50">JPG, PNG, WEBP</p>
                       </div>
                       <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                     </div>
                  </label>
               ) : (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg border border-zinc-100 flex items-center justify-between">
                     <div className="flex items-center gap-3 truncate">
                        <ImageIcon className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                        <div className="truncate">
                           <p className="text-[9px] font-black uppercase tracking-tight truncate leading-none mb-0.5">{file.name}</p>
                           <p className="text-[8px] font-bold text-[#c5a059] uppercase italic opacity-60">Asset Loaded</p>
                        </div>
                     </div>
                     <button onClick={resetAll} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
               )}
            </div>

            <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 rounded-[1.5rem] p-5 space-y-5 shadow-sm transition-all", !file && "opacity-40 grayscale blur-[1px]")}>
               <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Geometric Matrix</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 02</p></div>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                     {["free", "1:1", "16:9", "4:3"].map(a => (
                        <button key={a} onClick={() => applyAspect(a)} className={cn("h-10 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all", aspectStr === a ? "bg-[#c5a059] text-white shadow-md" : "bg-zinc-50 text-muted-foreground border border-zinc-100")}>{a}</button>
                     ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                      {[ { l: 'W', v: completedCrop?.width }, { l: 'H', v: completedCrop?.height } ].map((c, i) => (
                        <div key={i} className="relative h-10 flex items-center pl-8 pr-3 rounded-lg bg-zinc-50 font-mono text-[9px] font-black text-[#c5a059] border border-zinc-100">
                           <span className="absolute left-3 text-[8px] opacity-30 text-muted-foreground uppercase">{c.l}</span>
                           {c.v ? Math.round(c.v) : '0'}
                        </div>
                      ))}
                  </div>
                  <Button onClick={handleCrop} disabled={loading || !completedCrop?.width} className="w-full h-12 bg-[#c5a059] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg">
                    {loading ? "CROPPING..." : "CROP IMAGE"}
                  </Button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Safe Iso</span></div>
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><Zap className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Turbo Enc</span></div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            {result && (
              <div ref={successRef} className="animate-in zoom-in-95 duration-700 w-full">
                 <div className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-[#c5a059]/30 flex flex-col gap-5 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
                       <div className="flex items-center gap-4 min-w-fit">
                          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner"><CheckCircle2 className="w-5 h-5" /></div>
                          <div><h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">Extraction Complete</h3><p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.3em] italic leading-none">Geometric Mask Applied</p></div>
                       </div>
                       <div className="flex gap-2 w-full sm:w-auto items-center justify-center sm:justify-end">
                          <Button onClick={resetAll} variant="outline" className="h-10 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 shrink-0">NEW IMAGE</Button>
                          <a href={result} download={`cropped-toollix.${format}`} className="sm:flex-none"><Button className="h-10 px-4 rounded-lg bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-md text-[9px] shrink-0 w-full sm:w-auto">EXPORT FRAGMENT</Button></a>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 rounded-[1.5rem] min-h-[400px] lg:min-h-[500px] p-5 flex flex-col relative shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                  <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Matrix</span><p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">Extraction Feed</p></div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" /> Live Feed</div>
               </div>
               <div className="flex-1 flex flex-col items-center">
                  {!file ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20"><Layers className="w-12 h-12 text-zinc-300 mb-4" /><p className="text-xs font-black uppercase tracking-widest italic text-zinc-400">Awaiting Resource</p></div>
                  ) : (
                    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 items-center">
                       <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl p-4 sm:p-8 border border-zinc-100 w-full flex items-center justify-center">
                          {previewUrl && (
                             <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={(c) => setCompletedCrop(c)} aspect={aspectStr === "1:1" ? 1 : aspectStr === "16:9" ? 16 / 9 : aspectStr === "4:3" ? 4 / 3 : undefined} className="max-h-[500px]">
                                <img ref={imgRef} src={previewUrl} alt="Preview" onLoad={onImageLoad} className="max-h-[500px] w-auto block object-contain shadow-2xl rounded-xl" />
                             </ReactCrop>
                          )}
                       </div>
                       <div className="flex gap-2 w-full max-w-xs">
                          {["jpg", "png", "webp"].map(f => (
                             <button key={f} onClick={() => setFormat(f)} className={cn("flex-1 h-9 text-[8px] font-black rounded-lg uppercase tracking-widest transition-all", format === f ? "bg-[#c5a059] text-white" : "bg-zinc-100 text-muted-foreground")}>{f}</button>
                          ))}
                       </div>
                    </div>
                  )}
               </div>
            </div>
            {result && <Button onClick={resetAll} variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground font-black text-[8px] uppercase tracking-widest border-2 border-dashed">RESTART STUDIO</Button>}
          </div>
        </div>
      </div>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.1); border-radius: 4px; }`}</style>
    </ToolLayout>
  );
}
