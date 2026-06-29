"use client";

import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  Play, 
  Pause, 
  Square, 
  Volume2,
  Settings2,
  Waves,
  AudioLines,
  Download,
  Languages,
  ShieldCheck,
  Zap,
  Loader2,
  RefreshCcw,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TextToSpeechPage() {
  const [text, setText] = useState("Welcome to the Neural Audio Synthesis engine. Paste your content here to begin the conversion process.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const synth = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synth.current = window.speechSynthesis;
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(availableVoices[0].name);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = () => {
    if (!synth.current || !text) return;

    if (isPaused) {
      synth.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    synth.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      toast.error("Audio synthesis error occurred.");
    };

    synth.current.speak(utterance);
  };

  const pause = () => {
    if (synth.current && isPlaying) {
      synth.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (synth.current) {
      synth.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <ToolLayout 
      title="Neural Text to Speech" 
      description="Convert text into natural-sounding speech using advanced neural synthesis."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Manifest */}
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                      <Mic className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Source Manifest</h3>
                </div>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setText("")}
                   className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500"
                >
                   <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative group">
                <textarea
                  className="w-full h-[400px] lg:h-[500px] bg-transparent resize-none focus:outline-none font-medium text-[16px] leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059] placeholder:text-zinc-300"
                  placeholder="Type or paste your text manifest here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                
                {/* Status Indicator */}
                {isPlaying && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-[#c5a059] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl animate-in slide-in-from-right-4">
                     <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                     Transmitting Neural Audio
                  </div>
                )}
              </div>

              {/* Wave Animation */}
              <div className="flex items-center justify-center gap-1.5 h-12 opacity-20 pointer-events-none">
                 {[...Array(20)].map((_, i) => (
                    <div 
                       key={i} 
                       className={cn(
                          "w-1 rounded-full bg-[#c5a059] transition-all duration-300",
                          isPlaying ? "animate-pulse" : "h-2"
                       )} 
                       style={{ 
                          height: isPlaying ? `${Math.random() * 40 + 5}px` : "8px",
                          animationDelay: `${i * 0.05}s`
                       }} 
                    />
                 ))}
              </div>
            </div>

            {/* Playback Controls (Mobile-First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={isPlaying ? pause : speak}
                  disabled={!text}
                  className={cn(
                    "flex-1 h-20 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all",
                    isPlaying ? "bg-zinc-800 text-white" : "bg-[#c5a059] text-white hover:bg-[#b08d4a]"
                  )}
                >
                  {isPlaying ? <Pause className="w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3 ml-1 fill-current" />}
                  {isPlaying ? "PAUSE STREAM" : "BEGIN SYNTHESIS"}
                </Button>
                <Button 
                  onClick={stop}
                  variant="ghost"
                  className="h-20 sm:w-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center"
                >
                  <Square className="w-6 h-6" />
                </Button>
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Audio Settings</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Neural Configuration</p>
               </div>

               <div className="space-y-8">
                  {/* Voice Selector */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-2">Neural Voice Model</label>
                     <div className="relative">
                        <select 
                           value={selectedVoice}
                           onChange={(e) => setSelectedVoice(e.target.value)}
                           className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700 text-[11px] font-bold focus:outline-none focus:border-[#c5a059] transition-all appearance-none cursor-pointer pr-12"
                        >
                           {voices.map((voice) => (
                             <option key={voice.name} value={voice.name}>
                               {voice.name} ({voice.lang})
                             </option>
                           ))}
                        </select>
                        <Languages className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c5a059] pointer-events-none" />
                     </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Playback Rate</label>
                           <span className="text-[10px] font-black text-[#c5a059]">{rate}x</span>
                        </div>
                        <input 
                           type="range" 
                           min="0.5" max="2" step="0.1"
                           value={rate} 
                           onChange={(e) => setRate(parseFloat(e.target.value))}
                           className="w-full accent-[#c5a059]"
                        />
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Pitch Level</label>
                           <span className="text-[10px] font-black text-[#c5a059]">{pitch}x</span>
                        </div>
                        <input 
                           type="range" 
                           min="0" max="2" step="0.1"
                           value={pitch} 
                           onChange={(e) => setPitch(parseFloat(e.target.value))}
                           className="w-full accent-[#c5a059]"
                        />
                     </div>
                  </div>

               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Zap className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Zero Latency</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Languages className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Global Ready</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
