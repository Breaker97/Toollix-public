"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle, 
  Globe,
  Loader2,
  Share2,
  Zap,
  Target,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Inline SVGs for social platforms
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.31-2.34-.25-3.41.33-.71.38-1.27 1.03-1.57 1.77-.3.72-.41 1.52-.3 2.3.14 1.18.96 2.22 1.97 2.8 1.07.6 2.38.65 3.49.14.95-.44 1.72-1.28 2.05-2.25.13-.39.21-.8.22-1.21.03-3.08-.02-6.17.02-9.25-.01-1.5-.01-4-.01-4z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TwitterXIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const PLATFORMS = [
  { id: "instagram", name: "Instagram", url: "https://instagram.com/", icon: InstagramIcon, color: "text-pink-600", bg: "bg-pink-500/10" },
  { id: "x", name: "X (Twitter)", url: "https://x.com/", icon: TwitterXIcon, color: "text-zinc-900 dark:text-zinc-100", bg: "bg-zinc-500/10" },
  { id: "tiktok", name: "TikTok", url: "https://tiktok.com/@", icon: TikTokIcon, color: "text-zinc-900 dark:text-zinc-100", bg: "bg-zinc-500/10" },
  { id: "youtube", name: "YouTube", url: "https://youtube.com/@", icon: YoutubeIcon, color: "text-red-600", bg: "bg-red-500/10" },
  { id: "threads", name: "Threads", url: "https://threads.net/@", icon: Share2, color: "text-zinc-900 dark:text-zinc-100", bg: "bg-zinc-500/10" },
];

