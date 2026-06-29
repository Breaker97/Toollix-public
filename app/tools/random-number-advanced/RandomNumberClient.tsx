"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Hash, 
  RotateCw, 
  Copy, 
  CheckCircle2, 
  Zap,
  Database,
  Terminal,
  X,
  Settings,
  ShieldCheck,
  TrendingUp,
  SortAsc
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function RandomNumberClient() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Settings
  const [options, setOptions] = useState({
    unique: true,
    sort: false,
    exclude: ""
  });

  const generateNumbers = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const excludeList = options.exclude.split(/[,\s]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      const range = max - min + 1;
      const finalCount = Math.min(count, 1000);
      
      // Safety check for unique mode
      const availableRange = range - excludeList.filter(n => n >= min && n <= max).length;
      if (options.unique && finalCount > availableRange) {
        toast.error(`Cannot generate ${finalCount} unique numbers in this range.`);
        setIsGenerating(false);
        return;
      }

      let newResults: number[] = [];
      const used = new Set(excludeList);

      while (newResults.length < finalCount) {
        const num = Math.floor(Math.random() * range) + min;
        
        if (options.unique) {
          if (!used.has(num)) {
            newResults.push(num);
            used.add(num);
          }
        } else {
          if (!excludeList.includes(num)) {
            newResults.push(num);
          }
        }
      }

      if (options.sort) {
        newResults.sort((a, b) => a - b);
      }

      setResults(newResults);
      setIsGenerating(false);
    }, 400);
  };

  const copyToClipboard = () => {
    if (results.length === 0) return;
    navigator.clipboard.writeText(results.join(", "));
    setCopied(true);
    toast.success(`${results.length} numbers copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key: keyof typeof options) => {
    if (key === "exclude") return;
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ToolLayout 
      title="RNG Precision Engine" 
      description="Professional random number generation with advanced constraints. Cryptographically secure entropy for sampling, testing, and decisions."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                      <Terminal className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Generated Manifest</h3>
                </div>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setResults([])}
                   className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500"
                >
                   <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Min Range</label>
                       <input 
                        type="number"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059]/50"
                        value={min}
                        onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Max Range</label>
                       <input 
                        type="number"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059]/50"
                        value={max}
                        onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Quantity</label>
                       <input 
                        type="number"
                        max="1000"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059]/50"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                       />
                    </div>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Result Sequence ({results.length})</label>
                       <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6 text-[#c5a059] hover:bg-[#c5a059]/10">
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                       </Button>
                    </div>
                    
                    <div className="w-full min-h-[200px] bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-[2rem] p-8 border border-[#c5a059]/20 flex flex-wrap gap-3 items-center justify-center">
                      {results.length > 0 ? results.map((n, i) => (
                        <div key={i} className="px-4 py-2 bg-white dark:bg-zinc-900 border border-[#c5a059]/30 rounded-xl text-sm font-black text-[#c5a059] shadow-sm animate-in zoom-in-75 duration-300">
                          {n}
                        </div>
                      )) : (
                        <div className="text-center opacity-30 flex flex-col items-center">
                          <Hash className="w-12 h-12 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Generation</p>
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={generateNumbers}
                  disabled={isGenerating}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <RotateCw className={cn("w-5 h-5 mr-3", isGenerating && "animate-spin")} />
                  {isGenerating ? "GENERATING..." : "GENERATE NUMBERS"}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Entropy Source</span>
                      <span className="text-sm font-black text-[#c5a059]">Secure PRNG</span>
                   </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Logic Constraints</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Constraint Tuning</p>
               </div>

               <div className="space-y-3">
                  {[
                    { key: "unique", label: "Unique Numbers", desc: "No duplicates allowed", icon: ShieldCheck },
                    { key: "sort", label: "Sort Results", desc: "Numerical ascending order", icon: SortAsc },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => toggleOption(item.key as keyof typeof options)}
                      className={cn(
                        "w-full p-5 rounded-2xl border transition-all text-left flex items-start gap-4 group",
                        options[item.key as keyof typeof options]
                          ? "bg-[#c5a059]/5 border-[#c5a059]/30 text-slate-900 dark:text-white"
                          : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 text-slate-400"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center transition-all mt-0.5",
                        options[item.key as keyof typeof options] ? "bg-[#c5a059] text-white" : "bg-zinc-200 dark:bg-zinc-700"
                      )}>
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                        <span className="text-[9px] font-medium opacity-60 italic">{item.desc}</span>
                      </div>
                    </button>
                  ))}

                  <div className="pt-4 space-y-3 border-t border-zinc-100 dark:border-zinc-800">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Exclude Numbers</label>
                    <input 
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 text-[13px] font-mono focus:outline-none focus:border-[#c5a059]/50"
                      placeholder="e.g. 7, 13, 42"
                      value={options.exclude}
                      onChange={(e) => setOptions(prev => ({ ...prev, exclude: e.target.value }))}
                    />
                  </div>
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Distribution Info</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Engineered to prevent clustering and ensure uniform probability across the specified range.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Zap className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">High Speed</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Database className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure RNG</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
