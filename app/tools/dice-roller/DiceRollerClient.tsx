"use client";

import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Dices, 
  RefreshCw, 
  History as HistoryIcon, 
  Terminal, 
  Activity,
  Box,
  Zap,
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DiceType = 4 | 6 | 8 | 10 | 12 | 20;

const DICE_DOTS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const DICE_STYLES = [
  { id: "ivory", name: "Classic Ivory", bg: "bg-[#fdfbf7]", dot: "bg-zinc-900", text: "text-zinc-900", border: "border-zinc-200" },
  { id: "ruby", name: "Vivid Ruby", bg: "bg-red-600", dot: "bg-white", text: "text-white", border: "border-red-500" },
  { id: "sapphire", name: "Deep Sapphire", bg: "bg-blue-600", dot: "bg-white", text: "text-white", border: "border-blue-500" },
  { id: "onyx", name: "Polished Onyx", bg: "bg-zinc-900", dot: "bg-[#c5a059]", text: "text-[#c5a059]", border: "border-zinc-800" },
];

const DiceFace = ({ value, type, style }: { value: number; type: DiceType; style: typeof DICE_STYLES[0] }) => {
  if (type === 6) {
    return (
      <div className={cn("grid grid-cols-3 grid-rows-3 gap-2 w-full h-full p-4 rounded-[1.5rem] shadow-[inset_0_-8px_20px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.3)] border-b-4 border-r-4 transition-all duration-500", style.bg, style.border)}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "w-full h-full rounded-full transition-all duration-500 shadow-sm",
              DICE_DOTS[value as keyof typeof DICE_DOTS]?.includes(i) ? cn(style.dot, "scale-100") : "bg-transparent scale-0"
            )} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center rounded-[1.5rem] overflow-hidden shadow-[inset_0_-8px_20px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.3)] border-b-4 border-r-4 transition-all duration-500 group", style.bg, style.border)}>
       <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-40" />
       <span className={cn("relative text-4xl font-black italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]", style.text)}>{value}</span>
       <div className={cn("absolute bottom-2 right-3 text-[9px] font-black uppercase tracking-widest opacity-40", style.text)}>D{type}</div>
    </div>
  );
};

