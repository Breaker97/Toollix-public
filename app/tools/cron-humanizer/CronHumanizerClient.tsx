"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Terminal, Copy, Check, Info, Calendar, Clock, Zap, Smartphone, Layout, Share2, ShieldCheck, Target, Loader2, ArrowRight, RefreshCw, X, Plus } from "lucide-react";
import cronstrue from "cronstrue";
import cronParser from "cron-parser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CronHumanizerClient() {
  const [expression, setExpression] = useState("* * * * *");
  const [humanText, setHumanText] = useState("");
  const [nextDates, setNextDates] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [copied, setCopied] = useState(false);

  // Visual Builder State
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  useEffect(() => {
    const newExpr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setExpression(newExpr);
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  useEffect(() => {
    try {
      const text = cronstrue.toString(expression);
      setHumanText(text);
      
      const interval = cronParser.parse(expression);
      const dates = [];
      for (let i = 0; i < 5; i++) {
        dates.push(interval.next().toString());
      }
      setNextDates(dates);
      setIsValid(true);
    } catch (err) {
      setHumanText("Invalid cron expression");
      setNextDates([]);
      setIsValid(false);
    }
  }, [expression]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    toast.success("Cron expression copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Cron Job Humanizer"
      description="Convert complex cron expressions into simple, easy-to-read English schedules."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Result & Forecasting Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative min-h-[500px]">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center">
                       <Terminal className="w-5 h-5" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Cron Monitor</h3>
                 </div>
                 <div className="bg-[#c5a059]/10 text-[#c5a059] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", isValid ? "bg-[#c5a059] animate-pulse" : "bg-red-500")} />
                    {isValid ? "Active Signal" : "Syntax Error"}
                 </div>
              </div>

              {/* Translation Display */}
              <div className="space-y-12 py-4">
                 <div className={cn(
                    "p-10 rounded-[3rem] border-4 transition-all duration-700 relative overflow-hidden group",
                    isValid ? "bg-zinc-50 dark:bg-zinc-800/30 border-[#c5a059]/10" : "bg-red-500/5 border-red-500/10"
                 )}>
                    <div className="relative z-10 space-y-6">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Human Translation</span>
                       <h2 className={cn(
                          "text-3xl sm:text-4xl font-black tracking-tight leading-tight",
                          isValid ? "text-slate-900 dark:text-white" : "text-red-500"
                       )}>
                          {humanText}
                       </h2>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                       <Clock className="w-48 h-48" />
                    </div>
                 </div>

                 {/* Upcoming Dates Grid */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 px-4">
                       <Calendar className="w-4 h-4 text-[#c5a059]" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upcoming Execution Windows</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {isValid && nextDates.length > 0 ? (
                          nextDates.map((date, idx) => (
                             <div key={idx} className="p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group hover:border-[#c5a059]/30 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 text-[#c5a059] flex items-center justify-center font-black text-xs shadow-sm border border-zinc-100 dark:border-zinc-800">
                                      {idx + 1}
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Timestamp</p>
                                      <p className="text-[11px] font-black font-mono">
                                         {new Date(date).toLocaleString('en-US', { 
                                            month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false 
                                         })}
                                      </p>
                                   </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#c5a059] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                             </div>
                          ))
                       ) : (
                          <div className="col-span-full py-12 flex flex-col items-center justify-center gap-4 opacity-20 border-2 border-dashed rounded-[2rem]">
                             <X className="w-10 h-10" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Syntax</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            </div>

            {/* Main Action (Mobile First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1 relative group">
                  <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#c5a059]/30" />
                  <Input 
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    className="h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 font-black text-2xl sm:text-3xl text-center text-[#c5a059] shadow-xl tracking-[0.2em]"
                    placeholder="* * * * *"
                  />
               </div>
               <Button 
                  onClick={copyToClipboard}
                  className="px-10 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  {copied ? <Check className="w-5 h-5 mr-3" /> : <Copy className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" />}
                  {copied ? "COPIED" : "COPY CRON"}
                </Button>
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Quick Builder</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Visual Selector</p>
               </div>

               <div className="space-y-6">
                  {/* Selectors */}
                  {[
                    { label: "Minute", val: minute, set: setMinute, options: ["*", "*/5", "*/15", "0"] },
                    { label: "Hour", val: hour, set: setHour, options: ["*", "*/2", "0", "12"] },
                    { label: "Day", val: dayOfMonth, set: setDayOfMonth, options: ["*", "1,15", "L"] },
                    { label: "Week", val: dayOfWeek, set: setDayOfWeek, options: ["*", "1-5", "0,6"] }
                  ].map((item, i) => (
                    <div key={i} className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{item.label}</label>
                       <Select value={item.val} onValueChange={(v) => v && item.set(v)}>
                          <SelectTrigger className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none font-black text-xs uppercase tracking-widest shadow-inner-soft">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                             {item.options.map(opt => (
                                <SelectItem key={opt} value={opt} className="text-xs font-black uppercase tracking-widest">
                                   {opt === "*" ? `Every ${item.label}` : opt}
                                </SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                  ))}
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Syntax Guard</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Real-time</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
