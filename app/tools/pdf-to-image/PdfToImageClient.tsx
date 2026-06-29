"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileText, Download, Loader2, Image as ImageIcon, CheckCircle2, ChevronRight, Monitor, Zap, Printer, X, ShieldCheck, FileImage, RotateCcw } from "lucide-react";
import nextDynamic from "next/dynamic";
import JSZip from "jszip";
import { SmartText } from "@/components/ui/smart-text";
import { cn } from "@/lib/utils";
import { ProcessingOverlay } from "@/components/processing-overlay";

const Document = nextDynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = nextDynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

export function PdfToImageClient() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  const [pagesOpt, setPagesOpt] = useState<"all" | "first">("first");
  const [dpi, setDpi] = useState(150);
  const [format, setFormat] = useState<"png" | "jpg">("png");
  
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleFile = (f: File) => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(f);
    setFileUrl(URL.createObjectURL(f));
    setImages([]);
    setError(null);
    setProgress(0);
    setTotalPages(0);
  };

  const handleConvert = async () => {
    if (!fileUrl || !totalPages) return;
    setLoading(true);
    setError(null);
    setImages([]);
    setProgress(1);

    try {
      const { pdfjs } = await import("react-pdf");
      const loadingTask = pdfjs.getDocument(fileUrl);
      const pdf = await loadingTask.promise;

      const pageIndexes = pagesOpt === "first" 
        ? [1] 
        : Array.from({ length: totalPages }, (_, i) => i + 1);

      const generated: string[] = [];
      const scale = Math.min(4, dpi / 72); // Cap at 4x scale for stability

      for (let i = 0; i < pageIndexes.length; i++) {
        const pageNum = pageIndexes[i];
        setProgress(Math.round(((i + 1) / pageIndexes.length) * 100));

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not create canvas context");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas
        };

        await page.render(renderContext).promise;

        const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
        const quality = format === "jpg" ? 0.9 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        generated.push(dataUrl);
        canvas.width = 0;
        canvas.height = 0;
      }

      setImages(generated);
      setProgress(100);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to rasterize PDF pages");
    } finally {
      setLoading(false);
    }
  };

  const downloadImg = (dataUrl: string, idx: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${file?.name.replace('.pdf', '')}-p${idx + 1}.${format}`;
    a.click();
  };

  const downloadAllZip = async () => {
    if (!images.length) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      images.forEach((dataUrl, i) => {
        const base64Data = dataUrl.split(',')[1];
        zip.file(`p${i + 1}-${file?.name.replace('.pdf', '')}.${format}`, base64Data, { base64: true });
      });
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name.replace('.pdf', '')}-to-images.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Zipping error:", e);
    } finally {
      setZipping(false);
    }
  };

  return (
    <ToolLayout title="PDF to Image" description="Convert PDF pages into high-resolution PNG or JPG images instantly." fullWidth>
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {loading && (
          <ProcessingOverlay 
            status="processing" 
            progress={{ percent: progress, speed: 0 }} 
            title="Rasterizing"
            subtitle="Transforming document pages into high-fidelity imagery..."
          />
        )}
        
        {images.length > 0 && !loading && (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-700 w-full mb-20 space-y-12">
            <div className="bg-white dark:bg-zinc-950 rounded-[3rem] p-8 sm:p-16 text-center space-y-12 shadow-2xl border border-[#c5a059]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 rounded-bl-full blur-3xl opacity-50"></div>
                
                <div className="space-y-4 relative z-10">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner mb-6">
                     <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Extraction Complete</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black italic">
                    High-Fidelity Imagery Manifest Generated & Verified
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 max-w-3xl mx-auto">
                    <div className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center">
                        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Source Size</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{(file?.size || 0) > 1024 * 1024 ? `${(file!.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(file!.size / 1024)} KB`}</p>
                    </div>
                    
                    <div className="p-8 rounded-[2.5rem] bg-[#c5a059] text-white shadow-xl flex flex-col items-center justify-center scale-110">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Images</p>
                        <p className="text-6xl font-black leading-none">{images.length}</p>
                    </div>
                    
                    <div className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center">
                        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Density</p>
                        <p className="text-2xl font-black text-[#c5a059]">{format.toUpperCase()} · {dpi}</p>
                    </div>
                </div>

                <div className="max-w-xl mx-auto space-y-6 pt-6 relative z-10">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {images.length > 1 ? (
                      <button 
                        onClick={downloadAllZip} disabled={zipping}
                        className="w-full sm:flex-1 h-16 sm:h-20 text-sm font-black tracking-widest rounded-2xl bg-[#c5a059] text-white flex items-center justify-center gap-3 uppercase shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                         {zipping ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />} 
                         {zipping ? "PACKING..." : "DOWNLOAD ALL AS ZIP"}
                      </button>
                    ) : (
                      <button 
                        onClick={() => downloadImg(images[0], 0)}
                        className="w-full sm:flex-1 h-16 sm:h-20 text-sm font-black tracking-widest rounded-2xl bg-[#c5a059] text-white flex items-center justify-center gap-3 uppercase shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                         <Download className="w-6 h-6" /> DOWNLOAD IMAGE
                      </button>
                    )}
                    <button 
                      onClick={() => { setImages([]); setFile(null); setFileUrl(null); }} 
                      className="w-full sm:w-auto px-8 h-16 sm:h-20 rounded-2xl font-black bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200"
                    >
                       <RotateCcw className="w-4 h-4" /> RESTART
                    </button>
                  </div>
                </div>
            </div>

            {/* Individual Images Display */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8 italic text-center opacity-40">Individual Pages</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
                {images.map((img, i) => (
                  <div key={i} className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 shadow-soft-xl border border-border/40 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col gap-4">
                     <div className="relative aspect-[1/1.4] rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-900 border border-border/20 shadow-inner">
                        <img src={img} alt={`Page ${i+1}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">P.{i+1}</div>
                     </div>
                     <button 
                        onClick={() => downloadImg(img, i)}
                        className="w-full h-14 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-[#c5a059] hover:text-white transition-all duration-300 font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 group/btn border border-zinc-100 dark:border-zinc-800"
                     >
                        <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" /> Save Page {i+1}
                     </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

        {images.length === 0 && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Left Column: Preview & Upload */}
            <div className="lg:col-span-9 space-y-6">
              {!file ? (
                <div 
                  className="drop-zone rounded-2xl text-center cursor-pointer relative overflow-hidden group p-12 md:p-16 animate-in fade-in zoom-in-95"
                  onClick={() => document.getElementById('pdf-to-img-input')?.click()}
                >
                  <input 
                    type="file" 
                    id="pdf-to-img-input" 
                    accept="application/pdf" 
                    className="hidden" 
                    onChange={e => { if(e.target.files?.[0]) handleFile(e.target.files[0]); }} 
                  />
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-14 h-14 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 shadow-sm text-[#c5a059] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Upload Your PDF</h3>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm mb-6">Drag and drop your file here or click the button below</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); document.getElementById('pdf-to-img-input')?.click(); }}
                      className="btn-suite px-8 py-3 rounded-lg font-bold text-xs tracking-widest uppercase"
                    >
                      Choose Files
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Active File Card */}
                  <div className="suite-card rounded-[2.5rem] p-6 flex items-center gap-6 animate-in slide-in-from-left-4 duration-500">
                    <div className="w-20 h-20 bg-[#c5a059]/10 text-[#c5a059] rounded-2xl flex items-center justify-center shrink-0">
                      <FileText className="w-10 h-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white truncate tracking-tight">{file.name}</h4>
                      <p className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · {totalPages || "..."} Pages detected
                      </p>
                    </div>
                    <button 
                       onClick={() => { setFile(null); setFileUrl(null); setTotalPages(0); }}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rotate-0 hover:rotate-90"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Document Preview Area */}
                  <div className="suite-card rounded-[2.5rem] p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800 pb-4">
                      <h3 className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-[#c5a059]" /> Document Preview
                      </h3>
                    </div>

                    {fileUrl && !totalPages && (
                      <div className="hidden">
                        <Document file={fileUrl} onLoadSuccess={({numPages}) => setTotalPages(numPages)} />
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[700px] overflow-y-auto pr-6 custom-scrollbar pb-8 p-2">
                      {Array.from({ length: totalPages || 0 }).map((_, i) => (
                        <div key={i} className={cn("relative rounded-[2.5rem] overflow-hidden shadow-soft-xl bg-white aspect-[1/1.41] group border transition-all duration-500", (pagesOpt === "first" && i > 0) ? "opacity-30 grayscale border-zinc-50" : "border-zinc-200 dark:border-zinc-700 hover:-translate-y-3 hover:shadow-2xl hover:border-[#c5a059]/40")}>
                          <Document
                            file={fileUrl}
                            loading={<div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900"><Loader2 className="w-6 h-6 animate-spin text-[#c5a059] opacity-20" /></div>}
                            className="w-full h-full flex items-center justify-center"
                          >
                            <Page 
                              pageNumber={i + 1} 
                              width={280} 
                              renderTextLayer={false} 
                              renderAnnotationLayer={false}
                              className="w-full h-full object-contain"
                            />
                          </Document>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center">
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md">PAGE {i + 1}</span>
                          </div>
                        </div>
                      ))}
                      {(!totalPages || totalPages === 0) && (
                        <div className="col-span-full py-20 text-center space-y-4">
                           <Loader2 className="w-10 h-10 animate-spin text-[#c5a059] mx-auto opacity-20" />
                           <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest animate-pulse">Initializing Preview...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Controls */}
            <div className="lg:col-span-3 space-y-6 sticky top-24">
              
              <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Image Settings</h2>
                   <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Configure parameters</p>
                </div>

                <div className="space-y-6 pt-4">
                  {/* Page Range Toggles */}
                  <div className="space-y-3">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Pages Option</Label>
                     <div className="grid grid-cols-1 gap-2 p-1.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                       <button 
                         onClick={() => setPagesOpt("first")}
                         className={cn(
                           "py-3 px-4 rounded-xl text-[10px] font-bold flex items-center justify-between uppercase tracking-widest transition-all",
                           pagesOpt === "first" ? "bg-white dark:bg-zinc-700 text-[#c5a059] shadow-sm" : "text-slate-400 dark:text-zinc-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50"
                         )}
                       >
                         <span>First Page Only</span> {pagesOpt === "first" && <CheckCircle2 className="w-3.5 h-3.5" />}
                       </button>
                       <button 
                         onClick={() => setPagesOpt("all")}
                         className={cn(
                           "py-3 px-4 rounded-xl text-[10px] font-bold flex items-center justify-between uppercase tracking-widest transition-all",
                           pagesOpt === "all" ? "bg-white dark:bg-zinc-700 text-[#c5a059] shadow-sm" : "text-slate-400 dark:text-zinc-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50"
                         )}
                       >
                         <span>All Pages</span> {pagesOpt === "all" && <CheckCircle2 className="w-3.5 h-3.5" />}
                       </button>
                     </div>
                  </div>

                  {/* DPI Box */}
                  <div className="space-y-3">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Resolution (DPI)</Label>
                     <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        {[72, 150, 300].map(val => (
                          <button key={val} onClick={() => setDpi(val)} className={cn("flex flex-col items-center py-2.5 rounded-xl transition-all gap-0.5", dpi === val ? "bg-white dark:bg-zinc-700 text-[#c5a059] shadow-sm" : "text-slate-400 dark:text-zinc-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50")}>
                            <span className="text-sm font-black">{val}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">DPI</span>
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Format Box */}
                  <div className="space-y-3">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Output Format</Label>
                     <div className="grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        {["png", "jpg"].map(v => (
                          <button key={v} onClick={() => setFormat(v as any)} className={cn("py-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all", format === v ? "bg-white dark:bg-zinc-700 text-[#c5a059] shadow-sm" : "text-slate-400 dark:text-zinc-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50")}>
                            {v}
                          </button>
                        ))}
                     </div>
                  </div>
                </div>

                {/* Error Box */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-[11px] font-bold animate-pulse">
                    {error}
                  </div>
                )}


                {/* Action Area */}
                {!loading && (
                  <div className="pt-2">
                    <button 
                      onClick={handleConvert}
                      disabled={!file || !totalPages}
                      className="w-full btn-suite py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed group"
                    >
                      <span>CONVERT PDF</span>
                      <FileImage className="w-4 h-4 text-[#c5a059]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="feature-card p-6 rounded-3xl flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 bg-[#c5a059]/5 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a059]">Certified Clean</span>
                </div>
                <div className="feature-card p-6 rounded-3xl flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 bg-[#c5a059]/5 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#c5a059]" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a059]">Turbo Speed</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
