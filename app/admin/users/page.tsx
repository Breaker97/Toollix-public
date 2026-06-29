"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Users, 
  Loader2, 
  Search, 
  Filter, 
  Crown, 
  ShieldAlert, 
  Ban, 
  ShieldCheck, 
  Zap, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Filtering & Pagination State
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("user");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Deletion State
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        role,
        plan,
        status,
        limit: "15"
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
      setTotalUsers(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, role, plan, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400); // 400ms debounce for search
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleUpdate = async (userId: string, action: "role" | "plan" | "restriction" | "limit" | "reset-usage", value: any) => {
    setUpdating(`${userId}-${action}`);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      });
      if (res.ok) {
        setUsers(users.map(u => {
          if (u._id === userId) {
            let updated = { ...u };
            if (action === "restriction") updated.isRestricted = value;
            else if (action === "limit") updated.dailyLimitOverride = value;
            else if (action === "reset-usage") {
              updated.hourlyUsage = 0;
              updated.isExhausted = false;
            }
            else updated[action] = value;
            return updated;
          }
          return u;
        }));
      } else {
        alert("Update failed.");
      }
    } catch (e) {
      alert("Error updating user.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
        setConfirmDelete(null);
      } else {
        alert("Delete failed.");
      }
    } catch (e) {
      alert("Error deleting user.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setRole("all");
    setPlan("all");
    setStatus("all");
    setPage(1);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-700">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Identity Authority</h1>
           <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Manage global access, authentication and tool permissions.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white dark:bg-[#232333] shadow-sm px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-3 border border-zinc-50 dark:border-zinc-800">
             <div className="p-1.5 bg-primary/10 rounded-lg">
                <Users className="w-4 h-4 text-primary" />
             </div>
             <span>{totalUsers.toLocaleString()} Registered IDs</span>
           </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white dark:bg-[#232333] p-6 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-6">
         <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
            <Filter className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Search Refinement</h2>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-1 relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
               <input 
                 type="text" 
                 placeholder="Find identity..."
                 value={search}
                 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                 className="w-full h-11 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 ring-primary/20 transition-all placeholder:text-zinc-400"
               />
            </div>

            {/* Role Filter */}
            <div className="relative">
               <select 
                 value={role}
                 onChange={(e) => { setRole(e.target.value); setPage(1); }}
                 className="w-full h-11 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl px-4 text-sm font-bold text-zinc-600 dark:text-zinc-300 outline-none appearance-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
               >
                 <option value="all">Access Levels</option>
                 <option value="user">Standard User</option>
                 <option value="admin">Root Admin</option>
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
               </div>
            </div>

            {/* Plan Filter */}
            <div className="relative">
               <select 
                 value={plan}
                 onChange={(e) => { setPlan(e.target.value); setPage(1); }}
                 className="w-full h-11 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl px-4 text-sm font-bold text-zinc-600 dark:text-zinc-300 outline-none appearance-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
               >
                 <option value="all">All Service Tiers</option>
                 <option value="free">Community Tier</option>
                 <option value="pro">Pro Suite</option>
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
               </div>
            </div>

            {/* Status Filter */}
            <div className="relative flex items-center gap-3">
               <select 
                 value={status}
                 onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                 className="flex-1 h-11 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-xl px-4 text-sm font-bold text-zinc-600 dark:text-zinc-300 outline-none appearance-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
               >
                 <option value="all">Any Status</option>
                 <option value="active">Active Only</option>
                 <option value="restricted">Identity Blocked</option>
               </select>
               <Button 
                 onClick={resetFilters}
                 variant="ghost" 
                 className="h-11 w-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all shadow-sm"
                 title="Flush Filters"
               >
                 <X className="w-4 h-4" />
               </Button>
            </div>
         </div>
      </div>
      
      {/* Users Table Card */}
      <div className="bg-white dark:bg-[#232333] rounded-2xl overflow-hidden shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-400 uppercase tracking-widest font-bold text-[10px] border-b border-zinc-100 dark:border-zinc-800/50">
              <tr>
                <th className="px-10 py-5">Full Identity</th>
                <th className="px-8 py-5">Verified Email</th>
                <th className="px-8 py-5 text-center">Validation</th>
                <th className="px-8 py-5">Service Tier</th>
                <th className="px-8 py-5">Privileges</th>
                <th className="px-8 py-5">Safety</th>
                <th className="px-10 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                   <td colSpan={7} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                         <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400">Syncing Identity Records...</span>
                      </div>
                   </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-10 py-32 text-center text-muted-foreground font-medium">
                     <div className="flex flex-col items-center gap-6 opacity-40">
                        <Search className="w-16 h-16 text-zinc-200" />
                        <span className="text-xs font-bold uppercase tracking-[0.4em]">No matching records found</span>
                     </div>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-10 py-6 font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-inner">
                         {user.name?.[0] || 'U'}
                       </div>
                       <div>
                         <div className="text-sm leading-tight">{user.name}</div>
                         <div className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">Registry: {new Date(user.createdAt).toLocaleDateString()}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-zinc-500 dark:text-zinc-400 font-medium font-mono text-[13px]">
                    <div>{user.email}</div>
                    <div className="text-[10px] font-sans font-bold tracking-widest uppercase mt-1.5 flex items-center gap-2 group-hover:text-primary transition-colors">
                       <Activity className="w-3.5 h-3.5" /> 
                       <span className="opacity-80">{user.hourlyUsage} req / {user.hourlyLimit === -1 ? '∞' : user.hourlyLimit} hr</span>
                    </div>
                  </td>
                  
                  {/* Verification Status */}
                  <td className="px-8 py-6">
                     <div className="flex justify-center">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight shadow-sm border ${
                           user.isVerified 
                             ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                             : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                           {user.isVerified ? (
                             <><ShieldCheck className="w-3.5 h-3.5" /> Confirmed</>
                           ) : (
                             <><Loader2 className="w-3.5 h-3.5 animate-pulse" /> Pending</>
                           )}
                        </div>
                     </div>
                  </td>
                  
                  {/* Plan Control */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 select-container">
                       <select 
                         disabled={updating === `${user._id}-plan`}
                         value={user.plan || "free"}
                         onChange={(e) => handleUpdate(user._id, "plan", e.target.value)}
                         className={`px-3 py-1.5 rounded-lg border-none font-bold text-[11px] uppercase transition-all shadow-sm cursor-pointer outline-none focus:ring-2 ring-primary/20 ${user.plan === 'pro' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                       >
                         <option value="free">Community</option>
                         <option value="pro">Pro Suite</option>
                       </select>
                       {user.plan === 'pro' && <Crown className="w-4 h-4 text-amber-500 drop-shadow-md animate-pulse" />}
                    </div>
                  </td>

                  {/* Role Control */}
                  <td className="px-8 py-6">
                    <select 
                      disabled={updating === `${user._id}-role`}
                      value={user.role || "user"}
                      onChange={(e) => handleUpdate(user._id, "role", e.target.value)}
                      className={`px-3 py-1.5 rounded-lg border-none font-bold text-[11px] uppercase shadow-sm cursor-pointer transition-all outline-none focus:ring-2 ring-primary/20 ${user.role === 'admin' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                    >
                      <option value="user">Standard</option>
                      <option value="admin">Authority</option>
                    </select>
                  </td>

                  {/* Safety Status */}
                  <td className="px-8 py-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={updating === `${user._id}-restriction`}
                      onClick={() => handleUpdate(user._id, "restriction", !user.isRestricted)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-none font-bold text-[10px] uppercase shadow-sm transition-all ${
                        user.isRestricted 
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {user.isRestricted ? (
                        <><Ban className="w-3.5 h-3.5" /> BANNED</>
                      ) : (
                        <><ShieldCheck className="w-3.5 h-3.5" /> HEALTHY</>
                      )}
                    </Button>
                    
                    {user.isExhausted && (
                      <div className="mt-3 text-[9px] font-bold uppercase text-amber-600 bg-amber-500/10 rounded-lg px-2.5 py-1.5 flex items-center justify-between border border-amber-500/10 animate-in slide-in-from-top-1">
                        <span className="truncate">Limit Reached</span>
                        <Button
                          variant="ghost" 
                          size="icon"
                          disabled={updating === `${user._id}-reset-usage`}
                          onClick={() => handleUpdate(user._id, "reset-usage", true)}
                          className="h-5 w-5 min-w-[20px] rounded-md hover:bg-amber-500 hover:text-white transition-all ml-2"
                        >
                           <Zap className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </td>


                  {/* Actions */}
                  <td className="px-10 py-6 text-right">
                    {confirmDelete === user._id ? (
                      <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-3">
                         <span className="text-[10px] font-bold text-red-600 mr-2 uppercase tracking-tight">Security Wipe?</span>
                         <Button 
                           size="sm" 
                           onClick={() => handleDelete(user._id)}
                           className="bg-red-600 text-white hover:bg-red-700 h-9 rounded-xl shadow-md px-4 text-xs font-bold"
                         >Confirm</Button>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => setConfirmDelete(null)}
                           className="h-9 rounded-xl px-4 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                         >Abort</Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setConfirmDelete(user._id)}
                        className="text-zinc-200 hover:text-red-600 hover:bg-red-500/10 h-10 w-10 p-0 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-zinc-50/50 dark:bg-zinc-800/30 px-10 py-6 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Identity Batch {page} of {totalPages}
             </div>
             <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-xl h-10 w-10 p-0 bg-white dark:bg-zinc-900 shadow-sm border-none disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                   {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 rounded-xl text-[11px] font-bold transition-all shadow-sm ${
                          page === i + 1 
                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                            : "bg-white dark:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {i + 1}
                      </button>
                   ))}
                </div>
                <Button 
                  variant="ghost" 
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-xl h-10 w-10 p-0 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl disabled:opacity-30 disabled:bg-zinc-100 transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
             </div>
          </div>
        )}
      </div>

    </div>
  );
}
