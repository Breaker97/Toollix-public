"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, TrendingDown, Users, Zap, Crown,
  UserPlus, Activity, BarChart3, Loader2, ArrowUpRight, ArrowDownRight, Minus,
  Calendar, Info
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
  BarChart, Bar
} from "recharts";
import { cn } from "@/lib/utils";

// ── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#232333]/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-zinc-100 dark:border-none animate-in fade-in zoom-in-95">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{label}</p>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100">{payload[0].value.toLocaleString()}</p>
        </div>
        <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">{payload[0].name}</p>
      </div>
    );
  }
  return null;
};

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconClass, trend }: any) {
  return (
    <div className="bg-white dark:bg-[#232333] rounded-2xl p-6 flex flex-col gap-5 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-xl transition-all group-hover:scale-110", iconClass)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full",
            trend > 0 ? "text-emerald-600 bg-emerald-500/10" :
            trend < 0 ? "text-red-500 bg-red-500/10" :
            "text-zinc-400 bg-zinc-100 dark:bg-zinc-800"
          )}>
            {trend > 0 ? <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> : trend < 0 ? <ArrowDownRight className="w-3.5 h-3.5 shrink-0" /> : <Minus className="w-3.5 h-3.5 shrink-0" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">{value?.toLocaleString() ?? "—"}</p>
        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-1">{label}</p>
        {sub && <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">{sub}</p>}
      </div>
    </div>
  );
}

