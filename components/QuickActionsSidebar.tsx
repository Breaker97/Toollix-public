"use client";

import { useState } from "react";
import { RefreshCw, AlertTriangle, Users, TrendingUp, Loader2, Scale } from "lucide-react";

export default function QuickActionsSidebar() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleClick = async (action: string) => {
    if (action === "export_users") {
      window.location.href = "/api/admin/reports/export?type=users";
      return;
    }

    setLoadingAction(action);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.error || "Action failed.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="mt-4">
      <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</p>
      
      <button 
        onClick={() => handleClick("clear_cache")}
        disabled={loadingAction === "clear_cache"}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-muted transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-blue-500" /> 
          <span className="truncate">Clear Cache</span>
        </div>
        {loadingAction === "clear_cache" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </button>

      <button 
        onClick={() => handleClick("toggle_maintenance")}
        disabled={loadingAction === "toggle_maintenance"}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-muted transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" /> 
          <span className="truncate">Toggle Maintenance</span>
        </div>
        {loadingAction === "toggle_maintenance" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </button>

      <button 
        onClick={() => handleClick("seed_legal")}
        disabled={loadingAction === "seed_legal"}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-muted transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-emerald-500" /> 
          <span className="truncate">Initialize Legal</span>
        </div>
        {loadingAction === "seed_legal" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </button>

      <button 
        onClick={() => handleClick("sync_analytics")}
        disabled={loadingAction === "sync_analytics"}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-muted transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-purple-500" /> 
          <span className="truncate">Sync Analytics</span>
        </div>
        {loadingAction === "sync_analytics" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </button>
    </div>
  );
}
