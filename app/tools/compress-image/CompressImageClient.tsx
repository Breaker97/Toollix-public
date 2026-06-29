"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Loader2, Download, CheckCircle2, Zap, ShieldCheck, Activity, BarChart3, Database, Layers } from "lucide-react";
import JSZip from "jszip";
import { validateUpload, getLimitsForSession } from "@/lib/upload-limits";
import { apiFetch, getFileUrl } from "@/lib/fetcher";
import { useUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProcessItem {
  id: string;
  original: File;
  previewUrl: string;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  status: "idle" | "compressing" | "done" | "error";
  errorStr?: string;
  finalName?: string;
}

export default function CompressImageClient() {
  const { data: session } = useSession();
  const limits = getLimitsForSession(session);

  const [items, setItems] = useState<ProcessItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [outputFormat, setOutputFormat] = useState<string>("original");
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const { upload, status: uploadStatus, reset: resetUpload } = useUpload();
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [globalStatus, setGlobalStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      });
      if (zipUrl) URL.revokeObjectURL(zipUrl);
    };
  }, []);

  useEffect(() => {
    if (globalStatus === "done" && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [globalStatus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
      if (newFiles.length === 0) return;
      const totalFiles = [...items.map(i => i.original), ...newFiles];
      const validation = validateUpload(totalFiles, session, false);
      if (!validation.valid) {
        toast.error(validation.message);
        return;
      }
      setError(null);
      const newItems = newFiles.map(file => ({
        id: Math.random().toString(36).substring(7),
        original: file,
        previewUrl: URL.createObjectURL(file),
        compressedBlob: null,
        compressedUrl: null,
        status: "idle" as const
      }));
      setItems(prev => [...prev, ...newItems]);
    }
  };

  const removeItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach(item => {
       URL.revokeObjectURL(item.previewUrl);
       if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
    setItems([]);
    setGlobalStatus("idle");
    setError(null);
    resetUpload();
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setZipUrl(null);
  };

  const processBatch = async () => {
    if (items.length === 0) return;
    setGlobalStatus("processing");
    setError(null);
    const results = [];
    for (const item of items) {
        if (item.status === "done") {
            results.push({ ...item, name: item.finalName || item.original.name });
            continue;
        }
        setActiveItemId(item.id);
        setItems(prev => prev.map(p => p.id === item.id ? { ...p, status: "compressing" } : p));
        try {
          const formData = new FormData();
          formData.append("file", item.original);
          formData.append("quality", quality.toString());
          if (outputFormat !== "original") formData.append("format", outputFormat);
          const data = await upload("/api/tools/image/compress", formData);
          setItems(prev => prev.map(p => p.id === item.id ? { 
            ...p, 
            status: "done", 
            compressedBlob: data.blob, 
            compressedUrl: data.url,
            finalName: data.filename
          } : p));
          results.push({ ...item, compressedBlob: data.blob, name: data.filename });
        } catch (err: any) {
          setItems(prev => prev.map(p => p.id === item.id ? { ...p, status: "error", errorStr: err.message } : p));
        }
    }
    setActiveItemId(null);
    if (results.length > 1) {
      const zip = new JSZip();
      results.forEach(res => { if (res.compressedBlob) zip.file(res.name, res.compressedBlob); });
      const archive = await zip.generateAsync({ type: "blob" });
      setZipUrl(URL.createObjectURL(archive));
    }
    setGlobalStatus("done");
  };

  const downloadAll = () => {
    if (items.length === 1 && items[0].compressedUrl) {
      const a = document.createElement("a");
      a.href = items[0].compressedUrl;
      a.download = `optimized-${items[0].finalName || items[0].original.name}`;
      a.click();
    } else if (zipUrl) {
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `optimized-assets.zip`;
      a.click();
    }
  };

  const totalOriginalSize = items.reduce((acc, curr) => acc + curr.original.size, 0);
  const totalCompressedSize = items.reduce((acc, curr) => acc + (curr.compressedBlob?.size || curr.original.size), 0);
  const savings = totalOriginalSize - totalCompressedSize;
  const efficiency = totalOriginalSize > 0 ? Math.round((savings / totalOriginalSize) * 100) : 0;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <ToolLayout 
      title="Compress Image" 
      description="Professional batch optimization engine."
      fullWidth={false}
    >
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Workspace Area */}
          <div className="lg:col-span-8 space-y-4">
            <div className={cn(
              "bg-zinc-50 dark:bg-zinc-900/50 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col items-center relative transition-all duration-700 shadow-sm",
              items.length > 0 ? "min-h-[300px] justify-start" : "min-h-[500px] justify-center"
            )}>
               
               {items.length === 0 ? (
                  <div className="flex flex-col items-center gap-6 py-12">
                     <div className="relative group">
                        <div className="absolute -inset-6 bg-[#c5a059]/10 blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-20 h-20 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-[#c5a059] rounded-[1.5rem] flex items-center justify-center shadow-xl">
                           <ImageIcon className="w-8 h-8" />
                        </div>
                     </div>
                     <div className="text-center space-y-1">
                        <h3 className="text-lg font-black uppercase tracking-widest">Load Matrix Assets</h3>
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic opacity-50">JPG, PNG, WEBP</p>
                     </div>
                     <input type="file" multiple accept="image/*" className="hidden" id="image-upload" onChange={handleFileChange} />
                     <Button asChild className="h-14 px-10 rounded-xl bg-[#c5a059] text-white font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all">
                        <label htmlFor="image-upload">Browse Assets</label>
                     </Button>
                  </div>
               ) : (
                  <div className="w-full space-y-6 animate-in fade-in duration-700">
                     
                     {globalStatus === "done" && (
                        <div ref={successRef} className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-[#c5a059]/30 flex flex-col gap-5 shadow-lg relative overflow-hidden">
                           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">Optimization Successful</h3>
                                    <p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.3em] italic">Manifest Generated</p>
                                 </div>
                              </div>
                              <Button onClick={downloadAll} className="h-10 px-6 rounded-lg bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-md transition-all hover:scale-105 active:scale-95 border-none text-[10px] w-full sm:w-auto">
                                 EXPORT ALL {items.length > 1 ? '(ZIP)' : ''}
                              </Button>
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                { label: "Raw Size", value: formatSize(totalOriginalSize), icon: Database },
                                { label: "Efficiency", value: `${efficiency}%`, icon: BarChart3, highlight: true },
                                { label: "Reduction", value: formatSize(savings), icon: Activity },
                                { label: "Net Size", value: formatSize(totalCompressedSize), icon: Zap }
                              ].map((stat, i) => (
                                <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
                                   <div className="flex items-center justify-between">
                                      <stat.icon className={cn("w-3 h-3 opacity-20", stat.highlight && "text-[#c5a059] opacity-50")} />
                                      <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/50">{stat.label}</span>
                                   </div>
                                   <p className={cn("text-xs font-black tracking-tight", stat.highlight ? "text-[#c5a059]" : "text-foreground")}>{stat.value}</p>
                                </div>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar pb-4">
                        {items.map((item) => (
                           <div key={item.id} className="group relative bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                              <div className="aspect-[4/3] relative flex items-center justify-center mb-2 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg overflow-hidden">
                                 <img src={item.compressedUrl || item.previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                                 {item.status === "compressing" && (
                                    <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-[1px] flex items-center justify-center">
                                       <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                                    </div>
                                 )}
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[7px] font-black uppercase tracking-tight truncate text-muted-foreground leading-none">{item.original.name}</p>
                                 <div className="flex justify-between items-center text-[8px] font-black">
                                    <span className="text-slate-400">{formatSize(item.compressedBlob?.size || item.original.size)}</span>
                                    {item.status === "done" && item.compressedBlob && (
                                       <span className="text-[#c5a059]">-{Math.round(((item.original.size - item.compressedBlob.size) / item.original.size) * 100)}%</span>
                                    )}
                                 </div>
                              </div>
                              <button onClick={(e) => removeItem(item.id, e)} className="absolute top-1 right-1 w-6 h-6 bg-white dark:bg-zinc-800 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white border border-zinc-100">
                                 <X className="w-3 h-3" />
                              </button>
                           </div>
                        ))}
                        {items.length < limits.maxFiles && (
                           <label className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-white transition-all group">
                              <PlusCircleIcon className="w-4 h-4 text-zinc-300 group-hover:text-[#c5a059]" />
                              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                           </label>
                        )}
                     </div>
                  </div>
               )}
            </div>

            {items.length > 0 && globalStatus !== "done" && (
                <div className="flex animate-in slide-in-from-bottom-4">
                   <Button 
                    onClick={processBatch}
                    disabled={globalStatus === "processing"}
                    className="w-full h-16 rounded-[1.5rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[11px] font-black uppercase tracking-[0.2em] shadow-lg group transition-all"
                   >
                     {globalStatus === "processing" ? "COMPRESSING..." : "COMPRESS IMAGE"}
                   </Button>
                </div>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <div className={cn(
              "bg-white dark:bg-zinc-950 p-6 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm",
              items.length === 0 && "opacity-40 pointer-events-none grayscale blur-[1px]"
            )}>
               <div className="space-y-0.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-sm font-black text-foreground tracking-tight uppercase">Studio Driver</h2>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic opacity-50">Identity Configuration</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-3">
                     <div className="flex justify-between items-center px-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Quality</label>
                        <span className="text-xs font-black text-[#c5a059]">{quality}%</span>
                     </div>
                     <input 
                        type="range" 
                        min="10" max="100" 
                        value={quality} 
                        onChange={(e) => setQuality(Number(e.target.value))} 
                        className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#c5a059]" 
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Lexicon</label>
                     <div className="grid grid-cols-2 gap-2">
                        {["original", "webp", "jpg", "png"].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setOutputFormat(fmt)}
                            className={cn(
                              "h-10 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all",
                              outputFormat === fmt ? "bg-[#c5a059] text-white shadow-md" : "bg-zinc-50 dark:bg-zinc-900 text-muted-foreground border border-zinc-100 dark:border-zinc-800"
                            )}
                          >
                            {fmt}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100 dark:border-zinc-800">
                  <Activity className="w-3.5 h-3.5 text-[#c5a059] opacity-40" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">DPI Active</span>
               </div>
               <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100 dark:border-zinc-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Safe Enc</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.1); border-radius: 4px; }
      `}</style>
    </ToolLayout>
  );
}

function PlusCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
  );
}
