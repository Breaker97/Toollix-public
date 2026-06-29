"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  X,
  Type,
  AlignLeft,
  ArrowLeftRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ReverseMode = "chars" | "words" | "lines";

export default function TextReverserClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<ReverseMode>("chars");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleProcess();
  }, [input, mode]);

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    let result = "";
    switch (mode) {
      case "chars":
        result = input.split("").reverse().join("");
        break;
      case "words":
        result = input.split(/\s+/).reverse().join(" ");
        break;
      case "lines":
        result = input.split(/\r?\n/).reverse().join("\n");
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

  const modes: { value: ReverseMode; label: string; icon: any }[] = [
    { value: "chars", label: "Characters", icon: Type },
    { value: "words", label: "Words", icon: ArrowLeftRight },
    { value: "lines", label: "Lines", icon: AlignLeft },
  ];

  return (
    <ToolLayout 
      title="Text Reverser" 
      description="Professional string inversion engine. Instantly reverse characters, word order, or line sequences with zero latency."
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
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Reversed Output</label>
                       <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6 text-[#c5a059] hover:bg-[#c5a059]/10">
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                       </Button>
                    </div>
                    <textarea
                      readOnly
                      className="w-full h-[400px] bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-2xl p-6 border border-[#c5a059]/20 resize-none focus:outline-none font-mono text-[13px] leading-relaxed text-[#c5a059]"
                      placeholder="Inverted manifest output..."
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
                  <Copy className="w-5 h-5 mr-3" />
                  {copied ? "COPIED TO CLIPBOARD" : "COPY REVERSED TEXT"}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Characters</span>
                      <span className="text-xl font-black text-[#c5a059]">{input.length}</span>
                   </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Inversion Logic</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Transformation Protocol</p>
               </div>

               <div className="grid grid-cols-1 gap-3">
                  {modes.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      className={cn(
                        "py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-4 px-6",
                        mode === m.value 
                          ? "bg-[#c5a059] text-white shadow-lg border-[#c5a059]" 
                          : "bg-zinc-50 dark:bg-zinc-800 text-slate-400 border-zinc-100 dark:border-zinc-700 hover:bg-zinc-100/50"
                      )}
                    >
                      <m.icon className="w-4 h-4" />
                      Reverse {m.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Real-time Processing</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Instant inversion logic applied locally in your browser. No data ever leaves your device.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
