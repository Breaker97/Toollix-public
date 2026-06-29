"use client";

import { useState } from "react";
import { Mail, Send, Loader2, MessageSquare, Info, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(result.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden flex items-center justify-center p-6 selection:bg-brand-red/20 selection:text-brand-red">
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        
        {/* Left Column: Branding / Info */}
        <div className="flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 text-brand-red text-[10px] font-black uppercase tracking-[0.2em] shadow-soft-xl">
                 <MessageSquare className="w-3.5 h-3.5" /> Support Channel
              </div>
               <h1 className="text-5xl font-black tracking-tighter leading-none">
                Got a Question?<br />
                <span className="text-brand-red">Reach out.</span>
              </h1>
              <p className="text-muted-foreground font-medium leading-relaxed max-w-md">
                Have feedback, found a bug, or want to suggest a new tool? We're all ears. 
                Our team monitors this inbox daily and will get back to you within 24 hours.
              </p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-[1.5rem] bg-white dark:bg-zinc-900 shadow-soft-xl space-y-2">
                 <Zap className="w-5 h-5 text-orange-500" />
                 <h4 className="font-black text-sm uppercase">Fast Response</h4>
                 <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">Average reply time under 12 hours for all users.</p>
              </div>
              <div className="p-5 rounded-[1.5rem] bg-white dark:bg-zinc-900 shadow-soft-xl space-y-2">
                 <ShieldCheck className="w-5 h-5 text-emerald-500" />
                 <h4 className="font-black text-sm uppercase">Privacy First</h4>
                 <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">Your data is never shared. We only use your email to reply.</p>
              </div>
           </div>

           <div className="pt-8">
              <div className="flex items-center gap-3 text-muted-foreground/60 transition-colors hover:text-primary">
                 <Mail className="w-4 h-4" />
                 <span className="text-xs font-bold font-mono">support@toollix.io</span>
              </div>
           </div>
        </div>

        {/* Right Column: The Form */}
        <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
           {success ? (
             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 rounded-[2.5rem] text-center space-y-6 shadow-2xl">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto">
                   <ShieldCheck className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-black tracking-tighter uppercase italic">Message Sent!</h2>
                   <p className="text-muted-foreground font-medium">Your request is in our system. Watch your inbox shortly.</p>
                </div>
                <Button onClick={() => setSuccess(false)} variant="outline" className="h-12 rounded-xl px-8 font-black uppercase text-[10px] tracking-widest border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950">
                   Send Another
                </Button>
             </div>
           ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] space-y-6 shadow-soft-xl">
                <div className="space-y-4">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Name</Label>
                          <Input name="name" required placeholder="John Doe" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-brand-red/20 shadow-inner-soft placeholder:opacity-50" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                         <Input name="email" type="email" required placeholder="john@example.com" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-primary/20 shadow-inner" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject</Label>
                      <Input name="subject" required placeholder="Feature Request / Help" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-primary/20 shadow-inner" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message Detail</Label>
                       <textarea 
                        name="message" 
                        required 
                        rows={5}
                        placeholder="Tell us more about what's on your mind..."
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 ring-brand-red/20 outline-none text-sm transition-all resize-none shadow-inner-soft placeholder:opacity-50"
                      />
                   </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-600 text-xs font-bold animate-in fade-in zoom-in duration-300 shadow-sm">
                    <div className="flex items-center gap-2">
                       <Info className="w-4 h-4" /> {error}
                    </div>
                  </div>
                )}

                    <Button 
                       type="submit" 
                       disabled={loading}
                       className="w-full h-14 bg-brand-red text-white font-black uppercase tracking-[0.15em] text-xs rounded-2xl shadow-xl shadow-brand-red/20 group hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                   {loading ? (
                     <Loader2 className="w-5 h-5 animate-spin" />
                   ) : (
                     <div className="flex items-center gap-2">
                        Deploy Message <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                     </div>
                   )}
                </Button>

                <p className="text-[9px] text-muted-foreground/60 text-center font-bold uppercase tracking-widest">
                   Max 3 submissions per IP per 24 hours.
                </p>
              </form>
           )}
        </div>

      </div>
    </div>
  );
}
