"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Smile, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  X,
  Zap,
  Activity,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EmojiRemoverClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [removeSymbols, setRemoveSymbols] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleProcess();
  }, [input, removeSymbols]);

  const handleProcess = () => {
    if (!input) {
      setOutput("");
      return;
    }

    // Comprehensive emoji regex
    let emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F3FB}-\u{1F3FF}\u{1F170}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2934}\u{2935}\u{203C}\u{2049}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;
    
    let result = input.replace(emojiRegex, "");

    if (removeSymbols) {
      // Remove more symbols if checked
      result = result.replace(/[^\w\s\d.,!?;:()'"\-]/g, "");
    }

    // Clean up extra spaces that might have been left behind
    result = result.replace(/[ ]{2,}/g, " ").trim();

    setOutput(result);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Clean text copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout 
      title="Emoji Sanitizer" 
      description="Professional text purification tool. Strip all emojis, pictograms, and non-standard symbols for clean data analysis and professional documentation."
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

              <textarea
                className="w-full h-[300px] bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 resize-none focus:outline-none font-mono text-[14px] text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                placeholder="Paste text with emojis here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="suite-card rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                      <Zap className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Sanitized Output</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="w-10 h-10 rounded-full hover:bg-[#c5a059]/10 hover:text-[#c5a059]">
                   {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <textarea
                className="w-full h-[300px] bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 resize-none focus:outline-none font-mono text-[14px] text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                placeholder="Clean text will appear here..."
                value={output}
                readOnly
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={copyToClipboard}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  {copied ? "COPIED TO CLIPBOARD" : "COPY CLEAN TEXT"}
                </Button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cleaning Mode</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Filter Intensity</p>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                     <div className="flex items-center gap-3">
                        <Trash2 className="w-4 h-4 text-[#c5a059]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300">Remove Symbols</span>
                     </div>
                     <input 
                        type="checkbox" 
                        checked={removeSymbols} 
                        onChange={(e) => setRemoveSymbols(e.target.checked)}
                        className="w-4 h-4 accent-[#c5a059]"
                     />
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                     <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-wider italic">
                        Standard cleaning removes all standard Unicode emojis. Aggressive cleaning also strips non-alphanumeric symbols.
                     </p>
                  </div>
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Data Integrity</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Essential for prepping text for NLP models, database imports, or professional prints.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