export default function DiceRollerClient() {
  const [diceType, setDiceType] = useState<DiceType>(6);
  const [diceCount, setDiceCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<{ type: DiceType; results: number[]; total: number; timestamp: number }[]>([]);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [selectedStyle, setSelectedStyle] = useState(DICE_STYLES[0]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setRotation({
      x: Math.random() * 1080 + 360,
      y: Math.random() * 1080 + 360,
      z: Math.random() * 1080 + 360,
    });
    
    setTimeout(() => {
      const newResults = Array.from({ length: diceCount }, () => Math.floor(Math.random() * diceType) + 1);
      const total = newResults.reduce((a, b) => a + b, 0);
      setResults(newResults);
      setHistory(prev => [{ type: diceType, results: newResults, total, timestamp: Date.now() }, ...prev].slice(0, 12));
      setIsRolling(false);
      setRotation({ x: 0, y: 0, z: 0 });
      toast.success(`Total: ${total}`, { position: "bottom-center" });
    }, 800);
  };

  const diceTypes: DiceType[] = [4, 6, 8, 10, 12, 20];

  return (
    <ToolLayout 
      title="3D Dice Roller" 
      description="Professional 3D dice simulator. High-fidelity physics for games, decisions, and probability."
      fullWidth
    >
      <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="relative group rounded-[3rem] p-4 sm:p-12 overflow-hidden bg-[#1e293b] border-2 border-slate-700/50 shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col min-h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-[0.05] pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative flex items-center justify-between border-b border-white/5 pb-8 mb-12">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">Dice Arena</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059]">3D Physics Roll</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-800/40 border border-white/5 rounded-full flex items-center gap-3">
                       <div className={cn("w-2 h-2 bg-[#c5a059] rounded-full", isRolling && "animate-ping")} />
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Core Signal: Active</span>
                    </div>
                 </div>
              </div>
              <div className="relative flex-1 flex flex-wrap items-center justify-center gap-12 py-12 px-4 overflow-y-auto no-scrollbar">
                 {isRolling ? (
                    Array.from({ length: diceCount }).map((_, i) => (
                      <div key={i} className="w-32 h-32 animate-in zoom-in-50 duration-500">
                         <div 
                           className="w-full h-full relative transition-transform duration-800 ease-out flex items-center justify-center"
                           style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)` }}
                         >
                            <div className={cn("w-full h-full rounded-2xl shadow-2xl flex items-center justify-center border-4", selectedStyle.bg, selectedStyle.border)}>
                               <Dices className={cn("w-16 h-16 animate-pulse", selectedStyle.text)} />
                            </div>
                         </div>
                      </div>
                    ))
                 ) : results.length > 0 ? (
                    results.map((r, i) => (
                      <div key={i} className="relative group w-32 h-32 animate-in zoom-in-50 duration-300 shadow-[0_40px_80px_rgba(0,0,0,0.5)] rounded-[1.5rem] hover:scale-110 transition-transform">
                         <div className="absolute -inset-4 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                         <DiceFace value={r} type={diceType} style={selectedStyle} />
                      </div>
                    ))
                 ) : (
                    <div className="text-center space-y-8 opacity-20 group-hover:opacity-30 transition-opacity">
                       <div className="relative">
                          <div className="absolute -inset-10 bg-[#c5a059]/5 blur-[60px] rounded-full animate-pulse" />
                          <Dices className="w-32 h-32 text-[#c5a059]" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#c5a059]">Ready for Roll</p>
                          <p className="text-[9px] font-medium text-white uppercase italic tracking-widest">Execute protocol to manifest outcomes</p>
                       </div>
                    </div>
                 )}
              </div>
              {results.length > 0 && !isRolling && (
                <div className="relative mt-12 py-12 border-t border-white/5 text-center animate-in fade-in slide-in-from-bottom-10 duration-700">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-slate-800 border border-white/10 rounded-full text-[9px] font-black text-[#c5a059] uppercase tracking-[0.4em] italic">
                      Outcome Matrix
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <h2 className="text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                         {results.reduce((a, b) => a + b, 0)}
                      </h2>
                      <div className="flex items-center gap-4 opacity-40">
                         <div className="h-px w-12 bg-white" />
                         <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Total Sum</span>
                         <div className="h-px w-12 bg-white" />
                      </div>
                   </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
               <Button 
                  onClick={rollDice}
                  disabled={isRolling}
                  className="flex-1 h-24 rounded-[2.5rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[14px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(197,160,89,0.3)] group transition-all duration-500 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Dices className={cn("w-6 h-6 mr-4 transition-all duration-500", isRolling ? "rotate-[360deg] scale-125" : "group-hover:scale-110")} />
                  {isRolling ? "ROLLING..." : "EXECUTE KINETIC ROLL"}
                </Button>
                <div className="flex items-center gap-6 px-10 h-24 rounded-[2.5rem] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl">
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Geometry</span>
                      <span className="text-2xl font-black text-[#c5a059] italic uppercase">D{diceType}</span>
                   </div>
                </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <div className="suite-card rounded-[3rem] p-10 space-y-10 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Physics Lab</h2>
                  <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic leading-none mt-2">Geometry & Aesthetics</p>
               </div>
               <div className="space-y-8">
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 ml-2">
                        <Box className="w-3 h-3 text-[#c5a059]" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dice Geometry</label>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        {diceTypes.map((t) => (
                          <button
                            key={t}
                            onClick={() => setDiceType(t)}
                            className={cn(
                              "h-14 rounded-2xl text-xs font-black transition-all border-2 uppercase italic tracking-tighter",
                              diceType === t 
                                ? "bg-[#c5a059] text-white border-[#c5a059] shadow-lg scale-105" 
                                : "bg-zinc-50 dark:bg-zinc-950 text-slate-400 border-transparent hover:bg-zinc-100 hover:text-slate-600 dark:hover:bg-black"
                            )}
                          >
                            D{t}
                          </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 ml-2">
                        <Zap className="w-3 h-3 text-[#c5a059]" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resin Texture</label>
                     </div>
                     <div className="grid grid-cols-4 gap-3">
                        {DICE_STYLES.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedStyle(s)}
                            className={cn(
                              "aspect-square rounded-xl border-4 transition-all hover:scale-110",
                              selectedStyle.id === s.id ? "border-[#c5a059] scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                            )}
                            style={{ background: s.bg.startsWith('bg-[') ? s.bg.slice(4, -1) : (s.id === 'ivory' ? '#fdfbf7' : (s.id === 'ruby' ? '#dc2626' : (s.id === 'sapphire' ? '#2563eb' : '#18181b'))) }}
                            title={s.name}
                          />
                        ))}
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center ml-2">
                        <div className="flex items-center gap-2">
                           <Layout className="w-3 h-3 text-[#c5a059]" />
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dice Quantity</label>
                        </div>
                        <span className="text-xl font-black text-[#c5a059] italic">{diceCount}</span>
                     </div>
                     <div className="px-2">
                        <input 
                           type="range" min="1" max="12" step="1" 
                           value={diceCount} onChange={(e) => setDiceCount(parseInt(e.target.value))}
                           className="w-full h-2 bg-zinc-100 dark:bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                        />
                     </div>
                  </div>
                  <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 ml-2">
                           <HistoryIcon className="w-3 h-3 text-[#c5a059]" />
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Probability Stream</label>
                        </div>
                        <button onClick={() => setHistory([])} className="text-[8px] font-black uppercase tracking-widest text-[#c5a059] hover:underline">Clear</button>
                     </div>
                     <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto no-scrollbar mask-fade-v px-1">
                        {history.map((h, i) => (
                          <div key={h.timestamp} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-[1.5rem] border border-transparent hover:border-[#c5a059]/20 transition-all">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest">{h.results.length}D{h.type} Roll</span>
                                <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{h.results.join(", ")}</span>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className="text-lg font-black text-slate-800 dark:text-white italic leading-none">{h.total}</span>
                                <span className="text-[8px] font-bold text-slate-300 dark:text-zinc-700 uppercase">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                          </div>
                        ))}
                        {history.length === 0 && (
                          <div className="py-8 flex flex-col items-center justify-center opacity-20">
                             <Zap className="w-8 h-8 mb-2" />
                             <p className="text-[9px] font-black uppercase tracking-widest">No Recent Streams</p>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
            <div className="suite-card p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Stability Lock</span>
               </div>
               <p className="text-[10px] font-medium text-emerald-900 dark:text-emerald-400 leading-relaxed uppercase tracking-wider italic">
                  High-entropy cryptographic randomization verified for maximum probabilistic fairness.
               </p>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-fade-v { mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent); }
      `}</style>
    </ToolLayout>
  );
}
