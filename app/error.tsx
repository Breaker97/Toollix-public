'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 bg-amber-500/10 border-2 border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-3xl font-black tracking-tight text-foreground">Something went sideways</h2>
        <p className="text-muted-foreground font-medium leading-relaxed">
           We encountered an unexpected error while processing this request. Our team has been notified.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <Button 
          onClick={() => reset()} 
          size="lg"
          className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Try again
        </Button>
        <Link href="/">
          <Button 
            variant="outline" 
            size="lg"
            className="h-12 px-8 rounded-xl font-bold border-border/60 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </div>

      <div className="mt-12 p-4 bg-muted/30 border border-border/40 rounded-2xl max-w-lg w-full">
         <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Technical Log</span>
         </div>
         <p className="text-[11px] font-mono text-muted-foreground/80 break-all overflow-hidden text-left">
           {error.message || "Unknown error occurred during component mount or data fetch."}
           {error.digest && <span className="block mt-1 opacity-50">Digest: {error.digest}</span>}
         </p>
      </div>
    </div>
  );
}
