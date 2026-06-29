"use client";

import { Shield, Clock, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LegalHeaderProps {
  title: string;
  displayDate: string;
}

export function LegalHeader({ title, displayDate }: LegalHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          <div className="bg-emerald-50 dark:bg-emerald-950 p-2 sm:p-2.5 rounded-xl shrink-0 border border-emerald-100 dark:border-emerald-900 shadow-sm">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-xl font-black tracking-tight text-slate-900 uppercase italic truncate">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xs:inline">Updated</span> {displayDate}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="outline"
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-bold transition-all"
          >
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.print()}
            size="icon"
            className="sm:hidden w-8 h-8 rounded-lg border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
