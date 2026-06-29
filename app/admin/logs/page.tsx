"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  ShieldCheck, 
  Clock, 
  User, 
  Globe, 
  AlertCircle, 
  Search, 
  Terminal,
  Activity,
  History,
  Info,
  ShieldAlert
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/admin/logs")
      .then(res => res.json())
      .then(data => {
        if (data.logs) {
          setLogs(data.logs);
          setFilteredLogs(data.logs);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredLogs(
      logs.filter(log => 
        log.adminName.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        (log.details && log.details.toLowerCase().includes(term))
      )
    );
  }, [searchTerm, logs]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading Audit Stream</p>
         </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 italic">Audit & Security Logs</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Immutable Protocol Surveillance & History</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search action, admin or details..." 
            className="pl-12 h-14 rounded-2xl bg-white dark:bg-[#232333] border-none shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] focus-visible:ring-2 ring-primary/20 transition-all font-semibold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Status Dashboard */}
        <div className="lg:col-span-1 space-y-6 h-fit sticky top-24">
            <div className="bg-white dark:bg-[#232333] rounded-3xl p-8 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Surveillance Status</p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-tighter">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Live
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{logs.length}</p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Events</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                        <ShieldAlert className="w-4 h-4 text-red-500" /> Security Note
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic">
                        Logs are cryptographically sealed and immutable. Attempting to modify audit records triggers a high-severity alert to the primary system guardian.
                    </p>
                </div>
            </div>
            
            <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl space-y-3 relative overflow-hidden group">
                <Terminal className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12 transition-transform group-hover:scale-110" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Node Status</p>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-white font-extrabold text-sm tracking-tight font-mono">CORE_PROTOCOL_ACTIVE</p>
                </div>
            </div>
        </div>

        {/* Logs Feed */}
        <div className="lg:col-span-3">
            {filteredLogs.length === 0 ? (
                <div className="bg-white dark:bg-[#232333] rounded-[2.5rem] p-32 text-center space-y-6 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] border border-zinc-50 dark:border-none">
                    <div className="bg-zinc-50 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <History className="w-10 h-10 text-zinc-300" />
                    </div>
                    <div>
                        <p className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100">No signals caught</p>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Refine your filtration parameters</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredLogs.map((log, idx) => (
                        <div 
                            key={log._id} 
                            className="bg-white dark:bg-[#232333] p-8 rounded-[2rem] shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] transition-all hover:scale-[1.01] hover:shadow-2xl border border-zinc-50 dark:border-none group relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Info className="w-4 h-4 text-zinc-200" />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex gap-5 flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shadow-inner group-hover:bg-primary transition-colors shrink-0">
                                        <User className="w-7 h-7 text-zinc-300 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-lg font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 leading-none">{log.action}</h3>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full shadow-sm">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{log.adminName}</span>
                                            </div>
                                        </div>
                                        
                                        {log.details && (
                                            <div className="relative group/code">
                                                <code className="block text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50 p-5 rounded-2xl font-mono leading-relaxed break-all border border-zinc-100 dark:border-zinc-800/50 shadow-inner group-hover/code:text-zinc-700 dark:group-hover/code:text-zinc-300 transition-colors">
                                                    {log.details.length > 500 ? `${log.details.substring(0, 500)}...` : log.details}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex flex-row md:flex-col items-end gap-5 md:gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 w-max shrink-0 bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-zinc-300" /> {new Date(log.createdAt).toLocaleDateString()} <span className="text-[8px] opacity-40">|</span> {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-zinc-300" /> {log.ipAddress}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
