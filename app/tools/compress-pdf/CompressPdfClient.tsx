"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  RotateCcw, 
  Loader2, 
  UploadCloud,
  CheckCircle2,
  Minimize2,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Database,
  Search,
  Activity,
  BarChart3,
  Layers,
  Info,
  X
} from 'lucide-react';
import nextDynamic from "next/dynamic";
import { useUpload } from "@/hooks/use-upload";
import { ProcessingOverlay } from "@/components/processing-overlay";
import { validateUpload, getLimitsForSession } from "@/lib/upload-limits";
import { cn } from "@/lib/utils";

const Document = nextDynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = nextDynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

const LEVELS = [
  {
    key: "low" as const,
    label: "Basic",
    icon: Minimize2,
    desc: "Web Ready",
    badge: "-20%",
  },
  {
    key: "medium" as const,
    label: "Recommended",
    icon: Zap,
    desc: "Balanced",
    badge: "-50%",
  },
  {
    key: "high" as const,
    label: "Extreme",
    icon: Sparkles,
    desc: "Smallest",
    badge: "-85%",
  }
];

function fmtSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function CompressPdfClient() {
  const { data: session } = useSession();
  const limits = getLimitsForSession(session);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [result, setResult] = useState<{
    url: string;
    origSize: number;
    compSize: number;
    saved: number;
  } | null>(null);

  const { upload, progress, status, error: uploadError, reset: resetUpload } = useUpload();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;
    });
  }, []);

  useEffect(() => {
    if (result && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [result]);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [fileUrl, result?.url]);

  const handleFile = (f: File) => {
    const validation = validateUpload([f], session, true); 
    if (!validation.valid) {
      setLocalError(validation.message);
      return;
    }
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(f);
    setFileUrl(URL.createObjectURL(f));
    setResult(null);
    setTotalPages(null);
    setLocalError(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);
    setLocalError(null);
    try {
      const assetPrepRes = await fetch('/api/tools/pdf/upload-url', { method: 'POST' });
      const assetData = await assetPrepRes.json();
      if (assetData.error) throw new Error(assetData.error);
      const { uploadUri, assetId } = assetData;
      await upload(uploadUri, file, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' } 
      });
      
      const fd = new FormData();
      fd.append('assetId', assetId);
      fd.append('level', compressionLevel);
      const res = await fetch('/api/tools/pdf/compress', {
        method: 'POST',
        body: fd
      });
      const resData = await res.json();
      if (resData.url) {
        setResult({
          url: resData.url,
          origSize: resData.originalSize || file.size,
          compSize: resData.compressedSize || 0,
          saved: resData.savedPercent || Math.round((1 - ((resData.compressedSize || 0) / file.size)) * 100) || 0
        });
      } else if (resData.error) throw new Error(resData.error);
    } catch (e: any) {
      setLocalError(e.message || "An unexpected error occurred.");
    } finally {
      setIsCompressing(false);
    }
  };

  const resetAll = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(null);
    setFileUrl(null);
    setTotalPages(null);
    setResult(null);
    setLocalError(null);
    resetUpload();
  };

  const isProcessing = status === "uploading" || status === "processing" || isCompressing;

  return (
    <ToolLayout 
      title="PDF Compression Studio" 
      description="Professional document optimization engine."
      fullWidth={false}
    >
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        
        {isProcessing && (
          <ProcessingOverlay 
            status={status} 
            progress={progress} 
            title={status === 'processing' ? 'Compressing' : undefined}
            subtitle={status === 'processing' ? 'Aggressively optimizing document density...' : undefined}
          />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
           {/* Controls Sidebar */}
          {!isProcessing && !result && (
            <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 lg:sticky lg:top-24 animate-in fade-in slide-in-from-left-4 duration-500">
              
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 space-y-5 shadow-sm">
                 <div className="flex flex-col gap-0.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Resource Buffer</span>
                      <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 01</p>
                 </div>

                 <div className="space-y-4">
                   {!file ? (
                      <label className="w-full relative group cursor-pointer block">
                         <div className="relative rounded-xl p-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-100 dark:border-zinc-700 flex flex-col items-center justify-center text-center space-y-3 transition-all hover:bg-white dark:hover:bg-zinc-800">
                           <UploadCloud className="w-4 h-4 text-[#c5a059]" />
                           <div className="space-y-0.5">
                             <p className="text-[9px] font-black uppercase tracking-widest">Select PDF</p>
                             <p className="text-[7px] font-bold text-muted-foreground uppercase leading-none opacity-50">Max 100MB</p>
                           </div>
                           <input type="file" accept=".pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                         </div>
                      </label>
                   ) : (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                         <div className="flex items-center gap-3 truncate">
                            <FileText className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                            <div className="truncate">
                               <p className="text-[9px] font-black uppercase tracking-tight truncate leading-none mb-0.5">{file.name}</p>
                               <p className="text-[8px] font-bold text-[#c5a059] uppercase italic opacity-60">{fmtSize(file.size)}</p>
                            </div>
                         </div>
                         <button onClick={resetAll} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded transition-colors">
                            <X className="w-3 h-3" />
                         </button>
                      </div>
                   )}
                 </div>
              </div>

              <div className={cn(
                  "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 space-y-5 shadow-sm transition-all",
                  !file && "opacity-40 pointer-events-none grayscale blur-[1px]"
              )}>
                 <div className="flex flex-col gap-0.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Strategy Matrix</span>
                      <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 02</p>
                 </div>

                 <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      {LEVELS.map((lvl) => (
                        <button
                          key={lvl.key}
                          onClick={() => setCompressionLevel(lvl.key)}
                          className={cn(
                            "w-full p-2.5 rounded-lg text-left transition-all border flex items-center gap-3 group/btn",
                            compressionLevel === lvl.key 
                              ? "bg-[#c5a059]/5 border-[#c5a059] text-foreground shadow-sm" 
                              : "bg-zinc-50 dark:bg-zinc-800 border-transparent text-muted-foreground hover:bg-white dark:hover:bg-zinc-700"
                          )}
                        >
                          <div className={cn(
                              "w-7 h-7 rounded-md flex items-center justify-center transition-colors shadow-sm shrink-0",
                              compressionLevel === lvl.key ? "bg-[#c5a059] text-white" : "bg-white dark:bg-zinc-900"
                          )}>
                              <lvl.icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-0.5">{lvl.label}</p>
                            <p className="text-[7px] font-bold opacity-40 uppercase tracking-widest truncate">{lvl.desc}</p>
                          </div>
                          <div className={cn(
                              "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest",
                              compressionLevel === lvl.key ? "bg-[#c5a059] text-white" : "bg-zinc-200 dark:bg-zinc-900 text-muted-foreground/40"
                          )}>
                              {lvl.badge}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Button 
                        onClick={handleCompress}
                        disabled={isProcessing || !file}
                        className="w-full h-12 bg-[#c5a059] text-white rounded-xl font-black shadow-lg transition-all active:scale-95 text-[9px] uppercase tracking-[0.2em] border-none"
                      >
                        {isProcessing ? "PROCESSING..." : "COMPRESS PDF"}
                      </Button>
                      {localError && <p className="text-[8px] font-bold text-red-500 uppercase text-center">{localError}</p>}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100 dark:border-zinc-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Safe Isolation</span>
                 </div>
                 <div className="bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100 dark:border-zinc-800">
                    <Zap className="w-3.5 h-3.5 text-[#c5a059] opacity-40" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Turbo Protocol</span>
                 </div>
              </div>
            </div>
          )}

          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            
             {result && (
                <div ref={successRef} className="animate-in zoom-in-95 duration-700 w-full flex flex-col gap-4 max-w-2xl mx-auto">
                   <div className="bg-white dark:bg-zinc-950 p-6 sm:p-10 rounded-[2.5rem] border border-[#c5a059]/30 flex flex-col gap-6 shadow-2xl relative overflow-hidden text-center">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-bl-full blur-2xl opacity-50"></div>
                      
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative z-10">
                         <CheckCircle2 className="w-8 h-8" />
                      </div>

                      <div className="space-y-2 relative z-10">
                         <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none">Optimization Complete</h3>
                         <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black italic opacity-60">High-Fidelity Manifest Verified</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10 w-full px-2">
                         <Button onClick={() => {
                              const a = document.createElement("a");
                              a.href = result.url;
                              a.download = `${file?.name.replace('.pdf', '')}-optimized.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                         }} className="h-14 sm:h-16 px-6 sm:px-8 rounded-xl bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 border-none text-[9px] sm:text-[10px] w-full sm:w-auto">
                            <Download className="w-4 h-4 mr-2" /> DOWNLOAD RESULT
                         </Button>
                         <Button onClick={resetAll} className="h-14 sm:h-16 px-6 sm:px-8 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 border-zinc-100 dark:border-zinc-800 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all w-full sm:w-auto border-dashed text-muted-foreground">
                            <RotateCcw className="w-4 h-4 mr-2" /> RESTART
                         </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                         {[
                           { label: "Raw Size", value: fmtSize(result.origSize), icon: Database },
                           { label: "Efficiency", value: `${result.saved}%`, icon: BarChart3, highlight: true },
                           { label: "Reduction", value: fmtSize(result.origSize - result.compSize), icon: Activity },
                           { label: "Net Size", value: fmtSize(result.compSize), icon: Zap }
                         ].map((stat, i) => (
                           <div key={i} className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100/50 dark:border-zinc-800/50 flex flex-col gap-1 text-left">
                              <div className="flex items-center justify-between">
                                 <stat.icon className={cn("w-3 h-3 opacity-20", stat.highlight && "text-[#c5a059] opacity-40")} />
                                 <span className="text-[7px] font-black uppercase tracking-[0.1em] text-muted-foreground/50">{stat.label}</span>
                              </div>
                              <p className={cn("text-[11px] font-black tracking-tight", stat.highlight ? "text-[#c5a059]" : "text-foreground")}>{stat.value}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             )}

            <div className={cn(
               "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] min-h-[400px] lg:min-h-[500px] p-5 flex flex-col relative shadow-sm overflow-hidden",
               (result || isProcessing) && "hidden"
            )}>
               
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Matrix</span>
                    <p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">Extraction Feed</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" /> Live
                     </div>
                  </div>
               </div>

               <div className="flex-1 flex flex-col">
                  {!file ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                        <Layers className="w-12 h-12 text-zinc-300 mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest italic text-zinc-400">Awaiting Resource</p>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
                       <div className="flex justify-between items-center px-2">
                          <label className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Preview Protocol</label>
                       </div>
                       
                       <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl p-4 sm:p-6 border border-zinc-100 dark:border-zinc-800/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar pb-2">
                             {Array.from({ length: totalPages || 1 }).slice(0, 12).map((_, i) => (
                                <div key={i} className="aspect-[1/1.41] bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800 hover:-translate-y-1 transition-transform relative group">
                                   <Document 
                                     file={fileUrl} 
                                     onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
                                     className="w-full h-full"
                                     loading={<div className="w-full h-full flex items-center justify-center"><Loader2 className="w-3 h-3 animate-spin text-zinc-200" /></div>}
                                   >
                                      <Page pageNumber={i + 1} width={120} renderTextLayer={false} renderAnnotationLayer={false} className="w-full h-full" />
                                   </Document>
                                   <div className="absolute bottom-0 inset-x-0 h-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-[6px] font-black uppercase tracking-widest text-muted-foreground">P. {i + 1}</span>
                                   </div>
                                </div>
                             ))}
                             {totalPages && totalPages > 12 && (
                                <div className="aspect-[1/1.41] bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center">
                                   <p className="text-lg font-black text-muted-foreground/10">+{totalPages - 12}</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                  )}
               </div>

               <div className="absolute bottom-5 right-5 flex items-center gap-2 hidden sm:flex opacity-30">
                    <p className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground">Toollix Engine</p>
                    <Zap className="w-3 h-3 text-[#c5a059]" />
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
