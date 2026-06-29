"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Copy, 
  CheckCircle2, 
  Zap,
  Database,
  Terminal,
  X,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { md5 } from "@/lib/md5";

export default function MD5HashClient() {
  const [input, setInput] = useState("");
  const [salt, setSalt] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSalt, setShowSalt] = useState(false);

  useEffect(() => {
    handleProcess();
  }, [input, salt]);

  const handleProcess = () => {
    if (!input) {
      setOutput("");
      return;
    }

    const combined = input + salt;
    const hash = md5(combined);
    setOutput(hash);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("MD5 hash copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout 
      title="MD5 Hash Architect" 
      description="Cryptographically generate MD5 message-digests. Perfect for data integrity verification, checksums, and legacy fingerprinting."
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
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Source Vector</h3>
                </div>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => { setInput(""); setSalt(""); setOutput(""); }}
                   className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500"
                >
                   <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Input String</label>
                    <textarea
                      className="w-full h-[120px] bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 resize-none focus:outline-none font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                      placeholder="Enter text to hash..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Salt (Optional)</label>
                       <button 
                        onClick={() => setShowSalt(!showSalt)}
                        className="text-[9px] font-black uppercase tracking-widest text-[#c5a059] flex items-center gap-2"
                       >
                         {showSalt ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                         {showSalt ? "Hide" : "Show"}
                       </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c5a059]/40" />
                      <input
                        type={showSalt ? "text" : "password"}
                        className="w-full bg-zinc-50 dark:bg-zinc-800/30 rounded-xl py-4 pl-12 pr-6 border border-zinc-100 dark:border-zinc-800 focus:outline-none font-mono text-[13px] text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                        placeholder="Add a secret salt for extra entropy..."
                        value={salt}
                        onChange={(e) => setSalt(e.target.value)}
                      />
                    </div>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center px-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">MD5 Digest Output</label>
                       <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-6 w-6 text-[#c5a059] hover:bg-[#c5a059]/10">
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                       </Button>
                    </div>
                    <div className="w-full bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-2xl p-6 border border-[#c5a059]/20 font-mono text-[16px] font-black text-[#c5a059] break-all tracking-wider text-center">
                      {output || "waiting_for_input_stream"}
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
                  <ShieldCheck className="w-5 h-5 mr-3" />
                  {copied ? "COPIED TO CLIPBOARD" : "USE MD5 FINGERPRINT"}
                </Button>
                <div className="flex items-center gap-4 px-8 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Hash Bits</span>
                      <span className="text-xl font-black text-[#c5a059]">128-bit</span>
                   </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Hashing Protocol</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Security Parameters</p>
               </div>

               <div className="space-y-6">
                  <div className="suite-card p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#c5a059]" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Algorithm Info</span>
                    </div>
                    <p className="text-[9px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                      MD5 produces a 128-bit (16-byte) hash value, typically expressed as a 32-digit hexadecimal number.
                    </p>
                  </div>

                  <div className="suite-card p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#c5a059]" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Salted Entropy</span>
                    </div>
                    <p className="text-[9px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                      Adding a salt prevents rainbow table attacks and ensures unique hashes for identical inputs.
                    </p>
                  </div>
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Integrity Shield</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Pure client-side hashing. Your source data never touches our servers, ensuring total privacy.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Zap className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fast Kernal</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Database className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Private Lab</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
