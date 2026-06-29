"use client";

import { useState, useEffect } from 'react';
import { Upload, FileText, Settings2, Download, Check, RefreshCw, Loader2, BookOpen, Scissors, Printer, Info, HelpCircle, Layout as LayoutIcon, CheckCircle2, Sparkles, RotateCcw, Target, ShieldCheck, Maximize2, X, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { ToolLayout } from "@/components/tool-layout";
import { cn } from "@/lib/utils";
import nextDynamic from "next/dynamic";

const Document = nextDynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = nextDynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

export default function BookletClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [format, setFormat] = useState<'A4' | 'Letter'>('A4');
  const [sheetSequences, setSheetSequences] = useState<any[]>([]);
  const [numPages, setNumPages] = useState<number | null>(null);

  useEffect(() => {
      import("react-pdf").then((mod) => {
          mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setOutputBlob(null);
      setSheetSequences([]);
    } else {
      toast.error("Please upload a valid PDF file.");
    }
  };

  const processBooklet = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const srcPages = srcDoc.getPages();
      const originalCount = srcPages.length;
      setPageCount(originalCount);

      const paddedCount = Math.ceil(originalCount / 4) * 4;
      const doc = await PDFDocument.create();
      const numSheets = paddedCount / 4;
      const tempSequences: {sheet: number, side: string, left: number | string, right: number | string}[] = [];
      
      for (let i = 0; i < numSheets; i++) {
        const frontPage = doc.addPage(format === 'A4' ? [PageSizes.A4[1], PageSizes.A4[0]] : [PageSizes.Letter[1], PageSizes.Letter[0]]);
        const { width, height } = frontPage.getSize();
        const halfWidth = width / 2;

        const frontL = paddedCount - 2 * i;
        const frontR = 2 * i + 1;
        tempSequences.push({ sheet: i + 1, side: "Front", left: frontL > originalCount ? "BLANK" : frontL, right: frontR > originalCount ? "BLANK" : frontR });
        
        const backPage = doc.addPage(format === 'A4' ? [PageSizes.A4[1], PageSizes.A4[0]] : [PageSizes.Letter[1], PageSizes.Letter[0]]);
        const backL = 2 * i + 2;
        const backR = paddedCount - 2 * i - 1;
        tempSequences.push({ sheet: i + 1, side: "Back", left: backL > originalCount ? "BLANK" : backL, right: backR > originalCount ? "BLANK" : backR });

        const embedPage = async (pageIdx: number, targetPage: any, x: number) => {
          if (pageIdx <= originalCount) {
            const [embeddedPage] = await doc.embedPages([srcPages[pageIdx - 1]]);
            const { width: pW, height: pH } = embeddedPage.size();
            const scale = Math.min(halfWidth / pW, height / pH);
            const drawW = pW * scale;
            const drawH = pH * scale;
            targetPage.drawPage(embeddedPage, {
                x: x + (halfWidth - drawW) / 2, y: (height - drawH) / 2,
                width: drawW, height: drawH,
            });
          }
        };

        await embedPage(frontL, frontPage, 0);
        await embedPage(frontR, frontPage, halfWidth);
        await embedPage(backL, backPage, 0);
        await embedPage(backR, backPage, halfWidth);
        setProgress(Math.round(((i + 1) / numSheets) * 90));
      }

      const pdfBytes = await doc.save();
      setOutputBlob(new Blob([pdfBytes as any], { type: 'application/pdf' }));
      setSheetSequences(tempSequences);
      setProgress(100);
      toast.success("Booklet generated!");
    } catch (e) {
      toast.error("Process failed");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!outputBlob) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booklet-${file?.name || 'document'}.pdf`;
    link.click();
  };

  return (
    <ToolLayout 
      title="PDF Booklet Arranger" 
      description="Re-order and arrange PDF pages for professional saddle-stitch booklet printing."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Gallery / Sheet Map */}
          <div className="lg:col-span-8 space-y-6">
            <div className={cn("suite-card rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative min-h-[500px] flex flex-col items-center", outputBlob ? "justify-start" : "justify-center", "bg-zinc-50 dark:bg-zinc-800/30")}>
              {!outputBlob && (
                <div className="absolute top-8 left-8 flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Studio Workspace</h3>
                </div>
              )}

              {!file ? (
                 <div className="flex flex-col items-center gap-6 py-12">
                    <div className="w-20 h-20 bg-[#c5a059]/10 text-[#c5a059] rounded-2xl flex items-center justify-center animate-bounce">
                       <Upload className="w-10 h-10" />
                    </div>
                    <div className="text-center space-y-2">
                       <h3 className="text-xl font-black uppercase tracking-widest">Load Source PDF</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Multi-page Document Detected</p>
                    </div>
                    <input type="file" id="pdf-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    <Button asChild className="h-16 px-10 rounded-2xl bg-[#c5a059] text-white font-black uppercase tracking-[0.2em] shadow-xl">
                       <label htmlFor="pdf-upload">Browse Files</label>
                    </Button>
                 </div>
              ) : outputBlob ? (
                 <div className="w-full h-full flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] italic">Imposition Engine Ready</p>
                       </div>
                       <Button onClick={download} className="h-10 px-6 rounded-xl bg-zinc-900 text-white font-black text-[9px] uppercase tracking-widest transition-all hover:bg-[#c5a059] shadow-xl">
                          <Download className="w-3 h-3 mr-2" /> Download Document
                       </Button>
                    </div>

                    {/* Sheet Map */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar pb-8">
                       {sheetSequences.map((s, idx) => (
                          <div key={idx} className="group bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-[#c5a059]/10" />
                             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex justify-between">
                                <span>Sheet {s.sheet}</span>
                                <span className="text-[#c5a059] italic">{s.side}</span>
                             </p>
                             <div className="flex gap-4 h-32">
                                <div className={cn("flex-1 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all", typeof s.left === 'number' ? 'bg-[#c5a059]/5 text-[#c5a059] border-[#c5a059]/20 shadow-inner' : 'bg-zinc-50 text-slate-200 border-zinc-100')}>
                                   <span className="text-2xl font-black">{s.left}</span>
                                   <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Verso</span>
                                </div>
                                <div className={cn("flex-1 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all", typeof s.right === 'number' ? 'bg-[#c5a059]/5 text-[#c5a059] border-[#c5a059]/20 shadow-inner' : 'bg-zinc-50 text-slate-200 border-zinc-100')}>
                                   <span className="text-2xl font-black">{s.right}</span>
                                   <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Recto</span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              ) : (
                 <div className="w-full flex flex-col gap-8 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
                       <div className="flex items-center gap-4">
                          <FileText className="w-10 h-10 text-[#c5a059]" />
                          <div>
                             <p className="text-sm font-black uppercase tracking-tight truncate max-w-[200px]">{file.name}</p>
                             <p className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest italic">{numPages || 'Scanning'} Pages Detected</p>
                          </div>
                       </div>
                       <Button onClick={() => setFile(null)} variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></Button>
                    </div>

                    <div className="bg-white dark:bg-zinc-900/50 rounded-[2rem] p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 overflow-y-auto max-h-[600px] custom-scrollbar">
                       <Document 
                          file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
                       >
                          {Array.from(new Array(numPages || 0), (el, index) => (
                             <div key={index} className="space-y-3 group">
                                <div className="rounded-xl border shadow-sm overflow-hidden bg-white group-hover:scale-110 transition-transform duration-500">
                                   <Page pageNumber={index + 1} width={150} renderTextLayer={false} renderAnnotationLayer={false} className="w-full" />
                                </div>
                                <p className="text-[8px] font-black uppercase text-slate-400 text-center tracking-widest">Page {index + 1}</p>
                             </div>
                          ))}
                       </Document>
                    </div>
                 </div>
              )}
            </div>

            {/* Main Action (Mobile First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               {file && !outputBlob && (
                  <Button 
                    onClick={processBooklet}
                    disabled={loading}
                    className="w-full h-20 rounded-[2.5rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[13px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_-10px_rgba(197,160,89,0.4)] group transition-all relative overflow-hidden border-none"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <div className="relative z-10 flex items-center justify-center gap-4">
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />}
                       {loading ? `GENERATING ${progress}%` : "RE-ARRANGE INTO BOOKLET"}
                    </div>
                  </Button>
               )}
               {outputBlob && (
                  <Button onClick={() => { setFile(null); setOutputBlob(null); }} variant="outline" className="w-full h-20 px-10 rounded-[2.5rem] border-zinc-200 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all">
                     Reset Studio
                  </Button>
               )}
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className={cn("suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500", !file && "opacity-40 pointer-events-none grayscale")}>
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Imposition Driver</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Physical Identity</p>
               </div>

               <div className="space-y-6">
                  {/* Format Selector */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Sheet Format</label>
                     <div className="grid grid-cols-2 gap-2">
                        {['A4', 'Letter'].map(f => (
                           <button 
                              key={f}
                              onClick={() => setFormat(f as any)}
                              className={cn(
                                 "py-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                                 format === f ? "bg-[#c5a059] border-[#c5a059] text-white shadow-lg" : "bg-zinc-50 dark:bg-zinc-800 border-transparent text-slate-400"
                              )}
                           >
                              {f}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 space-y-4">
                     <div className="flex items-center gap-3">
                        <Scissors className="w-4 h-4 text-[#c5a059] opacity-40" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Saddle-Stitch Mode Active</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Printer className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ready to Print</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Maximize2 className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Perfect Scaling</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-slow {
          0% { top: 0; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-slow {
          animation: scan-slow 8s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(197, 160, 89, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(197, 160, 89, 0.4);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      ` }} />
    </ToolLayout>
  );
}
