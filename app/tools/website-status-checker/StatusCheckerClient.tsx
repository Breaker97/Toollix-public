"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Activity,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatusCheckerClient() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "up" | "down" | "blocked">("idle");
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);
  const [details, setDetails] = useState<any>(null);

  const checkStatus = async () => {
    if (!url) return;
    
    setStatus("checking");
    setStatusCode(null);
    setResponseTime(null);
    setScreenshotUrl(null);
    setImageLoading(false);
    setScreenshotError(false);
    setDetails(null);

    try {
      const response = await fetch("/api/tools/check-uptime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.status === "up") {
        setStatus("up");
        setResponseTime(data.responseTime);
        setStatusCode(data.statusCode);
        setScreenshotUrl(data.screenshotUrl);
        setDetails(data.details);
        setImageLoading(true);
        
        // Safety timeout for image loading (30s max for Google PageSpeed / Fallbacks)
        setTimeout(() => {
            setImageLoading((current) => {
                if (current) {
                    setScreenshotError(true);
                    return false;
                }
                return false;
            });
        }, 30000);
      } else {
        setStatus("down");
      }
      setLastChecked(data.lastChecked || new Date().toLocaleTimeString());
    } catch (e) {
      setStatus("down");
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  return (
    <ToolLayout 
      title="Uptime Sentinel" 
      description="Professional website connectivity engine. Monitor site availability, response latency, and global reachability in real-time."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 space-y-8 sm:space-y-12 overflow-hidden relative min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center bg-zinc-50/30 dark:bg-zinc-900/30 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl">
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm border border-[#c5a059]/20">
                    <Globe className="w-5 h-5" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Connectivity Hub</h3>
              </div>

              <div className="w-full max-w-2xl space-y-8 text-center">
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Enter website URL (e.g. google.com)"
                      className="w-full h-16 sm:h-24 bg-white dark:bg-zinc-950 rounded-2xl sm:rounded-[2.5rem] px-6 sm:px-10 pr-24 sm:pr-32 border-2 border-zinc-100 dark:border-zinc-800 text-lg sm:text-xl font-medium focus:outline-none focus:border-[#c5a059] shadow-xl transition-all"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && checkStatus()}
                    />
                    <Button 
                       onClick={checkStatus}
                       disabled={status === "checking" || !url}
                       className="absolute right-3 top-3 bottom-3 h-auto px-6 sm:px-10 rounded-xl sm:rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] transition-all shadow-lg flex items-center gap-2 group-hover:scale-[1.02] active:scale-95 border-none"
                    >
                       {status === "checking" ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                       <span className="hidden sm:inline font-bold uppercase tracking-widest text-[10px]">Inspect</span>
                    </Button>
                  </div>

                 {status !== "idle" && (
                   <div className="space-y-8 w-full">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500 w-full">
                        <div className={cn(
                          "p-8 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all shadow-xl",
                          status === "up" ? "bg-emerald-50/50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20" : 
                          status === "down" ? "bg-red-50/50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-red-500/20" :
                          "bg-zinc-100/50 border-zinc-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700"
                        )}>
                           {status === "up" ? <CheckCircle2 className="w-10 h-10" /> : 
                            status === "down" ? <XCircle className="w-10 h-10" /> :
                            <Clock className="w-10 h-10 animate-pulse" />}
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic mb-1">Service State</p>
                              <div className="flex flex-col items-center">
                                  <p className="text-2xl font-black uppercase tracking-tight">
                                     {status === "up" ? "Online" : status === "down" ? "Offline" : "Checking..."}
                                  </p>
                                  {statusCode && (
                                      <span className="text-[10px] font-mono font-bold bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full mt-1 border border-current opacity-60">
                                          HTTP {statusCode}
                                      </span>
                                  )}
                              </div>
                           </div>
                        </div>

                        <div className="p-8 bg-white dark:bg-zinc-950 rounded-[2rem] border-2 border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-4 shadow-xl">
                           <Zap className="w-10 h-10 text-[#c5a059]" />
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Latency</p>
                              <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                 {responseTime ? `${responseTime}ms` : "---"}
                              </p>
                           </div>
                        </div>

                        <div className="p-8 bg-white dark:bg-zinc-950 rounded-[2rem] border-2 border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-4 shadow-xl">
                           <Clock className="w-10 h-10 text-[#c5a059]" />
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Last Check</p>
                              <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                 {lastChecked || "---"}
                              </p>
                           </div>
                        </div>
                     </div>

                     {details && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-700">
                           <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Server Type</p>
                              <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate" title={details.server}>{details.server}</p>
                           </div>
                           <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Security</p>
                              <p className={cn("text-[10px] font-bold", details.isSecure ? "text-emerald-500" : "text-red-500")}>{details.protocol}</p>
                           </div>
                           <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Content Type</p>
                              <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate" title={details.contentType}>{details.contentType.split(';')[0]}</p>
                           </div>
                           <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Response Size</p>
                              <p className="text-[10px] font-bold text-slate-900 dark:text-white">{details.contentLength !== "N/A" ? `${(parseInt(details.contentLength) / 1024).toFixed(2)} KB` : "Varies"}</p>
                           </div>
                        </div>
                     )}

                     {screenshotUrl && status === "up" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                           <div className="flex items-center justify-between px-4">
                              <div className="flex items-center gap-2">
                                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Visual Verification</h4>
                                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                              </div>
                              <a 
                                href={url.startsWith('http') ? url : `https://${url}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest hover:underline flex items-center gap-1 transition-all"
                              >
                                 Open Website <ExternalLink className="w-3 h-3" />
                              </a>
                           </div>
                           <div className="relative group p-4 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden min-h-[200px] flex items-center justify-center">
                              {imageLoading && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 z-20 gap-4">
                                      <div className="relative">
                                          <RefreshCw className="w-10 h-10 text-[#c5a059] animate-spin" />
                                          <Globe className="w-4 h-4 text-[#c5a059] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                      </div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic animate-pulse text-center px-8">
                                          Syncing with Global Content Delivery Network...
                                      </p>
                                  </div>
                              )}
                              
                              {screenshotError && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 z-20 gap-3 p-8 text-center">
                                      <AlertTriangle className="w-10 h-10 text-amber-500" />
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Visual Capture Restricted</p>
                                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider leading-relaxed">
                                          Target domain has restricted automated snapshots or the capture timed out. 
                                          Use the "Open Website" link above for manual verification.
                                      </p>
                                  </div>
                              )}

                              <div className="aspect-video w-full relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-inner group-hover:shadow-2xl transition-all duration-500">
                                 {screenshotUrl && !screenshotError && (
                                     <img 
                                        src={screenshotUrl} 
                                        alt="Website Screenshot" 
                                        className={cn(
                                            "w-full h-full object-cover object-top hover:scale-105 transition-all duration-[2000ms]",
                                            imageLoading ? "opacity-0 scale-95 blur-md" : "opacity-100 scale-100 blur-0"
                                        )}
                                        onLoad={() => setImageLoading(false)}
                                        onError={() => {
                                            setImageLoading(false);
                                            setScreenshotError(true);
                                        }}
                                     />
                                 )}
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              </div>
                           </div>
                        </div>
                     )}
                   </div>
                 )}
              </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 flex flex-col sm:flex-row gap-6">
               <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[#c5a059]" />
               </div>
               <div className="space-y-2">
                  <h4 className="text-sm font-black text-[#c5a059] uppercase tracking-widest">Network Blueprint</h4>
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                     Our high-performance engine decodes the target domain's infrastructure, extracting server headers, security protocols, and visual state for a comprehensive reachability audit.
                  </p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Monitor Logic</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Inspection Protocol</p>
               </div>

               <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 space-y-3">
                     <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-[#c5a059]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">TCP Handshake</span>
                     </div>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-loose italic">
                        Verifying endpoint availability via high-performance server-side fetch with timeout safety.
                     </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 space-y-3">
                     <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-[#c5a059]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Global Origin</span>
                     </div>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-loose italic">
                        Request originating from our cloud edge to measure true public availability.
                     </p>
                  </div>
               </div>
            </div>

            <div className="suite-card p-8 rounded-[2.5rem] bg-zinc-950 text-white space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="flex items-center gap-3 relative z-10">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Uptime Intelligence</span>
               </div>
               <p className="text-[10px] font-medium text-zinc-400 leading-relaxed uppercase tracking-wider italic relative z-10">
                  Critical for DevOps teams and site owners to verify public visibility and network reachability across the global web.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

