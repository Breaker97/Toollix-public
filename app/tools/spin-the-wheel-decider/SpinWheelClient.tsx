"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Plus, 
  Trash2, 
  Trophy, 
  Settings2, 
  Activity,
  History,
  List,
  Sparkles,
  Zap,
  Target,
  Palette,
  X,
  Shuffle,
  SortAsc,
  Eraser
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WheelItem {
  id: string;
  text: string;
  color: string;
}

const PRESET_COLORS = [
  "#c5a059", "#1e293b", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"
];

const Firework = ({ x, y }: { x: number; y: number }) => {
  return (
    <div 
      className="absolute pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-8 bg-[#c5a059] rounded-full animate-firework-particle"
          style={{ 
            transform: `rotate(${i * 30}deg) translateY(-20px)`,
            animationDelay: `${Math.random() * 0.2}s`
          }}
        />
      ))}
    </div>
  );
};

export default function SpinWheelClient() {
  const [items, setItems] = useState<WheelItem[]>([
    { id: "1", text: "Alpha", color: "#c5a059" },
    { id: "2", text: "Beta", color: "#1e293b" },
    { id: "3", text: "Gamma", color: "#ef4444" },
    { id: "4", text: "Delta", color: "#3b82f6" },
    { id: "5", text: "Epsilon", color: "#10b981" },
  ]);
  const [rawText, setRawText] = useState("Alpha\nBeta\nGamma\nDelta\nEpsilon");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [history, setHistory] = useState<WheelItem[]>([]);
  const [showFirework, setShowFirework] = useState(false);
  const [fireworkPos, setFireworkPos] = useState({ x: 0, y: 0 });

  const handleRawTextChange = (text: string) => {
    setRawText(text);
    const lines = text.split("\n").map(l => l.trim()).filter(l => l !== "");
    const newItems = lines.map((line, i) => {
      const existing = items.find(item => item.text === line);
      return {
        id: existing?.id || Math.random().toString(36).substr(2, i),
        text: line,
        color: existing?.color || PRESET_COLORS[i % PRESET_COLORS.length]
      };
    });
    setItems(newItems);
  };

  const shuffleItems = () => {
    const lines = rawText.split("\n").filter(l => l.trim() !== "");
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    handleRawTextChange(lines.join("\n"));
  };

  const sortItems = () => {
    const lines = rawText.split("\n").filter(l => l.trim() !== "");
    lines.sort((a, b) => a.localeCompare(b));
    handleRawTextChange(lines.join("\n"));
  };

  const clearAll = () => {
    setRawText("");
    setItems([]);
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    if (!itemToRemove) return;
    const lines = rawText.split("\n").filter(l => l.trim() !== itemToRemove.text);
    handleRawTextChange(lines.join("\n"));
  };

  const spin = () => {
    if (isSpinning || items.length < 2) return;
    
    setIsSpinning(true);
    setWinner(null);
    setShowFirework(false);
    
    // Play spin start sound
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTick = () => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    };

    // Smooth high-performance rotation
    const extraRounds = 10 + Math.floor(Math.random() * 5);
    const randomOffset = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (extraRounds * 360) + randomOffset;
    
    setRotation(totalRotation);

    // Sound ticking effect logic
    let currentTickRotation = rotation;
    const sliceAngle = 360 / items.length;
    const startTime = Date.now();
    const duration = 5000;

    const tickInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(tickInterval);
        return;
      }

      // Easing function to match the wheel deceleration (cubic-bezier approximation)
      const t = elapsed / duration;
      const easeOut = 1 - Math.pow(1 - t, 3);
      const currentRot = rotation + (totalRotation - rotation) * easeOut;
      
      if (Math.abs(currentRot - currentTickRotation) >= sliceAngle) {
        playTick();
        currentTickRotation = currentRot;
      }
    }, 16);

    setTimeout(() => {
      setIsSpinning(false);
      
      const sliceAngle = 360 / items.length;
      const finalRotation = totalRotation % 360;
      
      // Pointer is at 3 o'clock (0 degrees in polar coords)
      const adjustedRotation = (360 - finalRotation) % 360;
      const winnerIndex = Math.floor(adjustedRotation / sliceAngle);
      
      const winningItem = items[winnerIndex];
      setWinner(winningItem);
      setHistory(prev => [winningItem, ...prev].slice(0, 8));
      setFireworkPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setShowFirework(true);
      
      // Play win sound
      const winOsc = audioCtx.createOscillator();
      const winGain = audioCtx.createGain();
      winOsc.connect(winGain);
      winGain.connect(audioCtx.destination);
      winOsc.frequency.setValueAtTime(440, audioCtx.currentTime);
      winOsc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);
      winGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      winGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      winOsc.start();
      winOsc.stop(audioCtx.currentTime + 0.5);

      setTimeout(() => {
        setShowFirework(false);
        audioCtx.close();
      }, 2000);

      toast.success(`Chosen: ${winningItem.text}`);
    }, duration);
  };

  // Helper to generate SVG pie slices
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <ToolLayout 
      title="Spin The Wheel Decider" 
      description="Professional high-precision decision engine with high-fidelity physics calibration."
      fullWidth
    >
      {showFirework && <Firework x={fireworkPos.x} y={fireworkPos.y} />}
      
      <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Wheel Stage */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative group rounded-[4rem] p-4 sm:p-12 overflow-hidden bg-slate-50 dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col min-h-[750px] items-center justify-center">
              
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(197,160,89,0.1)_0%,transparent_70%)] pointer-events-none" />
              
              <div className="absolute top-10 left-12 flex items-center gap-4">
                 <div className="w-12 h-12 bg-[#c5a059]/10 text-[#c5a059] rounded-2xl flex items-center justify-center border border-[#c5a059]/20 shadow-lg">
                    <Sparkles className="w-6 h-6" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-500 leading-none">High Fidelity Arena</span>
                    <span className="text-[9px] font-bold text-[#c5a059] uppercase tracking-widest mt-1 italic">Physics: Calibrated</span>
                 </div>
              </div>

              {/* Winner HUD */}
              {winner && !isSpinning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white/80 dark:bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
                   <div className="relative p-1 bg-gradient-to-br from-[#c5a059] to-transparent rounded-[4.5rem] shadow-2xl animate-in zoom-in-95 duration-500">
                      <div className="bg-white dark:bg-zinc-950 p-12 sm:p-20 rounded-[4.4rem] text-center space-y-8 max-w-md">
                         <div className="w-24 h-24 bg-[#c5a059] text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(197,160,89,0.4)] animate-bounce">
                            <Trophy className="w-12 h-12" />
                         </div>
                         <div className="space-y-3">
                            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic">You are a winner</p>
                            <h2 className="text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic drop-shadow-xl">{winner.text}</h2>
                         </div>
                         <div className="flex flex-col gap-4">
                            <Button 
                              onClick={() => { removeItem(winner.id); setWinner(null); }}
                              className="h-16 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            >
                              REMOVE FROM POOL
                            </Button>
                            <Button 
                              onClick={() => setWinner(null)}
                              className="h-16 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            >
                              CONTINUE
                            </Button>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Precise SVG Wheel */}
              <div className="relative w-80 h-80 sm:w-[600px] sm:h-[600px] transition-all duration-700">
                 
                 {/* Pointer Needle (Positioned at 3 o'clock / 0 degrees) */}
                 <div className="absolute top-1/2 -right-8 -translate-y-1/2 z-40 w-16 h-12 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[22px] border-t-transparent border-b-[22px] border-b-transparent border-r-[45px] border-r-red-600 relative filter drop-shadow-[0_5px_15px_rgba(220,38,38,0.4)]">
                       <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-5 w-5 bg-red-600 rotate-45 rounded-sm" />
                    </div>
                 </div>

                 <div 
                    className="w-full h-full rounded-full transition-transform duration-[5000ms] cubic-bezier(0.1, 0, 0, 1)"
                    style={{ transform: `rotate(${rotation}deg)` }}
                 >
                    <svg viewBox="-100 -100 200 200" className="w-full h-full drop-shadow-[0_60px_100px_rgba(0,0,0,0.15)]">
                       {items.map((item, i) => {
                          const angle = 360 / items.length;
                          const startAngle = i * angle;
                          const endAngle = (i + 1) * angle;
                          
                          // SVG Path logic
                          const start = getCoordinatesForPercent(startAngle / 360);
                          const end = getCoordinatesForPercent(endAngle / 360);
                          const largeArcFlag = angle > 180 ? 1 : 0;
                          const pathData = [
                            `M 0 0`,
                            `L ${start[0] * 100} ${start[1] * 100}`,
                            `A 100 100 0 ${largeArcFlag} 1 ${end[0] * 100} ${end[1] * 100}`,
                            `Z`,
                          ].join(" ");

                          // Text alignment: centered in slice, facing outward
                          const midAngle = startAngle + angle / 2;
                          const textX = Math.cos((midAngle * Math.PI) / 180) * 70;
                          const textY = Math.sin((midAngle * Math.PI) / 180) * 70;

                          return (
                            <g key={item.id}>
                               <path 
                                  d={pathData} 
                                  fill={item.color} 
                                  stroke="rgba(0,0,0,0.05)"
                                  strokeWidth="0.5"
                               />
                               <g transform={`translate(${textX}, ${textY}) rotate(${midAngle})`}>
                                  <text 
                                     textAnchor="end" 
                                     fill="white" 
                                     fontSize="8" 
                                     fontWeight="900" 
                                     className="uppercase tracking-widest italic drop-shadow-md"
                                     style={{ textTransform: "uppercase" }}
                                  >
                                     {item.text}
                                  </text>
                               </g>
                            </g>
                          );
                       })}
                       
                       {/* Decorative Hub */}
                       <circle cx="0" cy="0" r="15" fill="rgba(255,255,255,1)" className="dark:fill-zinc-950 shadow-2xl" />
                       <circle cx="0" cy="0" r="10" fill="#c5a059" />
                       <path d="M-3 0 L3 0 M0 -3 L0 3" stroke="white" strokeWidth="1" />
                    </svg>
                 </div>
                 
                 {/* Hub Zap Overlay */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#c5a059] rounded-full z-30 flex items-center justify-center shadow-xl pointer-events-none border-4 border-white dark:border-zinc-900">
                    <Zap className="w-5 h-5 text-white animate-pulse" />
                 </div>
              </div>

              {/* Action Deck */}
              <div className="mt-20 relative">
                 <Button 
                    onClick={spin}
                    disabled={isSpinning || items.length < 2}
                    className={cn(
                      "h-24 px-24 rounded-[3.5rem] bg-[#c5a059] text-white hover:bg-zinc-900 dark:hover:bg-white dark:hover:text-zinc-950 text-[16px] font-black uppercase tracking-[0.6em] shadow-[0_40px_80px_-20px_rgba(197,160,89,0.5)] transition-all active:scale-95 group overflow-hidden relative",
                      isSpinning && "opacity-50 cursor-not-allowed"
                    )}
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <RefreshCw className={cn("w-6 h-6 mr-4 transition-transform duration-500", isSpinning && "animate-spin")} />
                    {isSpinning ? "SPINNING..." : "SPINN"}
                 </Button>
              </div>
            </div>

            {/* History Feed */}
            <div className="suite-card rounded-[4rem] p-12 space-y-10 bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 shadow-xl">
               <div className="flex items-center gap-5 border-b border-slate-50 dark:border-zinc-800 pb-10">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-zinc-950 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <History className="w-7 h-7 text-[#c5a059]" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Session Log</h3>
                     <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest leading-none mt-2">Historical Manifestations</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                  {history.length === 0 ? (
                    <div className="col-span-full py-12 text-center">
                       <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-zinc-600 italic">Protocol idle. No records found.</p>
                    </div>
                  ) : (
                    history.map((h, i) => (
                      <div key={i} className="px-8 py-6 bg-slate-50 dark:bg-zinc-950 rounded-[2rem] border-2 border-transparent hover:border-[#c5a059]/20 transition-all flex flex-col gap-2 group shadow-sm">
                        <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest leading-none">Chosen</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{h.text}</span>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>

          {/* Configuration Column */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[4rem] p-10 space-y-10 bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-[#c5a059]/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">POOL</h2>
                     <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic leading-none mt-2">ENTRIES: {items.length}</p>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="icon" onClick={shuffleItems} title="Shuffle Pool" className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-950 text-slate-400 hover:text-[#c5a059] shadow-sm"><Shuffle className="w-5 h-5" /></Button>
                     <Button variant="ghost" size="icon" onClick={sortItems} title="Sort A-Z" className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-950 text-slate-400 hover:text-[#c5a059] shadow-sm"><SortAsc className="w-5 h-5" /></Button>
                     <Button variant="ghost" size="icon" onClick={clearAll} title="Clear All" className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-950 text-slate-400 hover:text-red-500 shadow-sm"><Eraser className="w-5 h-5" /></Button>
                  </div>
               </div>

               <div className="space-y-5">
                  <textarea 
                     className="w-full h-[400px] bg-slate-50 dark:bg-zinc-950 rounded-[2.5rem] p-10 text-[15px] font-bold focus:outline-none border-2 border-transparent focus:border-[#c5a059] transition-all resize-none font-mono shadow-inner text-slate-800 dark:text-zinc-200"
                     placeholder="Enter candidates (one per line)..."
                     value={rawText}
                     onChange={(e) => handleRawTextChange(e.target.value)}
                  />
                  <div className="flex items-center gap-2 text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic">
                     <Settings2 className="w-4 h-4" />
                     LIVE POOL SYNC ACTIVE
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-50 dark:border-zinc-800 space-y-4 max-h-[350px] overflow-y-auto no-scrollbar">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-4">COLOR MAPPING</p>
                  {items.map((item, i) => (
                    <div key={item.id} className="group flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-800/40 rounded-[1.5rem] border-2 border-transparent hover:border-[#c5a059]/20 transition-all shadow-sm">
                       <div className="flex items-center gap-5 flex-1">
                          <input 
                             type="color" 
                             value={item.color}
                             onChange={(e) => {
                               setItems(items.map(it => it.id === item.id ? { ...it, color: e.target.value } : it));
                             }}
                             className="w-10 h-10 rounded-2xl bg-transparent border-0 cursor-pointer p-0 overflow-hidden shadow-sm"
                          />
                          <span className="text-sm font-black text-slate-700 dark:text-zinc-200 uppercase tracking-tight italic truncate max-w-[180px]">{item.text}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="suite-card p-10 rounded-[3rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-6">
               <div className="flex items-center gap-4">
                  <Activity className="w-6 h-6 text-[#c5a059]" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#c5a059]">Fairness Protocol</span>
               </div>
               <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 leading-relaxed uppercase tracking-widest italic">
                  Advanced SVG path randomization ensures that every slice has a mathematically equal chance of manifestation.
               </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes firework-particle {
          0% { transform: rotate(var(--tw-rotate)) translateY(-20px) scale(1); opacity: 1; }
          100% { transform: rotate(var(--tw-rotate)) translateY(-180px) scale(0); opacity: 0; }
        }
        .animate-firework-particle {
          animation: firework-particle 1.8s cubic-bezier(0.1, 0, 0, 1) forwards;
        }
      `}</style>
    </ToolLayout>
  );
}
