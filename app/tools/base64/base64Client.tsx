"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeftRight, 
  Copy, 
  CheckCircle2, 
  Lock, 
  Unlock,
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
  Shield,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.trim()) { setOutput(""); setError(null); return; }
    handleProcess();
  }, [input, mode]);

  const handleProcess = () => {
    setError(null);
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setError(`Failed to ${mode}. The input is not a valid ${mode === "decode" ? "Base64 string" : "string"}.`);
      setOutput("");
    }
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
      title="Base64 Matrix Transcoder" 
      description="Professional text-to-base64 serialization engine. Encapsulate or decapsulate binary-safe strings with localized browser-native processing."
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
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Transcoder Mode</p>
               </div>

               <div className="space-y-8 relative z-10">
                  <div className="flex bg-zinc-50 dark:bg-zinc-800/80 p-2 rounded-[2rem] shadow-inner-soft border border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => { setMode("encode"); setOutput(""); setError(null); }}
                      className={cn(
                        "flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3",
                        mode === "encode" ? "bg-[#c5a059] text-white shadow-xl scale-[1.02]" : "text-muted-foreground/40 hover:text-[#c5a059]"
                      )}
                    >
                      <Lock className="w-4 h-4" /> ENCODE
                    </button>
                    <button
                      onClick={() => { setMode("decode"); setOutput(""); setError(null); }}
                      className={cn(
                        "flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3",
                        mode === "decode" ? "bg-[#c5a059] text-white shadow-xl scale-[1.02]" : "text-muted-foreground/40 hover:text-[#c5a059]"
                      )}
                    >
                      <Unlock className="w-4 h-4" /> DECODE
                    </button>
                  </div>

                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#c5a059]/5 border border-[#c5a059]/10">
                     <Shield className="w-5 h-5 text-[#c5a059] opacity-40" />
                     <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground leading-relaxed italic">
                        Local-first processing. No data leaves your secure workspace.
                     </p>
                  </div>
               </div>
            </div>

            {/* Support Info: Ecosystem - REDESIGNED: No Black Background */}
            <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-10 shadow-xl rounded-[2.5rem] sm:rounded-[3.5rem] space-y-10 relative overflow-hidden group border border-[#c5a059]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                     <Database className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Logic Matrix</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Synced</p>
                  </div>
               </div>

               <div className="space-y-4 relative z-10">
                  {[
                    { icon: Code, label: "Binary Safe", detail: "Active" },
                    { icon: Terminal, label: "UTF-8 Native", detail: "Enabled" },
                    { icon: ShieldCheck, label: "Private Flow", detail: "Encrypted" }
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
                        <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" /> Live Stream
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
                  {/* Left: Input Studio - REDESIGNED: No Black Background */}
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-4 italic">Inbound Vector</label>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] p-1 border border-zinc-100 dark:border-zinc-800 shadow-inner-soft relative overflow-hidden group/input">
                        <div className="absolute top-4 left-6 flex gap-1.5 z-20">
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>
                        <div className="absolute top-4 right-8 z-20">
                           <span className="text-[9px] font-mono font-black text-zinc-400/40 uppercase tracking-widest">{mode === 'encode' ? 'PLAIN_TEXT' : 'BASE64_BLOCK'}</span>
                        </div>
                        <textarea
                          className="w-full h-[500px] lg:h-[600px] p-12 pt-16 bg-transparent resize-none focus:outline-none font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059] placeholder:text-zinc-300"
                          placeholder={mode === "encode" ? "Initialize plain text manifest..." : "Initialize base64 block matrix..."}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                  </div>

                  {/* Right: Output Monitor - REDESIGNED: No Black Background */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic">Generated Manifest</label>
                       {output && (
                          <span className="text-[10px] font-mono font-black text-[#c5a059]/40">{output.length} Characters</span>
                       )}
                    </div>
                    <div className={cn(
                       "bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-[2.5rem] p-1 border shadow-inner-soft relative overflow-hidden transition-all duration-700",
                       error ? "border-red-500/20" : "border-[#c5a059]/20"
                    )}>
                        <div className="absolute top-4 right-8 z-20">
                           <span className="text-[9px] font-mono font-black text-[#c5a059]/40 uppercase tracking-widest">{mode === 'encode' ? 'BASE64_OUTPUT' : 'PLAIN_OUTPUT'}</span>
                        </div>
                        <textarea
                          readOnly
                          className={cn(
                            "w-full h-[500px] lg:h-[600px] p-12 pt-16 bg-transparent resize-none focus:outline-none font-mono text-[13px] leading-relaxed",
                            error ? "text-red-500/70" : "text-[#c5a059]"
                          )}
                          placeholder="Decrypted manifest will appear here..."
                          value={error ? `PROTOCOL_ERROR:\n\n${error}` : output}
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
        .shadow-inner-soft {
           box-shadow: inset 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </ToolLayout>
  );
}

