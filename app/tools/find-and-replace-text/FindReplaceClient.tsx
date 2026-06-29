"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Replace, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  X,
  CaseSensitive,
  WholeWord,
  Regex,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function FindReplaceClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleProcess();
  }, [input, findText, replaceText, caseSensitive, wholeWord, isRegex]);

  const handleProcess = () => {
    if (!input) {
      setOutput("");
      return;
    }
    if (!findText) {
      setOutput(input);
      return;
    }

    try {
      let flags = "g";
      if (!caseSensitive) flags += "i";

      let pattern = findText;
      if (!isRegex) {
        // Escape regex special characters if not using regex mode
        pattern = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      if (wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }

      const regex = new RegExp(pattern, flags);
      const result = input.replace(regex, replaceText);
      setOutput(result);
    } catch (e) {
      // If regex is invalid, just show input or error indicator
      setOutput(input);
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout 
      title="String Architect" 
      description="Professional find and replace engine. Bulk edit text with advanced matching logic, case sensitivity, and regular expression support."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 space-y-6 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                      <Terminal className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Input Data Stream</h3>
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
                className="w-full h-[200px] sm:h-[300px] bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 resize-none focus:outline-none font-mono text-[14px] text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                placeholder="Paste your source text here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 space-y-6 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                      <Replace className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Processed Output</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="w-10 h-10 rounded-full hover:bg-[#c5a059]/10 hover:text-[#c5a059]">
                   {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <textarea
                className="w-full h-[200px] sm:h-[300px] bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 resize-none focus:outline-none font-mono text-[14px] text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                placeholder="Results will appear here..."
                value={output}
                readOnly
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={copyToClipboard}
                  className="flex-1 h-14 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  {copied ? "COPIED TO CLIPBOARD" : "COPY PROCESSED TEXT"}
                </Button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Match Parameters</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Replacement Logic</p>
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Find Text</label>
                    <input 
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 text-sm focus:outline-none focus:border-[#c5a059]"
                      placeholder="String to match..."
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Replace With</label>
                    <input 
                      type="text"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 text-sm focus:outline-none focus:border-[#c5a059]"
                      placeholder="Replacement string..."
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                     {[
                       { key: "caseSensitive", label: "Case Sensitive", icon: CaseSensitive, active: caseSensitive },
                       { key: "wholeWord", label: "Whole Word", icon: WholeWord, active: wholeWord },
                       { key: "isRegex", label: "Regex Mode", icon: Regex, active: isRegex },
                     ].map((item) => (
                       <button
                         key={item.key}
                         onClick={() => {
                            if (item.key === "caseSensitive") setCaseSensitive(!caseSensitive);
                            if (item.key === "wholeWord") setWholeWord(!wholeWord);
                            if (item.key === "isRegex") setIsRegex(!isRegex);
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

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Bulk Processing</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Handle thousands of replacements instantly in your browser with zero latency.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
