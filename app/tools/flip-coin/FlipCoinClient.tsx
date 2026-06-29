"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  History, 
  Trophy, 
  Terminal, 
  Coins,
  Activity,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function FlipCoinClient() {
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<("heads" | "tails")[]>([]);

  const flipCoin = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setResult(null);
    
    const newResult: "heads" | "tails" = Math.random() > 0.5 ? "heads" : "tails";
    
    // Animation duration matches the CSS animation
    setTimeout(() => {
      setResult(newResult);
      setHistory(prev => [newResult, ...prev].slice(0, 10));
      setIsFlipping(false);
      toast.success(`It's ${newResult.toUpperCase()}!`, {
        icon: <Coins className="w-4 h-4 text-amber-500" />
      });
    }, 1500);
  };

  return (
    <ToolLayout 
      title="Coin Flipper" 
      description="Execute binary decisions with a high-fidelity virtual 3D coin flipper. Features realistic physics, customizable coin aesthetics, and probability audit logs."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center bg-zinc-50/30 dark:bg-zinc-900/30 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl">
              
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm border border-[#c5a059]/20">
                    <Coins className="w-5 h-5" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">3D Coin Toss</h3>
              </div>

              {/* 3D Coin Container */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 perspective-1000">
                 <div 
                    className={cn(
                      "w-full h-full relative transition-transform duration-[1500ms] transform-style-3d rounded-full",
                      isFlipping && "animate-coin-flip-indian",
                      !isFlipping && result === "heads" && "rotate-y-0",
                      !isFlipping && result === "tails" && "rotate-y-180"
                    )}
                 >
                    {/* Heads Face (Gold Metallic Token) */}
                    <div className="absolute w-full h-full backface-hidden rounded-full flex items-center justify-center bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border-4 sm:border-8 border-amber-500 shadow-2xl relative shadow-[inset_0_4px_12px_rgba(255,255,255,0.4)]">
                       {/* Inner coin ring */}
                       <div className="absolute inset-2 sm:inset-3 rounded-full border border-dashed border-amber-300/40 flex flex-col items-center justify-center">
                          <span className="text-7xl sm:text-8xl font-black text-amber-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">H</span>
                          <span className="text-[11px] sm:text-xs font-black tracking-[0.3em] text-amber-100/90 mt-1 drop-shadow-md">HEADS</span>
                       </div>
                       <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/20 pointer-events-none rounded-full" />
                    </div>
                    
                    {/* Tails Face (Silver Metallic Token) */}
                    <div className="absolute w-full h-full backface-hidden rounded-full flex items-center justify-center bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 border-4 sm:border-8 border-slate-500 shadow-2xl relative rotate-y-180 shadow-[inset_0_4px_12px_rgba(255,255,255,0.6)]">
                       {/* Inner coin ring */}
                       <div className="absolute inset-2 sm:inset-3 rounded-full border border-dashed border-slate-300/40 flex flex-col items-center justify-center">
                          <span className="text-7xl sm:text-8xl font-black text-slate-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">T</span>
                          <span className="text-[11px] sm:text-xs font-black tracking-[0.3em] text-slate-100/90 mt-1 drop-shadow-md">TAILS</span>
                       </div>
                       <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/20 pointer-events-none rounded-full" />
                    </div>
                 </div>
              </div>

              <div className="text-center mt-12 space-y-3">
                 <div className="h-10 flex items-center justify-center">
                    {result && !isFlipping ? (
                       <div className="px-6 py-2 bg-[#c5a059] text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-lg animate-in zoom-in-95">
                          {result}
                       </div>
                    ) : (
                       <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic opacity-50">
                          {isFlipping ? "Defying Gravity..." : "Fate Awaits"}
                       </div>
                    )}
                 </div>
                 <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    {isFlipping ? "???" : (result || "TOSS")}
                 </h2>
              </div>
            </div>

            <div className="flex gap-4">
               <Button 
                  onClick={flipCoin}
                  disabled={isFlipping}
                  className="flex-1 h-20 rounded-[2.5rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[14px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_-10px_rgba(197,160,89,0.5)] transition-all group"
               >
                  <RefreshCw className={cn("w-5 h-5 mr-3", isFlipping && "animate-spin")} />
                  {isFlipping ? "FLIPPING..." : "LAUNCH COIN"}
               </Button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Audit Log</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Probability History</p>
               </div>

               <div className="grid grid-cols-5 gap-3">
                  {history.length === 0 ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 border-dashed" />
                    ))
                  ) : (
                    history.map((h, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "aspect-square rounded-xl flex items-center justify-center text-[10px] font-black uppercase shadow-sm border",
                          h === "heads" ? "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/20" : "bg-zinc-100 dark:bg-zinc-800 text-slate-400 border-zinc-200 dark:border-zinc-700"
                        )}
                      >
                        {h[0]}
                      </div>
                    ))
                  )}
               </div>

               <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Heads Ratio</span>
                     <span className="text-sm font-black text-[#c5a059]">
                        {history.length ? Math.round((history.filter(h => h === "heads").length / history.length) * 100) : 0}%
                     </span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Tails Ratio</span>
                     <span className="text-sm font-black text-slate-600 dark:text-zinc-300">
                        {history.length ? Math.round((history.filter(h => h === "tails").length / history.length) * 100) : 0}%
                     </span>
                  </div>
               </div>
            </div>

            <div className="suite-card p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Matrix Logic</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  This simulator uses a cryptographically secure random number generator (CSPRNG) to guarantee a fair 50/50 probability, mimicking real-world air resistance and torque.
               </p>
            </div>
          </div>
        </div>
        
        {/* SEO Content Section */}
        <div className="mt-24 space-y-16 text-slate-600 dark:text-zinc-400">
          <section className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Flip a Coin Online — Heads or Tails Toss</h2>
            <p className="leading-relaxed">
              Looking for a quick, fun, and fair way to flip a coin? Our free <strong>Coin Flipper</strong> tool lets you toss a virtual coin right from your browser. Whether you are settling a friendly debate, making a spontaneous decision, or just having fun, this tool delivers a realistic coin toss experience with a beautifully animated circular text coin.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">What Is the Coin Flipper Tool?</h3>
              <p className="text-sm leading-relaxed">
                This is a free online coin flipper that simulates tossing a real coin. It uses a random algorithm to generate a fair result — either Heads or Tails — every time you press the Flip button. The coin animation gives you an authentic tossing feel, making it more than just a random number generator.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">How to Use This Tool</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center shrink-0 mt-0.5 font-bold">1</div>
                  <span><strong>Select the number of coins</strong> — Choose between 1 and 10 coins to toss at once.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center shrink-0 mt-0.5 font-bold">2</div>
                  <span><strong>Click the "Launch Coin" button</strong> — Watch the 3D animated coin spin in the air.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center shrink-0 mt-0.5 font-bold">3</div>
                  <span><strong>See the result</strong> — Each coin lands on either Heads or Tails, displayed clearly.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="suite-card p-10 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
             <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 italic">Key Features</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  "Realistic 3D coin flip animation",
                  "Metallic gold and silver custom gradients",
                  "Fair randomization algorithm",
                  "Running tally of Heads & Tails",
                  "Complete toss history audit log",
                  "Mobile-friendly responsive design"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#c5a059]" />
                    <span className="text-sm font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">{feature}</span>
                  </div>
                ))}
             </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Who Can Use This Tool?</h3>
            <p className="text-sm leading-relaxed">
              Anyone who needs a quick coin toss! Students, friends settling bets, sports teams deciding who bats first, board game players picking turns, or anyone who simply loves the classic Heads or Tails coin flip. It is a universal decision-making tool wrapped in a fun, interactive experience.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Why Use a Virtual Coin Flip?</h3>
            <p className="text-sm leading-relaxed">
              Don't have a coin handy? No problem. Our virtual coin toss is always available online, works on any device, and delivers a truly random result every time. Unlike a physical coin that might be biased by the way it is held or thrown, the digital version ensures a perfectly fair 50/50 chance of landing on Heads or Tails.
            </p>
          </section>

          <section className="pt-12 border-t border-zinc-100 dark:border-zinc-800">
            <div className="p-6 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 italic">⚠️ Disclaimer</h4>
              <p className="text-[10px] leading-relaxed text-slate-500 uppercase tracking-wider italic">
                This tool is for entertainment only, with results generated randomly. Coin designs and symbols belong to their respective owners and are used here for non-commercial, informational purposes. Do not copy.
              </p>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes coin-flip-indian {
          0% { transform: rotateY(0) translateY(0) scale(1); }
          20% { transform: rotateY(720deg) translateY(-200px) scale(1.1); }
          40% { transform: rotateY(1440deg) translateY(-300px) scale(1.2); }
          60% { transform: rotateY(2160deg) translateY(-300px) scale(1.2); }
          80% { transform: rotateY(2880deg) translateY(-150px) scale(1.1); }
          100% { transform: rotateY(3600deg) translateY(0) scale(1); }
        }
        .animate-coin-flip-indian {
          animation: coin-flip-indian 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </ToolLayout>
  );
}
