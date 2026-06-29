"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Zap,
  Code,
  ShieldCheck,
  Database,
  Braces,
  XCircle,
  FileCode
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function JsonToTypeScriptClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const getTsType = (val: any, name: string = "RootObject"): string => {
    if (val === null) return "null";
    const type = typeof val;
    if (type === "string" || type === "number" || type === "boolean") return type;
    if (Array.isArray(val)) {
      if (val.length === 0) return "any[]";
      return `${getTsType(val[0], name)}[]`;
    }
    if (type === "object") {
      let result = `interface ${capitalize(name)} {\n`;
      for (const key in val) {
        result += `  ${key}: ${getTsType(val[key], key)};\n`;
      }
      result += `}\n`;
      return result;
    }
    return "any";
  };

  const convertToJson = () => {
    if (!input.trim()) { setOutput(""); setError(null); return; }
    try {
      setOutput(getTsType(JSON.parse(input)));
      setError(null);
    } catch (err: any) {
      setError("Invalid JSON Matrix: " + err.message);
      setOutput("");
    }
  };

  useEffect(() => {
    const timer = setTimeout(convertToJson, 400);
    return () => clearTimeout(timer);
  }, [input]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    toast.success("TypeScript Interface Transcribed!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError(null);
    toast.info("Cleared");
  };

  return (
    <ToolLayout
      title="JSON to TypeScript"
      description="Convert JSON to TypeScript interfaces instantly. Get clean, strongly-typed code for your projects in one click."
      fullWidth={true}
    >
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[360px_1fr] lg:gap-10 items-start w-full overflow-x-hidden pb-12">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:sticky lg:top-28 space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
            
            {/* Phase 01: Settings */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-8 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Settings</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Options</p>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#c5a059]/5 border border-[#c5a059]/10">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shrink-0" />
                     <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground leading-relaxed italic">
                        Ready to convert JSON to code. 
                     </p>
                  </div>

                   <div className="grid grid-cols-1 gap-3">
                     <Button 
                       className="h-16 bg-[#c5a059] text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 border-none group"
                       onClick={handleCopy}
                       disabled={!output}
                     >
                        <FileCode className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform text-white" />
                        COPY INTERFACE
                     </Button>
                     <Button 
                       variant="ghost"
                       className="h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all border border-zinc-100 dark:border-zinc-800 shadow-sm"
                       onClick={clear}
                     >
                        <Trash2 className="w-4 h-4 mr-2" /> CLEAR PROTOCOL
                     </Button>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-4">
                       <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-red-500 italic leading-none">Logic Error</p>
                          <p className="text-[11px] font-bold text-red-950 dark:text-red-200 leading-relaxed">{error}</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Support Info: Ecosystem */}
            <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-8 shadow-lg rounded-[2rem] sm:rounded-[2.5rem] space-y-6 relative overflow-hidden group border border-[#c5a059]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                     <Braces className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Type Registry</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Operational</p>
                  </div>
               </div>

               <div className="space-y-3 relative z-10">
                  {[
                    { icon: Code, label: "TS Standard", detail: "Active" },
                    { icon: Database, label: "Object Mapping", detail: "Universal" },
                    { icon: ShieldCheck, label: "Secure Extract", detail: "Localized" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-[#c5a059]/10 group/item hover:bg-[#c5a059]/5 transition-all">
                       <div className="flex items-center gap-4">
                          <item.icon className="w-4 h-4 text-[#c5a059] opacity-40 group-hover/item:opacity-100" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400">{item.label}</span>
                       </div>
                       <span className="text-[9px] font-black text-[#c5a059] uppercase italic opacity-40">{item.detail}</span>
                    </div>
                  ))}
               </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Studio Workspace */}
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] sm:rounded-[2.5rem] min-h-[500px] lg:min-h-[600px] p-6 sm:p-8 lg:p-10 flex flex-col relative shadow-xl overflow-hidden">
               
               <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <div className="flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Visual Monitor</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059] opacity-80">Extraction Feed</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="bg-[#c5a059]/10 text-[#c5a059] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", output ? "bg-[#c5a059] animate-pulse" : "bg-zinc-200")} /> 
                        {output ? "TRANSCRIPTION SUCCESS" : "AWAITING MANIFEST"}
                     </div>
                  </div>
               </div>

               <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Input Studio */}
                  <div className="space-y-4 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-4 italic">Inbound JSON Manifest</label>
                    <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] p-1 border border-zinc-100 dark:border-zinc-800 shadow-inner-soft relative overflow-hidden group/input">
                        <div className="absolute top-4 left-6 flex gap-1.5 z-20">
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>
                        <div className="absolute top-4 right-8 z-20">
                           <span className="text-[9px] font-mono font-black text-zinc-400/40 uppercase tracking-widest">source.json</span>
                        </div>
                        <textarea
                          className="w-full h-full min-h-[400px] p-8 pt-12 bg-transparent resize-none focus:outline-none font-mono text-[13px] font-bold leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059] placeholder:text-zinc-300"
                          placeholder={'{\n  "id": 1,\n  "name": "Toollix Studio",\n  "protocol": ["web", "api"]\n}'}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                  </div>

                  {/* Right: Output Monitor */}
                  <div className="space-y-4 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] ml-4 italic">Generated Type Matrix</label>
                    <div className={cn(
                       "flex-1 bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-[2rem] p-1 border shadow-inner-soft relative overflow-hidden transition-all duration-700",
                       output ? "border-[#c5a059]/20" : "border-zinc-100 dark:border-zinc-800"
                    )}>
                        <div className="absolute top-4 right-8 z-20">
                           <span className="text-[9px] font-mono font-black text-[#c5a059]/40 uppercase tracking-widest">schema.ts</span>
                        </div>
                        <pre className="w-full h-full min-h-[400px] p-8 pt-12 overflow-auto font-mono text-[13px] font-bold leading-relaxed text-[#c5a059] bg-transparent scrollbar-hide">
                           {output || <span className="text-zinc-300">Interface transcription will appear here...</span>}
                        </pre>
                        <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />
                    </div>
                  </div>
               </div>

               {/* Footer Branding Overlay */}
               <div className="absolute bottom-12 right-12 flex items-center gap-4 hidden sm:flex">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none mb-1">Session Protocol</p>
                        <p className="text-[10px] font-mono font-black text-[#c5a059] uppercase leading-none">{Math.random().toString(36).substring(7)}</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
                    <Zap className="w-5 h-5 text-[#c5a059]" />
               </div>
            </div>
        </div>
      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .shadow-inner-soft { box-shadow: inset 0 2px 12px 0 rgba(0, 0, 0, 0.05); }
      `}</style>
    </ToolLayout>
  );
}
