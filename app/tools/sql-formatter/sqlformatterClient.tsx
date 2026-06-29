"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Code2, 
  Copy, 
  Trash2, 
  Check, 
  Database, 
  Terminal,
  AlignLeft,
  Type,
  Sparkles,
  RefreshCw,
  Zap,
  Smartphone,
  Layout,
  Share2,
  ShieldCheck,
  Target,
  Loader2,
  Code,
  Info,
  X,
  Maximize2,
  Monitor,
  CheckCircle2,
  Activity,
  BarChart3,
  ChevronRight
} from "lucide-react";
import { format } from "sql-formatter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DIALECTS = [
  { id: "postgresql", name: "Postgres", icon: "🐘" },
  { id: "mysql", name: "MySQL", icon: "🐬" },
  { id: "sql", name: "Standard", icon: "📜" },
  { id: "sqlite", name: "SQLite", icon: "🗄️" },
  { id: "tsql", name: "SQL Srvr", icon: "🖥️" },
  { id: "bigquery", name: "BigQuery", icon: "🔍" },
];

export default function SQLFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [dialect, setDialect] = useState("postgresql");
  const [indent, setIndent] = useState(2);
  const [uppercase, setUppercase] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "done" && successRef.current) {
        successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    setStatus("processing");
    setTimeout(() => {
      try {
        setError(null);
        const formatted = format(input, {
          language: dialect as any,
          tabWidth: indent,
          keywordCase: uppercase ? "upper" : "lower",
          useTabs: false,
        });
        setOutput(formatted);
        setStatus("done");
        toast.success("SQL Beautified!");
      } catch (err: any) {
        setError("Failed to format SQL. Syntax Error.");
        setOutput("");
        setStatus("idle");
        toast.error("Syntax Error Detected");
      }
    }, 400);
  }, [input, dialect, indent, uppercase]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("SQL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput(""); setOutput(""); setError(null); setStatus("idle");
  };

  return (
    <ToolLayout title="SQL Query Architect" description="High-fidelity SQL normalization engine." fullWidth={false}>
      <div className="w-full max-w-7xl mx-auto space-y-4 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 lg:sticky lg:top-24">
            
            {/* Phase 01: Strategy */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 rounded-[1.5rem] p-5 space-y-5 shadow-sm relative overflow-hidden">
               <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-3"><span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Studio Driver</span><p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic mt-0.5">Dialect Vector</p></div>
               
               <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-1.5">
                    {DIALECTS.map((d) => (
                      <button key={d.id} onClick={() => setDialect(d.id)} className={cn("flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-tight transition-all border", dialect === d.id ? "bg-[#c5a059] border-[#c5a059] text-white shadow-md scale-105 z-10" : "bg-zinc-50 text-muted-foreground border-zinc-100 hover:border-[#c5a059]/30")}>
                        <span className="text-xs leading-none shrink-0">{d.icon}</span>
                        <span className="truncate leading-none">{d.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Formatting Matrix</label>
                     <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-100">
                        <button onClick={() => setUppercase(!uppercase)} className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all", uppercase ? "bg-[#c5a059] text-white shadow-sm" : "text-muted-foreground hover:text-[#c5a059]")}>
                          <Type className="w-3 h-3" /> {uppercase ? "UPPER" : "LOWER"}
                        </button>
                        <button onClick={() => setIndent(indent === 2 ? 4 : 2)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-[#c5a059] transition-all">
                          <AlignLeft className="w-3 h-3" /> {indent} SPACES
                        </button>
                     </div>
                  </div>
                  <Button onClick={handleFormat} disabled={!input.trim()} className="w-full h-14 bg-gradient-to-br from-[#c5a059] to-[#b08d4b] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(197,160,89,0.3)] hover:scale-[1.02] active:scale-95 transition-all border-none group">
                     <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> BEAUTIFY QUERY
                  </Button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100 shadow-sm"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Safe Enc</span></div>
               <div className="bg-white p-3.5 rounded-xl flex flex-col items-center text-center gap-2 border border-zinc-100 shadow-sm"><Zap className="w-3.5 h-3.5 text-[#c5a059]" /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">Turbo Syn</span></div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
            
            {status === "done" && (
              <div ref={successRef} className="animate-in zoom-in-95 duration-700 w-full">
                 <div className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-[#c5a059]/30 flex flex-col gap-5 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
                       <div className="flex items-center gap-4 min-w-fit">
                          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner"><CheckCircle2 className="w-5 h-5" /></div>
                          <div><h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">Normalization Complete</h3><p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.3em] italic leading-none">Dialect Matrix Optimized</p></div>
                       </div>
                       <div className="flex gap-2 w-full sm:w-auto items-center justify-center sm:justify-end">
                          <Button onClick={clear} variant="outline" className="h-10 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 shrink-0 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors">CLEAR STUDIO</Button>
                          <Button onClick={handleCopy} className="h-10 px-4 rounded-lg bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-md text-[9px] shrink-0 flex items-center gap-2 hover:scale-105 transition-transform">
                             {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "COPIED" : "COPY SQL"}
                          </Button>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Dialect", value: dialect.toUpperCase(), icon: Database, highlight: true },
                          { label: "Stability", value: "99.9%", icon: Activity },
                          { label: "Indentation", value: `${indent} Spaces`, icon: AlignLeft },
                          { label: "Keywords", value: uppercase ? "UPPER" : "LOWER", icon: Type }
                        ].map((stat, i) => (
                          <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 flex flex-col gap-1">
                             <div className="flex items-center justify-between"><stat.icon className={cn("w-3 h-3 opacity-20", stat.highlight && "text-[#c5a059] opacity-50")} /><span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/50">{stat.label}</span></div>
                             <p className={cn("text-xs font-black tracking-tight", stat.highlight ? "text-[#c5a059]" : "text-zinc-600 dark:text-zinc-400")}>{stat.value}</p>
                          </div>
                        ))}
                    </div>
                 </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 rounded-[1.5rem] min-h-[500px] lg:min-h-[650px] p-5 flex flex-col relative shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                  <div className="flex flex-col gap-0.5"><span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Matrix</span><p className="text-sm font-black uppercase tracking-widest italic text-[#c5a059] opacity-80 leading-none">Spectrum Feed</p></div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full bg-[#c5a059]", status === "processing" && "animate-pulse")} /> {status === "processing" ? "SYNTHESIZING" : "LIVE"}
                  </div>
               </div>
               
               <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                  <div className="flex flex-col gap-3 min-h-[300px] lg:min-h-0">
                     <div className="flex justify-between items-center px-2"><span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Inbound Manifest</span><button onClick={clear} className="text-[8px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-colors">Clear Protocol</button></div>
                     <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 p-4 relative group">
                        <textarea className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-[11px] font-bold leading-relaxed text-zinc-700 dark:text-zinc-200 caret-[#c5a059] placeholder:text-zinc-300" placeholder="-- Paste raw SQL here..." value={input} onChange={(e) => setInput(e.target.value)} />
                        <div className="absolute top-2 right-2 flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-zinc-200" /><div className="w-1.5 h-1.5 rounded-full bg-zinc-200" /><div className="w-1.5 h-1.5 rounded-full bg-zinc-200" /></div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-3 min-h-[300px] lg:min-h-0">
                     <span className="text-[8px] font-black uppercase tracking-widest text-[#c5a059] opacity-40 px-2 italic">Beautified Matrix</span>
                     <div className={cn("flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 p-4 relative transition-all shadow-inner", status === "processing" && "blur-md opacity-40")}>
                        {error ? (
                          <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-4">
                             <Terminal className="w-8 h-8 text-red-500/40" />
                             <p className="text-[9px] font-black text-red-500/60 uppercase tracking-widest">{error}</p>
                          </div>
                        ) : output ? (
                          <pre className="w-full h-full overflow-auto font-mono text-[11px] font-bold leading-relaxed text-[#c5a059] custom-scrollbar">
                             <code>{output}</code>
                          </pre>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-6 opacity-30">
                             <div className="relative">
                                <Monitor className="w-12 h-12 text-zinc-200" />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-50 rounded-full border-2 border-white flex items-center justify-center"><Loader2 className="w-2.5 h-2.5 text-[#c5a059] animate-spin-slow" /></div>
                             </div>
                             <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">Awaiting Payload Matrix</p>
                          </div>
                        )}
                        {status === "processing" && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#c5a059] animate-spin" /></div>}
                        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.1); border-radius: 4px; } .animate-spin-slow { animation: spin 4s linear infinite; }`}</style>
    </ToolLayout>
  );
}
