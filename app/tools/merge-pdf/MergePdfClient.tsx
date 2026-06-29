"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  FileText, X, Loader2, GripVertical, CheckCircle2, Download,
  RotateCcw, Upload, Check, Zap, Shield, Plus, Database, BarChart3, Activity, Search
} from "lucide-react";
import { validateUpload, getLimitsForSession } from "@/lib/upload-limits";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, rectSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getGuestId } from "@/components/GuestSessionProvider";
import nextDynamic from "next/dynamic";
import { useUpload } from "@/hooks/use-upload";
import { formatSpeed } from "@/lib/upload";
import { ProcessingOverlay } from "@/components/processing-overlay";

const Document = nextDynamic(() => import("react-pdf").then((mod) => {
  mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
  return mod.Document;
}), { ssr: false });
const Page = nextDynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

type PdfItem = { id: string; file: File; url: string; };

const PdfThumbnail = React.memo(({ file, onFail }: { file: File, onFail: (err: any) => void }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (isMounted) setDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return () => { isMounted = false; };
  }, [file]);

  if (!dataUrl) {
    return <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#c5a059] opacity-20" /></div>;
  }

  return (
    <Document 
      file={dataUrl} 
      loading={<Loader2 className="w-6 h-6 animate-spin text-[#c5a059] opacity-20" />} 
      onLoadError={onFail}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <Page 
        pageNumber={1} 
        width={250}
        renderTextLayer={false} 
        renderAnnotationLayer={false} 
        className="[&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:!object-cover w-full h-full pointer-events-none"
      />
    </Document>
  );
});
PdfThumbnail.displayName = 'PdfThumbnail';

