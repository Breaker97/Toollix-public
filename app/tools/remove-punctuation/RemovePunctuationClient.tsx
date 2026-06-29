"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Scissors, 
  Copy, 
  CheckCircle2, 
  Zap,
  Database,
  Terminal,
  Type,
  X,
  Eraser,
  Wand2,
  Hash,
  Hash as HashIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function RemovePunctuationClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Settings
  const [options, setOptions] = useState({
    standard: true,
    math: false,
    currency: false,
    brackets: true,
    custom: ""
  });

  useEffect(() => {
    handleProcess();
  }, [input, options]);

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    let result = input;

    // Standard Punctuation: .,!?;:
    if (options.standard) {
      result = result.replace(/[.,!?;:]/g, "");
    }

    // Math symbols: +-*/=<>
    if (options.math) {
      result = result.replace(/[+\-*/=<>]/g, "");
    }

    // Currency: $£€¥
    if (options.currency) {
      result = result.replace(/[$£€¥¢]/g, "");
    }

    // Brackets: ()[]{}
    if (options.brackets) {
      result = result.replace(/[()[\]{}]/g, "");
    }

    // Custom
    if (options.custom) {
      const escaped = options.custom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`[${escaped}]`, 'g');
      result = result.replace(regex, "");
    }

    setOutput(result);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Sanitized text copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key: keyof typeof options) => {
    if (key === "custom") return;
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ToolLayout 
      title="Punctuation Purger" 
      description="Cleanse text by removing punctuation, symbols, and special characters. Ideal for NLP data preparation and text normalization."
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
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Raw Source</h3>
                </div>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => { setInput(""); setOutput(""); }}
                   className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500"
                >
                   <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Input Block</label>
                    <textarea
                      className="w-full h-[400px] bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 resize-none focus:outline-none font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                      placeholder="Paste text with punctuation here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Purger Output</label>
                       <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6 text-[#c5a059] hover:bg-[#c5a059]/10">
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                       </Button>
                    </div>
                    <textarea
                      readOnly
                      className="w-full h-[400px] bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-2xl p-6 border border-[#c5a059]/20 resize-none focus:outline-none font-mono text-[13px] leading-relaxed text-[#c5a059]"
                      placeholder="Sanitized text will appear here..."
                      value={output}
                    />
                 </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={copyToClipboard}
                  disabled={!output}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <Scissors className="w-5 h-5 mr-3" />
                  {copied ? "COPIED TO CLIPBOARD" : "USE CLEANED TEXT"}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Purge Efficiency</span>
                      <span className="text-xl font-black text-[#c5a059]">{input.length > 0 ? Math.max(0, Math.round(((input.length - output.length) / input.length) * 100)) : 0}%</span>
                   </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Purge Protocol</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Strip Configurations</p>
               </div>

               <div className="space-y-3">
                  {[
                    { key: "standard", label: "Standard Punctuations", desc: "Strip . , ! ? ; :" },
                    { key: "brackets", label: "Brackets & Wrappers", desc: "Strip ( ) [ ] { }" },
                    { key: "math", label: "Math Symbols", desc: "Strip + - * / = < >" },
                    { key: "currency", label: "Currency Symbols", desc: "Strip $ £ € ¥ ¢" },
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
                        "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                        options[item.key as keyof typeof options] ? "bg-[#c5a059] text-white" : "bg-zinc-200 dark:bg-zinc-700"
                      )}>
                        {options[item.key as keyof typeof options] ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                        <span className="text-[9px] font-medium opacity-60 italic">{item.desc}</span>
                      </div>
                    </button>
                  ))}

                  <div className="pt-4 space-y-3 border-t border-zinc-100 dark:border-zinc-800">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Custom Blacklist</label>
                    <input 
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 text-[13px] font-mono focus:outline-none focus:border-[#c5a059]/50"
                      placeholder="e.g. @ # %"
                      value={options.custom}
                      onChange={(e) => setOptions(prev => ({ ...prev, custom: e.target.value }))}
                    />
                  </div>
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Eraser className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Regex Kernel</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Advanced character pruning engine uses optimized regular expressions for high-volume text streams.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Zap className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fast Stream</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Database className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pure Local</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
