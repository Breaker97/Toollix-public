"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (e) {
      setStatus("error");
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 relative overflow-hidden group shadow-sm">
       {/* Background Glow */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50" />
       
       <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 text-center lg:text-left max-w-lg">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
                <Mail className="w-3 h-3" /> Exclusive Updates
             </div>
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white">
                Get new tools <span className="text-primary">first</span>.
             </h2>
             <p className="text-zinc-300 font-medium text-sm md:text-base leading-relaxed">
                Join 5,000+ users! Get notified when we release new free tools and performance updates. No spam, ever.
             </p>
          </div>

          <div className="w-full max-w-md">
             {status === "success" ? (
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center space-y-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-lg text-emerald-600">You're on the list!</h3>
                  <p className="text-xs text-muted-foreground">Keep an eye on your inbox for our next update.</p>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="flex flex-col sm:sm:row gap-3">
                  <div className="relative flex-1">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <input 
                       type="email" 
                       placeholder="Enter your email address" 
                       required
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full h-14 pl-12 pr-4 bg-background border border-border/60 rounded-2xl focus:border-brand-red focus:ring-4 focus:ring-brand-red/5 outline-none transition-all text-sm font-medium"
                     />
                  </div>
                  <Button type="submit" disabled={status === "loading"} className="h-14 px-8 rounded-2xl bg-brand-red text-white font-bold shadow-xl shadow-brand-red/20 flex items-center gap-2 group-active:scale-95 transition-transform">
                     {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
                  </Button>
               </form>
             )}
             {status === "error" && <p className="text-[10px] text-red-500 mt-3 font-bold uppercase tracking-widest text-center lg:text-left">Failed to subscribe. Please try again later.</p>}
          </div>
       </div>
    </div>
  );
}
