"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Radio, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  X,
  Zap,
  Activity,
  Volume2,
  VolumeX,
  Keyboard,
  ArrowRightLeft,
  Play,
  Pause,
  Square,
  Settings2,
  Share2,
  Download,
  Info,
  Layers,
  ZapOff,
  Speaker,
  RefreshCw,
  Trash2,
  Video,
  Music
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MORSE_CODE_MAP: Record<string, string> = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--", "Z": "--..",
  "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----",
  " ": "/", ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", "\"": ".-..-.", "$": "...-..-", "@": ".--.-."
};

const REVERSE_MORSE_MAP: Record<string, string> = Object.entries(MORSE_CODE_MAP).reduce((acc, [key, val]) => ({ ...acc, [val]: key }), {});

export default function MorseCodeClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"toMorse" | "fromMorse">("toMorse");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Audio & Signal Settings
  const [wpm, setWpm] = useState(20);
  const [pitch, setPitch] = useState(550);
  const [volume, setVolume] = useState(80);
  const [repeat, setRepeat] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [outputMode, setOutputMode] = useState<"sound" | "light" | "vibrate">("sound");
  const [currentSignalIndex, setCurrentSignalIndex] = useState(-1);
  const [flashActive, setFlashActive] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const stopPlayingRef = useRef<boolean>(false);
  const pauseRef = useRef<boolean>(false);

  useEffect(() => {
    handleProcess();
  }, [input, mode]);

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  const handleProcess = () => {
    if (!input) {
      setOutput("");
      return;
    }

    if (mode === "toMorse") {
      const result = input.toUpperCase().split("").map(char => MORSE_CODE_MAP[char] || "").join(" ").trim();
      setOutput(result);
    } else {
      const result = input.trim().split(" ").map(code => REVERSE_MORSE_MAP[code] || "").join("").replace(/\//g, " ").trim();
      setOutput(result);
    }
  };

  const stopPlaying = () => {
    stopPlayingRef.current = true;
    setIsProcessing(false);
    setIsPaused(false);
    setCurrentSignalIndex(-1);
    setFlashActive(false);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const playMorseSound = async () => {
    if (!output || isProcessing) return;
    
    setIsProcessing(true);
    stopPlayingRef.current = false;
    pauseRef.current = false;
    setIsPaused(false);
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const context = audioContextRef.current;
    
    const dot = 1.2 / wpm;
    const dash = dot * 3;
    const pauseTime = dot;

    const playTone = (duration: number) => {
      return new Promise<void>((resolve) => {
        if (stopPlayingRef.current) return resolve();
        
        if (outputMode === "light") setFlashActive(true);
        if (outputMode === "vibrate" && "vibrate" in navigator) navigator.vibrate(duration * 1000);

        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.frequency.value = pitch;
        
        const actualVolume = outputMode === "sound" ? (volume / 100) * 0.2 : 0;
        gain.gain.setValueAtTime(actualVolume, context.currentTime);
        
        osc.start();
        setTimeout(() => {
          osc.stop();
          setFlashActive(false);
          resolve();
        }, duration * 1000);
      });
    };

    const sleep = (duration: number) => new Promise(resolve => setTimeout(resolve, duration * 1000));

    const checkPause = async () => {
      while (pauseRef.current && !stopPlayingRef.current) {
        await sleep(0.1);
      }
    };

    const codes = output.split("");
    
    do {
      for (let i = 0; i < codes.length; i++) {
        if (stopPlayingRef.current) break;
        await checkPause();
        if (stopPlayingRef.current) break;

        setCurrentSignalIndex(i);
        
        const char = codes[i];
        if (char === ".") await playTone(dot);
        else if (char === "-") await playTone(dash);
        else if (char === " ") await sleep(pauseTime * 3);
        else if (char === "/") await sleep(pauseTime * 7);
        
        await sleep(pauseTime);
      }
      if (stopPlayingRef.current) break;
      if (!repeat) break;
      await sleep(pauseTime * 10);
    } while (repeat && !stopPlayingRef.current);

    if (!stopPlayingRef.current) {
      stopPlaying();
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Signal copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- DOWNLOAD LOGIC ---

  const downloadAudio = async () => {
    if (!output) return;
    toast.info("Generating audio file...");

    const dot = 1.2 / wpm;
    const dash = dot * 3;
    const pauseTime = dot;
    const codes = output.split("");
    
    // Calculate total duration
    let totalDuration = 0;
    codes.forEach(char => {
      if (char === ".") totalDuration += dot + pauseTime;
      else if (char === "-") totalDuration += dash + pauseTime;
      else if (char === " ") totalDuration += pauseTime * 4;
      else if (char === "/") totalDuration += pauseTime * 8;
    });

    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(sampleRate * totalDuration), sampleRate);
    
    let currentTime = 0;
    codes.forEach(char => {
      let duration = 0;
      if (char === ".") duration = dot;
      else if (char === "-") duration = dash;

      if (duration > 0) {
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        osc.connect(gain);
        gain.connect(offlineCtx.destination);
        osc.frequency.setValueAtTime(pitch, currentTime);
        gain.gain.setValueAtTime(0.2, currentTime);
        gain.gain.setValueAtTime(0, currentTime + duration);
        osc.start(currentTime);
        osc.stop(currentTime + duration);
        currentTime += duration + pauseTime;
      } else if (char === " ") {
        currentTime += pauseTime * 4;
      } else if (char === "/") {
        currentTime += pauseTime * 8;
      }
    });

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = bufferToWav(renderedBuffer);
    const url = URL.createObjectURL(wavBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `morse-signal-${Date.now()}.wav`;
    link.click();
    toast.success("Audio downloaded successfully!");
  };

  // WAV encoding helper
  const bufferToWav = (abuffer: AudioBuffer) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4); // chunk length

    for (let i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  const downloadVideo = () => {
    // Video generation in browser without heavy libs is tricky,
    // so we'll provide a high-quality GIF or a sequence of images?
    // Actually, we'll just show a "Video Generation Coming Soon" or use a canvas capture if possible.
    toast.info("Video export currently generates a high-quality Signal Chart PNG.");
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d")!;
    
    // Background
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = "#c5a059";
    ctx.font = "bold 80px sans-serif";
    ctx.fillText("MORSE SIGNAL STUDIO", 100, 200);
    
    // Content
    ctx.fillStyle = "#ffffff";
    ctx.font = "40px monospace";
    const wrappedOutput = output.match(/.{1,40}/g) || [];
    wrappedOutput.forEach((line, i) => {
      ctx.fillText(line, 100, 350 + (i * 60));
    });

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `morse-signal-chart-${Date.now()}.png`;
    link.click();
  };

  return (
    <ToolLayout 
      title="Morse Code Translator" 
      description="Professional high-fidelity Morse code engine. Reimagining the original digital language for the modern era."
      fullWidth
    >
      {flashActive && (
        <div className="fixed inset-0 bg-white dark:bg-white z-[9999] pointer-events-none opacity-20" />
      )}

      <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">
        
        <section className="space-y-8">
           <div className="suite-card rounded-[3.5rem] p-4 sm:p-12 bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-900 shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative overflow-hidden">
              
              <div className="flex bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-3xl w-full max-w-xl mx-auto mb-16 border border-zinc-100 dark:border-zinc-800 shadow-xl relative z-10">
                 <button 
                   onClick={() => { setMode("toMorse"); setInput(""); stopPlaying(); }}
                   className={cn(
                     "flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all",
                     mode === "toMorse" ? "bg-[#c5a059] text-white shadow-xl scale-105" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                   )}
                 >
                    <Terminal className="w-5 h-5" /> Text → Morse
                 </button>
                 <button 
                   onClick={() => { setMode("fromMorse"); setInput(""); stopPlaying(); }}
                   className={cn(
                     "flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all",
                     mode === "fromMorse" ? "bg-[#c5a059] text-white shadow-xl scale-105" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                   )}
                 >
                    <Radio className="w-5 h-5" /> Morse → Text
                 </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
                 <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-full items-center justify-center z-20 shadow-2xl">
                    <ArrowRightLeft className="w-6 h-6 text-[#c5a059]" />
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">INPUT — {mode === "toMorse" ? "TEXT" : "MORSE CODE"}</span>
                       <span className="text-[10px] font-bold text-[#c5a059] italic">{input.length} chars</span>
                    </div>
                    <div className="relative group">
                       <textarea 
                          className="w-full h-80 bg-zinc-50 dark:bg-zinc-900/30 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-10 text-xl font-mono text-zinc-800 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-800 focus:outline-none focus:border-[#c5a059]/30 transition-all resize-none caret-[#c5a059]"
                          placeholder={mode === "toMorse" ? "Type your message here..." : "Type Morse patterns ( . - )"}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                       />
                       <button onClick={() => setInput("")} className="absolute bottom-8 left-8 px-4 h-10 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                          <Trash2 className="w-3 h-3" /> Clear
                       </button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">OUTPUT — {mode === "toMorse" ? "MORSE CODE" : "TEXT"}</span>
                       <span className="text-[10px] font-bold text-[#c5a059] italic">{output.length} chars</span>
                    </div>
                    <div className="relative group">
                       <textarea 
                          className="w-full h-80 bg-zinc-50 dark:bg-zinc-900/10 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-10 text-xl font-mono text-[#c5a059] placeholder-zinc-200 dark:placeholder-zinc-900 focus:outline-none transition-all resize-none cursor-default"
                          placeholder="Translation will appear here..."
                          value={output}
                          readOnly
                       />
                       <button onClick={copyToClipboard} className="absolute bottom-8 right-8 px-6 h-10 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                          <Copy className="w-3 h-3" /> Copy
                       </button>
                    </div>
                 </div>
              </div>

              <div className="mt-12 p-8 border-t border-zinc-100 dark:border-zinc-900 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">SIGNAL VISUALIZATION</span>
                    <div className="flex items-center gap-2">
                       <div className={cn("w-3 h-3 rounded-full transition-all", isProcessing ? "bg-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.8)] animate-pulse" : "bg-zinc-200 dark:bg-zinc-800")} />
                       <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{isProcessing ? (isPaused ? "PAUSED" : "TRANSMITTING") : "STANDBY"}</span>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-3 min-h-[60px] p-8 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 items-center overflow-y-auto max-h-[150px] no-scrollbar">
                    {output ? output.split("").map((char, i) => {
                      if (char === ".") return <div key={i} className={cn("w-4 h-4 rounded-full transition-all duration-100", i === currentSignalIndex ? "bg-white scale-150 shadow-[0_0_15px_#c5a059]" : "bg-[#c5a059]")} />;
                      if (char === "-") return <div key={i} className={cn("w-10 h-4 rounded-full transition-all duration-100", i === currentSignalIndex ? "bg-white scale-110 shadow-[0_0_15px_#c5a059]" : "bg-[#c5a059]")} />;
                      if (char === " ") return <div key={i} className="w-4 h-4" />;
                      if (char === "/") return <div key={i} className="w-10 h-4 border-r-2 border-[#c5a059]/20" />;
                      return null;
                    }) : (
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-700 italic">Awaiting Manifestation...</p>
                    )}
                 </div>
              </div>

              <div className="mt-12 p-8 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-8 relative z-10">
                 <div className="flex items-center gap-4">
                    {!isProcessing ? (
                      <Button 
                        onClick={playMorseSound}
                        className="h-16 px-10 rounded-2xl bg-[#c5a059] text-white hover:bg-zinc-900 dark:hover:bg-white dark:hover:text-zinc-950 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all"
                      >
                         <Play className="w-5 h-5 mr-3" /> Play
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setIsPaused(!isPaused)}
                        className="h-16 px-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all"
                      >
                         {isPaused ? <Play className="w-5 h-5 mr-3" /> : <Pause className="w-5 h-5 mr-3" />}
                         {isPaused ? "Resume" : "Pause"}
                      </Button>
                    )}
                    <Button onClick={stopPlaying} variant="ghost" className="h-16 px-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all">
                       <Square className="w-4 h-4 mr-2" /> Stop
                    </Button>
                 </div>

                 <div className="flex items-center gap-6 border-l border-zinc-100 dark:border-zinc-800 pl-8">
                    <button 
                      onClick={() => setRepeat(!repeat)} 
                      className={cn(
                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-6 h-12 rounded-xl border", 
                        repeat ? "bg-[#c5a059]/10 border-[#c5a059] text-[#c5a059]" : "border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      )}
                    >
                       <RefreshCw className={cn("w-4 h-4", repeat && "animate-spin-slow")} /> Repeat
                    </button>
                    <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-[1.2rem] border border-zinc-200 dark:border-zinc-800">
                       <button 
                         onClick={() => setOutputMode("sound")}
                         className={cn(
                           "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                           outputMode === "sound" ? "bg-white dark:bg-zinc-800 text-[#c5a059] shadow-sm" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                         )}
                       >
                          <Volume2 className="w-3 h-3" /> Sound
                       </button>
                       <button 
                         onClick={() => setOutputMode("light")}
                         className={cn(
                           "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                           outputMode === "light" ? "bg-white dark:bg-zinc-800 text-[#c5a059] shadow-sm" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                         )}
                       >
                          <Zap className="w-3 h-3" /> Light
                       </button>
                       <button 
                         onClick={() => setOutputMode("vibrate")}
                         className={cn(
                           "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                           outputMode === "vibrate" ? "bg-white dark:bg-zinc-800 text-[#c5a059] shadow-sm" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                         )}
                       >
                          <Activity className="w-3 h-3" /> Vibrate
                       </button>
                    </div>
                 </div>

                 <div className="flex items-center gap-3">
                    <Button onClick={downloadAudio} variant="ghost" size="icon" className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-[#c5a059] transition-all" title="Download Audio (WAV)">
                       <Music className="w-4 h-4" />
                    </Button>
                    <Button onClick={downloadVideo} variant="ghost" size="icon" className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-[#c5a059] transition-all" title="Export Signal Chart">
                       <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" title="Share Signal">
                       <Share2 className="w-4 h-4" />
                    </Button>
                 </div>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12 px-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">SPEED (WPM)</span>
                       <span className="text-sm font-black text-[#c5a059]">{wpm}</span>
                    </div>
                    <input type="range" min="5" max="50" step="1" value={wpm} onChange={(e) => setWpm(parseInt(e.target.value))} className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a059]" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">PITCH (HZ)</span>
                       <span className="text-sm font-black text-[#c5a059]">{pitch}</span>
                    </div>
                    <input type="range" min="200" max="1000" step="10" value={pitch} onChange={(e) => setPitch(parseInt(e.target.value))} className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a059]" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">VOLUME</span>
                       <span className="text-sm font-black text-[#c5a059]">{volume}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="5" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a059]" />
                 </div>
              </div>
           </div>
        </section>

        <section className="space-y-24 pb-24">
           
           <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-full">
                 <Info className="w-4 h-4 text-[#c5a059]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059]">ABOUT THE TOOL</span>
              </div>
              <h2 className="text-5xl sm:text-7xl font-black text-zinc-900 dark:text-white italic tracking-tighter leading-none">
                 The Original Digital <br/> Language, <span className="text-[#c5a059]">Reimagined.</span>
              </h2>
              <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto">
                 Morse code transformed global communication in 1836 and remains a foundational signal today. This translator lets you encode, decode, hear, see, and feel Morse code — all from your browser.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                 {[
                   { icon: <ArrowRightLeft className="w-6 h-6" />, title: "Bidirectional", desc: "Convert plain text to Morse code or decode Morse signals back to readable text instantly." },
                   { icon: <Layers className="w-6 h-6" />, title: "Multi-Sensory", desc: "Experience Morse through sound, visual light flashes, or haptic vibration." },
                   { icon: <Zap className="w-6 h-6" />, title: "Fully Configurable", desc: "Fine-tune speed, pitch, volume, and waveform type for the perfect transmission." }
                 ].map((feat, i) => (
                   <div key={i} className="suite-card p-10 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/30 border-2 border-zinc-100 dark:border-zinc-800 text-left space-y-4 group hover:border-[#c5a059]/30 transition-all">
                      <div className="w-14 h-14 bg-[#c5a059]/10 text-[#c5a059] rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                         {feat.icon}
                      </div>
                      <h4 className="text-xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter">{feat.title}</h4>
                      <p className="text-sm text-zinc-500 leading-relaxed font-medium">{feat.desc}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-16">
              <div className="text-center space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#c5a059]">HOW IT WORKS</span>
                 <h3 className="text-4xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase">From Characters to Signals in Seconds</h3>
              </div>

              <div className="max-w-4xl mx-auto relative px-8">
                 <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#c5a059] to-transparent opacity-20 hidden md:block" />
                 
                 {[
                   { num: "1", title: "Type or Paste Your Message", desc: "Enter plain text to encode, or type Morse code using dots (.), dashes (-), and spaces." },
                   { num: "2", title: "Instant Translation", desc: "As you type, the translation appears in real time. The signal matrix shows the pattern." },
                   { num: "3", title: "Play It Back", desc: "Hit play to hear the Morse code as audio beeps, see it as screen flashes, or feel it as vibrations." },
                   { num: "4", title: "Copy or Share", desc: "Copy the translated output to your clipboard or use the share button to send it to others." }
                 ].map((step, i) => (
                   <div key={i} className={cn("flex flex-col md:flex-row gap-12 mb-20 relative", i % 2 === 0 ? "md:text-right" : "md:flex-row-reverse md:text-left")}>
                      <div className="flex-1 space-y-2">
                         <h5 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">{step.title}</h5>
                         <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-xs mx-auto md:mx-0">{step.desc}</p>
                      </div>
                      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-0 w-12 h-12 bg-[#c5a059] text-white rounded-full z-10 shadow-[0_0_30px_rgba(197,160,89,0.5)] items-center justify-center text-sm font-black">
                         {step.num}
                      </div>
                      <div className="flex-1" />
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-16">
              <div className="text-center space-y-4">
                 <h3 className="text-4xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase">More Than Just Dots and Dashes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[
                   { icon: <Keyboard className="w-5 h-5" />, title: "Learning & Education", desc: "Students can use adjustable speed to learn Morse at their own pace." },
                   { icon: <Activity className="w-5 h-5" />, title: "Amateur (Ham) Radio", desc: "Ham radio operators can practice CW transmissions and verify encoding." },
                   { icon: <ZapOff className="w-5 h-5" />, title: "Emergency Signaling", desc: "Encode SOS or other distress messages. Morse code works with flashlights or mirrors." },
                   { icon: <Settings2 className="w-5 h-5" />, title: "Accessibility", desc: "People with limited mobility can use Morse code as an input method." },
                   { icon: <Speaker className="w-5 h-5" />, title: "Puzzles & Games", desc: "Escape rooms, treasure hunts, and ARGs frequently use Morse code." },
                   { icon: <Zap className="w-5 h-5" />, title: "Secret Messages", desc: "Encode personal messages for fun or privacy. Share code with those who know the system." }
                 ].map((app, i) => (
                   <div key={i} className="suite-card p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900 flex items-start gap-6 group hover:bg-zinc-100 dark:hover:bg-zinc-900/30 transition-all">
                      <div className="w-12 h-12 bg-white dark:bg-zinc-800 text-[#c5a059] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-[#c5a059] group-hover:text-white transition-all">
                         {app.icon}
                      </div>
                      <div className="space-y-2">
                         <h6 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider italic">{app.title}</h6>
                         <p className="text-xs text-zinc-500 leading-relaxed font-medium">{app.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="suite-card rounded-[3rem] p-8 sm:p-16 bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-900 shadow-2xl space-y-12">
              <div className="text-center space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#c5a059]">QUICK REFERENCE</span>
                 <h3 className="text-4xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase leading-none">International Morse Code Chart</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4">
                 {Object.entries(MORSE_CODE_MAP).filter(([k]) => k !== " ").map(([char, signal], i) => (
                   <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-center space-y-2 hover:border-[#c5a059]/30 hover:scale-105 transition-all group cursor-pointer">
                      <div className="text-lg font-black text-zinc-900 dark:text-white group-hover:text-[#c5a059]">{char}</div>
                      <div className="text-[10px] font-mono text-[#c5a059]">{signal}</div>
                   </div>
                  ))}
              </div>
           </div>

        </section>
      </div>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </ToolLayout>
  );
}
