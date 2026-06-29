"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { cn } from "@/lib/utils";
import { 
  Upload, FileText, PenTool, Type, Calendar, Check, Trash2, Download, X, Move,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MousePointer2, Loader2, RotateCcw,
  ShieldCheck, Zap, Lock, Save, Copy, CheckCircle
} from "lucide-react";
import nextDynamic from "next/dynamic";
import { getFileUrl } from "@/lib/fetcher";
import SignatureCanvas from 'react-signature-canvas';
import { Dancing_Script, Caveat, Pacifico, Shadows_Into_Light } from "next/font/google";
import { ProcessingOverlay } from "@/components/processing-overlay";

const Document = nextDynamic(() => import("react-pdf").then((mod) => {
  mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
  return mod.Document;
}), { ssr: false });
const Page = nextDynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: '700' });
const caveat = Caveat({ subsets: ['latin'], weight: '700' });
const pacifico = Pacifico({ subsets: ['latin'], weight: '400' });
const shadows = Shadows_Into_Light({ subsets: ['latin'], weight: '400' });

const FONTS = [
  { id: 'dancing', name: 'Elegant', family: '"Dancing Script"', className: dancingScript.className },
  { id: 'caveat', name: 'Casual', family: '"Caveat"', className: caveat.className },
  { id: 'pacifico', name: 'Bold', family: '"Pacifico"', className: pacifico.className },
  { id: 'shadows', name: 'Marker', family: '"Shadows Into Light"', className: shadows.className },
  { id: 'sans', name: 'Standard', family: 'sans-serif', className: 'font-sans' },
  { id: 'serif', name: 'Formal', family: 'serif', className: 'font-serif' },
];

interface SignatureItem {
  id: string; dataUrl: string; x: number; y: number; w: number; h: number; page: number;
}

