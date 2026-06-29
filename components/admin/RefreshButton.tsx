"use client";

import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    
    // Simulate a brief delay for visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300",
        "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 active:scale-95",
        isRefreshing && "opacity-70 cursor-not-allowed"
      )}
      title="Refresh Admin Data"
    >
      <RefreshCcw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
      <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
    </button>
  );
}
