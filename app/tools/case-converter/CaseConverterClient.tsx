"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Type, 
  Copy, 
  CheckCircle2, 
  Zap,
  Database,
  Terminal,
  Code,
  Info,
  ArrowDownWideNarrow,
  Languages,
  Hash,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CaseMode = "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "pascal" | "constant";

export default function CaseConverterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<CaseMode>("upper");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) { setOutput(""); return; }
    handleProcess();
  }, [input, mode]);

  const handleProcess = () => {
    let result = input;
    const words = input.toLowerCase().match(/[a-z0-9]+/g) || [];

    switch (mode) {
      case "upper":
        result = input.toUpperCase();
        break;
      case "lower":
        result = input.toLowerCase();
        break;
      case "title":
        result = input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
        break;
      case "sentence":
        result = input.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case "camel":
        result = words.map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join("");
        break;
      case "snake":
        result = words.join("_");
        break;
      case "pascal":
        result = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join("");
        break;
      case "constant":
        result = words.join("_").toUpperCase();
        break;
    }
    setOutput(result);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Result copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const modes: { value: CaseMode; label: string; icon: any }[] = [
    { value: "upper", label: "UPPERCASE", icon: ArrowDownWideNarrow },
    { value: "lower", label: "lowercase", icon: ArrowDownWideNarrow },
    { value: "sentence", label: "Sentence case", icon: Type },
    { value: "title", label: "Title Case", icon: Type },
    { value: "camel", label: "camelCase", icon: Code },
    { value: "pascal", label: "PascalCase", icon: Code },
    { value: "snake", label: "snake_case", icon: Hash },
    { value: "constant", label: "CONSTANT_CASE", icon: Hash },
  ];

  return (
    <ToolLayout 
      title="Case Matrix Converter" 
      description="Professional text transformation engine. Instantly convert between programming cases and grammatical formats."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input/Output Manifest */}
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                      <Terminal className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Source Manifest</h3>
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
                      placeholder="Paste your source text here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Processed Stream</label>
                       <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6 text-[#c5a059] hover:bg-[#c5a059]/10">
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                       </Button>
                    </div>
                    <textarea
                      readOnly
                      className="w-full h-[400px] bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-2xl p-6 border border-[#c5a059]/20 resize-none focus:outline-none font-mono text-[13px] leading-relaxed text-[#c5a059]"
                      placeholder="Transformed manifest output..."
                      value={output}
                    />
                 </div>
              </div>
            </div>

            {/* Main Action (Mobile First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={copyToClipboard}
                  disabled={!output}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  {copied ? "COPIED TO CLIPBOARD" : "COPY TRANSFORMED TEXT"}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Word Count</span>
                      <span className="text-xl font-black text-[#c5a059]">{(input.match(/\w+/g) || []).length}</span>
                   </div>
                </div>
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Case Selection</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Transformation Protocol</p>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  {modes.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      className={cn(
                        "py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex flex-col items-center gap-2",
                        mode === m.value 
                          ? "bg-[#c5a059] text-white shadow-lg border-[#c5a059]" 
                          : "bg-zinc-50 dark:bg-zinc-800 text-slate-400 border-zinc-100 dark:border-zinc-700 hover:bg-zinc-100/50"
                      )}
                    >
                      <m.icon className="w-4 h-4" />
                      {m.label.split(' ')[0]}
                    </button>
                  ))}
               </div>
            </div>

            {/* Integration Card */}
            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Global Support</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Advanced Unicode support for multilingual character sets and special symbols.
               </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Zap className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fast Kernal</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Database className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Zero Storage</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
