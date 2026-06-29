"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  AlignJustify, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  X,
  Zap,
  Activity,
  Trash2,
  ListRestart,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TextCleanerClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState({
    extraSpaces: true,
    emptyLines: true,
    tabsToSpaces: true,
    trimLines: true,
    fixPunctuation: false,
    removeNumbers: false
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleProcess();
  }, [input, options]);

  const handleProcess = () => {
    if (!input) {
      setOutput("");
      return;
    }

    let result = input;

    if (options.tabsToSpaces) {
      result = result.replace(/\t/g, "    ");
    }

    if (options.trimLines) {
      result = result.split("\n").map(line => line.trim()).join("\n");
    }

    if (options.extraSpaces) {
      result = result.replace(/[ ]{2,}/g, " ");
    }

    if (options.emptyLines) {
      result = result.replace(/\n\s*\n/g, "\n").replace(/^\s*[\r\n]/gm, "");
    }

    if (options.fixPunctuation) {
      // Fix spaces before/after punctuation
      result = result.replace(/\s+([.,!?;:])/g, "$1"); // No space before
      result = result.replace(/([.,!?;:])(?![.\s])/g, "$1 "); // Space after
    }

    if (options.removeNumbers) {
      result = result.replace(/\d+/g, "");
    }

    setOutput(result.trim());
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Sanitized text copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ToolLayout 
      title="Text Sanitization Pro" 
      description="Professional string purification engine. Clean messy data, remove formatting artifacts, and prepare text for production-ready use cases."
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
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Messy Input</h3>
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
                placeholder="Paste messy text here..."
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
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Clean Rules</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Optimization Protocol</p>
               </div>

               <div className="space-y-3">
                  {[
                    { key: "extraSpaces", label: "Multiple Spaces", icon: AlignJustify },
                    { key: "emptyLines", label: "Empty Lines", icon: ListRestart },
                    { key: "tabsToSpaces", label: "Tabs to Spaces", icon: Terminal },
                    { key: "trimLines", label: "Trim Line Ends", icon: X },
                    { key: "fixPunctuation", label: "Fix Punctuation", icon: Activity },
                    { key: "removeNumbers", label: "Strip Numbers", icon: Hash },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => toggleOption(item.key as keyof typeof options)}
                      className={cn(
                        "w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between group",
                        options[item.key as keyof typeof options]
                          ? "bg-[#c5a059]/5 border-[#c5a059]/30 text-slate-900 dark:text-white"
                          : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 text-slate-400"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("w-4 h-4", options[item.key as keyof typeof options] ? "text-[#c5a059]" : "text-slate-300")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                      </div>
                      <div className={cn("w-6 h-3 rounded-full relative transition-all", options[item.key as keyof typeof options] ? "bg-[#c5a059]" : "bg-zinc-300")}>
                        <div className={cn("absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all", options[item.key as keyof typeof options] ? "left-3.5" : "left-0.5")} />
                      </div>
                    </button>
                  ))}
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Batch Cleanup</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Quickly transform raw copy, messy scraping results, or unformatted code notes into a clean, professional state.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
