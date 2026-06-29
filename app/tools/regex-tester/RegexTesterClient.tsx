"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Smartphone, 
  ShieldCheck, 
  Target, 
  Terminal, 
  XCircle
} from "lucide-react";

export default function RegexTesterClient() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("The quick brown fox jumps over the lazy dog 123 times.");

  const result = useMemo(() => {
    if (!pattern) return null;
    try {
      const regex = new RegExp(pattern, flags);
      const matches = Array.from(testString.matchAll(regex));
      return { matches, error: null };
    } catch (err: any) {
      return { matches: null, error: err.message };
    }
  }, [pattern, flags, testString]);

  const getHighlightedText = () => {
    if (!pattern || result?.error || !result?.matches || result.matches.length === 0) {
      return <span className="text-foreground">{testString}</span>;
    }

    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    if (!flags.includes("g")) {
      const match = testString.match(new RegExp(pattern, flags));
      if (match && match.index !== undefined) {
        elements.push(<span key="pre">{testString.substring(0, match.index)}</span>);
        elements.push(<mark key={0} className="bg-[#c5a059]/20 text-[#c5a059] font-bold px-0.5 rounded-sm border border-[#c5a059]/30 shadow-[0_0_15px_rgba(197,160,89,0.3)] transition-all">{match[0]}</mark>);
        elements.push(<span key="post">{testString.substring(match.index + match[0].length)}</span>);
        return elements;
      }
    }

    result.matches.forEach((match, i) => {
      const matchIndex = match.index!;
      const matchLength = match[0].length;
      elements.push(<span key={`pre-${i}`}>{testString.substring(lastIndex, matchIndex)}</span>);
      elements.push(
        <mark key={i} className="bg-[#c5a059]/20 text-[#c5a059] font-black px-1 rounded-sm border border-[#c5a059]/30 shadow-[0_0_15px_rgba(197,160,89,0.2)] transition-all">
          {match[0]}
        </mark>
      );
      lastIndex = matchIndex + matchLength;
    });

    elements.push(<span key="last">{testString.substring(lastIndex)}</span>);
    return elements;
  };

  const commonFlags = ["g", "i", "m", "s"];

  return (
    <ToolLayout 
      title="Regex Vision Lab" 
      description="Professional pattern analysis engine. Write, test, and debug complex regular expressions with real-time biometric highlighting."
      fullWidth={true}
    >
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[420px_1fr] lg:gap-16 items-start w-full overflow-x-hidden">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:sticky lg:top-28 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            
            {/* Phase 01: Strategy */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 space-y-10 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Studio Driver</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Pattern Logic</p>
               </div>

               <div className="space-y-8 relative z-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 italic">Regular Expression Manifest</label>
                    <div className="flex items-stretch rounded-[1.5rem] overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 shadow-inner-soft transition-all focus-within:border-[#c5a059]/50">
                      <span className="flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50 px-5 text-[#c5a059]/40 font-mono text-xl font-black border-r border-zinc-100 dark:border-zinc-800">/</span>
                      <input
                        className="flex-1 px-5 py-5 bg-transparent outline-none font-mono text-base font-bold text-[#c5a059] placeholder:text-[#c5a059]/20"
                        placeholder="[A-Z0-9]+"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                      />
                      <span className="flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50 px-3 text-[#c5a059]/40 border-l border-zinc-100 dark:border-zinc-800 font-mono text-xl font-black">/</span>
                      <input
                        className="w-20 px-3 py-5 bg-zinc-100/50 dark:bg-zinc-900/50 outline-none text-center font-mono text-sm font-black text-[#c5a059] placeholder:text-[#c5a059]/20"
                        placeholder="gims"
                        value={flags}
                        onChange={(e) => setFlags(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 italic">Global Flags Spectrum</label>
                     <div className="flex gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/80 rounded-[1.5rem] shadow-inner-soft border border-zinc-100 dark:border-zinc-800">
                        {commonFlags.map(f => (
                          <button
                            key={f}
                            onClick={() => setFlags(prev => prev.includes(f) ? prev.replace(f, "") : prev + f)}
                            className={cn(
                              "flex-1 h-12 rounded-xl font-mono text-[10px] font-black transition-all",
                              flags.includes(f) ? "bg-[#c5a059] text-white shadow-xl scale-[1.05]" : "text-muted-foreground/40 hover:text-[#c5a059]"
                            )}
                          >{f.toUpperCase()}</button>
                        ))}
                     </div>
                  </div>

                  {result?.error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-[1.5rem] flex items-start gap-4 animate-in slide-in-from-top-4">
                       <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-red-500 italic leading-none">Logic Error</p>
                          <p className="text-[11px] font-bold text-red-950 dark:text-red-200 leading-relaxed">{result.error}</p>
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
                     <Terminal className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Extraction Hub</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Rendering</p>
                  </div>
               </div>

               <div className="space-y-4 relative z-10">
                  {[
                    { icon: Target, label: "Precision Search", detail: "Active" },
                    { icon: Smartphone, label: "Live Extraction", detail: "Enabled" },
                    { icon: ShieldCheck, label: "Syntax Guard", detail: "Secure" }
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
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" /> 
                     {result?.matches ? `${result.matches.length} VECTORS IDENTIFIED` : "AWAITING MANIFEST"}
                  </div>
               </div>

               <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left: Input Studio */}
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-4 italic">Inbound Test Spectrum</label>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] p-1 border border-zinc-100 dark:border-zinc-800 shadow-inner-soft relative overflow-hidden group/input">
                        <div className="absolute top-4 left-6 flex gap-1.5 z-20">
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>
                        <div className="absolute top-4 right-8 z-20">
                           <span className="text-[9px] font-mono font-black text-zinc-400/40 uppercase tracking-widest">data.txt</span>
                        </div>
                        <textarea
                          className="w-full h-[300px] lg:h-[400px] p-12 pt-16 bg-transparent resize-none focus:outline-none font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059] placeholder:text-zinc-300"
                          placeholder="Initialize test manifest..."
                          value={testString}
                          onChange={(e) => setTestString(e.target.value)}
                        />
                    </div>

                    {/* Match Detail Grid */}
                    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] ml-4 italic">Vector Detail Matrix</label>
                       <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-[2.5rem] p-6 border border-zinc-100 dark:border-zinc-800 min-h-[160px] shadow-inner-soft">
                          {result && !result.error && result.matches && result.matches.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                              {result.matches.map((m, i) => (
                                <div key={i} className="group/vector bg-white dark:bg-zinc-900 border border-[#c5a059]/20 text-[#c5a059] p-4 rounded-2xl flex items-center gap-4 hover:shadow-2xl transition-all hover:scale-105 duration-500 shadow-sm">
                                   <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center font-black text-[10px] uppercase tracking-widest opacity-40 group-hover/vector:opacity-100">
                                      {i+1}
                                   </div>
                                   <code className="text-xs font-black font-mono tracking-tight">{m[0]}</code>
                                   <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">@{m.index}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-24 flex items-center justify-center">
                               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">No vectors identified</p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Right: Output Monitor */}
                  <div className="space-y-6 h-full flex flex-col">
                    <div className="flex justify-between items-center px-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic">Visual Highlighting Manifest</label>
                    </div>
                    <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[2.5rem] p-12 border-4 border-zinc-50 dark:border-zinc-800/50 shadow-2xl overflow-y-auto break-words whitespace-pre-wrap font-mono text-sm leading-relaxed relative group/output">
                       <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
                       <div className="relative z-10 text-zinc-600 dark:text-zinc-400">
                          {getHighlightedText()}
                       </div>
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
