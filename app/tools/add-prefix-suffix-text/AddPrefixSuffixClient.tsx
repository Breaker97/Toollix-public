"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  PlusSquare, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  X,
  Zap,
  Activity,
  ArrowRightLeft,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AddPrefixSuffixClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [skipEmpty, setSkipEmpty] = useState(true);
  const [addNumbering, setAddNumbering] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleProcess();
  }, [input, prefix, suffix, skipEmpty, addNumbering]);

  const handleProcess = () => {
    if (!input) {
      setOutput("");
      return;
    }

    const lines = input.split("\n");
    const result = lines.map((line, index) => {
      if (skipEmpty && line.trim() === "") return line;
      
      let processedLine = line;
      const numbering = addNumbering ? `${index + 1}. ` : "";
      
      return `${prefix}${numbering}${processedLine}${suffix}`;
    });

    setOutput(result.join("\n"));
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Formatted text copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout 
      title="Line Modifier" 
      description="Bulk line editing system. Automatically inject prefixes, suffixes, or numbering into every line of your document instantly."
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
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Source Document</h3>
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
                placeholder="Paste your text list here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="suite-card rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                      <ArrowRightLeft className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Modified Output</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="w-10 h-10 rounded-full hover:bg-[#c5a059]/10 hover:text-[#c5a059]">
                   {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <textarea
                className="w-full h-[300px] bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 resize-none focus:outline-none font-mono text-[14px] text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                placeholder="Modified text will appear here..."
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
                  {copied ? "COPIED TO CLIPBOARD" : "COPY FORMATTED TEXT"}
                </Button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Injection Rules</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Line Transformation</p>
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Prefix</label>
                    <input 
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 text-sm focus:outline-none focus:border-[#c5a059]"
                      placeholder="Text to add at start..."
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Suffix</label>
                    <input 
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 text-sm focus:outline-none focus:border-[#c5a059]"
                      placeholder="Text to add at end..."
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                     {[
                       { key: "skipEmpty", label: "Skip Empty Lines", icon: X, active: skipEmpty },
                       { key: "addNumbering", label: "Add Line Numbering", icon: Hash, active: addNumbering },
                     ].map((item) => (
                       <button
                         key={item.key}
                         onClick={() => {
                            if (item.key === "skipEmpty") setSkipEmpty(!skipEmpty);
                            if (item.key === "addNumbering") setAddNumbering(!addNumbering);
                         }}
                         className={cn(
                           "w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between group",
                           item.active
                             ? "bg-[#c5a059]/5 border-[#c5a059]/30 text-slate-900 dark:text-white"
                             : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 text-slate-400"
                         )}
                       >
                         <div className="flex items-center gap-3">
                           <item.icon className={cn("w-4 h-4", item.active ? "text-[#c5a059]" : "text-slate-300")} />
                           <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                         </div>
                         <div className={cn("w-6 h-3 rounded-full relative transition-all", item.active ? "bg-[#c5a059]" : "bg-zinc-300")}>
                           <div className={cn("absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all", item.active ? "left-3.5" : "left-0.5")} />
                         </div>
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Sequence Logic</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Ideal for wrapping values in quotes for SQL, adding bullet points, or numbering lists for documentation.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
