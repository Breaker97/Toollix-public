"use client";

import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, Scissors, RotateCcw, Loader2, Download, CheckCircle2, 
  Zap, X, Info, ShieldCheck, Layers, FileStack, BarChart3, Activity, Database, Search, UploadCloud
} from "lucide-react";
import nextDynamic from "next/dynamic";
import { useUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";
import { ProcessingOverlay } from "@/components/processing-overlay";

const Document = nextDynamic(() => import("react-pdf").then((mod) => {
  mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;
  return mod.Document;
}), { ssr: false });
const Page = nextDynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

export function SplitPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [mode, setMode] = useState<"fixed" | "custom">("fixed");
  const [fixedInterval, setFixedInterval] = useState(1);
  const [customRanges, setCustomRanges] = useState<string>("1-2, 3-5");
  const [downloadUrls, setDownloadUrls] = useState<{ name: string; url: string }[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "ready" | "processing" | "done">("idle");
  const successRef = useRef<HTMLDivElement>(null);

  const { upload, progress, status, reset: resetUpload } = useUpload();

  // Worker is initialized in dynamic import

  useEffect(() => {
    if (stage === "done" && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [stage]);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      downloadUrls.forEach(d => URL.revokeObjectURL(d.url));
      if (zipUrl) URL.revokeObjectURL(zipUrl);
    };
  }, [fileUrl, downloadUrls, zipUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
      setDownloadUrls([]);
      setZipUrl(null);
      setError(null);
      setTotalPages(null);
      setStage("ready");
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setStage("processing");
    setError(null);
    setDownloadUrls([]);
    setZipUrl(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    if (mode === "fixed") formData.append("interval", fixedInterval.toString());
    else formData.append("ranges", customRanges);
    try {
      const res = await upload("/api/tools/pdf/split", formData);
      if (res.error) { setError(res.error); setStage("ready"); return; }
      if (res.via === "binary") setZipUrl(res.url);
      else if (res.zipUrl) setZipUrl(res.zipUrl);
      if (res.files) setDownloadUrls(res.files);
      setStage("done");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setStage("ready");
    }
  };

  const resetAll = () => {
    setFile(null);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    setTotalPages(null);
    setDownloadUrls([]);
    setZipUrl(null);
    setError(null);
    setStage("idle");
    resetUpload();
  };

  const isProcessing = status === "uploading" || status === "processing";

  return (
    <ToolLayout 
      title="Split PDF" 
      description="Break down large PDF documents with precision."
      fullWidth={false}
    >
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        
        {isProcessing && (
          <ProcessingOverlay 
            status={status} 
            progress={progress} 
            title={status === 'processing' ? 'Extracting' : undefined}
            subtitle={status === 'processing' ? 'Precisely dissecting your document...' : undefined}
          />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
           {/* Controls Sidebar */}
          {!isProcessing && stage !== "done" && (
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
                             <p className="text-[7px] font-bold text-muted-foreground uppercase leading-none opacity-50">Secure Buffer</p>
                           </div>
                           <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                         </div>
                      </label>
                   ) : (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                         <div className="flex items-center gap-3 truncate">
                            <FileText className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                            <div className="truncate">
                               <p className="text-[9px] font-black uppercase tracking-tight truncate leading-none mb-0.5">{file.name}</p>
                               <p className="text-[8px] font-bold text-[#c5a059] uppercase italic opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                    <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl">
                      <button onClick={() => setMode("fixed")} className={cn("py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", mode === "fixed" ? "bg-white dark:bg-zinc-900 text-[#c5a059] shadow-sm" : "text-slate-400")}>Interval</button>
                      <button onClick={() => setMode("custom")} className={cn("py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", mode === "custom" ? "bg-white dark:bg-zinc-900 text-[#c5a059] shadow-sm" : "text-slate-400")}>Custom</button>
                    </div>

                    <div className="space-y-3">
                      {mode === "fixed" ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center px-1">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Pages Per File</Label>
                            <span className="text-xs font-black text-[#c5a059]">{fixedInterval}</span>
                          </div>
                          <Input type="range" min={1} max={totalPages || 10} step={1} value={fixedInterval} onChange={(e) => setFixedInterval(parseInt(e.target.value))} className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#c5a059]" />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Range Map</Label>
                          <Input value={customRanges} onChange={(e) => setCustomRanges(e.target.value)} placeholder="e.g. 1-2, 5" className="bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl h-10 text-[10px] font-black" />
                        </div>
                      )}
                      <Button onClick={handleSplit} disabled={isProcessing || !file} className="w-full h-12 bg-[#c5a059] text-white rounded-xl font-black shadow-lg transition-all active:scale-95 text-[9px] uppercase tracking-[0.2em] border-none">
                        {isProcessing ? "PROCESSING..." : "SPLIT PDF"}
                      </Button>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100 dark:border-zinc-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Certified Safe</span>
                 </div>
                 <div className="bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100 dark:border-zinc-800">
                    <Zap className="w-3.5 h-3.5 text-[#c5a059] opacity-40" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Turbo Speed</span>
                 </div>
              </div>
            </div>
          )}

          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            
            {stage === "done" && (
               <div ref={successRef} className="animate-in zoom-in-95 duration-700 w-full flex flex-col gap-4">
                  <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-[#c5a059]/30 flex flex-col gap-8 shadow-2xl relative overflow-hidden text-center">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-bl-full blur-2xl"></div>
                     <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative z-10">
                        <CheckCircle2 className="w-10 h-10" />
                     </div>
                      <div className="space-y-2 relative z-10">
                         <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">PDF Split Successfully</h3>
                         <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black italic">Your document has been split into individual files</p>
                      </div>
                     
                     <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 relative z-10 w-full px-2">
                        {zipUrl && (
                           <Button onClick={() => {
                               const a = document.createElement("a");
                               a.href = zipUrl;
                               a.download = mode === "fixed" ? "split-pdf.zip" : "extracted-pages.pdf";
                               a.click();
                           }} className="h-16 sm:h-20 px-8 sm:px-12 rounded-2xl bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 border-none text-[10px] sm:text-[11px] w-full sm:w-auto min-w-[200px]">
                               <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" /> DOWNLOAD ALL
                           </Button>
                        )}
                        <Button onClick={resetAll} className="h-16 sm:h-20 px-8 sm:px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all w-full sm:w-auto border-dashed text-muted-foreground min-w-[180px]">
                           <RotateCcw className="w-4 h-4 mr-2" /> RESTART ENGINE
                        </Button>
                     </div>

                     {downloadUrls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                           {downloadUrls.map((d, i) => (
                              <a key={i} href={d.url} download={d.name} className="group flex flex-col items-center gap-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-white transition-all hover:shadow-md">
                                 <FileStack className="w-5 h-5 text-zinc-300 group-hover:text-[#c5a059] transition-colors" />
                                 <span className="text-[8px] font-black uppercase tracking-tight text-center truncate w-full">{d.name.replace('.pdf', '')}</span>
                              </a>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            )}

            <div className={cn(
               "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] min-h-[400px] lg:min-h-[500px] p-5 flex flex-col relative shadow-sm overflow-hidden",
               (stage === "done" || isProcessing) && "hidden"
            )}>
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Matrix</span>
                    <p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">Extraction Feed</p>
                  </div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" /> Live
                  </div>
               </div>

               <div className="flex-1 flex flex-col">
                  {!file ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                        <Layers className="w-12 h-12 text-zinc-300 mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest italic text-zinc-400">Awaiting Resource</p>
                    </div>
                  ) : (
                     <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700">
                        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-[2rem] p-4 sm:p-8 border border-zinc-100 dark:border-zinc-800/50 shadow-inner">
                           <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar pb-6 p-2">
                              {Array.from({ length: totalPages || 1 }).slice(0, 24).map((_, i) => (
                                 <div key={i} className="aspect-[1/1.41] bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden ring-1 ring-black/5">
                                    <Document 
                                      file={file} 
                                      onLoadSuccess={onDocumentLoadSuccess} 
                                      className="w-full h-full flex items-center justify-center" 
                                      loading={<div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900"><Loader2 className="w-4 h-4 animate-spin text-[#c5a059] opacity-20" /></div>}
                                    >
                                       <Page 
                                         pageNumber={i + 1} 
                                         width={220} 
                                         renderTextLayer={false} 
                                         renderAnnotationLayer={false} 
                                         className="w-full h-full object-contain" 
                                       />
                                    </Document>
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center">
                                       <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-sm">PAGE {i + 1}</span>
                                    </div>
                                 </div>
                              ))}
                              {totalPages && totalPages > 24 && (
                                <div className="aspect-[1/1.41] bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 opacity-50">
                                  <FileStack className="w-8 h-8 text-zinc-300" />
                                  <p className="text-xl font-black text-zinc-400">+{totalPages - 24}</p>
                                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Pages Cached</p>
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
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
