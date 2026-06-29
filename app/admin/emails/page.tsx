"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Eye, ArrowLeft, Users, Zap, Globe, ShieldCheck, History, Clock, List, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const TEMPLATES = {
  welcome: `<h1>Welcome to Toollix, {{name}}!</h1>\n<p>We're thrilled to have you as part of our elite engineering community. Your dashboard is now active and ready for high-performance tool execution.</p>\n<p>Explore your new toolkit: <a href="https://www.toollix.io/dashboard">Launch Dashboard</a></p>`,
  alert: `<h2>Security Protocol Update</h2>\n<p>Hello {{name}},</p>\n<p>This is a critical notification regarding your account and our updated security manifest. Please review the latest policy changes to ensure continued compliance with our encrypted data standards.</p>\n<p>Timestamp: {{date}}</p>`,
  promo: `<div style="background: #fdfaf1; padding: 40px; border-radius: 24px; text-align: center;">\n  <h1 style="color: #c5a059;">Pro Suite: Exclusive Access</h1>\n  <p>Elevate your creative engine with our latest Pro-tier utilities. Faster processing, zero ads, and batch support await.</p>\n  <a href="https://www.toollix.io/pricing" style="background: #0f172a; color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none;">Upgrade Now</a>\n</div>`
};

export default function AdminEmailsPage() {
  const [step, setStep] = useState<"compose" | "review">("compose");
  
  const [audience, setAudience] = useState<string>("all");
  const [targetEmails, setTargetEmails] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [emailType, setEmailType] = useState<string>("marketing");
  const [htmlContent, setHtmlContent] = useState("");
  
  const [isCalculated, setIsCalculated] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{success?: string, error?: string, stats?: any} | null>(null);

  // History State
  const [viewMode, setViewMode] = useState<"compose" | "history">("compose");
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/emails");
      const data = await res.json();
      if (res.ok) setLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (viewMode === "history") fetchLogs();
  }, [viewMode]);

  const applyTemplate = (key: keyof typeof TEMPLATES) => {
    if (htmlContent && !confirm("This will overwrite your current draft. Proceed?")) return;
    setHtmlContent(TEMPLATES[key]);
  };

  const insertVariable = (variable: string) => {
    setHtmlContent(prev => prev + ` {{${variable}}} `);
  };

  const handleReview = async () => {
    if (!subject || !htmlContent) {
      alert("Please fill out subject and email body.");
      return;
    }

    setIsCalculated(true);
    setStep("review");
    
    try {
      const emailList = audience === "selected" 
        ? targetEmails.split(",").map(e => e.trim()).filter(e => e)
        : [];

      const res = await fetch("/api/admin/emails/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience,
          targetEmails: emailList,
          emailType
        })
      });

      const data = await res.json();
      if (res.ok) {
         setRecipientCount(data.count);
      } else {
         alert("Could not calculate recipients: " + data.error);
         setStep("compose");
      }
    } catch (err) {
       console.error("Count Error", err);
       alert("Error communicating with server.");
       setStep("compose");
    } finally {
      setIsCalculated(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    setResult(null);

    try {
      const emailList = audience === "selected" 
        ? targetEmails.split(",").map(e => e.trim()).filter(e => e)
        : [];

      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience,
          targetEmails: emailList,
          subject,
          html: htmlContent,
          emailType
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send emails");
      
      setResult({ 
        success: data.message,
        stats: data.stats 
      });
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const footerHtml = emailType === 'marketing' ? `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; font-family: sans-serif; font-size: 12px; color: #666; text-align: center;">
      <p>
        You are receiving this email because you are subscribed to updates from Toollix.<br/>
        If you no longer wish to receive these emails, you can <a href="#" style="color: #c5a059; text-decoration: underline;">unsubscribe here</a>.
      </p>
    </div>
  ` : "";

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Broadcast Center</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Multi-channel communication dispatch node</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-inner">
            <button 
              onClick={() => setViewMode("compose")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === "compose" 
                  ? "bg-white dark:bg-zinc-700 text-primary shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              )}
            >
              Compose
            </button>
            <button 
              onClick={() => setViewMode("history")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === "history" 
                  ? "bg-white dark:bg-zinc-700 text-primary shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              )}
            >
              History
            </button>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest bg-white dark:bg-zinc-800/50 shadow-sm border border-zinc-50 dark:border-none rounded-2xl px-5 py-3">
            <Mail className="w-3.5 h-3.5 text-primary" />
            MTA Signal Online
          </div>
        </div>
      </div>

      {viewMode === "history" ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
           <section className="bg-white dark:bg-[#232333] rounded-[2.5rem] shadow-[0_20px_50px_rgba(76,78,100,0.1)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden border border-zinc-100 dark:border-none">
              <div className="p-8 md:p-10 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                        <History className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 italic">Dispatch Archive</h2>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Tracing past signal propagations</p>
                    </div>
                 </div>
                 <Button onClick={fetchLogs} disabled={loadingLogs} variant="outline" className="h-10 px-5 rounded-xl text-[10px] uppercase font-black tracking-widest border-zinc-200 dark:border-zinc-700">
                   {loadingLogs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Refresh Registry"}
                 </Button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
                          <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Timestamp</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Subject / Type</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Yield Analytics</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Operations</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                       {loadingLogs ? (
                          <tr>
                             <td colSpan={4} className="p-32 text-center opacity-40">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest italic">Decrypting Log Manifest...</p>
                             </td>
                          </tr>
                       ) : logs.length === 0 ? (
                          <tr>
                             <td colSpan={4} className="p-32 text-center opacity-20">
                                <List className="w-16 h-16 mx-auto mb-6" />
                                <p className="text-xs font-black uppercase tracking-widest italic">No Broadcast Events Logged</p>
                             </td>
                          </tr>
                       ) : logs.map((log) => (
                          <tr key={log._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all group">
                             <td className="p-8">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100 font-black text-sm">
                                      <Clock className="w-3.5 h-3.5 text-primary" />
                                      {new Date(log.createdAt).toLocaleDateString()}
                                   </div>
                                   <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                      {new Date(log.createdAt).toLocaleTimeString()}
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                <div className="space-y-2">
                                   <p className="font-black text-sm tracking-tight text-zinc-800 dark:text-zinc-100 group-hover:text-primary transition-colors">{log.subject}</p>
                                   <div className="flex items-center gap-2">
                                      <span className={cn(
                                         "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                         log.emailType === 'marketing' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                                      )}>{log.emailType}</span>
                                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase tracking-widest">{log.audience}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-[200px]">
                                   <div className="space-y-1">
                                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block">Success</span>
                                      <span className="text-lg font-black text-emerald-500 italic">{log.stats?.success || 0}</span>
                                   </div>
                                   <div className="space-y-1">
                                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block">Failed</span>
                                      <span className="text-lg font-black text-red-500 italic">{log.stats?.failed || 0}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="p-8 text-right">
                                <Button 
                                  onClick={() => setSelectedLog(log)}
                                  className="h-10 px-5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold uppercase tracking-widest text-[9px] shadow-lg transition-all hover:scale-[1.05] active:scale-[0.95]"
                                >
                                   View Archive
                                </Button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </section>
        </div>
      ) : step === "compose" ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <section className="bg-white dark:bg-[#232333] p-8 md:p-10 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-10 border border-zinc-50 dark:border-none">
            
            <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-6">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Campaign Logistics</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Define audience & payload architecture</p>
                </div>
            </div>

            {/* Audience Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Target Segment</label>
                  <Select value={audience} onValueChange={(val) => setAudience(val || "all")}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-bold text-xs ring-primary/20 focus:ring-2 outline-none">
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl z-50">
                      <SelectItem value="all" className="font-bold text-zinc-700 dark:text-zinc-300 focus:bg-zinc-50 dark:focus:bg-zinc-800/50">All Registry Nodes</SelectItem>
                      <SelectItem value="pro" className="font-bold text-zinc-700 dark:text-zinc-300 focus:bg-zinc-50 dark:focus:bg-zinc-800/50">Pro-tier Subs Only</SelectItem>
                      <SelectItem value="free" className="font-bold text-zinc-700 dark:text-zinc-300 focus:bg-zinc-50 dark:focus:bg-zinc-800/50">Standard Tier Only</SelectItem>
                      <SelectItem value="selected" className="font-bold text-zinc-700 dark:text-zinc-300 focus:bg-zinc-50 dark:focus:bg-zinc-800/50">Manual List (CSV)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Dispatch Priority</label>
                  <Select value={emailType} onValueChange={(val) => setEmailType(val || "marketing")}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-bold text-xs ring-primary/20 focus:ring-2 outline-none">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl z-50">
                      <SelectItem value="marketing" className="text-orange-500 font-bold focus:bg-orange-500/5">Marketing (Consented Only)</SelectItem>
                      <SelectItem value="transactional" className="text-red-500 font-bold focus:bg-red-500/5">Critical (Bypass Headers)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Communication Lead</label>
                    <Input 
                      placeholder="Transmission Title..." 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-bold text-sm focus:ring-2 ring-primary/20 outline-none"
                    />
                </div>

                {audience === "selected" && (
                  <div className="space-y-2.5 md:col-span-2 lg:col-span-3 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Target Address Index</label>
                    <Input 
                      placeholder="user1@example.com, admin@domain.com, ..." 
                      value={targetEmails}
                      onChange={(e) => setTargetEmails(e.target.value)}
                      className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-bold text-xs focus:ring-2 ring-primary/20 outline-none"
                    />
                  </div>
                )}
            </div>

            {/* Editor Section */}
            <div className="grid lg:grid-cols-2 gap-10">
                {/* Raw Editor */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Template Logic (HTML)</label>
                            <div className="flex items-center gap-1.5 pt-1">
                                <button onClick={() => applyTemplate('welcome')} title="Welcome Kit" className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-primary/10 hover:text-primary transition-all shadow-sm">
                                    <Users className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => applyTemplate('alert')} title="Security Alert" className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-primary/10 hover:text-primary transition-all shadow-sm">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => applyTemplate('promo')} title="Promotion Manifest" className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-primary/10 hover:text-primary transition-all shadow-sm">
                                    <Zap className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <div className="flex items-center gap-1.5">
                                {['name', 'email', 'date', 'unsubscribe_link'].map(v => (
                                    <button 
                                        key={v}
                                        onClick={() => insertVariable(v)}
                                        className="text-[8px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-primary px-2 py-1 rounded-md transition-all border border-zinc-200 dark:border-zinc-700"
                                    >
                                        {v.split('_')[0]}
                                    </button>
                                ))}
                             </div>
                             <span className="text-[9px] font-black tracking-widest text-zinc-100 bg-zinc-800 px-3 py-1 rounded-full uppercase border border-zinc-700">Source Console</span>
                        </div>
                    </div>
                    <textarea
                        className="w-full min-h-[500px] rounded-2xl bg-zinc-950 border border-zinc-800/50 p-6 text-xs font-mono text-zinc-100 shadow-2xl focus:ring-2 ring-primary/40 outline-none resize-none leading-relaxed placeholder:text-zinc-700 selection:bg-primary/30"
                        placeholder="<!-- Inject premium HTML Logic or use presets above -->"
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                    />
                </div>

                {/* Live Preview Console */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Behavioral Render</label>
                        <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full uppercase">
                            <Eye className="w-3 h-3" /> Virtual Client
                        </div>
                    </div>
                    <div className="min-h-[500px] w-full bg-white rounded-2xl shadow-[0_2px_10px_0_rgba(0,0,0,0.05)] overflow-hidden flex flex-col border border-zinc-100 dark:border-none">
                        <div className="bg-zinc-50 border-b border-zinc-100 p-4 shrink-0">
                            <p className="text-sm text-zinc-800 font-extrabold truncate">{subject || "Awaiting Title..."}</p>
                            <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tight">System Node: <span className="text-primary tracking-normal">hello@toollix.io</span></p>
                        </div>
                        {htmlContent ? (
                            <div className="p-8 bg-white overflow-y-auto flex-1 text-zinc-800 scrollbar-thin" dangerouslySetInnerHTML={{ __html: htmlContent + footerHtml }} />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-20">
                                <Globe className="w-16 h-16 mb-4" />
                                <p className="text-xs font-bold uppercase tracking-widest max-w-[200px]">Logic Injection Required to Initiate Rendering</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time preview synchronized
              </div>
              <Button 
                onClick={handleReview}
                disabled={isCalculated || !subject || !htmlContent}
                className="h-14 px-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold uppercase tracking-widest text-xs shadow-xl shadow-zinc-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
              >
                {isCalculated ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Proceed to Verification</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </section>
        </div>
      ) : (
        /* STEP 2: REVIEW AND SEND */
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 max-w-3xl mx-auto">
            <section className="bg-white dark:bg-[#232333] rounded-[3rem] shadow-[0_20px_50px_rgba(76,78,100,0.1)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden border border-zinc-100 dark:border-zinc-800/50">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-10 text-zinc-900 dark:text-zinc-100 relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.05] rotate-12 scale-150 transform translate-x-12 -translate-y-12">
                      <Send className="w-48 h-48" />
                   </div>
                   <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary">
                            <ShieldCheck className="w-4 h-4" />
                            Security Clearance Level 4
                        </div>
                        <h2 className="text-4xl font-black tracking-tight italic">Final Dispatch Audit</h2>
                        <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px]">Verification Protocol: Mandatory clearance before global propagation</p>
                   </div>
                </div>

                <div className="p-10 space-y-10">
                   {/* Metrics Cluster */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-8 bg-zinc-50 dark:bg-zinc-800/60 rounded-[2rem] space-y-5 border border-zinc-100 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-md">
                         <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl">
                                <Users className="w-4.5 h-4.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Target Reach</span>
                         </div>
                         <div className="space-y-1">
                            <span className="text-5xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter italic">{recipientCount.toLocaleString()}</span>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{audience} Registry Nodes</p>
                         </div>
                         {emailType === 'marketing' && (
                             <div className="flex items-center gap-2.5 p-3 bg-orange-500/5 rounded-xl border border-orange-500/10">
                                <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                                <span className="text-[9px] font-black text-orange-600 uppercase tracking-wide">Consented Filters Engaged</span>
                             </div>
                         )}
                      </div>
                      <div className="p-8 bg-zinc-50 dark:bg-zinc-800/60 rounded-[2rem] space-y-5 border border-zinc-100 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-md">
                         <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-zinc-200 dark:bg-zinc-700/50 rounded-xl">
                                <Zap className="w-4.5 h-4.5 text-zinc-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Dispatch Logic</span>
                         </div>
                         <div className="space-y-1">
                            <span className={cn(
                                "text-3xl font-black tracking-tight capitalize italic",
                                emailType === 'marketing' ? 'text-orange-500' : 'text-red-500'
                            )}>{emailType} Burst</span>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {emailType === "transactional" ? "Critical data bypass headers" : "General audience material"}
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* Payload Summary */}
                   <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                      <div className="flex flex-col gap-3">
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Dispatch Identifier</span>
                         <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl font-bold text-zinc-800 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-800 shadow-sm">{subject}</div>
                      </div>
                      <div className="flex flex-col gap-3">
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Payload Volume</span>
                         <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl font-bold text-zinc-500 shadow-sm border border-zinc-100 dark:border-zinc-800">
                             <div className="p-1 px-2.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px] font-black uppercase text-zinc-600 dark:text-zinc-300">Data Size</div>
                             <span className="text-sm">{Math.round(htmlContent.length / 1024)} KB encoded manifest</span>
                         </div>
                      </div>
                   </div>

                   {/* Live Result Container */}
                   {result && (
                     <div className={cn(
                        "p-8 rounded-3xl border flex flex-col md:flex-row items-start md:items-center gap-6 animate-in zoom-in-95",
                        result.error ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                     )}>
                       <div className="p-4 bg-white/20 rounded-2xl shrink-0 group hover:scale-110 transition-transform">
                         {result.error ? <AlertCircle className="w-8 h-8 " /> : <CheckCircle2 className="w-8 h-8" />}
                       </div>
                       <div className="space-y-4 flex-1">
                         <div className="space-y-1">
                            <p className="font-black text-2xl tracking-tight">{result.error ? "Dispatch Operation Aborted" : "Transmission Finalized"}</p>
                            <p className="text-sm font-bold opacity-70 uppercase tracking-widest">{result.error || result.success}</p>
                         </div>
                         {result.stats && (
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                { l: "Target", v: result.stats.total, c: "text-zinc-500" },
                                { l: "Success", v: result.stats.successCount, c: "text-emerald-500" },
                                { l: "Skipped", v: result.stats.skippedCount, c: "text-orange-500" },
                                { l: "Bounced", v: result.stats.failedCount, c: "text-red-500" }
                              ].map(s => (
                                <div key={s.l} className="bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-black/5 flex flex-col items-center text-center">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{s.l}</span>
                                    <span className={cn("text-xl font-black", s.c)}>{s.v}</span>
                                </div>
                              ))}
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                </div>

                <div className="p-10 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <Button 
                    variant="outline" 
                    onClick={() => { setStep("compose"); setResult(null); }}
                    disabled={isSending || !!(result && !result.error)}
                    className="h-12 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-none hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all gap-3"
                  >
                     <ArrowLeft className="w-4 h-4" /> 
                     <span>Revert to Logic</span>
                  </Button>
                  <Button 
                    onClick={handleSend}
                    disabled={isSending || recipientCount === 0 || !!(result && !result.error)}
                    className="h-16 px-12 rounded-2xl text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black uppercase tracking-widest shadow-2xl shadow-zinc-900/40 gap-4 transition-all hover:scale-[1.03] active:scale-[0.97]"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : result && !result.error ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> 
                        <span>Execute Propagation</span>
                      </>
                    )}
                  </Button>
                </div>
            </section>
        </div>
      )}

      {/* Archive Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-[#232333] w-full max-w-4xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] p-12 animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh] border border-zinc-100 dark:border-zinc-800/50">
              <button 
                onClick={() => setSelectedLog(null)}
                className="absolute right-10 top-10 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 transition-all shadow-inner"
              >
                 <X className="w-6 h-6 text-zinc-500" />
              </button>

              <div className="mb-12 space-y-2">
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary">
                    <History className="w-4 h-4" />
                    Archival Material
                 </div>
                 <h2 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100 italic">{selectedLog.subject}</h2>
                 <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                       <Clock className="w-3.5 h-3.5" />
                       {new Date(selectedLog.createdAt).toLocaleString()}
                    </div>
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                       By: <span className="text-zinc-800 dark:text-zinc-100">{selectedLog.sentBy?.name}</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto rounded-3xl border border-zinc-100 dark:border-zinc-800 p-8 bg-white scrollbar-thin">
                 <div dangerouslySetInnerHTML={{ __html: selectedLog.htmlContent }} />
              </div>

              <div className="mt-10 flex justify-end">
                  <Button 
                    onClick={() => {
                        setSubject(selectedLog.subject);
                        setHtmlContent(selectedLog.htmlContent);
                        setEmailType(selectedLog.emailType);
                        setAudience(selectedLog.audience);
                        setViewMode("compose");
                        setSelectedLog(null);
                    }}
                    className="h-14 px-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
                  >
                    <Send className="w-4 h-4" />
                    Clone Manifest to Compose
                  </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
