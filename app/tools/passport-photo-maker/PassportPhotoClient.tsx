"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Download, Check, Printer, ChevronDown, Loader2, Image as ImageIcon, ShieldCheck, Maximize2, RefreshCw, X, Palette, Layout, Settings2, CheckCircle2, Zap, Database, Activity, BarChart3, Target, Scissors, Layers, Monitor, FileType, ArrowLeft, Pipette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { removeBackground } from '@imgly/background-removal';
import jsPDF from 'jspdf';
import { ToolLayout } from "@/components/tool-layout";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRESETS = [
  { name: "USA / India (2x2\")", width: 51, height: 51, ratio: 1/1 },
  { name: "UK / Europe (35x45mm)", width: 35, height: 45, ratio: 35/45 },
  { name: "Schengen Visa (35x45mm)", width: 35, height: 45, ratio: 35/45 },
  { name: "China Visa (33x48mm)", width: 33, height: 48, ratio: 33/48 },
  { name: "Australia (35x45mm)", width: 35, height: 45, ratio: 35/45 },
  { name: "Japan (35x45mm)", width: 35, height: 45, ratio: 35/45 },
];

const BG_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Off-White", value: "#F5F5F5" },
  { name: "Light Blue", value: "#E3F2FD" },
  { name: "Royal Blue", value: "#0D47A1" },
  { name: "Light Gray", value: "#F0F0F0" },
];

