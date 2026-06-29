"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ToolLayout } from "@/components/tool-layout";
import { validateUpload } from "@/lib/upload-limits";
import { Button } from "@/components/ui/button";
import { UploadCloud, Download, Loader2, Image as ImageIcon, Sparkles, RefreshCw, Check, CheckCircle2, Zap, ShieldCheck, Activity, Database, BarChart3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleActionResponse } from "@/lib/fetcher";
import { convertImageAction } from "./actions";

const FORMATS = ["jpg", "png", "webp", "avif", "tiff", "gif"];

export function ConvertImageClient() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState("webp");
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const successRef = useRef<HTMLDivElement>(null);

  const srcExt = file?.name.split(".").pop()?.toLowerCase() ?? "";

  useEffect(() => {
    if (result && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [result]);

  const handleFile = (f: File) => {
    const validation = validateUpload([f], session);
    if (!validation.valid) { setError(validation.message); return; }
    setFile(f); setResult(null); setError(null);
    setPreview(URL.createObjectURL(f));
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const other = FORMATS.find(fm => fm !== ext && !(fm === "jpg" && ext === "jpeg"));
    setTargetFormat(other || "webp");
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("format", targetFormat); fd.append("quality", String(quality));
      const data = await convertImageAction(fd);
      const { url, blob } = handleActionResponse(data);
      setResult({ url, size: blob?.size || 0 });
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const resetAll = () => {
    setFile(null); if (preview) URL.revokeObjectURL(preview);
    setPreview(null); setResult(null); setError(null);
  };

  return (
    <ToolLayout title="Image Converter" description="Professional format evolution studio." fullWidth={false}>
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 space-y-5 shadow-sm">
               <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Resource Buffer</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 01</p></div>
               {!file ? (
                  <label className="w-full group cursor-pointer block">
                     <div className="relative rounded-xl p-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-center space-y-3 transition-all hover:bg-white">
                       <UploadCloud className="w-4 h-4 text-[#c5a059]" />
                       <div className="space-y-0.5"><p className="text-[9px] font-black uppercase tracking-widest">Select Image</p><p className="text-[7px] font-bold text-muted-foreground uppercase leading-none opacity-50">JPG, PNG, WEBP</p></div>
                       <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                     </div>
                  </label>
               ) : (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg border border-zinc-100 flex items-center justify-between">
                     <div className="flex items-center gap-3 truncate">
                        <ImageIcon className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                        <div className="truncate"><p className="text-[9px] font-black uppercase tracking-tight truncate leading-none mb-0.5">{file.name}</p><p className="text-[8px] font-bold text-[#c5a059] uppercase italic opacity-60">Loaded</p></div>
                     </div>
                     <button onClick={resetAll} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
               )}
            </div>

            <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 rounded-[1.5rem] p-5 space-y-5 shadow-sm transition-all", !file && "opacity-40 grayscale blur-[1px]")}>
               <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Format Matrix</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 02</p></div>
               <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                     {FORMATS.filter(f => f !== srcExt && !(f === "jpg" && srcExt === "jpeg")).map(f => (
                        <button key={f} onClick={() => setTargetFormat(f)} className={cn("h-10 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all", targetFormat === f ? "bg-[#c5a059] text-white shadow-md" : "bg-zinc-50 text-muted-foreground border border-zinc-100")}>{f}</button>
                     ))}
                  </div>
                  {(targetFormat === "jpg" || targetFormat === "webp" || targetFormat === "avif") && (
                     <div className="space-y-3">
                        <div className="flex justify-between items-center px-1"><label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Quality</label><span className="text-xs font-black text-[#c5a059]">{quality}%</span></div>
                        <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full h-1 bg-zinc-100 rounded-full appearance-none accent-[#c5a059]" />
                     </div>
                  )}
                  <Button onClick={handleConvert} disabled={loading || !file} className="w-full h-12 bg-[#c5a059] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95">
                    {loading ? "CONVERTING..." : "CONVERT IMAGE"}
                  </Button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Safe Enc</span></div>
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><Zap className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Turbo Net</span></div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            {result && (
              <div ref={successRef} className="animate-in zoom-in-95 duration-700 w-full">
                 <div className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-[#c5a059]/30 flex flex-col gap-5 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner"><CheckCircle2 className="w-5 h-5" /></div>
                          <div><h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">Evolution Complete</h3><p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.3em] italic leading-none">High-Fidelity Manifest Generated</p></div>
                       </div>
                       <a href={result.url} download={`converted-toollix.${targetFormat}`} className="w-full sm:w-auto"><Button className="h-10 px-8 rounded-lg bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-md text-[10px] w-full sm:w-auto">DOWNLOAD {targetFormat.toUpperCase()}</Button></a>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Raw Size", value: `${(file!.size / 1024).toFixed(1)} KB`, icon: Database },
                          { label: "Efficiency", value: `${Math.round((1 - result.size / file!.size) * 100)}%`, icon: BarChart3, highlight: true },
                          { label: "Reduction", value: `${((file!.size - result.size) / 1024).toFixed(1)} KB`, icon: Activity },
                          { label: "Net Size", value: `${(result.size / 1024).toFixed(1)} KB`, icon: Zap }
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

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 rounded-[1.5rem] min-h-[400px] lg:min-h-[500px] p-5 flex flex-col relative shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                  <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Matrix</span><p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">Format Evolution</p></div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" /> Live</div>
               </div>
               <div className="flex-1 flex flex-col">
                  {!file ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20"><ImageIcon className="w-12 h-12 text-zinc-300 mb-4" /><p className="text-xs font-black uppercase tracking-widest italic text-zinc-400">Awaiting Resource</p></div>
                  ) : (
                    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 items-center justify-center">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                          <div className="space-y-3">
                             <label className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1 italic">Source</label>
                             <div className="aspect-square bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 flex items-center justify-center p-6 overflow-hidden">
                                <img src={preview!} alt="Original" className="max-h-full max-w-full object-contain rounded-xl drop-shadow-lg" />
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[8px] font-black uppercase tracking-[0.3em] text-[#c5a059] ml-1 italic">Phase</label>
                             <div className={cn("aspect-square rounded-2xl border border-zinc-100 flex items-center justify-center p-6 overflow-hidden relative", !result ? "bg-zinc-50/50" : "bg-white")}>
                                {result ? <img src={result.url} alt="Converted" className="max-h-full max-w-full object-contain drop-shadow-xl animate-in zoom-in-95 duration-700" /> : <Loader2 className={cn("w-8 h-8", loading ? "animate-spin text-[#c5a059]" : "text-zinc-200")} />}
                             </div>
                          </div>
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
