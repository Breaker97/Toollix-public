"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  AlignLeft, 
  Copy, 
  CheckCircle2, 
  Zap,
  Terminal,
  Type,
  RefreshCw,
  Layout,
  Layers,
  FileText,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type LoremType = "paragraphs" | "sentences" | "words";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

export default function LoremIpsumPage() {
  const [output, setOutput] = useState("");
  const [type, setType] = useState<LoremType>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateLorem();
  }, [type, count, startWithLorem]);

  const generateLorem = () => {
    let result = "";
    const generateSentence = () => {
      const len = Math.floor(Math.random() * 10) + 5;
      let s = [];
      for (let i = 0; i < len; i++) {
        s.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      let text = s.join(" ");
      return text.charAt(0).toUpperCase() + text.slice(1) + ".";
    };

    const generateParagraph = () => {
      const len = Math.floor(Math.random() * 3) + 3;
      let p = [];
      for (let i = 0; i < len; i++) {
        p.push(generateSentence());
      }
      return p.join(" ");
    };

    if (type === "words") {
      let words = [];
      if (startWithLorem) {
        words.push("Lorem", "ipsum", "dolor", "sit", "amet");
      }
      for (let i = words.length; i < count; i++) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      result = words.slice(0, count).join(" ");
    } else if (type === "sentences") {
      let sentences = [];
      for (let i = 0; i < count; i++) {
        sentences.push(generateSentence());
      }
      if (startWithLorem) {
        sentences[0] = "Lorem ipsum dolor sit amet, " + sentences[0].charAt(0).toLowerCase() + sentences[0].slice(1);
      }
      result = sentences.join(" ");
    } else {
      let paragraphs = [];
      for (let i = 0; i < count; i++) {
        paragraphs.push(generateParagraph());
      }
      if (startWithLorem) {
        paragraphs[0] = "Lorem ipsum dolor sit amet, " + paragraphs[0].charAt(0).toLowerCase() + paragraphs[0].slice(1);
      }
      result = paragraphs.join("\n\n");
    }

    setOutput(result);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Placeholder text copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout 
      title="Lorem Ipsum Generator" 
      description="Professional placeholder text engine. Generate high-fidelity dummy text for UI/UX prototypes and development layouts."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Output Display */}
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Visual Monitor</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyToClipboard}
                    className={cn(
                      "w-10 h-10 rounded-full transition-all",
                      copied ? "text-emerald-500 bg-emerald-50" : "hover:bg-[#c5a059]/10 hover:text-[#c5a059]"
                    )}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="relative group">
                <textarea
                  readOnly
                  className="w-full h-[500px] lg:h-[600px] bg-transparent resize-none focus:outline-none font-medium text-[16px] leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059] placeholder:text-zinc-300"
                  value={output}
                />
                
                {/* Visual Flair */}
                <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-[0.02] pointer-events-none" />
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <Type className="w-3.5 h-3.5 text-[#c5a059]" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{output.split(/\s+/).filter(Boolean).length} Words</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Layers className="w-3.5 h-3.5 text-[#c5a059]" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Blob([output]).size} Bytes</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Active Stream</span>
                 </div>
              </div>
            </div>

            {/* Main Action (Mobile First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={copyToClipboard}
                  className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  {copied ? "TEXT COPIED" : "COPY PLACEHOLDER"}
                </Button>
                <Button 
                  onClick={generateLorem}
                  variant="ghost"
                  className="h-20 sm:w-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[#c5a059] hover:bg-[#c5a059]/10 transition-all flex items-center justify-center"
                >
                  <RefreshCw className="w-6 h-6" />
                </Button>
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Generation Settings</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Logic Driver</p>
               </div>

               <div className="space-y-8">
                  {/* Mode Toggles */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 ml-2">Text Unit</label>
                     <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        {(["paragraphs", "sentences", "words"] as LoremType[]).map((t) => (
                           <button 
                              key={t}
                              onClick={() => setType(t)}
                              className={cn(
                                 "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                 type === t ? "bg-white dark:bg-zinc-700 text-[#c5a059] shadow-sm" : "text-slate-400 dark:text-zinc-500 hover:bg-zinc-100/50"
                              )}
                           >
                              {t.slice(0, 4)}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Quantity Slider */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Quantity</label>
                        <span className="text-[10px] font-black text-[#c5a059]">{count}</span>
                     </div>
                     <input 
                        type="range" 
                        min="1" 
                        max={type === 'words' ? 500 : 20}
                        value={count} 
                        onChange={(e) => setCount(parseInt(e.target.value))}
                        className="w-full accent-[#c5a059]"
                     />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                     <button
                        onClick={() => setStartWithLorem(!startWithLorem)}
                        className={cn(
                           "w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-between px-6",
                           startWithLorem ? "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/20" : "bg-zinc-50 dark:bg-zinc-800 text-slate-400 border-zinc-100 dark:border-zinc-700"
                        )}
                     >
                        <span>Start with Lorem</span>
                        <div className={cn("w-2 h-2 rounded-full", startWithLorem ? "bg-[#c5a059] animate-pulse" : "bg-zinc-300")} />
                     </button>
                  </div>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Zap className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Turbo Mode</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Terminal className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">API Ready</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
