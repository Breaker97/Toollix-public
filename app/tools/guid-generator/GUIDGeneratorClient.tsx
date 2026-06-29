"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Fingerprint, 
  Copy, 
  CheckCircle2, 
  Zap,
  Database,
  Terminal,
  RefreshCw,
  X,
  Braces,
  Hash,
  Quote,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function GUIDGeneratorClient() {
  const [results, setResults] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [copied, setCopied] = useState(false);
  
  // Settings
  const [options, setOptions] = useState({
    uppercase: false,
    dashes: true,
    braces: false,
    quotes: false,
    comma: false
  });

  useEffect(() => {
    generateGUIDs();
  }, [count, options]);

  const generateGUIDs = () => {
    const newGuids = Array.from({ length: Math.min(100, Math.max(1, count)) }, () => {
      let guid = crypto.randomUUID();
      
      if (!options.dashes) {
        guid = guid.replace(/-/g, "");
      }
      
      if (options.uppercase) {
        guid = guid.toUpperCase();
      }
      
      if (options.braces) {
        guid = `{${guid}}`;
      }
      
      if (options.quotes) {
        guid = `"${guid}"`;
      }
      
      return guid;
    });
    setResults(newGuids);
  };

  const copyToClipboard = () => {
    if (results.length === 0) return;
    const text = results.join(options.comma ? ", " : "\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${results.length} GUIDs copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ToolLayout 
      title="GUID Discovery Engine" 
      description="Professional unique identifier generation. Cryptographically secure UUID v4 strings for database keys, session IDs, and software architecture."
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
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Generated Sequence</h3>
                </div>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={generateGUIDs}
                   className="w-10 h-10 rounded-full hover:bg-[#c5a059]/10 hover:text-[#c5a059]"
                >
                   <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Active Manifest ({results.length})</label>
                   <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6 text-[#c5a059] hover:bg-[#c5a059]/10">
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                   </Button>
                </div>
                
                <div className="w-full h-[400px] bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-2xl p-6 border border-[#c5a059]/20 overflow-y-auto custom-scrollbar font-mono text-[13px] text-[#c5a059] leading-relaxed">
                  {results.map((guid, index) => (
                    <div key={index} className="flex gap-4 py-1 border-b border-[#c5a059]/5 last:border-0">
                      <span className="opacity-30 select-none w-8">{index + 1}</span>
                      <span>{guid}{options.comma && index < results.length - 1 ? "," : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={copyToClipboard}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  {copied ? "COPIED TO CLIPBOARD" : "COPY ALL GUIDS"}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Entropy Type</span>
                      <span className="text-sm font-black text-[#c5a059]">UUID V4</span>
                   </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Generation Protocol</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Constraint Selection</p>
               </div>

               <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Quantity</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                    />
                    <div className="flex justify-between text-[10px] font-black text-[#c5a059]">
                      <span>1</span>
                      <span>{count}</span>
                      <span>100</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    {[
                      { key: "uppercase", label: "Uppercase", icon: Hash },
                      { key: "dashes", label: "Include Dashes", icon: X },
                      { key: "braces", label: "Code Braces {}", icon: Braces },
                      { key: "quotes", label: "Add Quotes \"\"", icon: Quote },
                      { key: "comma", label: "Comma Separated", icon: Code },
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
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Security Logic</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Utilizes <code>crypto.getRandomValues()</code> for high-entropy, collision-resistant unique identifiers.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Zap className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure RNG</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Database className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Offline Safe</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
