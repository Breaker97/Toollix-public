"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Cpu, HardDrive, AlertCircle, CheckCircle2, Loader2, Gauge } from "lucide-react";

interface HealthStats {
  memory?: {
    total: number;
    free: number;
    used: number;
    percent: string;
  };
  cpu?: {
    model: string;
    count: number;
    platform: string;
  };
  system?: {
    uptime: number;
    nodeVersion: string;
    dbStatus: string;
  };
}

export function HealthMonitor() {
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/admin/health");
      const data = await res.json();
      if (data.health) {
        setStats(data.health);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      console.error("Failed to fetch health stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // 10 second refresh
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-16 bg-white dark:bg-[#232333] border border-zinc-100 dark:border-zinc-800/50 rounded-2xl animate-pulse ring-1 ring-zinc-50 shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin mr-4 text-primary/40" />
        <span className="text-xs font-bold text-muted-foreground tracking-[0.2em] uppercase">Booting Health Diagnostics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
           <div className="p-2.5 bg-primary/10 rounded-xl">
             <Activity className="w-5 h-5 text-primary" />
           </div>
           <div>
             <h2 className="text-xl font-extrabold tracking-tight">Cloud Infrastructure</h2>
             <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Live Instance • Node.js Agent</span>
               <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
               <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Connected</span>
             </div>
           </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground/50 uppercase font-bold tracking-widest mb-1">Last Update</p>
          <span className="text-xs font-mono font-bold text-muted-foreground">{new Date(lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* RAM Status */}
        <div className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] relative overflow-hidden group border border-zinc-50 dark:border-none">
           <div className="flex items-center justify-between mb-8">
              <div className="p-3 bg-blue-500/10 rounded-xl transition-colors group-hover:bg-blue-500/20">
                 <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">Volatility</span>
           </div>
           
           <div className="space-y-5">
              <div className="flex items-end justify-between">
                <div>
                   <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5">Memory Load</p>
                   <h3 className="text-4xl font-extrabold tracking-tighter">{stats?.memory?.percent}%</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter mb-1">Capacity</p>
                  <p className="text-xs font-bold text-muted-foreground/80">
                    {((stats?.memory?.used || 0) / (1024 * 1024 * 1024)).toFixed(2)}G <span className="text-muted-foreground/30 mx-1">/</span> {((stats?.memory?.total || 0) / (1024 * 1024 * 1024)).toFixed(1)}G
                  </p>
                </div>
              </div>
              
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-1000 ease-in-out relative" 
                   style={{ width: `${stats?.memory?.percent}%` }} 
                 >
                   <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                 </div>
              </div>
           </div>
        </div>

        {/* CPU Status */}
        <div className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] relative group border border-zinc-50 dark:border-none">
           <div className="flex items-center justify-between mb-8">
              <div className="p-3 bg-purple-500/10 rounded-xl transition-colors group-hover:bg-purple-500/20">
                 <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-purple-600 dark:text-purple-400 bg-purple-500/5 px-3 py-1 rounded-full border border-purple-500/10">Architecture</span>
           </div>
           
           <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5">Compute Engine</p>
                <h3 className="text-xl font-bold truncate leading-tight text-zinc-800 dark:text-zinc-200">{stats?.cpu?.model.replace(/CPU|Processor/g, '').trim()}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                 <div>
                    <p className="uppercase tracking-widest font-bold text-[9px] text-muted-foreground/40 mb-1">Platform</p>
                    <span className="text-xs font-extrabold uppercase">{stats?.cpu?.platform} x64</span>
                 </div>
                 <div>
                    <p className="uppercase tracking-widest font-bold text-[9px] text-muted-foreground/40 mb-1">Threads</p>
                    <span className="text-xs font-extrabold uppercase">{stats?.cpu?.count} Logics</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Heartbeat */}
        <div className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] border border-zinc-50 dark:border-none">
           <div className="flex items-center justify-between mb-8">
              <div className="p-3 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                 <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">Connectivity</span>
           </div>
           
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Database Node</span>
                 {stats?.system?.dbStatus === "Connected" ? (
                   <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                     <CheckCircle2 className="w-3 h-3" /> STABLE
                   </span>
                 ) : (
                   <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">
                     <AlertCircle className="w-3 h-3" /> TIMEOUT
                   </span>
                 )}
              </div>
              
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                 <div className="flex justify-between items-baseline mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Execution Time</p>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground/60">{stats?.system?.nodeVersion}</span>
                 </div>
                 <p className="text-3xl font-extrabold font-mono tracking-tighter text-zinc-900 dark:text-zinc-100">
                   {formatUptime(stats?.system?.uptime || 0)}
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