export default function PassportPhotoClient() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [removedBgUrl, setRemovedBgUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [selectedBg, setSelectedBg] = useState(BG_COLORS[0].value);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [paperSize, setPaperSize] = useState<'single' | '4x6' | 'A4'>('4x6');
  
  const cropperRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 4 && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [step]);

  const handleFile = async (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
    setStep(2); setProcessing(true); setProgress(0);
    try {
      const resultBlob = await removeBackground(f, { progress: (_, c, t) => setProgress(Math.round((c/t)*100)) });
      setRemovedBgUrl(URL.createObjectURL(resultBlob));
      setStep(3);
    } catch (e) {
      setRemovedBgUrl(url); setStep(3);
      toast.error("BG removal failed, proceeding with original.");
    } finally { setProcessing(false); }
  };

  const onConfirmCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas({ 
        width: 800, 
        height: 800 / selectedPreset.ratio,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });
      setCroppedUrl(croppedCanvas.toDataURL('image/png'));
      setStep(4);
    }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current; if (!canvas || !croppedUrl) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpi = 300;
    const mmToPx = (mm: number) => (mm / 25.4) * dpi;

    if (paperSize === 'A4') { canvas.width = 2480; canvas.height = 3508; }
    else if (paperSize === '4x6') { canvas.width = 1800; canvas.height = 1200; }
    else { canvas.width = mmToPx(selectedPreset.width); canvas.height = mmToPx(selectedPreset.height); }

    ctx.fillStyle = "#FFFFFF"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const img = new Image();
    img.onload = () => {
      const photoW = mmToPx(selectedPreset.width); const photoH = mmToPx(selectedPreset.height);
      const margin = mmToPx(5); const pageMargin = paperSize === 'single' ? 0 : mmToPx(15);
      
      let cols = 1, rows = 1;
      if (paperSize !== 'single') {
        cols = Math.floor((canvas.width - 2 * pageMargin + margin) / (photoW + margin));
        rows = Math.floor((canvas.height - 2 * pageMargin + margin) / (photoH + margin));
      }

      const totalW = cols * photoW + (cols - 1) * margin;
      const totalH = rows * photoH + (rows - 1) * margin;
      const offsetX = (canvas.width - totalW) / 2;
      const offsetY = (canvas.height - totalH) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = paperSize === 'single' ? 0 : offsetX + c * (photoW + margin);
          const y = paperSize === 'single' ? 0 : offsetY + r * (photoH + margin);
          ctx.fillStyle = selectedBg; ctx.fillRect(x, y, photoW, photoH);
          ctx.drawImage(img, x, y, photoW, photoH);
          if (paperSize !== 'single') {
            ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, photoW, photoH);
          }
        }
      }
    };
    img.src = croppedUrl;
  };

  useEffect(() => { if (step === 4) renderCanvas(); }, [step, croppedUrl, selectedBg, paperSize, selectedPreset]);

  const exportFile = (fmt: 'pdf' | 'jpg' | 'png' | 'webp') => {
    const canvas = canvasRef.current; if (!canvas) return;
    if (fmt === 'pdf') {
      const dims: [number, number] = paperSize === 'A4' ? [210, 297] : (paperSize === '4x6' ? [152.4, 101.6] : [selectedPreset.width, selectedPreset.height]);
      const pdf = new jsPDF({ orientation: dims[0] > dims[1] ? 'l' : 'p', unit: 'mm', format: dims });
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, dims[0], dims[1]); pdf.save('passport-photos-toollix.pdf');
    } else {
      const a = document.createElement('a'); 
      const mime = fmt === 'png' ? 'image/png' : (fmt === 'webp' ? 'image/webp' : 'image/jpeg');
      a.href = canvas.toDataURL(mime, 0.98); a.download = `passport-photos-toollix.${fmt}`; a.click();
    }
  };

  const resetAll = () => {
    setFile(null); setOriginalUrl(null); setRemovedBgUrl(null); setCroppedUrl(null); setStep(1); setProgress(0);
  };

  const goBack = () => {
    if (step === 3) setStep(1);
    if (step === 4) setStep(3);
  };

  return (
    <ToolLayout title="Passport Photo Studio" description="Print-ready identity extraction suite." fullWidth={false}>
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 lg:sticky lg:top-24">
            
            {step === 1 && (
               <div className="bg-white dark:bg-zinc-900 border border-zinc-200 rounded-[1.5rem] p-5 space-y-5 shadow-sm animate-in slide-in-from-left-4 duration-300">
                  <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Resource Buffer</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 01</p></div>
                  {!file ? (
                     <label className="w-full group cursor-pointer block">
                        <div className="relative rounded-xl p-6 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-center space-y-3 transition-all hover:bg-white">
                          <Upload className="w-4 h-4 text-[#c5a059]" />
                          <div className="space-y-0.5"><p className="text-[9px] font-black uppercase tracking-widest">Select Portrait</p><p className="text-[7px] font-bold text-muted-foreground uppercase leading-none opacity-50">JPG, PNG, WEBP</p></div>
                          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                        </div>
                     </label>
                  ) : (
                     <div className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-lg border border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 truncate">
                           <ImageIcon className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                           <div className="truncate"><p className="text-[9px] font-black uppercase tracking-tight truncate leading-none mb-0.5">{file.name}</p><p className="text-[8px] font-bold text-[#c5a059] uppercase italic opacity-60">Asset Buffered</p></div>
                        </div>
                        <button onClick={resetAll} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"><X className="w-3.5 h-3.5" /></button>
                     </div>
                  )}
               </div>
            )}

            {step === 3 && (
               <div className="bg-white dark:bg-zinc-900 border border-zinc-200 rounded-[1.5rem] p-5 space-y-5 shadow-sm animate-in slide-in-from-left-4 duration-300">
                  <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Geometric Framing</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 03</p></div>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Standard</label>
                        <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                           {PRESETS.map(p => (
                              <button key={p.name} onClick={() => setSelectedPreset(p)} className={cn("flex flex-col p-2.5 rounded-lg border text-left transition-all", selectedPreset.name === p.name ? "bg-[#c5a059] border-[#c5a059] text-white shadow-md" : "bg-zinc-50 text-muted-foreground border-zinc-100")}>
                                 <span className="text-[9px] font-black uppercase tracking-tight leading-none">{p.name}</span>
                                 <span className={cn("text-[7px] font-bold mt-1 uppercase", selectedPreset.name === p.name ? "text-white/60" : "text-muted-foreground/40")}>{p.width}x{p.height}mm</span>
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col gap-2">
                        <Button onClick={onConfirmCrop} className="w-full h-11 bg-[#c5a059] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg">CONFIRM CROP</Button>
                        <Button onClick={goBack} variant="outline" className="w-full h-10 border-2 rounded-xl font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-2">
                           <ArrowLeft className="w-3 h-3" /> BACK TO PORTRAIT
                        </Button>
                     </div>
                  </div>
               </div>
            )}

            {step === 4 && (
               <div className="bg-white dark:bg-zinc-900 border border-zinc-200 rounded-[1.5rem] p-5 space-y-5 shadow-sm animate-in slide-in-from-left-4 duration-300">
                  <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Visual Synthesis</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 04</p></div>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject Background</label>
                        <div className="flex flex-wrap gap-2 items-center">
                           {BG_COLORS.map(c => (
                              <button key={c.name} onClick={() => setSelectedBg(c.value)} className={cn("w-7 h-7 rounded-full border-2 transition-all", selectedBg === c.value ? "border-[#c5a059] scale-110 shadow-sm" : "border-zinc-100")} style={{ backgroundColor: c.value }} title={c.name} />
                           ))}
                           <div className="relative group">
                              <input type="color" value={selectedBg} onChange={(e) => setSelectedBg(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                              <div className={cn("w-7 h-7 rounded-full border-2 flex items-center justify-center bg-zinc-50 border-zinc-100", !BG_COLORS.find(c => c.value === selectedBg) && "border-[#c5a059] scale-110")}><Pipette className="w-3 h-3 opacity-40" /></div>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sheet Protocol</label>
                        <div className="grid grid-cols-3 gap-1.5">
                           {(['single', '4x6', 'A4'] as const).map(s => (
                              <button key={s} onClick={() => setPaperSize(s)} className={cn("h-8 text-[8px] font-black rounded-lg uppercase tracking-widest transition-all", paperSize === s ? "bg-[#c5a059] text-white" : "bg-zinc-50 text-muted-foreground border-zinc-100")}>{s}</button>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col gap-2 pt-2">
                        <Button onClick={() => exportFile('pdf')} className="w-full h-11 bg-[#c5a059] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md flex items-center justify-center gap-2">
                           <Printer className="w-3.5 h-3.5" /> PRINT PDF MANIFEST
                        </Button>
                           <DropdownMenu>
                              <DropdownMenuTrigger>
                                 <Button asChild variant="outline" className="w-full h-11 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 flex items-center justify-center gap-2 group cursor-pointer">
                                    <div>
                                       <Download className="w-3.5 h-3.5" /> DOWNLOAD IMAGE <ChevronDown className="w-2.5 h-2.5 opacity-30 group-data-[state=open]:rotate-180 transition-transform" />
                                    </div>
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl border-2 shadow-2xl bg-white dark:bg-zinc-900 p-1 z-[100] font-black text-[9px] uppercase tracking-widest animate-in fade-in zoom-in-95">
                                 <DropdownMenuItem onClick={() => exportFile('jpg')} className="cursor-pointer py-3 px-4 focus:bg-zinc-50 dark:focus:bg-zinc-800 rounded-lg outline-none flex items-center gap-3"><FileType className="w-4 h-4 text-[#c5a059]" /> JPG FORMAT</DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => exportFile('png')} className="cursor-pointer py-3 px-4 focus:bg-zinc-50 dark:focus:bg-zinc-800 rounded-lg outline-none flex items-center gap-3"><FileType className="w-4 h-4 text-[#c5a059]" /> PNG FORMAT</DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => exportFile('webp')} className="cursor-pointer py-3 px-4 focus:bg-zinc-50 dark:focus:bg-zinc-800 rounded-lg outline-none flex items-center gap-3"><FileType className="w-4 h-4 text-[#c5a059]" /> WEBP FORMAT</DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        <Button onClick={goBack} variant="outline" className="w-full h-10 border-2 rounded-xl font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-2">
                           <ArrowLeft className="w-3.5 h-3.5" /> BACK TO CROP
                        </Button>
                     </div>
                  </div>
               </div>
            )}

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Safe Iso</span></div>
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><Zap className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Turbo Syn</span></div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            
            <div className="lg:hidden flex items-center justify-center gap-3 py-2">
               {[1, 2, 3, 4].map(s => (
                  <div key={s} className={cn("w-2 h-2 rounded-full transition-all", step === s ? "bg-[#c5a059] w-6" : "bg-zinc-200")} />
               ))}
            </div>

            {step === 4 && (
              <div ref={successRef} className="animate-in zoom-in-95 duration-700 w-full">
                 <div className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-[#c5a059]/30 flex flex-col gap-5 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
                       <div className="flex items-center gap-4 min-w-fit">
                          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner"><CheckCircle2 className="w-5 h-5" /></div>
                          <div><h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">Manifest Complete</h3><p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.3em] italic leading-none">Identity Grid Generated</p></div>
                       </div>
                       <div className="flex gap-2 w-full sm:w-auto items-center justify-center sm:justify-end">
                          <Button onClick={resetAll} variant="outline" className="h-10 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 shrink-0">NEW STUDIO</Button>
                          <Button onClick={() => exportFile('pdf')} className="h-10 px-4 rounded-lg bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-md text-[9px] shrink-0">DOWNLOAD PDF</Button>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 rounded-[1.5rem] min-h-[450px] lg:min-h-[550px] p-5 flex flex-col relative shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                  <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Matrix</span><p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">
                     {step === 1 ? "Resource Input" : step === 2 ? "Subject Isolation" : step === 3 ? "Geometric Framing" : "Visual Synthesis"}
                  </p></div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full bg-[#c5a059]", processing && "animate-pulse")} /> {processing ? "SYNCING" : "LIVE"}
                  </div>
               </div>
               
               <div className="flex-1 flex flex-col items-center justify-center">
                  {step === 1 && (
                    <div className="opacity-20 flex flex-col items-center gap-6"><Monitor className="w-16 h-16 text-zinc-300 mb-2" /><p className="text-xs font-black uppercase tracking-widest italic text-zinc-400 text-center">Awaiting Portrait Resource<br/><span className="text-[8px] opacity-50">High-resolution recommended</span></p></div>
                  )}

                  {step === 2 && (
                    <div className="w-full max-w-sm space-y-6 animate-in fade-in">
                       <div className="relative flex justify-center">
                          <div className="w-24 h-24 rounded-full border-4 border-[#c5a059]/10 border-t-[#c5a059] animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center"><Layers className="w-8 h-8 text-[#c5a059] animate-pulse" /></div>
                       </div>
                       <div className="space-y-3">
                          <Progress value={progress} className="h-1.5 bg-zinc-100" />
                          <div className="flex justify-between items-center"><span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">Neural Masking Phase</span><span className="text-[10px] font-black text-[#c5a059] italic">{progress}%</span></div>
                       </div>
                    </div>
                  )}

                  {step === 3 && removedBgUrl && (
                    <div className="w-full flex-1 flex flex-col gap-4 animate-in zoom-in-95">
                       <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-2 sm:p-4 h-[350px] sm:h-[450px]">
                          <Cropper key={selectedPreset.name} src={removedBgUrl} style={{ height: '100%', width: '100%' }} aspectRatio={selectedPreset.ratio} guides={true} ref={cropperRef} viewMode={1} background={false} autoCropArea={0.8} />
                       </div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-center text-muted-foreground italic">Align face within guidelines for {selectedPreset.name}</p>
                    </div>
                  )}

                  {step === 4 && croppedUrl && (
                    <div className="w-full flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in">
                       <div className={cn("bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center overflow-hidden w-full shadow-inner", paperSize === 'single' ? "max-w-xs aspect-square p-8" : "max-w-md p-4 sm:p-8")} style={{ backgroundImage: "radial-gradient(#c5a059 0.5px, transparent 0.5px)", backgroundSize: "15px 15px" }}>
                          <canvas ref={canvasRef} className={cn("shadow-2xl border border-zinc-200 bg-white", paperSize === 'single' ? "w-full h-auto" : "max-w-full h-auto")} />
                       </div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40 italic">
                          {paperSize === 'single' ? "Single High-Resolution Extraction" : paperSize === '4x6' ? "4x6 Standard Photo Print Sheet" : "A4 Full Production Sheet"}
                       </p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.1); border-radius: 4px; }`}</style>
    </ToolLayout>
  );
}
