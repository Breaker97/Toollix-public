"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Link, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  X,
  Type,
  Activity,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SlugGeneratorClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [stripSpecial, setStripSpecial] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleProcess();
  }, [input, delimiter, lowercase, stripSpecial]);

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    let result = input;

    if (lowercase) {
      result = result.toLowerCase();
    }

    if (stripSpecial) {
      // Keep only alphanumeric and spaces (to be replaced by delimiter)
      result = result.replace(/[^\w\s-]/g, "");
    }

    // Replace spaces and underscores with delimiter
    result = result.replace(/[\s_]+/g, delimiter);

    // Remove duplicate delimiters
    const escapedDelimiter = delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const doubleDelimiterRegex = new RegExp(`${escapedDelimiter}${escapedDelimiter}+`, 'g');
    result = result.replace(doubleDelimiterRegex, delimiter);

    // Trim delimiters from start and end
    const startDelimiterRegex = new RegExp(`^${escapedDelimiter}+`);
    const endDelimiterRegex = new RegExp(`${escapedDelimiter}+$`);
    result = result.replace(startDelimiterRegex, "").replace(endDelimiterRegex, "");

    setOutput(result);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Result copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout 
      title="SEO Slug Generator" 
      description="Professional URL optimization tool. Convert titles and descriptions into clean, search-engine friendly slugs instantly."
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
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Source Title</h3>
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

              <div className="space-y-6">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Input Title</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 focus:outline-none font-mono text-[16px] text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                      placeholder="e.g. How to Build a Next.js App in 2026!"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Generated Slug</label>
                       <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6 text-[#c5a059] hover:bg-[#c5a059]/10">
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                       </Button>
                    </div>
                    <div className="w-full bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-2xl p-6 border border-[#c5a059]/20 font-mono text-[14px] text-[#c5a059] break-all">
                       {output || "waiting-for-input..."}
                    </div>
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
                  {copied ? "COPIED TO CLIPBOARD" : "COPY SEO SLUG"}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col text-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Path Length</span>
                      <span className="text-xl font-black text-[#c5a059]">{output.length}</span>
                   </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Slug Strategy</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">SEO Protocol</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delimiter</label>
                     <div className="grid grid-cols-3 gap-2">
                        {["-", "_", "."].map((d) => (
                          <button
                            key={d}
                            onClick={() => setDelimiter(d)}
                            className={cn(
                              "py-3 rounded-xl text-lg font-bold transition-all border",
                              delimiter === d 
                                ? "bg-[#c5a059] text-white border-[#c5a059] shadow-md" 
                                : "bg-zinc-50 dark:bg-zinc-800 text-slate-400 border-zinc-100 dark:border-zinc-700 hover:bg-zinc-100/50"
                            )}
                          >
                            {d === "-" ? "—" : d}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                     <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        <div className="flex items-center gap-3">
                           <Type className="w-4 h-4 text-[#c5a059]" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300">Force Lowercase</span>
                        </div>
                        <input 
                           type="checkbox" 
                           checked={lowercase} 
                           onChange={(e) => setLowercase(e.target.checked)}
                           className="w-4 h-4 accent-[#c5a059]"
                        />
                     </div>

                     <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        <div className="flex items-center gap-3">
                           <Globe className="w-4 h-4 text-[#c5a059]" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300">Strip Special</span>
                        </div>
                        <input 
                           type="checkbox" 
                           checked={stripSpecial} 
                           onChange={(e) => setStripSpecial(e.target.checked)}
                           className="w-4 h-4 accent-[#c5a059]"
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">SEO Best Practice</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Clean URLs improve search rankings and user click-through rates. Avoid using underscores where possible.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
