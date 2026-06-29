"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Dices, 
  RefreshCw, 
  Terminal, 
  Activity,
  Plus,
  Trash2,
  Trophy,
  X,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SpinWheelClient() {
  const [items, setItems] = useState(["Option 1", "Option 2", "Option 3", "Option 4"]);
  const [newItem, setNewItem] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = () => {
    if (isSpinning || items.length < 2) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    const extraSpins = 5 + Math.random() * 5;
    const finalRotation = rotation + (extraSpins * 360) + (Math.random() * 360);
    
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      // Calculate winner based on final rotation
      const actualRotation = finalRotation % 360;
      const sliceAngle = 360 / items.length;
      // Wheel starts at top (270 deg)
      const index = Math.floor(((360 - actualRotation + 270) % 360) / sliceAngle);
      setWinner(items[index]);
      
      if (soundEnabled) {
         try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
            audio.volume = 0.3;
            audio.play();
         } catch(e) {}
      }
    }, 4000);
  };

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    if (items.length > 2) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      toast.error("Need at least 2 options to spin!");
    }
  };

  return (
    <ToolLayout 
      title="Decision Matrix" 
      description="Professional random selection engine. Resolve debates, select prize winners, or randomize tasks with our physics-modeled interactive wheel."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 space-y-8 sm:space-y-12 overflow-hidden relative min-h-[500px] sm:min-h-[600px] flex flex-col items-center justify-center bg-zinc-50/30 dark:bg-zinc-900/30">
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                    <Dices className="w-5 h-5" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Game Floor</h3>
              </div>

              {/* The Wheel */}
              <div className="relative">
                 {/* Needle */}
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 text-[#c5a059] drop-shadow-lg">
                    <div className="w-8 h-8 bg-[#c5a059] clip-path-triangle rotate-180" />
                 </div>

                 <div 
                    ref={wheelRef}
                    className="w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] rounded-full border-8 border-white dark:border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.1)] relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                    style={{ transform: `rotate(${rotation}deg)` }}
                 >
                    {items.map((item, i) => {
                      const angle = 360 / items.length;
                      const rotate = i * angle;
                      const skew = 90 - angle;
                      return (
                        <div 
                          key={i}
                          className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left flex items-center justify-center"
                          style={{ 
                            transform: `rotate(${rotate}deg) skewY(-${skew}deg)`,
                            backgroundColor: i % 2 === 0 ? "#c5a059" : "#1a1a1a"
                          }}
                        >
                           <span 
                             className="text-[10px] font-black text-white uppercase tracking-widest absolute bottom-4 left-4"
                             style={{ 
                               transform: `skewY(${skew}deg) rotate(45deg)`,
                               transformOrigin: '0 0',
                               width: '150px'
                             }}
                           >
                             {item}
                           </span>
                        </div>
                      );
                    })}
                 </div>

                 {/* Center hub */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white dark:bg-zinc-900 rounded-full border-4 border-[#c5a059] shadow-xl flex items-center justify-center z-20">
                    <div className="w-2 h-2 bg-[#c5a059] rounded-full" />
                 </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                 {winner && (
                   <div className="flex items-center gap-4 animate-bounce">
                      <Trophy className="w-6 h-6 text-[#c5a059]" />
                      <span className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                         {winner} wins!
                      </span>
                   </div>
                 )}
                 <Button 
                    onClick={spin}
                    disabled={isSpinning}
                    className="h-14 sm:h-20 px-8 sm:px-16 rounded-2xl sm:rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] sm:text-[14px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] shadow-2xl transition-all active:scale-95"
                 >
                    {isSpinning ? <RefreshCw className="w-6 h-6 animate-spin" /> : "SPIN THE WHEEL"}
                 </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Slice Manager</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Option Pool</p>
               </div>

               <div className="space-y-4">
                  <div className="flex gap-2">
                     <input 
                       type="text" 
                       placeholder="Add option..."
                       className="flex-1 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 text-xs font-medium focus:outline-none focus:border-[#c5a059] border border-zinc-100 dark:border-zinc-700"
                       value={newItem}
                       onChange={(e) => setNewItem(e.target.value)}
                       onKeyDown={(e) => e.key === "Enter" && addItem()}
                     />
                     <Button onClick={addItem} className="bg-[#c5a059] h-12 w-12 rounded-xl">
                        <Plus className="w-5 h-5" />
                     </Button>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                     {items.map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 group">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300">{item}</span>
                          <button onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                             <X className="w-4 h-4" />
                          </button>
                       </div>
                     ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                     <button
                       onClick={() => setSoundEnabled(!soundEnabled)}
                       className={cn(
                         "w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between",
                         soundEnabled ? "bg-[#c5a059]/5 border-[#c5a059]/30 text-[#c5a059]" : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100"
                       )}
                     >
                       <div className="flex items-center gap-3">
                         {soundEnabled ? <Volume2 className="w-4 h-4 text-[#c5a059]" /> : <VolumeX className="w-4 h-4 text-slate-300" />}
                         <span className="text-[10px] font-black uppercase tracking-widest">SFX Feedback</span>
                       </div>
                       <div className={cn("w-6 h-3 rounded-full relative transition-all", soundEnabled ? "bg-[#c5a059]" : "bg-zinc-300")}>
                         <div className={cn("absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all", soundEnabled ? "left-3.5" : "left-0.5")} />
                       </div>
                     </button>
                  </div>
               </div>
            </div>

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Physics Engine</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Uses cubic-bezier momentum simulation for authentic deceleration. Fair, random, and unhackable selection logic.
               </p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .clip-path-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </ToolLayout>
  );
}