function SortablePdfCard({ item, index, onRemove }: { item: PdfItem, index: number, onRemove: (id: string, url: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1
  };
  const [thumbError, setThumbError] = useState(false);

  const handlePdfError = useCallback((err: any) => {
    console.error("PDF Load Error:", err);
    setThumbError(true);
  }, []);

  return (
    <div ref={setNodeRef} style={style} className={cn(
        "group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#c5a059]/40 hover:-translate-y-1 relative aspect-[1/1.41]", 
        isDragging && "shadow-2xl ring-2 ring-[#c5a059] border-transparent scale-105 z-50"
    )}>
      <button 
        className="absolute top-2 right-2 p-1.5 z-20 bg-white/80 backdrop-blur text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:bg-zinc-900/80 dark:hover:bg-red-950/30 rounded-full transition-all shadow-sm" 
        onClick={(e) => { e.stopPropagation(); onRemove(item.id, item.url); }}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="absolute top-2 left-2 p-1.5 z-20 bg-white/80 backdrop-blur text-zinc-500 rounded-md shadow-sm pointer-events-none flex items-center gap-1">
        <GripVertical className="w-3 h-3" />
        <span className="text-[9px] font-black pr-0.5 text-[#c5a059] uppercase tracking-widest">{index + 1}</span>
      </div>
      
      <div {...attributes} {...listeners} className="w-full h-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center relative cursor-grab active:cursor-grabbing">
        {!thumbError ? (
          <PdfThumbnail file={item.file} onFail={handlePdfError} />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-10 h-10 text-zinc-200" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Preview Fail</span>
          </div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end pointer-events-none">
           <p className="font-bold text-[11px] text-white truncate w-full tracking-tight drop-shadow-md mb-1">{item.file.name}</p>
           <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-[#c5a059]/20 text-[8px] font-black text-[#c5a059] uppercase backdrop-blur-sm shrink-0">{(item.file.size / 1024 / 1024).toFixed(1)} MB</span>
           </div>
        </div>
      </div>
    </div>
  );
}

export function MergePdfClient() {
  const { data: session } = useSession();
  const [items, setItems] = useState<PdfItem[]>([]);
  const [step, setStep] = useState(1);
  const [mergeMode, setMergeMode] = useState<'standard' | 'optimized'>('standard');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const { upload, progress, status, reset: resetUpload } = useUpload();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Worker is now initialized in the dynamic import above

  useEffect(() => {
    if (step === 3 && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [step]);

  useEffect(() => {
    return () => {
      items.forEach(item => URL.revokeObjectURL(item.url));
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(f => f.type === "application/pdf");
    
    if (validFiles.length === 0) return;

    const newItems: PdfItem[] = validFiles.map(f => ({
      id: Math.random().toString(36).substring(7) + Date.now(),
      file: f,
      url: URL.createObjectURL(f)
    }));
    
    setItems(prev => [...prev, ...newItems]);
    setStep(2);
  };

  const removeFile = (id: string, url: string) => {
    URL.revokeObjectURL(url);
    setItems(prev => {
      const next = prev.filter(item => item.id !== id);
      if (next.length === 0) setStep(1);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      setError("Please add at least 2 files to merge.");
      return;
    }
    setError(null);
    const formData = new FormData();
    items.forEach(item => formData.append("files", item.file));
    formData.append("mode", mergeMode);
    
    try {
      const res = await upload("/api/tools/pdf/merge", formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      setDownloadUrl(res.url);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const clearAll = () => {
    items.forEach(item => URL.revokeObjectURL(item.url));
    setItems([]);
    setStep(1);
    setDownloadUrl(null);
    setError(null);
    resetUpload();
  };

  const isProcessing = status === "uploading" || status === "processing";

  return (
    <ToolLayout title="Merge PDF" description="Combine PDF documents into one manifest." fullWidth={false}>
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        
        {!isProcessing && step !== 3 && (
            <div className="flex items-center justify-center gap-3 mb-6">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black transition-all border-2", step >= s ? "bg-[#c5a059] border-[#c5a059] text-white" : "bg-zinc-50 border-zinc-200 text-zinc-300")}>
                        {step > s ? <Check className="w-3 h-3" /> : s}
                    </div>
                ))}
            </div>
        )}

        {isProcessing && (
            <ProcessingOverlay status={status} progress={progress} />
        )}

        {step === 1 && !isProcessing && (
          <div className="bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center relative group">
            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="application/pdf" onChange={handleFileChange} />
            <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl text-[#c5a059] group-hover:scale-110 transition-transform"><Upload className="w-8 h-8" /></div>
            <h3 className="text-lg font-black uppercase tracking-widest leading-none mb-2">Upload PDFs</h3>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Drag & Drop Protocol</p>
          </div>
        )}

        {step === 2 && !isProcessing && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 lg:sticky lg:top-24">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                      <div className="space-y-0.5 border-b border-zinc-100 dark:border-zinc-800 pb-3"><h4 className="text-[9px] font-black uppercase tracking-widest">Merge Strategy</h4><p className="text-[7px] font-black text-[#c5a059] uppercase italic opacity-60">Phase 02</p></div>
                      <div className="flex flex-col gap-2">
                        {[{ id: "standard", label: "Standard" }, { id: "optimized", label: "Optimized" }].map(opt => (
                          <button key={opt.id} onClick={() => setMergeMode(opt.id as any)} className={cn("flex items-center justify-between p-2.5 rounded-xl border transition-all", mergeMode === opt.id ? "bg-[#c5a059]/5 border-[#c5a059] shadow-sm" : "bg-zinc-50 dark:bg-zinc-800 border-transparent")}>
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", mergeMode === opt.id ? "text-foreground" : "text-muted-foreground")}>{opt.label}</span>
                            {mergeMode === opt.id && <Check className="w-3.5 h-3.5 text-[#c5a059]" />}
                          </button>
                        ))}
                      </div>
                      <Button onClick={handleMerge} disabled={isProcessing} className="w-full h-11 bg-[#c5a059] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg active:scale-[0.98] transition-transform">
                        {isProcessing ? "PROCESSING..." : "COMBINE FILES"}
                      </Button>
                      {error && <p className="text-[8px] font-bold text-red-500 uppercase text-center">{error}</p>}
                  </div>
              </div>

              <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 min-h-[350px] shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                          <div className="flex flex-col gap-0.5"><span className="text-[7px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Resource Feed</span><p className="text-xs font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">Queue Matrix</p></div>
                          <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => document.getElementById('add-more-input')?.click()} className="h-8 text-[8px] font-black uppercase tracking-widest"><Plus className="w-3 h-3 mr-1" /> Add More</Button>
                             <input type="file" id="add-more-input" multiple accept="application/pdf" className="hidden" onChange={handleFileChange} />
                             <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-[8px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50">Clear</Button>
                          </div>
                      </div>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
                          <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                            {items.map((item, index) => (<SortablePdfCard key={item.id} item={item} index={index} onRemove={removeFile} />))}
                          </SortableContext>
                        </div>
                      </DndContext>
                  </div>
              </div>
          </div>
        )}

        {step === 3 && (
            <div ref={successRef} className="animate-in zoom-in-95 duration-700 w-full">
                <div className="bg-white dark:bg-zinc-950 p-12 rounded-xl text-center space-y-8 border border-[#c5a059]/30 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-bl-full blur-2xl"></div>
                   <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mx-auto shadow-inner relative z-10"><CheckCircle2 className="w-10 h-10" /></div>
                   <div className="space-y-2 relative z-10">
                       <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">Files Merged Successfully</h3>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black italic">{items.length} Documents Combined Into One Professional PDF</p>
                   </div>
                   <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 pt-4 relative z-10 w-full px-2">
                       <Button onClick={clearAll} className="h-16 sm:h-20 px-8 sm:px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all w-full sm:w-auto border-dashed text-muted-foreground min-w-[180px]">
                           <RotateCcw className="w-4 h-4 mr-2" /> RESTART ENGINE
                       </Button>
                       <a href={downloadUrl!} download={`merged-${items.length}-files.pdf`} className="w-full sm:w-auto">
                           <Button className="w-full sm:w-auto bg-[#c5a059] text-white px-8 sm:px-12 h-16 sm:h-20 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all border-none min-w-[200px]">
                               <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" /> DOWNLOAD RESULT
                           </Button>
                       </a>
                   </div>
                </div>
            </div>
        )}
      </div>
      <style jsx global>{` 
        .custom-scrollbar::-webkit-scrollbar { width: 3px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.1); border-radius: 4px; } 
      `}</style>
    </ToolLayout>
  );
}
