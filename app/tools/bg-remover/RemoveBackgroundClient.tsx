"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Download, Check, RefreshCw, Loader2, Sparkles, Image as ImageIcon, CheckCircle2, Zap, Layers, Target, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { ToolLayout } from "@/components/tool-layout";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { validateUpload } from "@/lib/upload-limits";

export function RemoveBackgroundClient() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<string>('');
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const { data: session } = useSession();
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 3 && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [step]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const validation = validateUpload([selected], session);
      if (!validation.valid) {
        toast.error(validation.message);
        return;
      }
      setFile(selected);
      const objUrl = URL.createObjectURL(selected);
      setOriginalUrl(objUrl);
      setStep(2);
      setResultUrl(null);
      setProcessingState('Preparing your image...');
      setAnalyzingProgress(10);
      try {
        setProcessingState('Removing background...');
        const { removeBackground } = await import("@imgly/background-removal");
        const resultBlob = await removeBackground(selected, {
            progress: (key, current, total) => {
                setAnalyzingProgress(Math.min(10 + Math.round((current / total) * 85), 95));
            }
        });
        setAnalyzingProgress(100);
        setProcessingState('Finalizing...');
        const pngBlob = resultBlob.slice(0, resultBlob.size, "image/png");
        setResultUrl(URL.createObjectURL(pngBlob));
        setStep(3);
      } catch (error) {
        toast.error("Background removal failed.");
        setStep(1); setFile(null); setOriginalUrl(null);
      }
    }
  };

  const reset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setOriginalUrl(null); setResultUrl(null); setStep(1); setAnalyzingProgress(0);
  };

  const downloadImage = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `no-bg-${file?.name?.replace(/\.[^.]+$/, "") || "image"}.png`;
    a.click();
  };

  return (
    <ToolLayout 
      title="Background Remover" 
      description="Advanced subject isolation engine."
      fullWidth={false}
    >
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-8 space-y-4 order-2 lg:order-1">
            <div className={cn(
                "bg-zinc-50 dark:bg-zinc-900/50 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col items-center relative transition-all duration-700 shadow-sm",
                step > 1 ? "min-h-[300px] justify-start" : "min-h-[500px] justify-center"
            )}>
               
               {step < 3 && (
                <div className="absolute top-6 left-8 flex items-center gap-2.5">
                   <div className="w-7 h-7 bg-[#c5a059]/10 text-[#c5a059] rounded-lg flex items-center justify-center">
                      <Target className="w-3.5 h-3.5" />
                   </div>
                   <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground italic leading-none">Extraction Studio</h3>
                </div>
               )}

               {step === 1 ? (
                  <div className="flex flex-col items-center gap-6 py-12">
                     <div className="relative group">
                        <div className="absolute -inset-6 bg-[#c5a059]/10 blur-[30px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-20 h-20 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-[#c5a059] rounded-[1.5rem] flex items-center justify-center shadow-xl">
                           <Upload className="w-8 h-8" />
                        </div>
                     </div>
                     <div className="text-center space-y-1">
                        <h3 className="text-lg font-black uppercase tracking-widest leading-none">Load Source Asset</h3>
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic opacity-50">JPG, PNG, WEBP</p>
                     </div>
                     <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" id="image-upload" onChange={handleFileChange} />
                     <Button asChild className="h-14 px-10 rounded-xl bg-[#c5a059] text-white font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all">
                        <label htmlFor="image-upload">Select Asset</label>
                     </Button>
                  </div>
               ) : step === 2 ? (
                  <div className="w-full flex-1 flex flex-col items-center justify-center space-y-8 py-12">
                     <div className="relative">
                        <div className="w-16 h-16 rounded-full border-3 border-[#c5a059]/10 border-t-[#c5a059] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Sparkles className="w-4 h-4 text-[#c5a059] animate-pulse" />
                        </div>
                     </div>
                     <div className="text-center space-y-3 w-full max-w-[200px]">
                        <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground italic">{processingState}</h3>
                        <div className="space-y-1.5">
                           <Progress value={analyzingProgress} className="h-1.5 bg-[#c5a059]/10" />
                           <p className="text-[7px] font-black text-[#c5a059] italic text-right uppercase tracking-[0.2em]">{analyzingProgress}% SECURED</p>
                        </div>
                     </div>
                  </div>
               ) : step === 3 && resultUrl && (
                  <div className="w-full animate-in fade-in duration-700 space-y-4">
                     <div ref={successRef} className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-[#c5a059]/30 flex flex-col gap-5 shadow-lg relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner">
                                 <CheckCircle2 className="w-5 h-5" />
                              </div>
                              <div>
                                 <h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">Masking Complete</h3>
                                 <p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.2em] italic leading-none">Transparency Verified</p>
                              </div>
                           </div>
                           <Button onClick={downloadImage} className="h-10 px-6 rounded-lg bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-md transition-all hover:scale-105 active:scale-95 border-none text-[10px] w-full sm:w-auto">
                              DOWNLOAD PNG
                           </Button>
                        </div>
                        <div className="relative group bg-zinc-50 dark:bg-zinc-950/30 rounded-[1.5rem] border border-zinc-200 p-6 min-h-[300px] flex items-center justify-center overflow-hidden"
                             style={{ backgroundImage: "radial-gradient(#c5a059 0.5px, transparent 0.5px)", backgroundSize: "10px 10px" }}
                        >
                           <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-[0.5px]" />
                           <img src={resultUrl} alt="Result" className="relative z-10 max-h-[350px] w-auto object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-105" />
                        </div>
                     </div>
                     <Button onClick={reset} variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground font-black text-[8px] uppercase tracking-widest border-2 border-dashed">Another Asset</Button>
                  </div>
               )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4 order-3 lg:order-2 lg:sticky lg:top-24">
            <div className={cn("bg-white dark:bg-zinc-950 p-6 rounded-[1.5rem] border border-zinc-200 space-y-6 shadow-sm", step === 1 && "opacity-40 grayscale blur-[1px]")}>
               <div className="space-y-0.5 border-b border-zinc-100 pb-3">
                  <h2 className="text-xs font-black text-foreground tracking-tight uppercase">Studio Driver</h2>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic opacity-50">Extraction Logic</p>
               </div>
               <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 space-y-3">
                     <div className="flex items-center gap-2.5 truncate">
                        <ImageIcon className="w-3.5 h-3.5 text-[#c5a059] opacity-40" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground truncate">{file?.name || "No asset"}</span>
                     </div>
                     <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">Neural Mask Active</span>
                     </div>
                  </div>
                  <div className="h-10 bg-[#c5a059] text-white rounded-lg flex items-center justify-center text-[9px] font-black uppercase tracking-widest shadow-md">Lossless PNG</div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-zinc-100 shadow-sm"><Sparkles className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">AI Mask</span></div>
               <div className="bg-white p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-zinc-100 shadow-sm"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Safe Enc</span></div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