// ── Top Tool Bar ─────────────────────────────────────────────────────────────
function TopToolBar({ name, count, max }: { name: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="space-y-2 group">
        <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest truncate">{name?.replace(/-/g, " ")}</span>
            <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-100">{count.toLocaleString()}</span>
        </div>
        <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
            <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 group-hover:brightness-110 transition-all duration-700 shadow-lg"
            style={{ width: `${pct}%` }}
            />
        </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(res => res.json())
      .then(json => {
        if (json.error) { setError(json.error); }
        else { setData(json); }
        setLoading(false);
      })
      .catch(() => { setError("Failed to fetch analytics."); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-white dark:bg-[#232333] flex items-center justify-center shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse" />
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Aggregating Metrics</p>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">Telemetry node synchronization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/10 px-8 py-6 rounded-3xl border border-red-100 dark:border-none shadow-sm text-center max-w-sm">
            <Activity className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-extrabold text-red-600 dark:text-red-400">Data Stream Interrupted</p>
            <p className="text-sm text-red-600/60 dark:text-red-400/40 font-bold uppercase tracking-widest mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const { timeline, usageSplit, users, topTools, weeklyGrowthPct, thisWeekCount } = data;

  const audiencePieData = [
    { name: "Registered", value: usageSplit?.registered ?? 0 },
    { name: "Guests", value: usageSplit?.guest ?? 0 },
  ];
  const PIE_COLORS = ["#6366f1", "#d4d4d8"];

  const registeredPct = usageSplit?.total > 0
    ? Math.round((usageSplit.registered / usageSplit.total) * 100)
    : 0;
  const guestPct = 100 - registeredPct;

  const maxToolCount = topTools?.[0]?.count ?? 1;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">
            Intelligence Center
          </h1>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            Behavioral analysis & volume observability
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest bg-white dark:bg-zinc-800/50 shadow-sm border border-zinc-50 dark:border-none rounded-2xl px-5 py-3 self-start">
          <Activity className="w-3.5 h-3.5 text-primary" />
          Live Metrics Feed
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Zap}
          label="Tool Executions"
          value={usageSplit?.total}
          sub="All-time throughput"
          iconClass="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Current Velocity"
          value={thisWeekCount}
          sub="Last 7-day period"
          iconClass="bg-emerald-500/10 text-emerald-500"
          trend={weeklyGrowthPct}
        />
        <StatCard
          icon={Users}
          label="Network Reach"
          value={users?.total}
          sub={`${users?.newLast30 ?? 0} new arrivals (30d)`}
          iconClass="bg-indigo-500/10 text-indigo-500"
        />
        <StatCard
          icon={Crown}
          label="Elite Members"
          value={users?.pro}
          sub={`${users?.total > 0 ? Math.round((users.pro / users.total) * 100) : 0}% tier conversion`}
          iconClass="bg-amber-500/10 text-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* 30-Day Area Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-[#232333] rounded-3xl p-8 md:p-10 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-500/10 rounded-2xl">
                 <Calendar className="w-5 h-5 text-blue-500" />
               </div>
               <div>
                 <h2 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Traffic Distribution</h2>
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">30-day time-series snapshot</p>
               </div>
            </div>
            <div className="hidden md:block">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Runs / Day</span>
                </div>
            </div>
          </div>

          {timeline?.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl">
              <div className="text-center space-y-4 opacity-30">
                <BarChart3 className="w-16 h-16 mx-auto" />
                <p className="text-xs font-bold uppercase tracking-widest">Quiet Period · No Activity Detected</p>
              </div>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.05} vertical={false} stroke="#888" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                    dy={10}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    name="Runs"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#areaGrad)"
                    dot={false}
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Audience Donut */}
        <div className="bg-white dark:bg-[#232333] rounded-3xl p-8 md:p-10 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20_0_rgba(0,0,0,0.3)] flex flex-col">
          <div className="flex items-center gap-4 mb-10 text-center xl:text-left">
            <div className="p-3 bg-violet-500/10 rounded-2xl mx-auto xl:mx-0">
              <Users className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Audience Mix</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Authorization status split</p>
            </div>
          </div>

          {usageSplit?.total === 0 ? (
            <div className="flex-1 flex items-center justify-center opacity-20">
              <div className="text-center space-y-4">
                <Users className="w-16 h-16 mx-auto" />
                <p className="text-xs font-bold uppercase tracking-widest">Awaiting First Access</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={audiencePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="65%"
                      outerRadius="90%"
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {audiencePieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} className="hover:opacity-80 transition-opacity" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "16px", border: "none", background: "#18181b", padding: "12px 16px" }}
                      itemStyle={{ color: "#fff", fontWeight: 800, fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 mt-8">
                {[
                  { label: "Authenticated", value: usageSplit.registered, pct: registeredPct, color: "#6366f1" },
                  { label: "Guest Node", value: usageSplit.guest, pct: guestPct, color: "#d4d4d8" },
                ].map(({ label, value, pct, color }) => (
                  <div key={label} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 shadow-sm group hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: color }} />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">{value.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-zinc-400 tracking-tight">{pct}% Contribution</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Top Tools + New Users */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Top Tools */}
        <div className="bg-white dark:bg-[#232333] rounded-3xl p-8 md:p-10 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-violet-500/10 rounded-2xl">
              <BarChart3 className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Operational Leaderboard</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Primary tool run volume ranking</p>
            </div>
          </div>

          {topTools?.length === 0 ? (
            <p className="text-sm font-bold text-zinc-300 uppercase tracking-widest text-center py-20">Leaderboard Empty</p>
          ) : (
            <div className="space-y-6">
              {topTools?.map((tool: any) => (
                <TopToolBar key={tool.name} name={tool.name} count={tool.count} max={maxToolCount} />
              ))}
            </div>
          )}
        </div>

        {/* New User Growth */}
        <div className="bg-white dark:bg-[#232333] rounded-3xl p-8 md:p-10 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <UserPlus className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Membership Registry</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Account level stratification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Active Nodes", value: users?.total, icon: Users, iconColor: "text-indigo-500", bg: "bg-indigo-50 group-hover:bg-indigo-500" },
              { label: "Recent Onboard", value: users?.newLast30, icon: UserPlus, iconColor: "text-emerald-500", bg: "bg-emerald-50 group-hover:bg-emerald-500" },
              { label: "Prime Tier", value: users?.pro, icon: Crown, iconColor: "text-amber-500", bg: "bg-amber-50 group-hover:bg-amber-500" },
              {
                label: "Standard Tier",
                value: (users?.total ?? 0) - (users?.pro ?? 0),
                icon: Activity,
                iconColor: "text-zinc-400",
                bg: "bg-zinc-50 group-hover:bg-zinc-400"
              },
            ].map(({ label, value, icon: Icon, iconColor, bg }) => (
              <div key={label} className="p-6 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-none shadow-sm group hover:bg-white dark:hover:bg-zinc-800 transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded-xl transition-all duration-500 group-hover:bg-primary group-hover:text-white", iconColor, "bg-white dark:bg-zinc-900 shadow-sm")}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 group-hover:text-primary transition-colors">{label}</span>
                </div>
                <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{(value ?? 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
