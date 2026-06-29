"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ToolLayout } from "@/components/tool-layout";
import { validateUpload } from "@/lib/upload-limits";
import { Button } from "@/components/ui/button";
import {
  ScanLine, Camera, Copy, ExternalLink, CheckCircle2,
  XCircle, RefreshCw, ImageIcon, Zap, Smartphone, Share2, ShieldCheck, Target, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function QrScannerClient() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [scanMode, setScanMode] = useState<"camera" | "upload">("camera");
  const [fileLoading, setFileLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();

  const startCamera = async () => {
    setResult(null);
    setError(null);
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch {}
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 280, height: 280 },
        },
        (decodedText: string) => {
          setResult(decodedText);
          scanner.stop().catch(() => {});
          setScanning(false);
          toast.success("QR Code Decoded!");
        },
        () => {} // ignore errors during scanning
      );
    } catch (err: any) {
      setError("Camera access denied or not available. Try uploading a QR image instead.");
      setScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setResult(null);
    setError(null);
    setFileLoading(true);

    const file = e.target.files[0];
    const validation = validateUpload([file], session);
    if (!validation.valid) {
      setError(validation.message);
      setFileLoading(false);
      return;
    }

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader-file");
      const decoded = await scanner.scanFile(file, true);
      setResult(decoded);
      toast.success("QR Code Extracted!");
    } catch (err: any) {
      console.error("Scan error:", err);
      setError("No QR code found in this image. Please try a clearer photo or a direct screen capture.");
    } finally {
      setFileLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Decoded content copied!");
  };

  const isUrl = (text: string) => {
    try { new URL(text); return true; } catch { return false; }
  };

  const reset = () => {
    if (scannerRef.current) {
      try { scannerRef.current.stop(); } catch {}
    }
    setResult(null);
    setError(null);
    setScanning(false);
    setCopied(false);
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
      }
    };
  }, []);

  return (
    <ToolLayout
      title="QR Code Scanner"
      description="Scan QR codes using your camera or by uploading an image. Fast, secure, and works entirely in your browser."
      fullWidth={true}
    >
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 items-start w-full overflow-x-hidden">
        
        {/* LEFT COLUMN: Studio Workspace */}
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 order-1 lg:order-1">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-10 flex flex-col relative shadow-2xl overflow-hidden min-h-[500px] lg:min-h-[700px]">
               
               <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <div className="flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Visual Monitor</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059] opacity-80">Spectrum Feed</p>
                  </div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                     <div className={cn("w-2 h-2 rounded-full bg-[#c5a059]", scanning ? "animate-ping" : "animate-pulse")} /> 
                     {scanning ? "SCANNING..." : result ? "SUCCESS" : "READY"}
                  </div>
               </div>

               <div className="flex-1 flex flex-col items-center justify-center relative">
                  
                  {/* Camera Scanner Workspace */}
                  {scanMode === "camera" && !result && (
                    <div className="w-full max-w-2xl animate-in zoom-in-95 duration-700">
                      <div className="relative aspect-square w-full rounded-[3rem] sm:rounded-[4rem] overflow-hidden bg-black border-8 sm:border-[12px] border-white dark:border-zinc-800 shadow-2xl group/scanner">
                         <div id="qr-reader" className="w-full h-full" />
                         
                         {!scanning && (
                           <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl z-20">
                              <div className="w-40 h-40 rounded-[3rem] bg-[#c5a059]/5 border-2 border-dashed border-[#c5a059]/20 flex items-center justify-center mb-8 relative group-hover/scanner:scale-105 transition-transform duration-700">
                                 <ScanLine className="w-16 h-16 text-[#c5a059]/40" />
                                 <div className="absolute inset-0 bg-[#c5a059]/5 animate-pulse rounded-[3rem]" />
                              </div>
                              <Button 
                                className="h-16 px-10 bg-[#c5a059] text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all border-none uppercase tracking-widest text-xs"
                                onClick={startCamera}
                                disabled={scanning}
                              >
                                 Start Live Scan
                              </Button>
                           </div>
                         )}

                         {scanning && (
                           <>
                             <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-6 py-3 bg-white dark:bg-zinc-900 rounded-full border border-[#c5a059]/20 shadow-2xl">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a059]">Live Feed</span>
                             </div>
                             <div className="absolute top-8 left-8 w-10 h-10 border-t-4 border-l-4 border-[#c5a059] rounded-tl-xl z-10" />
                             <div className="absolute top-8 right-8 w-10 h-10 border-t-4 border-r-4 border-[#c5a059] rounded-tr-xl z-10" />
                             <div className="absolute bottom-8 left-8 w-10 h-10 border-b-4 border-l-4 border-[#c5a059] rounded-bl-xl z-10" />
                             <div className="absolute bottom-8 right-8 w-10 h-10 border-b-4 border-r-4 border-[#c5a059] rounded-br-xl z-10" />
                             <div className="absolute inset-x-8 top-0 h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent shadow-[0_0_20px_#c5a059] animate-[scan_3s_linear_infinite] z-10" />
                           </>
                         )}
                      </div>
                    </div>
                  )}

                   {/* Upload Scanner Workspace */}
                  {scanMode === "upload" && !result && (
                    <div className="w-full max-w-2xl animate-in zoom-in-95 duration-700">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative w-full aspect-square rounded-[3rem] sm:rounded-[4rem] bg-zinc-50 dark:bg-zinc-800/50 border-4 border-dashed border-[#c5a059]/20 hover:border-[#c5a059]/40 transition-all cursor-pointer overflow-hidden shadow-inner-soft"
                      >
                        <div className="absolute inset-0 bg-[#c5a059]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
                           <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-zinc-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700 border border-[#c5a059]/10">
                              {fileLoading ? (
                                <Loader2 className="w-12 h-12 text-[#c5a059] animate-spin" />
                              ) : (
                                <ImageIcon className="w-12 h-12 text-[#c5a059]" />
                              )}
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white italic">
                                {fileLoading ? "Analyzing..." : "Drop QR Image"}
                              </h3>
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-relaxed italic">
                                {fileLoading ? "Scanning pixels for patterns" : "Click to browse or drag & drop"}
                              </p>
                           </div>
                           <Button variant="outline" className="rounded-xl px-8 h-10 border-[#c5a059]/20 hover:bg-[#c5a059]/5 font-black text-[9px] uppercase tracking-widest pointer-events-none">
                              <span>Browse Files</span>
                           </Button>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </div>
                  )}

                  {/* Result Hub */}
                  {result && (
                    <div className="w-full max-w-2xl animate-in zoom-in-95 fade-in duration-700">
                       <div className="bg-white dark:bg-zinc-900 p-8 sm:p-12 rounded-[3rem] sm:rounded-[4rem] border border-[#c5a059]/20 shadow-2xl relative overflow-hidden group/result">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                          
                          <div className="relative z-10 space-y-10">
                             <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-[#c5a059] rounded-2xl flex items-center justify-center shadow-xl group-hover/result:scale-110 transition-transform duration-700">
                                   <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <div className="space-y-1 text-left">
                                   <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">Content Decoded</h3>
                                   <p className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest italic">Fast Spectrum Scan</p>
                                </div>
                             </div>

                             <div className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 shadow-inner-soft group-hover/result:bg-zinc-100 dark:group-hover/result:bg-zinc-800 transition-colors duration-700">
                                <p className="font-mono text-sm font-bold text-[#c5a059] break-all leading-relaxed text-center">{result}</p>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <Button
                                  className="h-14 rounded-2xl bg-[#c5a059] text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                                  onClick={copyResult}
                                >
                                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                  {copied ? "COPIED" : "COPY TEXT"}
                                </Button>
                                {isUrl(result) ? (
                                  <Button
                                    className="h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                                    onClick={() => window.open(result, "_blank", "noopener,noreferrer")}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    OPEN LINK
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    className="h-14 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 font-black text-xs uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                                    onClick={reset}
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    RESET SCAN
                                  </Button>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {error && (
                    <div className="w-full max-w-xl p-6 bg-red-500/5 border-2 border-red-500/10 rounded-[2rem] flex items-center gap-5 animate-in slide-in-from-bottom-4 duration-700">
                       <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                          <XCircle className="w-5 h-5 text-white" />
                       </div>
                       <div className="space-y-1 text-left">
                          <p className="text-[9px] font-black uppercase tracking-widest text-red-500 italic">Scan Error</p>
                          <p className="text-xs font-bold text-red-900 dark:text-red-100 leading-tight">{error}</p>
                       </div>
                    </div>
                  )}
               </div>

               {/* Hidden Scanner Targets to ensure DOM presence */}
               <div className="hidden">
                  <div id="qr-reader-file" />
               </div>

               {/* Footer Branding Overlay */}
               <div className="absolute bottom-10 right-10 flex items-center gap-4 hidden sm:flex">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none mb-1">Session ID</p>
                        <p className="text-[10px] font-mono font-black text-[#c5a059] uppercase leading-none opacity-60">
                           {mounted ? sessionId : "------"}
                        </p>
                    </div>
                    <div className="w-px h-6 bg-zinc-100 dark:bg-zinc-800" />
                    <Zap className="w-4 h-4 text-[#c5a059]" />
               </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Controls */}
        <div className="w-full lg:sticky lg:top-28 space-y-6 animate-in fade-in slide-in-from-left-8 duration-700 order-2 lg:order-2">
            
            {/* Phase 01: Mode Selector */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 space-y-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/5 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Settings</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Select Interface</p>
               </div>

               <div className="flex bg-zinc-50 dark:bg-zinc-800/80 p-1.5 rounded-2xl shadow-inner-soft relative z-10">
                  <button
                    onClick={() => { setScanMode("camera"); reset(); }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                      scanMode === "camera" ? "bg-white dark:bg-zinc-700 text-[#c5a059] shadow-md" : "text-muted-foreground/60 hover:text-[#c5a059]"
                    )}
                  >
                    <Camera className="w-3.5 h-3.5" /> Camera
                  </button>
                  <button
                    onClick={() => { setScanMode("upload"); reset(); }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                      scanMode === "upload" ? "bg-white dark:bg-zinc-700 text-[#c5a059] shadow-md" : "text-muted-foreground/60 hover:text-[#c5a059]"
                    )}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> File
                  </button>
               </div>

               {result && (
                 <div className="pt-2">
                    <Button 
                      variant="outline"
                      className="w-full h-12 rounded-xl border-2 border-dashed border-[#c5a059]/20 font-black text-[9px] uppercase tracking-widest text-[#c5a059] hover:bg-[#c5a059]/5 transition-all"
                      onClick={reset}
                    >
                       <RefreshCw className="w-3.5 h-3.5 mr-2" /> New Scan
                    </Button>
                 </div>
               )}
            </div>

            {/* Support Info: Ecosystem */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 space-y-6 shadow-xl relative overflow-hidden group">
               <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center shadow-sm">
                     <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white leading-none">Security</h4>
                    <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest mt-1">Local Processing</p>
                  </div>
               </div>

               <div className="space-y-3">
                  {[
                    { icon: Target, label: "Precision" },
                    { icon: Smartphone, label: "Mobile First" },
                    { icon: Share2, label: "Instant Copy" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                       <div className="flex items-center gap-3">
                          <item.icon className="w-3.5 h-3.5 text-[#c5a059] opacity-40" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                       </div>
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                  ))}
               </div>
            </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes scan {
          from { transform: translateY(0); }
          to { transform: translateY(480px); }
        }
        .shadow-inner-soft {
           box-shadow: inset 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </ToolLayout>
  );
}
