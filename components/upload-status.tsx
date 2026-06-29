"use client";

import { formatSpeed, formatTime, type UploadProgress, type UploadStatus } from "@/lib/upload";
import { Loader2, Zap, Clock, CheckCircle2, AlertCircle, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadStatusProps {
  status: UploadStatus;
  progress: UploadProgress;
  fileName?: string;
  statusText?: string;
  className?: string;
}

export function UploadStatusDisplay({
  status,
  progress,
  fileName,
  statusText,
  className
}: UploadStatusProps) {
  if (status === "idle") return null;

  const isUploading = status === "uploading";
  const isProcessing = status === "processing";
  const isDone = status === "done";
  const isError = status === "error";

  return (
    <div className={cn(
      "w-full suite-card rounded-2xl p-5 sm:p-6 relative overflow-hidden",
      isError && "!border-red-200 dark:!border-red-900/50 !bg-red-50 dark:!bg-red-950/20",
      isDone && "!border-emerald-200 dark:!border-emerald-900/50",
      className
    )}>
      <div className="space-y-4">

        {/* Header Row: Phase + Speed */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
              isUploading && "bg-blue-50 dark:bg-blue-900/30 text-blue-500",
              isProcessing && "bg-violet-50 dark:bg-violet-900/30 text-violet-500",
              isDone && "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500",
              isError && "bg-red-50 dark:bg-red-900/30 text-red-500",
            )}>
              {isUploading && <ArrowUp className="w-4 h-4 animate-bounce" />}
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              {isDone && <CheckCircle2 className="w-4 h-4" />}
              {isError && <AlertCircle className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {isUploading ? "Uploading" : 
                 isProcessing ? "Processing" : 
                 isDone ? "Complete" : "Failed"}
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate max-w-[180px] sm:max-w-[240px]">
                {fileName || "Your file"}
              </p>
            </div>
          </div>

          {/* Live Speed + ETA — only during upload */}
          {isUploading && (
            <div className="text-right shrink-0 animate-in fade-in duration-300">
              <div className="flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                <Zap className="w-3.5 h-3.5" /> {formatSpeed(progress.speed)}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums justify-end mt-0.5">
                <Clock className="w-2.5 h-2.5" /> {formatTime(progress.timeLeft ?? 0)} left
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {isUploading ? "Upload Progress" : isProcessing ? "Server Processing" : isDone ? "Completed" : "Error"}
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-zinc-300">
              {isProcessing ? (
                <span className="flex items-center gap-1">100<span className="text-violet-500 animate-pulse">%</span></span>
              ) : isDone ? "100%" : `${progress.percent}%`}
            </span>
          </div>
          
          <div className="relative h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-300 ease-out",
                isUploading && "bg-blue-500",
                isProcessing && "bg-violet-500",
                isDone && "bg-emerald-500",
                isError && "bg-red-500",
              )}
              style={{ 
                width: isProcessing || isDone ? "100%" : `${progress.percent}%`,
              }}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer" />
              )}
            </div>
          </div>
        </div>

        {/* Phase-specific messages */}
        {isProcessing && (
          <p className="text-xs text-violet-500 dark:text-violet-400 flex items-center gap-2 animate-in fade-in duration-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            {statusText || "Server is processing your file. This may take a moment..."}
          </p>
        )}
        {isDone && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in duration-500">
            ✓ Ready for download
          </p>
        )}
      </div>
    </div>
  );
}
