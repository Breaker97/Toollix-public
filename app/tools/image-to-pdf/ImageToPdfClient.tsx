"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Download, Loader2, X, CheckCircle2, FileStack, Type, Maximize, Zap, Check, RotateCcw, Plus } from "lucide-react";
import { handleActionResponse } from "@/lib/fetcher";
import { imageToPdfAction } from "./actions";
import { cn } from "@/lib/utils";
import { ProcessingOverlay } from "@/components/processing-overlay";

export function ImageToPdfClient() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState("A4");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => setPreviews(prev => [...prev, URL.createObjectURL(f)]));
    setResult(null);
    setStep(2);
  };

  const removeFile = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setFiles(prev => {
        const newFiles = prev.filter((_, idx) => idx !== i);
        if (newFiles.length === 0) setStep(1);
        return newFiles;
    });
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const clearAll = () => {
    previews.forEach(p => URL.revokeObjectURL(p));
    setFiles([]);
    setPreviews([]);
    setStep(1);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!files.length) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));
      fd.append("pageSize", pageSize);

      const data = await imageToPdfAction(fd);
      const { url } = handleActionResponse(data);
      setResult(url);
      setStep(3);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout 
      title="Image to PDF" 
      description="Combine multiple images into a professional PDF document. Batch upload PNG, JPG, or WebP files instantly."
    >
      <div className="max-w-5xl mx-auto space-y-6 px-4 md:px-0 w-full overflow-x-hidden pb-12">
        
        {loading && (
          <ProcessingOverlay 
            status="processing" 
            progress={{ percent: 0, speed: 0 }} 
            title="Assembling"
            subtitle="Binding your images into a structured document..."
          />
        )}
        
        {/* Steps Progress */}
        <div className="flex flex-wrap items-center justify-center gap-y-4 mb-8 w-full">
            {[
                { num: 1, label: "Upload" },
                { num: 2, label: "Settings" },
                { num: 3, label: "Download" },
            ].map((s, i, arr) => (
                <div key={s.num} className="flex items-center">
                    <div className={cn(
                        "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-bold transition-colors shrink-0",
                        step >= s.num ? "bg-[#c5a059] text-white" : "bg-zinc-100 text-muted-foreground dark:bg-zinc-800"
                    )}>
                        {step > s.num ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : s.num}
                    </div>
                    <span className={cn(
                        "ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-medium whitespace-nowrap",
                        step >= s.num ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {s.label}
                    </span>
                    {i < arr.length - 1 && (
                        <div className={cn(
                            "w-4 sm:w-16 h-[2px] sm:h-1 mx-1.5 sm:mx-4 rounded-full transition-colors shrink-0",
                            step > s.num ? "bg-[#c5a059]" : "bg-zinc-100 dark:bg-zinc-800"
                        )} />
                    )}
                </div>
            ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <Card className="p-6 sm:p-12 border-dashed border-2 flex flex-col items-center justify-center relative group overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors min-h-[300px]">
            <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/jpeg, image/png, image/webp" onChange={handleFiles} />
            <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-[#c5a059]" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Upload Images</h3>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
                Drag and drop files here or click to browse. We support JPG, PNG, and WebP formats. Batch upload is supported.
            </p>
          </Card>
        )}

        {/* Step 2: Settings & Queue */}
        {step === 2 && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Left Controls */}
              <div className="md:col-span-4 space-y-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 space-y-5 shadow-sm">
                      <div className="flex flex-col gap-0.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Format Protocol</span>
                           <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Configuration</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {[
                          { id: "A4", title: "A4 Format", sub: "Standard Print", icon: FileStack },
                          { id: "Letter", title: "US Letter", sub: "Regional Size", icon: Type },
                          { id: "fit", title: "Dynamic Fit", sub: "Match Source", icon: Maximize }
                        ].map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setPageSize(p.id)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl transition-all text-left border",
                              pageSize === p.id 
                                ? "bg-[#c5a059]/5 border-[#c5a059] shadow-sm" 
                                : "bg-zinc-50 dark:bg-zinc-800/50 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            )}
                          >
                             <div className={cn(
                               "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                               pageSize === p.id ? "bg-[#c5a059] text-white" : "bg-white dark:bg-zinc-800 text-muted-foreground"
                             )}>
                                <p.icon className="w-3.5 h-3.5" />
                             </div>
                             <div>
                                <p className={cn("text-[10px] font-black uppercase tracking-tight", pageSize === p.id ? "text-foreground" : "text-muted-foreground")}>{p.title}</p>
                                <p className="text-[8px] font-bold text-muted-foreground opacity-60">{p.sub}</p>
                             </div>
                          </button>
                        ))}
                      </div>

                      <div className="pt-4 space-y-3">
                          <Button onClick={handleConvert} disabled={loading} className="w-full h-12 bg-[#c5a059] text-white rounded-xl font-black shadow-lg transition-all active:scale-95 text-[9px] uppercase tracking-[0.2em] border-none">
                              {loading ? "PROCESSING..." : "GENERATE PDF"}
                          </Button>
                          <Button variant="ghost" onClick={() => setStep(1)} className="w-full h-10 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 hover:opacity-100">
                              Cancel
                          </Button>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100 dark:border-zinc-800">
                        <Zap className="w-3.5 h-3.5 text-[#c5a059] opacity-40" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Express</span>
                     </div>
                     <div className="bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100 dark:border-zinc-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059] opacity-40" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Secure</span>
                     </div>
                  </div>
              </div>

              {/* Main Queue */}
              <div className="md:col-span-8 space-y-4">
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-6 min-h-[500px] shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                          <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Asset Buffer</span>
                              <p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">{files.length} Image{files.length !== 1 ? 's' : ''} Identified</p>
                          </div>
                          <button onClick={clearAll} className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                             Purge All
                          </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {previews.map((src, i) => (
                            <div key={i} className="group relative flex flex-col bg-zinc-50 dark:bg-zinc-900 rounded-[1.25rem] overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-md hover:-translate-y-1">
                               <div className="aspect-[4/3] relative p-1.5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/50">
                                  <img 
                                    src={src} 
                                    alt="Preview" 
                                    className="max-h-full max-w-full object-contain rounded-lg drop-shadow-md group-hover:scale-105 transition-transform duration-500" 
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                     <button 
                                         className="h-9 w-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all" 
                                         onClick={() => removeFile(i)}
                                     >
                                       <X className="w-4 h-4 text-red-500" />
                                     </button>
                                  </div>
                               </div>
                               <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-white/90 dark:bg-zinc-900/90 rounded-md text-[7px] font-black uppercase tracking-widest shadow-sm border border-zinc-100 dark:border-zinc-800">
                                  #{i + 1}
                               </div>
                            </div>
                          ))}
                          <label className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] cursor-pointer hover:border-[#c5a059]/40 hover:bg-[#c5a059]/5 transition-all group bg-zinc-50/30 dark:bg-zinc-900/10">
                             <div className="w-9 h-9 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                                <Plus className="w-4 h-4 text-[#c5a059]" />
                             </div>
                             <span className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-[#c5a059]">Add Asset</span>
                             <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
                          </label>
                      </div>

                      {error && (
                        <div className="mt-8 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 p-4 rounded-xl text-center border border-red-100">
                          {error}
                        </div>
                      )}
                  </div>
              </div>
          </div>
        )}

        {/* Step 3: Result & Download */}
        {step === 3 && result && (
            <div className="space-y-6 animate-in zoom-in-95 duration-700 w-full flex flex-col gap-4">
                <div className="bg-white dark:bg-zinc-950 p-8 sm:p-16 rounded-[3rem] border border-[#c5a059]/30 flex flex-col gap-10 shadow-2xl relative overflow-hidden text-center">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 rounded-bl-full blur-3xl opacity-50"></div>
                   
                   <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner relative z-10">
                       <CheckCircle2 className="w-12 h-12" />
                   </div>
                   
                    <div className="space-y-4 relative z-10">
                        <h3 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none mb-1">Conversion Complete</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black italic">
                           Successfully converted {files.length} images into a high-quality PDF document
                        </p>
                    </div>
                   
                   <div className="flex flex-col sm:flex-row justify-center items-center gap-5 pt-4 relative z-10">
                       <a href={result} download={`${files[0]?.name.split('.')[0] || 'compiled'}-collection.pdf`} className="w-full sm:w-auto">
                           <Button className="w-full h-16 sm:h-20 sm:px-16 rounded-2xl bg-[#c5a059] text-white font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95 border-none text-[11px]">
                               <Download className="w-6 h-6 mr-3" /> DOWNLOAD PDF
                           </Button>
                       </a>
                       <Button variant="outline" onClick={clearAll} className="w-full sm:w-auto h-16 sm:h-20 sm:px-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-zinc-50 transition-all border-dashed">
                           <RotateCcw className="w-4 h-4 mr-2" /> RESTART STUDIO
                       </Button>
                   </div>
                </div>
            </div>
        )}

      </div>
    </ToolLayout>
  );
}
