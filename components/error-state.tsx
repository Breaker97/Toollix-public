import React from "react";
import { AlertCircle, AlertTriangle, Info, XCircle, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  variant?: "error" | "warning" | "info" | "critical";
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title,
  message,
  variant = "error",
  onRetry,
  className
}: ErrorStateProps) {
  const configs = {
    error: {
      icon: XCircle,
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-600 dark:text-red-400",
      title: title || "Operation Failed"
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      title: title || "Attention Required"
    },
    info: {
      icon: Info,
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      title: title || "Information"
    },
    critical: {
      icon: AlertCircle,
      bg: "bg-red-600/10",
      border: "border-red-600/30",
      text: "text-red-700 dark:text-red-400",
      title: title || "Critical Error"
    }
  };

  const config = configs[variant];
  const Icon = config.icon;

  return (
    <div className={cn(
      "p-6 rounded-3xl border animate-in fade-in slide-in-from-top-4 duration-500",
      config.bg,
      config.border,
      className
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("p-2 rounded-xl bg-background shadow-sm border border-border/40", config.text)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className={cn("font-black text-sm uppercase tracking-tight", config.text)}>
            {config.title}
          </h4>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            {message}
          </p>
          {onRetry && (
            <div className="pt-3">
              <Button 
                onClick={onRetry} 
                variant="outline" 
                size="sm" 
                className="h-9 px-4 rounded-xl font-bold bg-background/50 hover:bg-background border-border/40 transition-all text-xs"
              >
                <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
