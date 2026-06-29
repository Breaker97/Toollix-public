"use client";

import { cn } from "@/lib/utils";
import { formatSpeed } from "@/lib/upload";

export function ProcessingOverlay({ 
  status, 
  progress,
  title,
  subtitle,
  uploadLabel = "Upload",
  engineLabel = "AI Engine"
}: { 
  status: string, 
  progress: any,
  title?: string,
  subtitle?: string,
  uploadLabel?: string,
  engineLabel?: string
}) {
  const isDone = status === "done";
  const isError = status === "error";

  const displayTitle = title || (status === 'uploading' ? 'Uploading' : status === 'processing' ? 'Synthesizing' : isDone ? 'Complete' : isError ? 'Error' : 'Initializing');
  const displaySub = subtitle || (status === 'uploading' ? 'Transmitting data to secure vault...' : 
                     status === 'processing' ? 'AI engine optimizing your manifest...' : 
                     isDone ? 'Transaction finalized successfully.' : 
                     isError ? 'Protocol failed. Please try again.' : 
                     'Establishing secure channel...');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-[3.5rem] py-12 px-6 border border-[#d4af37]/10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Ambient Background Glow */}
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#d4af37]/5 blur-[100px] rounded-full pointer-events-none transition-all duration-1000"
            style={{ 
                width: `${300 + (progress.percent * 2)}px`, 
                height: `${300 + (progress.percent * 2)}px`,
                backgroundColor: isDone ? "rgba(74, 222, 128, 0.1)" : isError ? "rgba(239, 68, 68, 0.1)" : "rgba(212, 175, 55, 0.05)"
            }}
        ></div>

        {/* Circular Animation Header */}
        <div className="flex justify-center mb-10 relative z-10">
            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Outer pulse rings */}
                <div className="absolute w-36 h-36 bg-[#d4af37]/10 rounded-full animate-pulse-ring" style={{ animationDelay: '0s' }}></div>
                <div className="absolute w-36 h-36 bg-[#d4af37]/5 rounded-full animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
                
                {/* Orbits */}
                <div className="absolute w-28 h-28 rounded-full border-2 border-transparent border-t-[#d4af37] animate-spin-slow"></div>
                <div className="absolute w-24 h-24 rounded-full border-2 border-transparent border-t-[#f9e29c] animate-spin-reverse"></div>

                {/* Speaking Dots */}
                <div className="flex gap-2 items-center">
                    {[0, 1, 2, 3].map((i) => (
                        <div 
                            key={i} 
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-500",
                                isDone ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : 
                                isError ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                                "bg-[#d4af37] animate-jump"
                            )}
                            style={{ animationDelay: `${i * 0.15}s`, animationDuration: status === 'processing' ? '0.6s' : '1s' }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>

        {/* Text Info */}
        <div className="mb-10 relative z-10 text-center">
            <h2 className={cn(
                "text-xl font-black uppercase tracking-[0.2em] mb-2 transition-colors",
                isDone ? "text-emerald-500" : isError ? "text-red-500" : "text-[#aa8d2e]"
            )}>
                {displayTitle}
            </h2>
            <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-5">
                {displaySub}
            </p>
        </div>

        {/* Progress Section */}
        <div className="px-4 relative z-10">
            <div className="flex justify-between items-end mb-3">
                <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors",
                    isDone ? "bg-emerald-50 text-emerald-500 border-emerald-200" : 
                    isError ? "bg-red-50 text-red-500 border-red-200" : 
                    "bg-[#f9e29c]/30 text-[#aa8d2e] border-[#d4af37]/20"
                )}>
                    {status === 'uploading' ? uploadLabel : status === 'processing' ? engineLabel : isDone ? 'Verified' : 'Status'}
                </span>
                <span className="text-2xl font-black text-[#aa8d2e] tabular-nums">{progress.percent}%</span>
            </div>
            
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4 p-[1px]">
                <div 
                    className={cn("h-full rounded-full transition-all duration-500", isDone ? "bg-emerald-500" : isError ? "bg-red-500" : "gold-shimmer")}
                    style={{ width: `${progress.percent}%` }}
                ></div>
            </div>

            <div className="flex justify-center items-center gap-2 text-zinc-400 font-mono text-[9px] tracking-widest">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isDone ? "bg-emerald-400" : isError ? "bg-red-400" : "bg-emerald-400")}></div>
                LIVE SPEED: <span className="text-[#aa8d2e] font-black">{formatSpeed(progress.speed)}</span>
            </div>
        </div>

        <style jsx>{`
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
            @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.1; } 100% { transform: scale(1.5); opacity: 0; } }
            @keyframes jump { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-15px); opacity: 1; scale: 1.2; box-shadow: 0 10px 15px rgba(212, 175, 55, 0.4); } }
            @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            
            .animate-spin-slow { animation: spin-slow 3s linear infinite; }
            .animate-spin-reverse { animation: spin-reverse 2s linear infinite; }
            .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .animate-jump { animation: jump 1s infinite ease-in-out; }
            .gold-shimmer { background: linear-gradient(90deg, #aa8d2e, #f9e29c, #aa8d2e); background-size: 200% 100%; animation: shimmer 2s infinite linear; }
        `}</style>
      </div>
    </div>
  );
}
