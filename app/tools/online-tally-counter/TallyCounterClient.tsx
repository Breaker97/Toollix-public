"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Minus, 
  RefreshCw, 
  History, 
  Terminal, 
  Activity,
  PlusSquare,
  Volume2,
  VolumeX,
  Keyboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TallyCounterClient() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<{ value: number, time: string }[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Keyboard support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "ArrowUp") increment();
      if (e.key === "-" || e.key === "ArrowDown") decrement();
      if (e.key === "r" || e.key === "R") reset();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [count, step, soundEnabled]);

  const playClick = () => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
      audio.volume = 0.2;
      audio.play();
    } catch (e) {}
  };

  const increment = () => {
    setCount(prev => prev + step);
    playClick();
  };

  const decrement = () => {
    setCount(prev => Math.max(0, prev - step));
    playClick();
  };

  const reset = () => {
    if (count > 0) {
      setHistory(prev => [{ value: count, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
    }
    setCount(0);
    toast.info("Counter reset to zero");
  };

  return (
    <ToolLayout 
      title="Tally Engine" 
      description="Professional digital clicker counter. Track inventory, audience size, or event occurrences with high-precision increments and session history."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-12 space-y-12 overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center bg-zinc-50/30 dark:bg-zinc-900/30">
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                    <PlusSquare className="w-5 h-5" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Active Session</h3>
              </div>

              <div className="flex flex-col items-center gap-8">
                 <div className="relative group">
                    <div className="absolute -inset-10 bg-[#c5a059]/10 rounded-full blur-3xl group-hover:bg-[#c5a059]/20 transition-all duration-700" />
                    <span className="relative text-[160px] font-black text-[#c5a059] leading-none tracking-tighter drop-shadow-2xl italic">
                       {count}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <Button 
                       onClick={decrement}
                       className="w-20 h-20 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-xl"
                    >
                       <Minus className="w-8 h-8" />
                    </Button>
                    <Button 
                       onClick={increment}
                       className="w-40 h-40 rounded-full bg-[#c5a059] text-white hover:bg-[#b08d4a] shadow-2xl group transition-all"
                    >
                       <Plus className="w-16 h-16 group-active:scale-90 transition-transform" />
                    </Button>
                    <Button 
                       onClick={reset}
                       className="w-20 h-20 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-all shadow-xl"
                    >
                       <RefreshCw className="w-8 h-8" />
                    </Button>
                 </div>
              </div>

              <div className="mt-8 flex items-center gap-4 px-6 py-2 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-full border border-zinc-200 dark:border-zinc-700">
                 <div className="flex items-center gap-2 opacity-40">
                    <Keyboard className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase">Space / Arrow keys supported</span>
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1 suite-card p-6 rounded-[2rem] flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]">
                        <Activity className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step Value</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">+{step}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     {[1, 5, 10].map(s => (
                       <button
                         key={s}
                         onClick={() => setStep(s)}
                         className={cn(
                           "w-12 h-10 rounded-xl text-[11px] font-black transition-all border",
                           step === s 
                            ? "bg-[#c5a059] text-white border-[#c5a059]" 
                            : "bg-zinc-50 dark:bg-zinc-800 text-slate-400 border-zinc-100 dark:border-zinc-700"
                         )}
                       >
                         {s}
                       </button>
                     ))}
                  </div>
               </div>

               <Button 
                  variant="ghost"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={cn(
                    "h-24 px-8 rounded-[2rem] border-2 transition-all",
                    soundEnabled ? "border-[#c5a059]/20 text-[#c5a059]" : "border-zinc-100 text-slate-400"
                  )}
                >
                  {soundEnabled ? <Volume2 className="w-6 h-6 mr-3" /> : <VolumeX className="w-6 h-6 mr-3" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">Audio Feedback</span>
                </Button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Count History</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Previous Sessions</p>
               </div>

               <div className="space-y-4">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Total Count</span>
                          <span className="text-[9px] text-slate-400 italic">{h.time}</span>
                       </div>
                       <span className="text-2xl font-black text-slate-600 dark:text-zinc-300 italic">{h.value}</span>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-30 italic">
                       <History className="w-8 h-8 mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No History Yet</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Persistence Logic</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Keep track of inventory, audience clicks, or repetition training with zero latency and high precision.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