export default function SignPdfPage() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "upload">("draw");
  const padRef = useRef<SignatureCanvas>(null);
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [activeSigId, setActiveSigId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>("select");
  const [zoom, setZoom] = useState(100);
  const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string | null>(null);
  const [sigColor, setSigColor] = useState<string>('#c5a059');
  const [currentPage, setCurrentPage] = useState(1);

  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setFileDataUrl(null);
      return;
    }
    let isMounted = true;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (isMounted) setFileDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return () => { isMounted = false; };
  }, [file]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && viewerRef.current) {
        const isSm = window.innerWidth >= 640;
        const padding = isSm ? 96 : 32; 
        let cw = entries[0].contentRect.width - padding;
        if (cw > 800) cw = 800; 
        setContainerWidth(Math.floor(cw));
      }
    });
    if (viewerRef.current) observer.observe(viewerRef.current);
    return () => observer.disconnect();
  }, [step]); // Re-bind on step change to grab new ref

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]; setFile(f); setFileUrl(URL.createObjectURL(f)); setStep(2);
    }
  };

  const handleScroll = () => {
      if (!viewerRef.current) return;
      const container = viewerRef.current;
      const containerCenter = container.getBoundingClientRect().top + container.clientHeight / 2;
      let closestPage = 1;
      let minDistance = Infinity;
      for (let i = 0; i < numPages; i++) {
          const el = document.getElementById(`page_${i}`);
          if (el) {
             const rect = el.getBoundingClientRect();
             const elCenter = rect.top + rect.height / 2;
             const dist = Math.abs(containerCenter - elCenter);
             if (dist < minDistance) {
                 minDistance = dist;
                 closestPage = i + 1;
             }
          }
      }
      if (closestPage !== currentPage) setCurrentPage(closestPage);
  };

  const addSignature = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
       const aspectRatio = img.height / img.width;
       const pWidth = pageWidth || 800; 
       const pHeight = pageHeight || 1130;
       
       let initialW = 0.3;
       let initialH = (initialW * pWidth * aspectRatio) / pHeight;
       
       const newSig: SignatureItem = { 
           id: Math.random().toString(36).substr(2, 9), 
           dataUrl, x: 0.1, y: 0.1, w: initialW, h: initialH, 
           page: currentPage 
       };
       setSignatures(prev => [...prev, newSig]); 
       setShowModal(false); 
       setActiveSigId(newSig.id);
    };
    img.src = dataUrl;
  };

  const createTextSignature = (text: string, font: string, fontSize: number, color: string = '#c5a059') => {
      const cvs = document.createElement('canvas'); 
      const ctx = cvs.getContext('2d')!; 
      ctx.font = `${fontSize}px ${font}`; 
      const metrics = ctx.measureText(text);
      cvs.width = metrics.width + 40; 
      cvs.height = fontSize + 40;
      ctx.font = `${fontSize}px ${font}`; 
      ctx.fillStyle = color;
      ctx.textAlign = 'center'; 
      ctx.textBaseline = 'middle'; 
      ctx.fillText(text, cvs.width / 2, cvs.height / 2);
      addSignature(cvs.toDataURL());
  };

  const handleToolClick = (toolId: string) => {
      setActiveTool(toolId);
      if (toolId === 'sign') {
          setActiveTab('draw');
          setShowModal(true);
      } else if (toolId === 'text') {
          setActiveTab('type');
          setShowModal(true);
      } else if (toolId === 'date') {
          createTextSignature(new Date().toLocaleDateString(), "sans-serif", 40, "#000000");
          setActiveTool("select");
      } else if (toolId === 'check') {
          createTextSignature("✓", "sans-serif", 60, "#000000");
          setActiveTool("select");
      }
  };

  const handleSignDocument = async () => {
    if (!file || signatures.length === 0) return;
    setLoading(true);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("sig_count", signatures.length.toString());
      fd.append("audit_trail", "true");
      signatures.forEach((sig, i) => {
        fd.append(`sig_data_${i}`, sig.dataUrl); fd.append(`sig_x_${i}`, sig.x.toString()); fd.append(`sig_y_${i}`, sig.y.toString()); fd.append(`sig_w_${i}`, sig.w.toString()); fd.append(`sig_h_${i}`, sig.h.toString()); fd.append(`sig_page_${i}`, sig.page.toString());
      });
      const res = await fetch("/api/tools/pdf/sign", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Signing failed");
      const { url } = await getFileUrl(res); setResultUrl(url); setStep(3);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, sigId: string, pageNode: HTMLElement) => {
    e.stopPropagation();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    
    let lastX = clientX;
    let lastY = clientY;
    const rect = pageNode.getBoundingClientRect();
    const sig = signatures.find(s => s.id === sigId);
    if (!sig) return;
    
    let currentX = sig.x;
    let currentY = sig.y;
    const sigEl = document.getElementById(`sig_${sigId}`);
    if (sigEl) sigEl.style.transition = 'none';
    
    const move = (moveEvent: MouseEvent | TouchEvent) => {
      if (moveEvent.cancelable) moveEvent.preventDefault();
      const curX = 'touches' in moveEvent ? (moveEvent as TouchEvent).touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const curY = 'touches' in moveEvent ? (moveEvent as TouchEvent).touches[0].clientY : (moveEvent as MouseEvent).clientY;
      const deltaX = (curX - lastX) / rect.width; 
      const deltaY = (curY - lastY) / rect.height;
      lastX = curX; 
      lastY = curY;
      
      currentX = Math.max(-sig.w + 0.02, Math.min(0.98, currentX + deltaX));
      currentY = Math.max(-sig.h + 0.02, Math.min(0.98, currentY + deltaY));
      
      if (sigEl) {
          sigEl.style.left = `${currentX * 100}%`;
          sigEl.style.top = `${currentY * 100}%`;
      }
    };

    const up = () => { 
      window.removeEventListener("mousemove", move); 
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
      if (sigEl) sigEl.style.transition = '';
      setSignatures(prev => prev.map(s => s.id === sigId ? { ...s, x: currentX, y: currentY } : s));
    };

    window.addEventListener("mousemove", move); 
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, sigId: string, pageNode: HTMLElement) => {
    e.stopPropagation();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    
    let startX = clientX;
    const rect = pageNode.getBoundingClientRect();
    const sig = signatures.find(s => s.id === sigId); 
    if (!sig) return;
    const startW = sig.w; 
    const startH = sig.h;
    
    let currentW = startW;
    let currentH = startH;
    const sigEl = document.getElementById(`sig_${sigId}`);
    if (sigEl) sigEl.style.transition = 'none';

    const move = (moveEvent: MouseEvent | TouchEvent) => {
      if (moveEvent.cancelable) moveEvent.preventDefault();
      const curX = 'touches' in moveEvent ? (moveEvent as TouchEvent).touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const deltaW = (curX - startX) / rect.width;
      
      currentW = Math.max(0.05, startW + deltaW);
      currentH = currentW * (startH / startW);
      if (sigEl) {
         sigEl.style.width = `${currentW * 100}%`;
         sigEl.style.height = `${currentH * 100}%`;
      }
    };

    const up = () => { 
      window.removeEventListener("mousemove", move); 
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
      if (sigEl) sigEl.style.transition = '';
      setSignatures(prev => prev.map(s => s.id === sigId ? { ...s, w: currentW, h: currentH } : s));
    };

    window.addEventListener("mousemove", move); 
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  };

  const resetAll = () => { 
    setFile(null); setFileUrl(null); setStep(1); setResultUrl(null); setSignatures([]); setActiveSigId(null); setError(null);
  };

  return (
    <ToolLayout title="Sign PDF" description="Securely seal your documents. Draw, type, or upload your signature with professional vector burning." fullWidth>
      <div className="flex flex-col w-full border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-2xl relative" style={{ height: 'calc(100vh - 8rem)' }}>
        
        {loading && (
          <ProcessingOverlay 
            status="processing" 
            progress={{ percent: 0, speed: 0 }} 
            title="Sealing"
            subtitle="Embedding high-fidelity vector signatures into document..."
          />
        )}

        {/* Header */}
        <header className="h-16 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-6 flex items-center justify-end z-40 shrink-0">
          {file && step === 2 && (
            <button onClick={handleSignDocument} disabled={loading || signatures.length === 0} className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#a38448] text-white px-4 sm:px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded shadow-sm disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
              <span className="hidden sm:inline">{loading ? "Saving..." : "Save & Download"}</span>
              <span className="sm:hidden">{loading ? "Saving..." : "Save"}</span>
            </button>
          )}
        </header>

        {step === 1 && (
          <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f3f4f6] dark:bg-[#121212]">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-light mb-2 tracking-tight">Secure PDF Signing</h2>
              <p className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Secure • Elegant • Precise</p>
            </div>
            <div 
              onClick={() => document.getElementById("sign-upload")?.click()}
              className="group relative h-64 w-full max-w-2xl border-2 border-dashed border-[#c5a059]/40 bg-[#c5a059]/5 hover:bg-[#c5a059]/10 flex flex-col items-center justify-center cursor-pointer transition-all rounded-xl shadow-sm"
            >
              <Upload className="w-10 h-10 text-[#c5a059]/60 mb-4 group-hover:text-[#c5a059] transition-colors" />
              <span className="text-xs uppercase tracking-widest font-bold text-[#c5a059]">Click to upload document</span>
              <input id="sign-upload" type="file" className="hidden" accept="application/pdf" onChange={handleFileDrop} />
            </div>
          </main>
        )}

        {step === 2 && file && (
          <div className="flex flex-col sm:flex-row flex-1 overflow-hidden bg-[#f3f4f6] dark:bg-[#121212]">
            {/* Side Tools */}
            <aside className="w-full sm:w-20 bg-white dark:bg-zinc-950 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-zinc-800 flex flex-row sm:flex-col items-center py-3 sm:py-8 gap-4 sm:gap-8 shrink-0 overflow-x-auto sm:overflow-y-auto px-4 sm:px-0">
              {[
                { id: 'select', icon: MousePointer2, label: 'Select' },
                { id: 'sign', icon: PenTool, label: 'Sign' },
                { id: 'text', icon: Type, label: 'Text' },
                { id: 'date', icon: Calendar, label: 'Date' },
                { id: 'check', icon: Check, label: 'Mark' },
              ].map(tool => (
                <button 
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`group flex flex-col items-center gap-1 ${activeTool === tool.id ? 'text-[#c5a059]' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                >
                  <div className={`p-2 sm:p-3 border rounded-lg transition-all ${activeTool === tool.id ? 'border-[#c5a059] bg-[#c5a059]/5 shadow-sm' : 'border-transparent'}`}>
                    <tool.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[8px] uppercase font-bold tracking-tighter">{tool.label}</span>
                </button>
              ))}
            </aside>

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
              <div className="h-10 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 text-[10px] uppercase font-bold text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="w-10 text-center">{zoom}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <ChevronLeft className="w-4 h-4 opacity-30" />
                  <span>Page {numPages > 0 ? `${currentPage} of ${numPages}` : '...'}</span>
                  <ChevronRight className="w-4 h-4 opacity-30" />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 sm:p-12 flex flex-col items-center bg-[#f3f4f6] dark:bg-[#121212]" ref={viewerRef} onScroll={handleScroll}>
                <Document file={file} className="flex flex-col gap-10 sm:gap-14 w-full items-center" onLoadSuccess={onDocumentLoadSuccess}>
                  {Array.from(new Array(numPages), (el, index) => (
                      <div key={index} className="flex flex-col items-center gap-3 w-full max-w-full">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            Page {index + 1} of {numPages}
                        </span>
                        <div id={`page_${index}`} className="relative bg-white shadow-xl rounded-sm overflow-hidden transition-all hover:shadow-2xl w-fit mx-auto max-w-full border border-gray-200 dark:border-zinc-800" onClick={() => setActiveSigId(null)}>
                            <div className="w-full max-w-full overflow-hidden [&_.react-pdf__Page]:!w-fit [&_.react-pdf__Page]:!max-w-full [&_.react-pdf__Page__canvas]:!max-w-full [&_.react-pdf__Page__canvas]:!w-full [&_.react-pdf__Page__canvas]:!h-auto">
                              <Page 
                                  pageNumber={index + 1} 
                                  width={containerWidth} 
                                  renderTextLayer={false} 
                                  renderAnnotationLayer={false}
                                  onLoadSuccess={(p) => { setPageWidth(p.width); setPageHeight(p.height); }}
                              />
                            </div>
                            {signatures.filter(s => s.page === index + 1).map(sig => {
                              const isActive = sig.id === activeSigId;
                              return (
                                  <div 
                                    id={`sig_${sig.id}`}
                                    key={sig.id} className={cn("absolute rounded group transition-all", isActive ? "ring-1 ring-[#c5a059] bg-[#c5a059]/5 cursor-move z-50" : "hover:ring-1 hover:ring-[#c5a059]/40 cursor-pointer")}
                                    style={{ left: `${sig.x * 100}%`, top: `${sig.y * 100}%`, width: `${sig.w * 100}%`, height: `${sig.h * 100}%`, mixBlendMode: 'multiply' }}
                                    onMouseDown={(e) => { setActiveSigId(sig.id); const node = document.getElementById(`page_${index}`); if (node) handleDrag(e, sig.id, node); }}
                                    onTouchStart={(e) => { setActiveSigId(sig.id); const node = document.getElementById(`page_${index}`); if (node) handleDrag(e, sig.id, node); }}
                                    onClick={(e) => { e.stopPropagation(); setActiveSigId(sig.id); }}
                                  >
                                    <img src={sig.dataUrl} alt="Sig" className="w-full h-full pointer-events-none" />
                                    {isActive && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl px-2 py-1 flex items-center gap-2 rounded z-50">
                                          <Move className="w-3 h-3 text-gray-400" />
                                          <button onClick={(e) => { 
                                             e.stopPropagation(); 
                                             const isLast = sig.page === numPages;
                                             const newId = Math.random().toString(36).substr(2,9);
                                             setSignatures(prev => [...prev, { 
                                                 ...sig, id: newId, 
                                                 page: isLast ? sig.page : sig.page + 1,
                                                 y: isLast ? Math.min(0.9, sig.y + 0.05) : sig.y 
                                             }]);
                                             setActiveSigId(newId);
                                             if (!isLast) document.getElementById(`page_${sig.page}`)?.scrollIntoView({ behavior: 'smooth' });
                                          }} title={sig.page === numPages ? "Duplicate on page" : "Copy to next page"}><Copy className="w-3 h-3 text-blue-400" /></button>
                                          <button onClick={(e) => { e.stopPropagation(); setSignatures(prev => prev.filter(s => s.id !== sig.id)); }}><Trash2 className="w-3 h-3 text-red-400" /></button>
                                          <button onClick={(e) => { e.stopPropagation(); setActiveSigId(null); }}><Check className="w-3 h-3 text-[#c5a059]" /></button>
                                        </div>
                                    )}
                                    {isActive && (
                                        <div 
                                          className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-[#c5a059] rounded-sm cursor-nwse-resize"
                                          onMouseDown={(e) => { const node = document.getElementById(`page_${index}`); if (node) handleResizeStart(e, sig.id, node); }}
                                          onTouchStart={(e) => { const node = document.getElementById(`page_${index}`); if (node) handleResizeStart(e, sig.id, node); }}
                                        />
                                    )}
                                  </div>
                              );
                            })}
                        </div>
                      </div>
                  ))}
                </Document>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="hidden sm:flex w-72 bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 p-6 flex-col gap-6 shrink-0 overflow-y-auto">
               <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">Seal Configuration</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Identity Verification</p>
               </div>
               <button onClick={() => { setActiveTab('draw'); setShowModal(true); }} className="w-full py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#c5a059] transition-all rounded shadow-md">
                  <PenTool className="w-4 h-4" /> Create Signature
               </button>
               <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg p-4">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest mb-2">
                     <span className="text-gray-400">Placed Assets</span>
                     <span className="text-[#c5a059]">{signatures.length}</span>
                  </div>
                  {signatures.length === 0 && <div className="text-[9px] text-gray-300 italic">No signatures yet...</div>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {signatures.map((s, i) => <img key={i} src={s.dataUrl} className="w-12 border border-gray-200 dark:border-zinc-700 bg-white rounded p-1" />)}
                  </div>
               </div>
               <div className="mt-auto flex flex-col gap-2">
                 <div className="p-3 border border-gray-100 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 flex items-center gap-3">
                   <div className="w-2 h-2 bg-[#c5a059] rounded-full"></div>
                   <span className="text-[9px] font-bold uppercase text-gray-400">Secure Seal Active</span>
                 </div>
                 <div className="p-3 border border-gray-100 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 flex items-center gap-3">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span className="text-[9px] font-bold uppercase text-gray-400">Audit Trail Enabled</span>
                 </div>
               </div>
            </aside>
          </div>
        )}

        {step === 3 && resultUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#f3f4f6] dark:bg-[#121212] animate-in zoom-in-95 duration-500">
             <div className="bg-white dark:bg-zinc-950 p-6 sm:p-12 rounded-xl shadow-xl text-center max-w-xl w-full border border-gray-200 dark:border-zinc-800 mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-light mb-2 tracking-tight">Document Sealed</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-8">Vector Signature Embedded</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
                   <a href={resultUrl} download={`${file?.name.replace('.pdf', '')}-signed.pdf`} className="flex items-center justify-center gap-2 bg-[#c5a059] hover:bg-[#a38448] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded shadow-md w-full sm:w-auto">
                      <Download className="w-4 h-4" /> Download PDF
                   </a>
                   <button onClick={resetAll} className="flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-800 px-8 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-all rounded w-full sm:w-auto">
                      <RotateCcw className="w-4 h-4" /> Restart
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Modal inside ToolLayout bounds */}
        {showModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-lg overflow-hidden shadow-2xl rounded-lg border border-gray-200 dark:border-zinc-800">
              <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-zinc-800">
                <h3 className="uppercase tracking-[0.2em] text-xs font-bold">Create Signature</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 hover:text-[#c5a059] transition-colors" /></button>
              </div>
              <div className="flex border-b border-gray-100 dark:border-zinc-800">
                {['draw', 'type', 'upload'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === t ? 'text-[#c5a059] border-b-2 border-[#c5a059]' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="p-8">
                {activeTab === 'draw' && (
                  <div className="flex flex-col gap-3 relative">
                     <div className="relative">
                       <SignatureCanvas ref={padRef} canvasProps={{ className: 'w-full h-48 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 rounded cursor-crosshair' }} penColor={sigColor} />
                       <button onClick={() => padRef.current?.clear()} className="absolute bottom-2 right-2 text-[9px] uppercase tracking-widest text-gray-400 hover:text-red-500 bg-white/80 dark:bg-black/80 px-2 py-1 rounded">Clear</button>
                     </div>
                     <div className="flex justify-center gap-4 mt-2">
                        {['#000000', '#2563eb', '#dc2626', '#c5a059'].map(c => (
                           <button 
                             key={c} 
                             onClick={() => setSigColor(c)} 
                             className={cn("w-6 h-6 rounded-full border-2 transition-transform", sigColor === c ? "border-gray-400 scale-125 shadow-sm" : "border-transparent")}
                             style={{ backgroundColor: c }}
                           />
                        ))}
                     </div>
                  </div>
                )}
                {activeTab === 'type' && (
                  <div className="flex flex-col gap-4">
                     <input type="text" value={typedName} onChange={e => setTypedName(e.target.value)} placeholder="Type here..." className={cn("w-full border-b border-gray-300 dark:border-zinc-700 bg-transparent p-4 text-3xl focus:outline-none focus:border-[#c5a059] transition-all", selectedFont.className)} style={{ color: sigColor }} />
                     <div className="flex flex-col gap-4">
                       <div className="flex flex-wrap gap-2">
                          {FONTS.map(f => (
                             <button key={f.id} onClick={() => setSelectedFont(f)} className={cn("px-4 py-2 rounded border text-xs whitespace-nowrap transition-all", selectedFont.id === f.id ? "border-[#c5a059] text-[#c5a059]" : "border-gray-200 dark:border-zinc-800")}>
                                {f.name}
                             </button>
                          ))}
                       </div>
                       <div className="flex gap-3 items-center border-t border-gray-100 dark:border-zinc-800 pt-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Color</span>
                          {['#000000', '#2563eb', '#dc2626', '#c5a059'].map(c => (
                             <button 
                               key={c} 
                               onClick={() => setSigColor(c)} 
                               className={cn("w-6 h-6 rounded-full border-2 transition-transform shrink-0", sigColor === c ? "border-gray-400 scale-110 shadow-sm" : "border-transparent")}
                               style={{ backgroundColor: c }}
                             />
                          ))}
                       </div>
                     </div>
                  </div>
                )}
                {activeTab === 'upload' && (
                  <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#c5a059] transition-all relative rounded bg-gray-50 dark:bg-zinc-900 min-h-[192px]">
                     {uploadedSignatureUrl ? (
                         <img src={uploadedSignatureUrl} alt="Uploaded signature" className="max-h-32 object-contain" />
                     ) : (
                         <>
                             <Upload className="w-8 h-8 text-gray-300 dark:text-zinc-600 mb-2" />
                             <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Click to upload signature</span>
                         </>
                     )}
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => {
                         if (e.target.files && e.target.files[0]) {
                             const reader = new FileReader();
                             reader.onload = (ev) => {
                                 const rawData = ev.target?.result as string;
                                 const img = new Image();
                                 img.onload = () => {
                                     const cvs = document.createElement('canvas');
                                     cvs.width = img.width; cvs.height = img.height;
                                     const ctx = cvs.getContext('2d')!;
                                     ctx.drawImage(img, 0, 0);
                                     const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
                                     const data = imageData.data;
                                     
                                     for (let i = 0; i < data.length; i += 4) {
                                         const origAlpha = data[i + 3];
                                         if (origAlpha === 0) continue;

                                         const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
                                         const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                                         
                                         let alpha = origAlpha;
                                         if (lum > 220) {
                                            alpha = 0; // Pure white paper becomes fully transparent
                                         } else if (lum > 140) {
                                            // Smooth anti-aliasing for edges
                                            alpha = Math.min(origAlpha, Math.floor(255 - ((lum - 140) * 255 / 80)));
                                         }
                                         data[i + 3] = alpha;
                                     }
                                     ctx.putImageData(imageData, 0, 0);
                                     setUploadedSignatureUrl(cvs.toDataURL('image/png'));
                                 };
                                 img.src = rawData;
                             };
                             reader.readAsDataURL(e.target.files[0]);
                         }
                     }} />
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
                <button onClick={() => setShowModal(false)} className="px-6 py-2 text-[10px] uppercase font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors">Cancel</button>
                <button onClick={() => {
                   if (activeTab === 'draw' && !padRef.current?.isEmpty()) addSignature(padRef.current!.toDataURL());
                   else if (activeTab === 'type' && typedName) {
                      const cvs = document.createElement('canvas'); cvs.width = 600; cvs.height = 200;
                      const ctx = cvs.getContext('2d')!; ctx.font = `60px ${selectedFont.family}`; ctx.fillStyle = sigColor;
                      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(typedName, 300, 100);
                      addSignature(cvs.toDataURL());
                   }
                   else if (activeTab === 'upload' && uploadedSignatureUrl) {
                      addSignature(uploadedSignatureUrl);
                      setUploadedSignatureUrl(null);
                   }
                }} className="px-8 py-2 bg-black dark:bg-white dark:text-black text-white text-[10px] uppercase font-bold hover:bg-[#c5a059] dark:hover:bg-[#c5a059] transition-colors rounded">Apply</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ToolLayout>
  );
}
