"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Copy, 
  CheckCircle2, 
  Zap,
  Terminal,
  Search,
  BarChart,
  FileText,
  Filter,
  RefreshCw,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STOP_WORDS = new Set(["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "s", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "you", "your", "yours", "yourself", "yourselves"]);

export default function KeywordDensityPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{ word: string; count: number; density: string }[]>([]);
  const [excludeStopWords, setExcludeStopWords] = useState(true);
  const [minWordLength, setMinWordLength] = useState(3);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeText = () => {
    if (!input.trim()) { setResults([]); return; }
    setAnalyzing(true);
    
    setTimeout(() => {
      const words = input.toLowerCase().match(/\b\w+\b/g) || [];
      const totalWords = words.length;
      const freqMap: Record<string, number> = {};

      words.forEach(word => {
        if (excludeStopWords && STOP_WORDS.has(word)) return;
        if (word.length < minWordLength) return;
        freqMap[word] = (freqMap[word] || 0) + 1;
      });

      const sortedResults = Object.entries(freqMap)
        .map(([word, count]) => ({
          word,
          count,
          density: ((count / totalWords) * 100).toFixed(2) + "%"
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      setResults(sortedResults);
      setAnalyzing(false);
      toast.success("Analysis complete!");
    }, 800);
  };

  return (
    <ToolLayout 
      title="SEO Keyword Density Matrix" 
      description="Professional linguistic analysis engine. Deconstruct content architecture and optimize keyword distribution."
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
                      <BarChart className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Source Content</h3>
                </div>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setInput("")}
                   className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500"
                >
                   <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative group">
                <textarea
                  className="w-full h-[400px] lg:h-[500px] bg-transparent resize-none focus:outline-none font-medium text-[16px] leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059] placeholder:text-zinc-300"
                  placeholder="Paste your content here for keyword architectural analysis..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              {/* Matrix Table */}
              {results.length > 0 && (
                 <div className="mt-8 border-t border-zinc-50 dark:border-zinc-800/50 pt-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-6">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Density Matrix Result</h4>
                       <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Optimized Output</span>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-4 no-scrollbar">
                       {results.map((res, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 hover:border-[#c5a059]/20 transition-all">
                             <span className="text-[11px] font-black text-slate-700 dark:text-zinc-300 lowercase">{res.word}</span>
                             <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-400">{res.count}x</span>
                                <span className="text-[11px] font-black text-[#c5a059]">{res.density}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
            </div>

            {/* Main Action (Mobile First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={analyzeText}
                  disabled={analyzing || !input}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  {analyzing ? <RefreshCw className="w-5 h-5 mr-3 animate-spin" /> : <Search className="w-5 h-5 mr-3" />}
                  {analyzing ? "ANALYZING CONTENT..." : "RUN ARCHITECTURAL AUDIT"}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Words</span>
                      <span className="text-xl font-black text-[#c5a059]">{input.split(/\s+/).filter(Boolean).length}</span>
                   </div>
                </div>
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Analysis Filters</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Logic Parameters</p>
               </div>

               <div className="space-y-8">
                  {/* Toggle */}
                  <div className="space-y-4">
                     <button
                        onClick={() => setExcludeStopWords(!excludeStopWords)}
                        className={cn(
                           "w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-between px-6",
                           excludeStopWords ? "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/20" : "bg-zinc-50 dark:bg-zinc-800 text-slate-400 border-zinc-100 dark:border-zinc-700"
                        )}
                     >
                        <span>Exclude Stop Words</span>
                        <Filter className={cn("w-4 h-4", excludeStopWords ? "text-[#c5a059]" : "text-slate-300")} />
                     </button>
                  </div>

                  {/* Slider */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Min Word Length</label>
                        <span className="text-[10px] font-black text-[#c5a059]">{minWordLength}px</span>
                     </div>
                     <input 
                        type="range" 
                        min="1" max="10"
                        value={minWordLength} 
                        onChange={(e) => setMinWordLength(parseInt(e.target.value))}
                        className="w-full accent-[#c5a059]"
                     />
                  </div>
               </div>
            </div>

            {/* SEO Tooltip */}
            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">SEO Best Practice</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Maintain keyword density between 1% and 2% for optimal search engine performance without triggering spam filters.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
