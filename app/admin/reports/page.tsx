"use client";

import { useEffect, useState } from "react";
import { 
  Download, FileSpreadsheet, Users, Activity, 
  Loader2, ArrowUpRight, Clock, ShieldCheck, 
  Calendar, Inbox, ExternalLink, Database,
  TrendingUp,
  FileText,
  UserPlus,
  Zap,
  BarChart3,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";

// Use native Intl for date formatting to minimize dependencies
const formatDate = (date: Date | string, pattern: string = "MMM dd, HH:mm") => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (pattern === "HH:mm:ss") {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }
  return d.toLocaleDateString([], { month: 'short', day: '2-digit' }) + ", " + 
         d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export default function ReportsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports/stats")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch reports data", err);
        setLoading(false);
      });
  }, []);

  const handleExport = (type: "users" | "tools") => {
    window.location.href = `/api/admin/reports/export?type=${type}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Synthesizing Intel Stream</p>
         </div>
      </div>
    );
  }

  const stats = data?.stats || { totalUsers: 0, totalUsage: 0, newUsersLast30: 0 };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 italic">Database Intelligence</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Server className="w-3.5 h-3.5" /> Live Data Manifest & Registry Exports
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white dark:bg-[#232333] px-6 py-4 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] flex items-center gap-3 border border-zinc-50 dark:border-none">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Secure Admin Registry Access</p>
           </div>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#232333] p-8 rounded-[2rem] shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-4 transition-all hover:scale-[1.02] border border-zinc-50 dark:border-none">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
                <p className="text-3xl font-black text-zinc-800 dark:text-zinc-100">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Userbase</p>
            </div>
        </div>
        <div className="bg-white dark:bg-[#232333] p-8 rounded-[2rem] shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-4 transition-all hover:scale-[1.02] border border-zinc-50 dark:border-none">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-teal-500" />
            </div>
            <div>
                <p className="text-3xl font-black text-zinc-800 dark:text-zinc-100">{stats.totalUsage.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Executions Handled</p>
            </div>
        </div>
        <div className="bg-white dark:bg-[#232333] p-8 rounded-[2rem] shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-4 transition-all hover:scale-[1.02] border border-zinc-50 dark:border-none">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
            <div>
                <p className="text-3xl font-black text-zinc-800 dark:text-zinc-100">+{stats.newUsersLast30.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Growth Window (30D)</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
         
         {/* Registrations List */}
         <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-zinc-900 dark:bg-primary rounded-full" />
                  <h3 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                     <UserPlus className="w-5 h-5 text-zinc-400" /> Recent Registrations
                  </h3>
               </div>
               <button onClick={() => handleExport("users")} className="text-[10px] font-extrabold text-white bg-zinc-900 rounded-xl px-5 py-2.5 shadow-lg shadow-zinc-900/10 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                  <FileSpreadsheet className="w-4 h-4" /> Export CSV
               </button>
            </div>
            <div className="bg-white dark:bg-[#232333] rounded-[2.5rem] overflow-hidden shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] border border-zinc-50 dark:border-none">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                           <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">User Manifest</th>
                           <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Protocol Tier</th>
                           <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Registry Signal</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {data?.recentUsers?.map((user: any, idx: number) => (
                           <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors group" style={{ animationDelay: `${idx * 50}ms` }}>
                              <td className="p-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all">
                                        {(user.name || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100 truncate max-w-[150px]">{user.name || "Anonymous Cluster"}</span>
                                        <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[150px] italic">{user.email}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-6 text-center">
                                 <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    user.plan === 'pro' 
                                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-sm shadow-amber-500/10' 
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-transparent'
                                 )}>
                                    {user.plan}
                                 </span>
                              </td>
                              <td className="p-6 text-right">
                                 <div className="flex flex-col items-end">
                                    <span className="text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300">{formatDate(new Date(user.createdAt), 'MMM dd, HH:mm')}</span>
                                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">Verified Node</span>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Telemetry List */}
         <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
                  <h3 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                     <BarChart3 className="w-5 h-5 text-teal-500" /> Live Telemetry
                  </h3>
               </div>
               <button onClick={() => handleExport("tools")} className="text-[10px] font-black text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 rounded-xl px-5 py-2.5 shadow-xl shadow-zinc-900/20 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest">
                  <Download className="w-4 h-4" /> Behavioral Dump
               </button>
            </div>
            <div className="bg-white dark:bg-[#232333] rounded-[2.5rem] overflow-hidden shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] border border-zinc-50 dark:border-none">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                           <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Execution Hash</th>
                           <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">Source Node</th>
                           <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Timestamp</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {data?.recentActivity?.map((log: any, idx: number) => (
                           <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors group" style={{ animationDelay: `${idx * 50}ms` }}>
                              <td className="p-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)] animate-pulse" />
                                    <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100 capitalize group-hover:text-teal-600 transition-colors">{log.toolName?.replace(/-/g, " ")}</span>
                                 </div>
                              </td>
                              <td className="p-6 text-center">
                                 <code className="text-[10px] font-bold bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800 text-zinc-400 group-hover:text-primary transition-colors">
                                    {log.userId?.substring(0, 10).toUpperCase()}
                                 </code>
                              </td>
                              <td className="p-6 text-right">
                                 <div className="flex flex-col items-end">
                                    <span className="text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300">{formatDate(new Date(log.createdAt), 'HH:mm:ss')}</span>
                                    <span className="text-[9px] font-bold text-teal-500 uppercase tracking-tighter">Active Sync</span>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

      </div>

      {/* Footer Info */}
      <footer className="pt-10 border-t border-zinc-100 dark:border-zinc-800">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" /> Registry manifests contain 42+ behavioral telemetry parameters for analytical synthesis.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-full border border-zinc-100 dark:border-none">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Protocol Version 4.0.0A</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
