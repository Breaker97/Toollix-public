"use client";

import { useEffect, useState } from "react";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Loader2, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Circle,
  X,
  Search,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Zap,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, iconClass }: any) {
  return (
    <div className="bg-white dark:bg-[#232333] p-8 rounded-[2rem] shadow-[0_2px_10px_0_rgba(76,78,100,0.05)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-6 group hover:-translate-y-1 transition-all duration-300 border border-zinc-100 dark:border-none">
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 shadow-sm", iconClass)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{sub}</div>
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{label}</h4>
        <p className="text-4xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100 italic">{value}</p>
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showRedemptions, setShowRedemptions] = useState<any>(null);
  
  // Create Form State
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercent: 10,
    maxRedemptions: 0,
    expiryDate: ""
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
 
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons([data.coupon, ...coupons]);
        setShowCreate(false);
        setNewCoupon({ code: "", discountPercent: 10, maxRedemptions: 0, expiryDate: "" });
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Failed to create coupon.");
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      if (res.ok) {
        setCoupons(coupons.map(c => c._id === id ? { ...c, active: !currentActive } : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon permanently?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(coupons.filter(c => c._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Coupon Inventory</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Promotion Logic & Growth Catalyst</p>
        </div>
        <Button 
          onClick={() => setShowCreate(true)}
          className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-zinc-900 font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95] gap-3 uppercase tracking-widest text-xs border-none"
        >
          <Plus className="w-5 h-5 stroke-[3]" /> 
          <span>Deploy Manifest</span>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="Active Campaign Nodes" 
          value={coupons.filter(c => c.active).length} 
          sub="Live Logic" 
          icon={Activity} 
          iconClass="bg-emerald-500/10 text-emerald-500" 
        />
        <StatCard 
          label="Total Redemptions" 
          value={coupons.reduce((acc, curr) => acc + (curr.timesUsed || 0), 0)} 
          sub="Conversion" 
          icon={Zap} 
          iconClass="bg-primary/10 text-primary" 
        />
        <StatCard 
          label="Market Ceiling" 
          value={`${coupons.length > 0 ? Math.max(...coupons.map(c => c.discountPercent)) : 0}%`} 
          sub="Max Reward" 
          icon={ArrowUpRight} 
          iconClass="bg-indigo-500/10 text-indigo-500" 
        />
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-[#232333] rounded-[2.5rem] shadow-[0_20px_50px_rgba(76,78,100,0.1)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden border border-zinc-100 dark:border-none">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
                     <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Campaign Entity</th>
                     <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Reward Yield</th>
                     <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Consumption Data</th>
                     <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Expiration</th>
                     <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Operations</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                  {loading ? (
                    <tr>
                       <td colSpan={5} className="p-32 text-center">
                          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary opacity-20" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-6 italic">Syncing with Registry...</p>
                       </td>
                    </tr>
                  ) : coupons.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="p-32 text-center opacity-40">
                            <div className="text-center space-y-6">
                                <Ticket className="w-16 h-16 mx-auto text-zinc-300" />
                                <p className="text-sm font-black uppercase tracking-[0.2em]">No Active Coupon Signals Detected</p>
                            </div>
                       </td>
                    </tr>
                  ) : coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all group">
                       <td className="p-8">
                          <div className="flex items-center gap-5">
                             <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                                <Ticket className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors" />
                             </div>
                             <span className="font-black text-xl tracking-tighter text-zinc-800 dark:text-zinc-100 uppercase italic">{c.code}</span>
                          </div>
                       </td>
                       <td className="p-8">
                          <div className="flex items-baseline gap-1.5">
                             <span className="text-3xl font-black text-primary italic">{c.discountPercent}</span>
                             <span className="text-[11px] font-black text-primary/60 uppercase tracking-widest">% OFF</span>
                          </div>
                       </td>
                       <td className="p-8">
                          <div className="space-y-3">
                             <div className="flex items-center gap-2.5">
                                <span className={cn(
                                    "w-2.5 h-2.5 rounded-full",
                                    c.active ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'
                                )} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{c.active ? 'Active Node' : 'Terminated'}</span>
                             </div>
                             <button 
                               onClick={() => setShowRedemptions(c)}
                               className="text-[10px] font-bold text-zinc-400 hover:text-primary transition-colors flex items-center gap-2 group/btn"
                             >
                                <div className="flex items-center gap-2.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl group-hover/btn:bg-primary/10 transition-colors shadow-sm">
                                    <Users className="w-3.5 h-3.5" /> 
                                    <span className="font-black tracking-tight">{c.timesUsed || 0} / {c.maxRedemptions || '∞'}</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </div>
                             </button>
                          </div>
                       </td>
                       <td className="p-8">
                          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 w-fit px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
                             <Clock className="w-4 h-4 opacity-40 shrink-0" />
                             <span className="text-xs font-black tracking-tight">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Infinite Duration'}</span>
                          </div>
                       </td>
                       <td className="p-8 text-right">
                          <div className="flex items-center justify-end gap-4">
                             <Button 
                               onClick={() => toggleStatus(c._id, c.active)}
                               className={cn(
                                 "h-11 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 border-none",
                                 c.active 
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 shadow-zinc-900/20' 
                                    : 'bg-primary text-zinc-900 hover:bg-primary/90 shadow-primary/40'
                               )}
                             >
                                {c.active ? "Pause Signal" : "Resume Node"}
                             </Button>
                             <Button 
                               variant="outline"
                               onClick={() => deleteCoupon(c._id)}
                               className="h-11 w-11 p-0 rounded-2xl bg-red-500/10 border-none hover:bg-red-500 hover:text-white text-red-500 transition-all shadow-lg active:scale-95"
                             >
                                <Trash2 className="w-5 h-5" />
                             </Button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-white/40 dark:bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-[#232333] w-full max-w-md rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] p-12 animate-in zoom-in-95 duration-300 relative border border-zinc-100 dark:border-zinc-800/50">
              <button 
                onClick={() => setShowCreate(false)}
                className="absolute right-10 top-10 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 transition-all shadow-inner"
              >
                 <X className="w-6 h-6 text-zinc-500" />
              </button>
              
              <div className="space-y-10">
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100 italic">Deploy Manifest</h2>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Growth Engine Configuration</p>
                 </div>

                 <form onSubmit={handleCreate} className="space-y-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 ml-1">Universal Promo Code</Label>
                       <Input 
                         value={newCoupon.code}
                         onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                         placeholder="SAVE50" 
                         required
                         className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border-none px-6 font-black text-lg focus:ring-4 ring-primary/10 outline-none uppercase tracking-widest placeholder:text-zinc-300 shadow-inner" 
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 ml-1">Discount Yield %</Label>
                          <Input 
                            type="number"
                            min="1"
                            max="100"
                            value={newCoupon.discountPercent}
                            onChange={e => setNewCoupon({...newCoupon, discountPercent: parseInt(e.target.value)})}
                            className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border-none px-6 font-black text-xl text-primary focus:ring-4 ring-primary/10 outline-none shadow-inner" 
                          />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 ml-1">Consumption Limit</Label>
                          <Input 
                            type="number"
                            placeholder="∞"
                            value={newCoupon.maxRedemptions}
                            onChange={e => setNewCoupon({...newCoupon, maxRedemptions: parseInt(e.target.value)})}
                            className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border-none px-6 font-black text-xl text-zinc-600 dark:text-zinc-300 focus:ring-4 ring-primary/10 outline-none shadow-inner" 
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 ml-1">Time Horizon (Expiry)</Label>
                       <Input 
                         type="date"
                         value={newCoupon.expiryDate}
                         onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                         className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border-none px-6 font-black text-sm focus:ring-4 ring-primary/10 outline-none shadow-inner" 
                       />
                    </div>

                    {error && (
                      <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black text-center flex items-center justify-center gap-4 uppercase tracking-[0.2em] animate-in fade-in zoom-in-95 shadow-md">
                         <AlertCircle className="w-5 h-5 shrink-0" /> 
                         <span>Logic Violation: {error}</span>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={creating}
                      className="w-full h-16 bg-primary text-zinc-900 font-black uppercase tracking-[0.3em] text-xs rounded-2xl shadow-2xl shadow-primary/40 transition-all hover:scale-[1.03] active:scale-[0.97] border-none"
                    >
                       {creating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initiate Final Deployment"}
                    </Button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Redemptions Modal */}
      {showRedemptions && (
        <div className="fixed inset-0 z-50 bg-white/40 dark:bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-[#232333] w-full max-w-lg rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] p-12 animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[85vh] border border-zinc-100 dark:border-zinc-800/50">
              <button 
                onClick={() => setShowRedemptions(null)}
                className="absolute right-10 top-10 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 transition-all shadow-inner"
              >
                 <X className="w-6 h-6 text-zinc-500" />
              </button>

              <div className="mb-12 text-center xl:text-left">
                 <h2 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100 mb-2 italic">Consumption Analytics</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-3 justify-center xl:justify-start">
                   <Ticket className="w-4 h-4" /> 
                   <span>Tracing Entity: <span className="underline decoration-wavy transition-all decoration-primary/30">{showRedemptions.code}</span></span>
                 </p>
              </div>

              <div className="flex-1 overflow-y-auto pr-3 scrollbar-thin">
                 {showRedemptions.redemptions && showRedemptions.redemptions.length > 0 ? (
                    <div className="space-y-4">
                       {showRedemptions.redemptions.map((r: any, idx: number) => (
                         <div key={idx} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between group hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700">
                            <div className="flex flex-col gap-1">
                               <span className="text-base font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{r.email}</span>
                               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1 italic">{new Date(r.usedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-xl opacity-40 group-hover:opacity-100 transition-all">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            </div>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="py-24 text-center opacity-10 border-4 border-dotted border-zinc-200 dark:border-zinc-800 rounded-[2.5rem]">
                        <Users className="w-20 h-20 mx-auto mb-6" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">No Redemptions Logged in Current Node</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
