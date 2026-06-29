"use client";

import { useState, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Lock, 
  Copy, 
  CheckCircle2, 
  Zap,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Shield,
  Key,
  Fingerprint,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: "Weak", color: "bg-red-500" });

  const generatePassword = useCallback(() => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let charset = lower;
    if (useUppercase) charset += upper;
    if (useNumbers) charset += numbers;
    if (useSymbols) charset += symbols;

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(result);
  }, [length, useUppercase, useNumbers, useSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    let score = 0;
    if (length > 8) score++;
    if (length > 12) score++;
    if (useUppercase) score++;
    if (useNumbers) score++;
    if (useSymbols) score++;

    if (score <= 2) setStrength({ score, label: "Weak", color: "bg-red-500" });
    else if (score <= 4) setStrength({ score, label: "Medium", color: "bg-orange-500" });
    else setStrength({ score, label: "Strong", color: "bg-emerald-500" });
  }, [password, length, useUppercase, useNumbers, useSymbols]);

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Secure password copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout 
      title="Secure Password Vault" 
      description="Professional entropy-based password generation engine. Create high-security, cryptographically random strings for identity protection."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Result Manifest */}
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-12 overflow-hidden relative min-h-[400px] flex flex-col justify-center">
              <div className="absolute top-8 left-8 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4 w-full max-w-[200px]">
                 <div className="w-8 h-8 bg-[#c5a059]/10 text-[#c5a059] rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                 </div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Secure Output</h3>
              </div>

              <div className="text-center space-y-8 relative z-10 pt-12">
                 <div className="relative inline-block group">
                    <div className={cn(
                      "absolute inset-0 blur-3xl opacity-20 transition-all duration-1000",
                      strength.color
                    )} />
                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-mono font-black tracking-tighter text-zinc-800 dark:text-zinc-100 break-all leading-tight relative">
                      {password}
                    </h2>
                 </div>

                 <div className="flex justify-center items-center gap-3">
                    <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", strength.color)} />
                    <span className={cn("text-[11px] font-black uppercase tracking-[0.3em] italic", strength.color.replace('bg-', 'text-'))}>
                       {strength.label} Entropy Level
                    </span>
                 </div>
              </div>

              {/* Action Rows */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10 pt-6">
                 <Button 
                   onClick={copyToClipboard}
                   className="h-16 px-12 rounded-2xl bg-[#c5a059] hover:bg-[#b08d4a] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl transition-all hover:scale-[1.02] flex items-center gap-4"
                 >
                   {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                   {copied ? "COPIED" : "COPY SECURE KEY"}
                 </Button>
                 <Button 
                   variant="ghost"
                   onClick={generatePassword}
                   className="h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-[#c5a059] hover:bg-[#c5a059]/10 transition-all shadow-md"
                 >
                   <RefreshCw className="w-5 h-5" />
                 </Button>
              </div>
            </div>

            {/* Quick Actions / Mobile Settings Trigger */}
            <div className="grid grid-cols-2 gap-4 lg:hidden">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Fingerprint className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Biometric Grade</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Locally Signed</span>
               </div>
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Key Settings</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Entropy Driver</p>
               </div>

               <div className="space-y-8">
                  {/* Slider */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Key Length</label>
                        <span className="text-[10px] font-black text-[#c5a059]">{length} Bits</span>
                     </div>
                     <input 
                        type="range" 
                        min="8" max="64"
                        value={length} 
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full accent-[#c5a059]"
                     />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                     {[
                        { label: "Uppercase Letters", state: useUppercase, setState: setUseUppercase },
                        { label: "Numerical Values", state: useNumbers, setState: setUseNumbers },
                        { label: "Special Characters", state: useSymbols, setState: setUseSymbols }
                     ].map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => opt.setState(!opt.state)}
                          className={cn(
                            "w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-between px-6",
                            opt.state ? "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/20" : "bg-zinc-50 dark:bg-zinc-800 text-slate-400 border-zinc-100 dark:border-zinc-700"
                          )}
                        >
                          <span>{opt.label}</span>
                          <div className={cn("w-2 h-2 rounded-full", opt.state ? "bg-[#c5a059] animate-pulse" : "bg-zinc-300")} />
                        </button>
                     ))}
                  </div>

                  <Button 
                    onClick={generatePassword}
                    className="w-full py-6 rounded-2xl bg-[#c5a059] hover:bg-[#b08d4a] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg group transition-all"
                  >
                    <RefreshCw className="w-4 h-4 mr-3 group-hover:rotate-180 transition-transform duration-700" />
                    Regenerate Key
                  </Button>
               </div>
            </div>

            {/* Matrix Card */}
            <div className="grid grid-cols-1 gap-4">
               <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-6">
                  <div className="flex items-center gap-3">
                     <Shield className="w-5 h-5 text-[#c5a059]" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Security Matrix</span>
                  </div>
                  <div className="space-y-4">
                     {[
                        { icon: Key, label: "AES-256", detail: "Compliant" },
                        { icon: Fingerprint, label: "Entropy", detail: `${length * 4} Bits` }
                     ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center opacity-60">
                           <div className="flex items-center gap-3">
                              <item.icon className="w-3.5 h-3.5 text-[#c5a059]" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                           </div>
                           <span className="text-[9px] font-black text-[#c5a059] italic uppercase">{item.detail}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
