"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Trash2, 
  Key,
  Zap,
  Share2,
  Target,
  ShieldAlert,
  Fingerprint,
  Lock,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ValidationResult {
  line: number;
  type: "error" | "warning" | "success";
  message: string;
  content: string;
}

export default function EnvValidatorClient() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isValidated, setIsValidated] = useState(false);

  const validateEnv = () => {
    if (!input.trim()) { toast.error("Please provide .env manifest."); return; }

    const lines = input.split("\n");
    const newResults: ValidationResult[] = [];

    const secretPatterns = [
      { pattern: /AIZA[0-9A-Za-z-_]{35}/, name: "Google API Key" },
      { pattern: /sk_live_[0-9a-zA-Z]{24}/, name: "Stripe Live Secret Key" },
      { pattern: /sq0atp-[0-9A-Za-z-_]{22}/, name: "Square Access Token" },
      { pattern: /password|secret|key|auth|token/i, name: "Potential Generic Secret", type: "warning" as const },
    ];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return;

      const parts = trimmedLine.split("=");
      if (parts.length < 2) {
        newResults.push({ line: index + 1, type: "error", message: "Missing '=' assignment or invalid format.", content: trimmedLine });
        return;
      }

      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim();

      if (/\s/.test(key)) {
        newResults.push({ line: index + 1, type: "error", message: "Keys should not contain spaces.", content: trimmedLine });
      }

      secretPatterns.forEach(({ pattern, name, type }) => {
        if (pattern.test(trimmedLine)) {
          newResults.push({ line: index + 1, type: type || "warning", message: `Sensitive Data Detected: ${name}`, content: trimmedLine });
        }
      });

      const insecureValues = ["123456", "password", "root", "admin", "12345678"];
      if (insecureValues.includes(value.toLowerCase().replace(/['"]/g, ''))) {
        newResults.push({ line: index + 1, type: "warning", message: `Insecure generic value for ${key}`, content: trimmedLine });
      }
    });

    setResults(newResults);
    setIsValidated(true);
    if (newResults.filter(r => r.type === "error").length === 0) {
      toast.success("Security validation passed!");
    } else {
      toast.error("Vulnerabilities detected.");
    }
  };

  const handleClear = () => { setInput(""); setResults([]); setIsValidated(false); toast.info("Vault Cleared"); };
  const handleCopy = () => { navigator.clipboard.writeText(input); toast.success("Manifest copied to clipboard"); };

  const errors = results.filter(r => r.type === "error").length;
  const warnings = results.filter(r => r.type === "warning").length;

  return (
    <ToolLayout
      title=".env Checker"
      description="Check your .env files for errors or sensitive information. Secure and private validation that happens entirely in your browser."
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
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Status</p>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#c5a059]/5 border border-[#c5a059]/10">
                     <Lock className="w-4 h-4 text-[#c5a059] opacity-40 shrink-0" />
                     <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground leading-relaxed italic">
                        Local processing active. No manifest data leaves your secure workspace.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                     <Button 
                       className="h-16 bg-[#c5a059] text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 border-none group"
                       onClick={validateEnv}
                     >
                        <ShieldCheck className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform text-white" />
                        RUN SECURITY SCAN
                     </Button>
                      <div className="flex gap-3">
                        <Button 
                           variant="ghost" 
                           onClick={handleCopy} 
                           disabled={!input}
                           className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#c5a059]/10 hover:text-[#c5a059] transition-all border border-zinc-100 dark:border-zinc-800 shadow-sm"
                        >
                           <Copy className="w-4 h-4 mr-2" /> COPY
                        </Button>
                        <Button 
                           variant="ghost"
                           onClick={handleClear}
                           className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all border border-zinc-100 dark:border-zinc-800 shadow-sm"
                        >
                           <Trash2 className="w-4 h-4 mr-2" /> CLEAR
                        </Button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Support Info: Ecosystem */}
            <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-8 shadow-lg rounded-[2rem] sm:rounded-[2.5rem] space-y-6 relative overflow-hidden group border border-[#c5a059]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                     <Fingerprint className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Vulnerability Lab</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Shielded</p>
                  </div>
               </div>

               <div className="space-y-3 relative z-10">
                  {[
                    { icon: Search, label: "Deep Scan", detail: "Active" },
                    { icon: ShieldAlert, label: "Secret Guard", detail: "Enabled" },
                    { icon: Target, label: "Precision Logic", detail: "Active" }
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
                        <div className={cn("w-2 h-2 rounded-full", isValidated ? (errors > 0 ? "bg-red-500" : "bg-emerald-500") : "bg-zinc-200")} /> 
                        {isValidated ? (errors > 0 ? "VULNERABILITIES DETECTED" : "VAULT SECURE") : "AWAITING MANIFEST"}
                     </div>
                  </div>
               </div>

               <div className="flex-1 flex flex-col space-y-8">
                  {/* Editor Manifest */}
                  <div className="space-y-4 flex-1 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-4 italic">Inbound .env Manifest</label>
                    <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] p-1 border border-zinc-100 dark:border-zinc-800 shadow-inner-soft relative overflow-hidden group/input min-h-[300px]">
                        <div className="absolute top-4 left-6 flex gap-1.5 z-20">
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>
                        <div className="absolute top-4 right-8 z-20">
                           <span className="text-[9px] font-mono font-black text-zinc-400/40 uppercase tracking-widest">secrets.vault</span>
                        </div>
                        <textarea
                          className="w-full h-full p-8 pt-12 bg-transparent resize-none focus:outline-none font-mono text-[13px] font-bold leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059] placeholder:text-zinc-300"
                          placeholder={"# Initialize environment manifest...\nAPI_PROTOCOL=secure\nKEY_VECTOR=sk_live_..."}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                  </div>

                  {/* Result Matrix */}
                  {isValidated && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 pb-10">
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {[
                            { label: "Logic Errors", count: errors, color: "red" },
                            { label: "Security Warnings", count: warnings, color: "amber" },
                            { label: "Protocol Status", count: results.length === 0 ? "PASSED" : "FLAGGED", color: results.length === 0 ? "emerald" : "zinc" },
                          ].map(stat => (
                            <div key={stat.label} className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-8 text-center shadow-inner-soft group/stat transition-all hover:border-[#c5a059]/30">
                               <p className={cn(
                                 "text-3xl font-black mb-2",
                                 stat.color === "red" && errors > 0 ? "text-red-500" :
                                 stat.color === "amber" && warnings > 0 ? "text-amber-500" :
                                 stat.color === "emerald" ? "text-emerald-500" : "text-zinc-500"
                               )}>{stat.count}</p>
                               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">{stat.label}</p>
                            </div>
                          ))}
                       </div>

                       {results.length === 0 ? (
                          <div className="bg-emerald-500/5 border border-emerald-500/10 p-12 rounded-[3rem] text-center space-y-6 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
                             <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto group-hover:scale-110 transition-transform duration-700" />
                             <div className="relative z-10 space-y-2">
                                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-600">MANIFEST SECURE</h4>
                                <p className="text-xs text-muted-foreground/60 font-medium italic">No structural vulnerabilities or known secrets detected in the current manifest.</p>
                             </div>
                          </div>
                       ) : (
                          <div className="grid grid-cols-1 gap-4">
                             {results.map((res, i) => (
                               <div
                                 key={i}
                                 className={cn(
                                   "p-6 rounded-[2rem] border-2 flex gap-6 items-start transition-all hover:scale-[1.01]",
                                   res.type === "error" ? "bg-red-500/5 border-red-500/10" : "bg-amber-500/5 border-amber-500/10"
                                 )}
                               >
                                 <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg",
                                    res.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                 )}>
                                   {res.type === "error" ? <AlertCircle className="w-6 h-6" /> : <Key className="w-6 h-6" />}
                                 </div>
                                 <div className="flex-1 space-y-3">
                                   <div className="flex items-center gap-4">
                                      <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                        res.type === "error" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                                      )}>LINE {res.line}</span>
                                      <p className="text-sm font-black uppercase tracking-tight text-foreground">{res.message}</p>
                                   </div>
                                   <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 group/code shadow-inner-soft">
                                      <code className="text-xs font-mono text-zinc-500 group-hover:text-[#c5a059] transition-colors">{res.content}</code>
                                   </div>
                                 </div>
                               </div>
                             ))}
                          </div>
                       )}
                    </div>
                  )}
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
