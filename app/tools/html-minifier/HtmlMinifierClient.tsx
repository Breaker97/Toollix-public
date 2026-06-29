"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Minimize2, 
  Copy, 
  CheckCircle2, 
  Trash2,
  Zap,
  Globe,
  Code,
  Layers,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function HtmlMinifierClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ original: number; minified: number; saved: number } | null>(null);

  const handleMinify = () => {
    if (!input.trim()) { toast.error("Please provide HTML payload."); return; }
    let minified = input;
    // Basic minification logic
    minified = minified.replace(/<!--[\s\S]*?-->/g, ""); // Remove comments
    minified = minified.replace(/>\s+</g, "><"); // Remove whitespace between tags
    minified = minified.replace(/\s{2,}/g, " "); // Collapse multiple spaces
    minified = minified.trim();
    
    setOutput(minified);
    const origSize = new Blob([input]).size;
    const miniSize = new Blob([minified]).size;
    setStats({ 
      original: origSize, 
      minified: miniSize, 
      saved: Math.round(((origSize - miniSize) / origSize) * 100) || 0 
    });
    toast.success("HTML Minified Successfully!");
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Minified HTML copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setStats(null);
    toast.info("Workspace Cleared");
  };

  return (
    <ToolLayout
      title="HTML Core Minifier"
      description="Professional DOM optimization engine. Serialize and compress HTML manifests to accelerate network delivery and improve core web vitals."
      fullWidth={true}
    >
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[420px_1fr] lg:gap-16 items-start w-full overflow-x-hidden">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:sticky lg:top-28 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            
            {/* Phase 01: Protocol */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 space-y-10 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Driver</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Compression Engine</p>
               </div>

               <div className="space-y-8 relative z-10">
                  <div className="flex flex-col gap-4">
                     <Button 
                       className="h-20 bg-[#c5a059] text-white rounded-[1.5rem] font-black shadow-xl transition-all active:scale-95 border-none group"
                       onClick={handleMinify}
                     >
                        <Minimize2 className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform text-white" />
                        COMPRESS DOM
                     </Button>
                     <Button 
                       variant="ghost"
                       className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all"
                       onClick={clear}
                     >
                        <Trash2 className="w-4 h-4 mr-2" /> CLEAR WORKSPACE
                     </Button>
                  </div>

                  {stats && (
                    <div className="bg-[#c5a059]/5 border border-[#c5a059]/20 p-6 rounded-[2rem] space-y-4 animate-in slide-in-from-top-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] italic">Efficiency Matrix</span>
                          <span className="text-xl font-black text-[#c5a059]">{stats.saved}%</span>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                             <span>Original</span>
                             <span>{(stats.original / 1024).toFixed(1)} KB</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#c5a059]/10 rounded-full overflow-hidden">
                             <div className="h-full bg-[#c5a059] transition-all duration-1000" style={{ width: `${100 - stats.saved}%` }} />
                          </div>
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[#c5a059] italic">
                             <span>Minified</span>
                             <span>{(stats.minified / 1024).toFixed(1)} KB</span>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Support Info: Ecosystem */}
            <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-10 shadow-xl rounded-[2.5rem] sm:rounded-[3.5rem] space-y-10 relative overflow-hidden group border border-[#c5a059]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                     <Globe className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Core Vitals</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Optimizing</p>
                  </div>
               </div>

               <div className="space-y-4 relative z-10">
                  {[
                    { icon: Code, label: "HTML5 Protocol", detail: "Active" },
                    { icon: Layers, label: "Layer Pruning", detail: "Enabled" },
                    { icon: ShieldCheck, label: "DOM Guard", detail: "Safe" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-[#c5a059]/10 group/item hover:bg-[#c5a059]/5 transition-all">
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
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] min-h-[600px] lg:min-h-[800px] p-6 sm:p-10 lg:p-16 flex flex-col relative shadow-2xl overflow-hidden">
               
               <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                  <div className="flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Visual Monitor</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059] opacity-80">Extraction Feed</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="bg-[#c5a059]/10 text-[#c5a059] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", output ? "bg-[#c5a059] animate-pulse" : "bg-zinc-200")} /> 
                        {output ? "OPTIMIZATION COMPLETE" : "AWAITING MANIFEST"}
                     </div>
                     <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={copyToClipboard} 
                        disabled={!output} 
                        className={cn("w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 transition-all border border-zinc-100 dark:border-zinc-700 shadow-sm", copied ? "bg-emerald-50 text-emerald-600" : "hover:bg-[#c5a059]/10 hover:text-[#c5a059]")}
                      >
                        {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </Button>
                  </div>
               </div>

               <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left: Input Studio */}
                  <div className="space-y-6 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-4 italic">Inbound HTML Manifest</label>
                    <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] p-1 border border-zinc-100 dark:border-zinc-800 shadow-inner-soft relative overflow-hidden group/input">
                        <div className="absolute top-4 left-6 flex gap-1.5 z-20">
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>
                        <div className="absolute top-4 right-8 z-20">
                           <span className="text-[9px] font-mono font-black text-zinc-400/40 uppercase tracking-widest">source.html</span>
                        </div>
                        <textarea
                          className="w-full h-full min-h-[400px] p-12 pt-16 bg-transparent resize-none focus:outline-none font-mono text-[13px] font-bold leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059] placeholder:text-zinc-300"
                          placeholder={"<html>\n  <head>\n    <!-- protocol initialization -->\n    <title>Toollix Studio</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>"}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                  </div>

                  {/* Right: Output Monitor */}
                  <div className="space-y-6 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] ml-4 italic">Compressed DOM Matrix</label>
                    <div className={cn(
                       "flex-1 bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-[2.5rem] p-1 border shadow-inner-soft relative overflow-hidden transition-all duration-700",
                       output ? "border-[#c5a059]/20" : "border-zinc-100 dark:border-zinc-800"
                    )}>
                        <div className="absolute top-4 right-8 z-20">
                           <span className="text-[9px] font-mono font-black text-[#c5a059]/40 uppercase tracking-widest">minified.html</span>
                        </div>
                        <textarea
                          readOnly
                          className="w-full h-full min-h-[400px] p-12 pt-16 bg-transparent resize-none focus:outline-none font-mono text-[13px] font-bold leading-relaxed text-[#c5a059] placeholder:text-zinc-300"
                          placeholder="Compressed manifest will appear here..."
                          value={output}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />
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
        .shadow-inner-soft { box-shadow: inset 0 2px 12px 0 rgba(0, 0, 0, 0.05); }
      `}</style>
    </ToolLayout>
  );
}
