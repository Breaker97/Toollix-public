"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Wand2, 
  Minimize2, 
  Copy, 
  CheckCircle2, 
  Trash2,
  Zap,
  Smartphone,
  Layout,
  Share2,
  ShieldCheck,
  Target,
  Loader2,
  Terminal,
  Database,
  Code,
  FileJson,
  Sparkles,
  RefreshCw,
  XCircle,
  Info,
  Monitor,
  AlignLeft,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function CodeEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = "",
  label,
  labelColor = "text-muted-foreground/40",
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  label: string;
  labelColor?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = value ? value.split("\n") : [""];
  const lineCount = Math.max(lines.length, 1);

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex flex-col gap-2.5 h-full">
      <div className="flex justify-between items-center px-2">
         <label className={cn("text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic", labelColor)}>
           {label}
         </label>
         <span className="text-[7px] font-mono font-black text-zinc-300 uppercase tracking-widest">{lineCount} LINES</span>
      </div>
      <div className={cn(
        "relative flex-1 rounded-2xl overflow-hidden border shadow-sm flex flex-col transition-all duration-300",
        readOnly ? "bg-[#c5a059]/5 border-[#c5a059]/10" : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800"
      )}>
        <div className="flex flex-1 overflow-hidden">
          <div ref={lineNumbersRef} className="select-none overflow-hidden shrink-0 bg-white/30 dark:bg-black/5 border-r border-zinc-100 dark:border-zinc-800/30 py-4 w-10">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="text-right pr-3 font-mono text-[9px] font-black leading-6 text-zinc-300 dark:text-zinc-600">
                {String(i + 1).padStart(2, '0')}
              </div>
            ))}
          </div>
          <div className="relative flex-1">
             {readOnly ? (
               <pre className="w-full h-full py-4 px-5 overflow-auto font-mono text-[11px] font-bold leading-6 text-[#c5a059] bg-transparent whitespace-pre custom-scrollbar relative z-10" style={{ tabSize: 2 }}>
                 {value || <span className="opacity-20">{placeholder}</span>}
               </pre>
             ) : (
               <textarea ref={textareaRef} value={value} onChange={(e) => onChange?.(e.target.value)} onScroll={syncScroll} spellCheck={false} className="w-full h-full py-4 px-5 overflow-auto font-mono text-[11px] font-bold leading-6 text-zinc-700 dark:text-zinc-200 bg-transparent whitespace-pre resize-none outline-none caret-[#c5a059] custom-scrollbar relative z-10" placeholder={placeholder} style={{ tabSize: 2 }} />
             )}
             <div className="absolute inset-0 bg-[radial-gradient(#c5a059_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);
  const [status, setStatus] = useState<"idle" | "processing">("idle");

  const handleFormat = () => {
    if (!input.trim()) return;
    setStatus("processing");
    setTimeout(() => {
      try {
        const parsed = JSON.parse(input);
        setOutput(JSON.stringify(parsed, null, indent));
        setError(null);
        toast.success("JSON Beautified!");
      } catch (err: any) {
        setError(err.message);
        setOutput("");
        toast.error("Protocol Syntax Error");
      } finally { setStatus("idle"); }
    }, 300);
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    setStatus("processing");
    setTimeout(() => {
      try {
        const parsed = JSON.parse(input);
        setOutput(JSON.stringify(parsed));
        setError(null);
        toast.success("JSON Serialized!");
      } catch (err: any) {
        setError(err.message);
        setOutput("");
        toast.error("Protocol Syntax Error");
      } finally { setStatus("idle"); }
    }, 300);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Manifest copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => { setInput(""); setOutput(""); setError(null); };

  return (
    <ToolLayout title="JSON Object Architect" description="High-fidelity JSON normalization engine." fullWidth={false}>
      <div className="w-full max-w-7xl mx-auto space-y-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 rounded-[1.5rem] p-5 space-y-5 shadow-sm relative overflow-hidden">
               <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Studio Driver</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Matrix Protocol</p></div>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Indentation Matrix</label>
                     <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-100">
                        {[2, 4].map(n => (
                          <button key={n} onClick={() => setIndent(n)} className={cn("flex-1 h-9 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", indent === n ? "bg-[#c5a059] text-white shadow-md" : "text-muted-foreground hover:text-[#c5a059]")}>{n} SPACES</button>
                        ))}
                     </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     <Button onClick={handleFormat} className="w-full h-11 bg-[#c5a059] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2">
                        <Wand2 className="w-4 h-4" /> BEAUTIFY MANIFEST
                     </Button>
                     <Button variant="outline" onClick={handleMinify} className="w-full h-10 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <Minimize2 className="w-3.5 h-3.5 opacity-40" /> SERIALIZE
                     </Button>
                  </div>

                  {error && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 animate-in slide-in-from-top-2">
                       <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                       <p className="text-[10px] font-bold text-red-900 leading-relaxed truncate-3-lines">{error}</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Safe Obj</span></div>
               <div className="bg-zinc-50 p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100"><Zap className="w-3.5 h-3.5 text-[#c5a059] opacity-40" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Turbo Syn</span></div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 rounded-[1.5rem] min-h-[500px] lg:min-h-[650px] p-5 flex flex-col relative shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                  <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Visual Monitor</span><p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">Extraction Feed</p></div>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full bg-[#c5a059]", status === "processing" && "animate-pulse")} /> {status === "processing" ? "SYNCING" : "LIVE"}
                    </div>
                    {output && (
                      <Button onClick={handleCopy} size="icon" variant="ghost" className={cn("w-8 h-8 rounded-lg border transition-all", copied ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-zinc-50 border-zinc-100 hover:text-[#c5a059]")}>
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
               </div>
               
               <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                  <div className="flex flex-col min-h-[300px] lg:min-h-0">
                     <CodeEditor label="Inbound JSON Manifest" value={input} onChange={setInput} placeholder={'{\n  "status": "initialize",\n  "protocol": "awaiting_payload"\n}'} />
                     <div className="mt-2 flex justify-end px-2">
                        <button onClick={handleClear} className="text-[8px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-colors">Clear Protocol</button>
                     </div>
                  </div>

                  <div className="flex flex-col min-h-[300px] lg:min-h-0">
                     <CodeEditor label="Generated Result Matrix" value={output} readOnly placeholder="Result manifest will appear here..." labelColor="text-[#c5a059]" />
                     {output && (
                       <div className="mt-2 flex justify-end px-2">
                          <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500/60 italic flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> Manifest Optimized</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.1); border-radius: 4px; }`}</style>
    </ToolLayout>
  );
}
