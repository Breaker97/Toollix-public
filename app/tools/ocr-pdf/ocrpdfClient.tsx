"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  FileText, Trash2, ScanLine, Copy, Download, RotateCcw, 
  Check, Info, Zap, X, ShieldCheck, Target, RefreshCw, 
  CheckCircle2, Layers, Search, UploadCloud
} from "lucide-react";
import { UploadStatusDisplay } from "@/components/upload-status";
import type { UploadStatus } from "@/lib/upload";
import { cn } from "@/lib/utils";
import nextDynamic from "next/dynamic";

const Document = nextDynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = nextDynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const languagesList = [
  { code: "eng", name: "English" },
  { code: "spa", name: "Spanish" },
  { code: "fra", name: "French" },
  { code: "deu", name: "German" },
  { code: "hin", name: "Hindi" },
  { code: "ara", name: "Arabic" },
  { code: "jpn", name: "Japanese" },
  { code: "chi_sim", name: "Chinese (Simplified)" },
];

export default function OCRPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [stage, setStage] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("eng");
  const [isCopied, setIsCopied] = useState(false);
  const [numPagesPreview, setNumPagesPreview] = useState<number>(0);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
    });
  }, []);

  useEffect(() => {
    if (status === "done" && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      setFile(selected); setStatus("idle"); setStage("idle"); setExtractedText(""); setProgress(0); setError(null);
    }
  };

  const processOCR = async () => {
    if (!file) return;
    try {
      setStatus("processing"); setStage("uploading"); setError(null);
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(language, 1, { logger: (m) => { if (m.status === "recognizing text") { setStage("processing"); setProgress(Math.floor(m.progress * 100)); } } });
      let fullText = "";
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import("pdfjs-dist");
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${(pdfjsLib as any).version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        setTotalPages(pdf.numPages);
        for (let i = 1; i <= pdf.numPages; i++) {
          setCurrentPage(i);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;
          canvas.height = viewport.height; canvas.width = viewport.width;
          context.filter = "contrast(1.2) brightness(1.1) grayscale(1)";
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          const { data: { text } } = await worker.recognize(canvas);
          fullText += `--- Page ${i} ---\n\n${text}\n\n`;
        }
      } else {
        setTotalPages(1); setCurrentPage(1);
        const { data: { text } } = await worker.recognize(file);
        fullText = text;
      }
      await worker.terminate(); setExtractedText(fullText); setStatus("done"); setStage("done");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setStatus("error");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText); setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadFile = (fmt: 'txt' | 'pdf') => {
    if (fmt === 'txt') {
      const blob = new Blob([extractedText], { type: "text/plain" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
      link.download = `extracted-text.txt`; link.click();
    } else {
      import("jspdf").then(jspdfModule => {
        const doc = new (jspdfModule.default || (jspdfModule as any).jsPDF)();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;
        const lines = doc.splitTextToSize(extractedText, pageWidth - (margin * 2));
        doc.setFontSize(10); doc.text(lines, margin, 20); doc.save(`extracted-text.pdf`);
      });
    }
  };

  const reset = () => { setFile(null); setExtractedText(""); setStatus("idle"); setStage("idle"); setProgress(0); setError(null); };

  return (
    <ToolLayout title="OCR PDF" description="Extract text from scanned assets." fullWidth={false}>
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-8 space-y-4 order-2 lg:order-1">
            {status === "done" && (
              <div ref={successRef} className="animate-in zoom-in-95 duration-700 space-y-4">
                 <div className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-[#c5a059]/30 flex flex-col gap-5 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner">
                             <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                             <h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">Extraction Verified</h3>
                             <p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.3em] italic leading-none">Synthesized Data Ready</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button onClick={copyToClipboard} className={cn("flex-1 h-10 px-4 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all", isCopied ? "bg-emerald-500" : "bg-zinc-900")}>
                             {isCopied ? "Secured" : "Copy"}
                          </Button>
                          <Button onClick={() => downloadFile('pdf')} className="flex-1 h-10 px-4 rounded-lg bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-md text-[9px]">
                             Export PDF
                          </Button>
                       </div>
                    </div>
                    <div className="relative rounded-xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-100 flex flex-col min-h-[300px]">
                       <div className="flex-1 overflow-y-auto p-6 selection:bg-[#c5a059]/20 custom-scrollbar max-h-[400px]">
                          <pre className="whitespace-pre-wrap text-[11px] font-mono leading-[1.6] text-slate-600 dark:text-slate-400">{extractedText}</pre>
                       </div>
                    </div>
                 </div>
                 <Button onClick={reset} variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground font-black text-[8px] uppercase tracking-widest border-2 border-dashed">Another Source</Button>
              </div>
            )}

            {status !== "done" && (
              <div className={cn("bg-zinc-50 dark:bg-zinc-900/50 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col items-center relative shadow-sm transition-all", status === 'processing' || file ? "min-h-[300px]" : "min-h-[500px] justify-center")}>
                 {status === "idle" && !file && (
                    <div className="flex flex-col items-center gap-6 py-12">
                       <div className="w-16 h-16 bg-white dark:bg-zinc-800 border border-zinc-100 rounded-2xl flex items-center justify-center shadow-xl text-[#c5a059]"><UploadCloud className="w-8 h-8" /></div>
                       <div className="text-center space-y-1">
                          <h3 className="text-lg font-black uppercase tracking-widest">Load Matrix Assets</h3>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic opacity-50">PDF or Image</p>
                       </div>
                       <input type="file" id="ocr-upload" className="hidden" accept="application/pdf,image/*" onChange={handleFileChange} />
                       <Button asChild className="h-14 px-10 rounded-xl bg-[#c5a059] text-white font-black uppercase tracking-[0.2em] shadow-lg"><label htmlFor="ocr-upload">Browse Matrix</label></Button>
                    </div>
                 )}
                 {status === "idle" && file && (
                    <div className="w-full space-y-5 animate-in slide-in-from-bottom-4">
                       <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 shadow-sm">
                          <div className="flex items-center gap-3 truncate">
                             <FileText className="w-4 h-4 text-[#c5a059] shrink-0" />
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-tight truncate max-w-[150px] leading-none mb-0.5">{file.name}</p>
                                <p className="text-[8px] font-black text-[#c5a059] uppercase italic opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                             </div>
                          </div>
                          <Button onClick={reset} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></Button>
                       </div>
                       <div className="bg-white dark:bg-zinc-950/50 rounded-2xl p-4 border-2 border-dashed border-zinc-100 overflow-y-auto max-h-[300px] flex flex-col items-center">
                          {file.type === "application/pdf" ? (
                             <Document file={file} onLoadSuccess={({ numPages }) => setNumPagesPreview(numPages)} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Array.from(new Array(numPagesPreview || 0), (el, index) => (
                                   <div key={index} className="rounded border shadow-sm overflow-hidden bg-white"><Page pageNumber={index + 1} width={100} renderTextLayer={false} renderAnnotationLayer={false} /></div>
                                )).slice(0, 8)}
                             </Document>
                          ) : <img src={URL.createObjectURL(file)} className="max-w-[150px] rounded-lg shadow-xl" />}
                       </div>
                       <Button onClick={processOCR} className="w-full h-16 rounded-2xl bg-[#c5a059] text-white font-black uppercase tracking-[0.3em] shadow-lg"><Zap className="w-4 h-4 mr-2" /> EXTRACT TEXT</Button>
                    </div>
                 )}
                 {status === "processing" && <div className="w-full max-w-sm py-12"><UploadStatusDisplay status={stage} progress={{ percent: progress, speed: 0, loaded: 0, total: 0, timeLeft: 0 }} /></div>}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4 order-3 lg:order-2 lg:sticky lg:top-24">
            <div className={cn("bg-white dark:bg-zinc-950 p-6 rounded-[1.5rem] border border-zinc-200 space-y-6 shadow-sm", !file && "opacity-40 grayscale blur-[1px]")}>
               <div className="space-y-0.5 border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-black text-foreground tracking-tight uppercase">Studio Driver</h2>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic opacity-50">Linguistic Profile</p>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Lexicon</label>
                     <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full h-10 bg-zinc-50 rounded-lg border-none font-black text-[9px] uppercase tracking-[0.2em] px-3 ring-1 ring-zinc-200">
                        {languagesList.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                     </select>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#c5a059]/5 border border-[#c5a059]/10"><div className="flex items-center gap-2"><Target className="w-3 h-3 text-[#c5a059] opacity-40" /><span className="text-[8px] font-black uppercase tracking-widest text-[#c5a059] italic">2.5x Precision Scan</span></div></div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-zinc-100"><RefreshCw className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Auto Cont</span></div>
               <div className="bg-white p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-zinc-100"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Safe Iso</span></div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes scan-slow { 0% { top: 0; opacity: 0; } 5% { opacity: 1; } 95% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan-slow { animation: scan-slow 8s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.1); border-radius: 4px; }
      `}</style>
    </ToolLayout>
  );
}