export default function SocialCheckerClient() {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username or brand name.");
      return;
    }
    setIsChecking(true);
    setHasSearched(true);
    // Simulate a brief check
    setTimeout(() => {
        setIsChecking(false);
        toast.success(`Social matrix generated for "${username}"`);
    }, 1200);
  };

  const handleClear = () => {
    setUsername("");
    setHasSearched(false);
    toast.info("Matrix reset");
  };

  return (
    <ToolLayout 
      title="Identity Availability Monitor" 
      description="Professional social reconnaissance engine. Verify brand name availability across all major platforms with real-time vector links."
      fullWidth={true}
    >
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[420px_1fr] lg:gap-16 items-start w-full overflow-x-hidden">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:sticky lg:top-28 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            
            {/* Phase 01: Targeting */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 space-y-8 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Inbound Scan</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Identity Vector</p>
               </div>

               <div className="space-y-6 relative z-10">
                  <form onSubmit={handleSearch} className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 italic">Username / Handle</label>
                      <div className="relative group">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#c5a059]/30 group-hover:text-[#c5a059] transition-colors" />
                          <Input 
                            placeholder="apple, brandname, @handle..." 
                            className="pl-16 h-18 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border-none font-bold placeholder:font-medium focus-visible:ring-4 focus-visible:ring-[#c5a059]/10 shadow-inner-soft text-[#c5a059]"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isChecking || !username.trim()}
                      className="w-full h-20 bg-gradient-to-r from-[#c5a059] to-[#b08d4b] text-white rounded-[2rem] font-black shadow-[0_20px_50px_-10px_rgba(197,160,89,0.4)] transition-all active:scale-95 border-none group overflow-hidden"
                    >
                       {isChecking ? (
                          <Loader2 className="w-8 h-8 animate-spin opacity-40" />
                       ) : (
                          <div className="flex items-center justify-center gap-4 relative z-10">
                             <Target className="w-8 h-8 opacity-40 group-hover:scale-110 transition-transform" />
                             <span className="text-xl uppercase tracking-[0.2em]">INITIALIZE SCAN</span>
                          </div>
                       )}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                  </form>
                  
                  <Button 
                    variant="ghost" 
                    onClick={handleClear} 
                    className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-2 border-dashed border-[#c5a059]/10 text-muted-foreground hover:text-[#c5a059] hover:bg-[#c5a059]/5 transition-all"
                  >
                     Reset Matrix
                  </Button>
               </div>
            </div>

            {/* Support Info: Ecosystem */}
            <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-10 shadow-xl rounded-[2.5rem] sm:rounded-[3.5rem] space-y-10 relative overflow-hidden group border border-[#c5a059]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                     <ShieldCheck className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Security Matrix</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Monitoring</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {[
                    { icon: Globe, label: "Global Reach", detail: "Active" },
                    { icon: Zap, label: "Zero Latency", detail: "Optimized" },
                    { icon: Share2, label: "Multi-Platform", detail: "Ready" }
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
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Extraction Hub</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059] opacity-80">Availability Feed</p>
                  </div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" /> Live Analysis
                  </div>
               </div>

               {hasSearched ? (
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      {PLATFORMS.map((platform, idx) => (
                          <div 
                              key={platform.id}
                              className="group bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur-3xl border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-8 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-700 animate-in fade-in slide-in-from-bottom-4"
                              style={{ animationDelay: `${idx * 100}ms` }}
                          >
                              <div className="flex items-center justify-between mb-8">
                                  <div className={cn("p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110 duration-700", platform.bg)}>
                                      <platform.icon className={cn("w-6 h-6", platform.color)} />
                                  </div>
                                  <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-10 px-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-[#c5a059]/10 hover:text-[#c5a059] border border-transparent hover:border-[#c5a059]/20 transition-all"
                                      onClick={() => window.open(`${platform.url}${username.replace(/^@/, '')}`, '_blank')}
                                  >
                                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                      VISIT
                                  </Button>
                              </div>
                              <div className="space-y-1.5 mb-8">
                                <h4 className="font-black text-xl tracking-tight leading-none">{platform.name}</h4>
                                <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.1em] truncate italic">
                                    {platform.url.replace('https://', '')}{username.replace(/^@/, '')}
                                </p>
                              </div>
                              
                              <div className="pt-6 border-t border-zinc-200/50 dark:border-zinc-800 flex flex-col gap-5">
                                  <div className="flex items-center gap-2">
                                      <HelpCircle className="w-3.5 h-3.5 text-[#c5a059]/30" />
                                      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/40 leading-none">STATUS: UNDETERMINED</span>
                                  </div>
                                  <Button 
                                      variant="outline" 
                                      className="w-full h-12 text-[9px] font-black rounded-xl uppercase tracking-[0.2em] border-zinc-200 dark:border-zinc-800 hover:border-[#c5a059]/40 hover:bg-[#c5a059]/5 text-muted-foreground group/verify"
                                      onClick={() => window.open(`${platform.url}${username.replace(/^@/, '')}`, '_blank')}
                                  >
                                      <CheckCircle2 className="w-4 h-4 mr-2 opacity-20 group-hover/verify:opacity-100 transition-opacity" />
                                      MANUAL VERIFY
                                  </Button>
                              </div>
                          </div>
                      ))}
                  </div>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-10 animate-in fade-in duration-1000">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
                        <div className="p-10 rounded-[3rem] bg-zinc-50 dark:bg-zinc-800/40 border-2 border-dashed border-[#c5a059]/10 flex flex-col items-center text-center space-y-6 group hover:border-[#c5a059]/20 transition-all duration-700">
                           <div className="w-16 h-16 bg-white dark:bg-zinc-900 shadow-xl rounded-2xl flex items-center justify-center border border-[#c5a059]/10 group-hover:scale-110 transition-transform duration-700">
                              <Globe className="w-8 h-8 text-[#c5a059] opacity-20 group-hover:opacity-100 transition-opacity" />
                           </div>
                           <div className="space-y-1.5">
                             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059] italic leading-none">Brand Consistency</h5>
                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-relaxed">Check availability across all major nodes to maintain brand integrity.</p>
                           </div>
                        </div>
                        <div className="p-10 rounded-[3rem] bg-zinc-50 dark:bg-zinc-800/40 border-2 border-dashed border-[#c5a059]/10 flex flex-col items-center text-center space-y-6 group hover:border-[#c5a059]/20 transition-all duration-700">
                           <div className="w-16 h-16 bg-white dark:bg-zinc-900 shadow-xl rounded-2xl flex items-center justify-center border border-[#c5a059]/10 group-hover:scale-110 transition-transform duration-700">
                              <Sparkles className="w-8 h-8 text-[#c5a059] opacity-20 group-hover:opacity-100 transition-opacity" />
                           </div>
                           <div className="space-y-1.5">
                             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059] italic leading-none">Instant Insights</h5>
                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-relaxed">Get direct protocol links to verify and secure your handle in seconds.</p>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#c5a059] animate-pulse">Awaiting Identity Seed</p>
                     </div>
                  </div>
               )}

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
