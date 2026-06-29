'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home, Ghost } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry 
    console.error("Critical System Failure:", error);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
       Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <main className="relative min-h-screen flex items-center justify-center p-6 bg-[#0B0C10] text-slate-100 overflow-hidden">
          
          {/* Animated Background Elements */}
          <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
          
          <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
            
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse" />
               <div className="relative w-32 h-32 bg-slate-900 border-2 border-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                 <AlertCircle className="w-16 h-16 text-red-500" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-slate-100 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                 System Halt
               </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-tight italic uppercase">
                Structural <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Broken Link</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-md mx-auto font-medium">
                A critical exception occurred that interrupted the platform's core loop. We've captured the telemetry for investigation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => reset()} 
                className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-slate-200 transition-all active:scale-95 font-black text-base shadow-xl"
              >
                <RefreshCcw className="w-5 h-5 mr-3" /> Attempt Reconnect
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline" 
                className="h-14 px-10 rounded-2xl border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-all font-bold text-base text-slate-300"
              >
                <Home className="w-5 h-5 mr-3" /> Return to Base
              </Button>
            </div>

            <div className="pt-12 flex items-center justify-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
               <Ghost className="w-4 h-4 opacity-50" />
               <span>Toollix Core v3.0</span>
            </div>
          </div>

          {/* Noise overlay */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] contrast-200" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        </main>
      </body>
    </html>
  );
}
