"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  AlignJustify, 
  Copy, 
  CheckCircle2, 
  Zap,
  Database,
  Terminal,
  Type,
  X,
  Hash,
  Activity,
  FileText,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LineCounterClient() {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState({
    lines: 0,
    words: 0,
    chars: 0,
    charsNoSpaces: 0,
    emptyLines: 0
  });

  useEffect(() => {
    handleProcess();
  }, [input]);

  const handleProcess = () => {
    if (!input) {
      setStats({ lines: 0, words: 0, chars: 0, charsNoSpaces: 0, emptyLines: 0 });
      return;
    }

    const lines = input.split(/\r?\n/);
    const words = input.trim().split(/\s+/).filter(w => w.length > 0);
    const chars = input.length;
    const charsNoSpaces = input.replace(/\s/g, "").length;
    const emptyLines = lines.filter(l => l.trim().length === 0).length;

    setStats({
      lines: lines.length,
      words: words.length,
      chars,
      charsNoSpaces,
      emptyLines
    });
  };

  return (
    <ToolLayout 
      title="Text Density Engine" 
      description="Advanced analytical tool for line, word, and character counting. Real-time metric extraction for content optimization."
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
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Source Corpus</h3>
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

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Input Matrix</label>
                 <textarea
                   className="w-full h-[400px] bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl p-8 border border-zinc-100 dark:border-zinc-800 resize-none focus:outline-none font-mono text-[14px] leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                   placeholder="Paste text here to analyze..."
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                 />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div className="suite-card p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 flex flex-col items-center justify-center gap-4 group hover:border-[#c5a059]/30 transition-all">
                  <div className="w-12 h-12 bg-[#c5a059]/10 rounded-2xl flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform">
                     <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Lines</p>
                     <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.lines}</p>
                  </div>
               </div>
               <div className="suite-card p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 flex flex-col items-center justify-center gap-4 group hover:border-[#c5a059]/30 transition-all">
                  <div className="w-12 h-12 bg-[#c5a059]/10 rounded-2xl flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform">
                     <Type className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Word Count</p>
                     <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.words}</p>
                  </div>
               </div>
               <div className="suite-card p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 flex flex-col items-center justify-center gap-4 group hover:border-[#c5a059]/30 transition-all">
                  <div className="w-12 h-12 bg-[#c5a059]/10 rounded-2xl flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform">
                     <Activity className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Char Count</p>
                     <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.chars}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Granular Metrics</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Detail Extraction</p>
               </div>

               <div className="space-y-4">
                  {[
                    { label: "Empty Lines", val: stats.emptyLines, icon: X },
                    { label: "Characters (No Spaces)", val: stats.charsNoSpaces, icon: Hash },
                    { label: "Avg Chars / Line", val: stats.lines ? Math.round(stats.chars / stats.lines) : 0, icon: BarChart3 },
                    { label: "Avg Words / Line", val: stats.lines ? Math.round(stats.words / stats.lines) : 0, icon: AlignJustify },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800">
                       <div className="flex items-center gap-3">
                          <m.icon className="w-4 h-4 text-[#c5a059]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300">{m.label}</span>
                       </div>
                       <span className="text-sm font-black text-slate-900 dark:text-white">{m.val}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Metric Kernel</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Live analytical processing calculates density and distribution in real-time within the browser environment.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Type className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Privacy</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Database className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Local Lab</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
