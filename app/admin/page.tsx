"use client";

import { useEffect, useState } from "react";
import { Users, Crown, TrendingUp, Loader2, Zap, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { HealthMonitor } from "@/components/admin/HealthMonitor";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
          <p className="text-sm text-muted-foreground/60 animate-pulse font-bold tracking-widest uppercase">Syncing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Analytics Overview</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">Platform performance and user engagement metrics.</p>
        </div>
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl border border-emerald-500/10 w-max text-xs shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Operational
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={<Users className="w-6 h-6 text-blue-500" />} 
          trend="+12% from last month"
          color="bg-blue-500/10"
        />
        <StatCard 
          title="Premium Members" 
          value={stats.proUsers.toLocaleString()} 
          subtitle={`${((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}% Conversion`}
          icon={<Crown className="w-6 h-6 text-amber-500" />} 
          trend="+5.2% growth"
          color="bg-amber-500/10"
        />
        <StatCard 
          title="Free Tier" 
          value={stats.freeUsers.toLocaleString()} 
          icon={<Zap className="w-6 h-6 text-emerald-500" />} 
          trend="84% Retention"
          color="bg-emerald-500/10"
        />
        <StatCard 
          title="Tool Activity" 
          value={stats.totalToolsUsed.toLocaleString()} 
          icon={<Activity className="w-6 h-6 text-purple-500" />} 
          trend="Last 24h peak"
          color="bg-purple-500/10"
        />
      </div>

      {/* System Health Monitoring */}
      <div className="pt-4">
        <HealthMonitor />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle, trend, color }: { title: string; value: number | string; icon: React.ReactNode; subtitle?: string; trend?: string; color: string }) {
  return (
    <div className="group bg-white dark:bg-[#232333] rounded-2xl p-6 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 ${color} rounded-xl transition-all duration-500 group-hover:scale-110`}>{icon}</div>
        {trend && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
        </div>
        {subtitle && <p className="text-[10px] font-semibold text-muted-foreground/60 mt-2">{subtitle}</p>}
      </div>
      
      {/* Decorative gradient hit */}
      <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-gradient-to-br from-transparent to-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

