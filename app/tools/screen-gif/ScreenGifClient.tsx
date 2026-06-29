"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Loader2, Video, Download, Play, Square, ImageIcon, Check, X, ShieldCheck, Zap, Database, Activity, BarChart3, CheckCircle2, Settings2, Monitor } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ScreenGifClient() {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('standard');
  const successRef = useRef<HTMLDivElement>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => { loadFFmpeg(); }, []);
  useEffect(() => {
    if (gifBlob && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [gifBlob]);

  const loadFFmpeg = async () => {
    try {
      const ffmpegInstance = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      ffmpegInstance.on('progress', ({ progress }) => {
        let p = Math.round(progress * 100);
        if (!isNaN(p)) setProgress(p);
      });
      setFfmpeg(ffmpegInstance); setIsReady(true);
    } catch (err) { toast.error("Engine failed to load"); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 }, width: { max: 1920 } },
        audio: false
      });
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder; chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob); stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start(1000); setRecording(true); setVideoBlob(null); setGifBlob(null);
    } catch (err) { toast.error("Capture Failed"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const convertToGif = async () => {
    if (!ffmpeg || !videoBlob) return;
    setProcessing(true); setProgress(0);
    try {
      const inputData = await fetchFile(videoBlob);
      await ffmpeg.writeFile('input.webm', inputData);
      let filterComplex = '[0:v] fps=10,scale=800:-1:flags=lanczos,split [a][b];[a] palettegen [p];[b][p] paletteuse';
      if (quality === 'high') filterComplex = '[0:v] fps=15,scale=1280:-1:flags=lanczos,split [a][b];[a] palettegen [p];[b][p] paletteuse';
      else if (quality === 'ultra') filterComplex = '[0:v] fps=24,scale=1920:-1:flags=lanczos,split [a][b];[a] palettegen [p];[b][p] paletteuse';
      await ffmpeg.exec(['-f', 'webm', '-i', 'input.webm', '-filter_complex', filterComplex, '-f', 'gif', '-y', 'output.gif']);
      const data = await ffmpeg.readFile('output.gif');
      setGifBlob(new Blob([data as any], { type: 'image/gif' }));
      setProgress(100);
    } catch (err) { toast.error("Conversion failed"); } finally { setProcessing(false); }
  };

  const resetAll = () => {
    setVideoBlob(null); setGifBlob(null); setRecording(false); setProcessing(false); setProgress(0);
  };

  return (
    <ToolLayout title="Screen to GIF" description="Professional browser-native capture studio." fullWidth={false}>
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 space-y-5 shadow-sm">
               <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Capture Driver</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Phase 01</p></div>
               <div className="space-y-4">
                  <div className="space-y-3">
                     <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Resolution Protocol</label>
                     <div className="grid grid-cols-1 gap-2">
                        {[
                           { id: 'standard', label: 'Standard (800px)', detail: 'Fast' },
                           { id: 'high', label: 'High Def (1280px)', detail: 'HD' },
                           { id: 'ultra', label: 'Ultra (1920px)', detail: 'Pro' }
                        ].map(q => (
                           <button key={q.id} onClick={() => setQuality(q.id as any)} disabled={recording || processing} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all text-left", quality === q.id ? "bg-[#c5a059] border-[#c5a059] text-white shadow-md" : "bg-zinc-50 text-muted-foreground border-zinc-100")}>
                              <div className="space-y-0.5"><p className="text-[9px] font-black uppercase tracking-widest">{q.label}</p><p className={cn("text-[7px] font-bold uppercase", quality === q.id ? "text-white/60" : "text-muted-foreground/50")}>{q.detail}</p></div>
                              {quality === q.id && <Check className="w-3.5 h-3.5" />}
                           </button>
                        ))}
                     </div>
                  </div>
                  {!recording ? (
                     <Button onClick={startRecording} disabled={!isReady || processing} className="w-full h-12 bg-[#c5a059] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95">
                        {!isReady ? "ENGINE LOADING..." : "START RECORDING"}
                     </Button>
                  ) : (
                     <Button onClick={stopRecording} className="w-full h-12 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg animate-pulse">STOP CAPTURE</Button>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Safe Render</span></div>
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><Zap className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Turbo Enc</span></div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            {gifBlob && (
              <div ref={successRef} className="animate-in zoom-in-95 duration-700 w-full">
                 <div className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-[#c5a059]/30 flex flex-col gap-5 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
                       <div className="flex items-center gap-4 min-w-fit">
                          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner"><CheckCircle2 className="w-5 h-5" /></div>
                          <div><h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">Synthesize Complete</h3><p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.3em] italic leading-none">GIF Buffer Verified</p></div>
                       </div>
                       <div className="flex gap-2 w-full sm:w-auto items-center justify-center sm:justify-end">
                          <Button onClick={resetAll} variant="outline" className="h-10 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 shrink-0">NEW CAPTURE</Button>
                          <Button onClick={() => { const a = document.createElement("a"); a.href = URL.createObjectURL(gifBlob); a.download = "screen-capture.gif"; a.click(); }} className="h-10 px-4 rounded-lg bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-md text-[9px] shrink-0">DOWNLOAD GIF</Button>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Engine", value: "WASM v12", icon: Database },
                          { label: "Stability", value: "99.9%", icon: BarChart3, highlight: true },
                          { label: "Frames", value: quality === 'ultra' ? '24 FPS' : '15 FPS', icon: Activity },
                          { label: "Codec", value: "GIF PRO", icon: Zap }
                        ].map((stat, i) => (
                          <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 flex flex-col gap-1">
                             <div className="flex items-center justify-between"><stat.icon className={cn("w-3 h-3 opacity-20", stat.highlight && "text-[#c5a059] opacity-50")} /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/50">{stat.label}</span></div>
                             <p className={cn("text-xs font-black tracking-tight", stat.highlight ? "text-[#c5a059]" : "text-foreground")}>{stat.value}</p>
                          </div>
                        ))}
                    </div>
                 </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 rounded-[1.5rem] min-h-[400px] lg:min-h-[500px] p-5 flex flex-col relative shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                  <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Matrix</span><p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">Capture Workspace</p></div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full bg-[#c5a059]", (recording || processing) && "animate-pulse")} /> {recording ? "REC" : (processing ? "SYNTH" : "LIVE")}
                  </div>
               </div>
               <div className="flex-1 flex flex-col items-center justify-center">
                  {gifBlob ? (
                    <div className="w-full flex-1 relative bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center p-6 overflow-hidden" style={{ backgroundImage: "radial-gradient(#c5a059 0.5px, transparent 0.5px)", backgroundSize: "10px 10px" }}>
                       <img src={URL.createObjectURL(gifBlob)} alt="GIF" className="max-h-[400px] w-auto object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-700" />
                    </div>
                  ) : videoBlob ? (
                    <div className="w-full flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4">
                       <video src={URL.createObjectURL(videoBlob)} controls className="max-h-[400px] rounded-2xl shadow-xl border border-zinc-100" />
                       <Button onClick={convertToGif} disabled={processing} className="h-12 px-10 rounded-xl bg-[#c5a059] text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                          {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                          {processing ? `Synthesizing ${progress}%` : "CONVERT TO GIF"}
                       </Button>
                    </div>
                  ) : recording ? (
                    <div className="flex flex-col items-center gap-8 animate-pulse opacity-40">
                       <div className="w-24 h-24 rounded-full border-4 border-[#c5a059]/20 border-t-[#c5a059] animate-spin flex items-center justify-center"><Video className="w-8 h-8 text-[#c5a059]" /></div>
                       <p className="text-sm font-black uppercase tracking-[0.2em] text-[#c5a059] italic">Recording Stream...</p>
                    </div>
                  ) : processing ? (
                    <div className="w-full max-w-sm space-y-4">
                       <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-[#c5a059] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
                       <p className="text-center text-[8px] font-black uppercase tracking-widest text-[#c5a059]">Applying Neural Mask {progress}%</p>
                    </div>
                  ) : (
                    <div className="opacity-20 flex flex-col items-center gap-6"><Monitor className="w-16 h-16 text-zinc-300 mb-2" /><p className="text-xs font-black uppercase tracking-widest italic text-zinc-400 text-center">Load Display Resource<br/><span className="text-[8px] opacity-50">Browser permission required</span></p></div>
                  )}
               </div>
            </div>
            {gifBlob && <Button onClick={resetAll} variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground font-black text-[8px] uppercase tracking-widest border-2 border-dashed">RESTART STUDIO</Button>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
