import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Sparkles, Ghost, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-[90vh] p-6 text-center overflow-hidden selection:bg-[#c5a059]/20 selection:text-[#c5a059]">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-[#c5a059]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-[#c5a059]/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative mb-16 group">
        {/* Large Background Text with Gold Gradient */}
        <div className="text-[180px] sm:text-[320px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#c5a059]/20 to-transparent select-none tracking-tighter opacity-40 group-hover:opacity-60 transition-opacity duration-1000">
          404
        </div>
        
        {/* Floating Ghost Hub */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="relative w-40 h-40 sm:w-56 sm:h-56 bg-white dark:bg-zinc-950 border-8 border-[#c5a059] rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(197,160,89,0.3)] flex flex-col items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-all duration-700">
             <Ghost className="w-20 h-20 sm:w-24 sm:h-24 text-[#c5a059] animate-bounce transition-transform duration-500 scale-110" />
             <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#c5a059] rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-950">
               <ShieldAlert className="w-6 h-6 text-white" />
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[#c5a059]/5 border border-[#c5a059]/10 text-[#c5a059] text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-sm italic">
            <Sparkles className="w-4 h-4 fill-[#c5a059]/20" /> Dimensional Breach Detected
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-[calc(-0.04em)] text-foreground leading-[1.05]">
            Lost in the <br />
            <span className="text-[#c5a059] italic drop-shadow-sm">Digital Cloud.</span>
          </h1>
        </div>
        
        <p className="text-muted-foreground text-lg sm:text-xl font-bold leading-relaxed max-w-lg mx-auto uppercase tracking-wide opacity-80 italic">
          The module you're looking for has been moved, renamed, or perhaps it never existed in this dimension.
        </p>

        <div className="flex justify-center pt-8">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-72 h-20 rounded-[2rem] font-black text-lg bg-zinc-950 dark:bg-white text-white dark:text-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_40px_80px_-20px_rgba(197,160,89,0.4)] hover:scale-105 active:scale-95 transition-all duration-500 border-none group uppercase tracking-[0.2em]">
              <Home className="w-6 h-6 mr-4 group-hover:scale-125 transition-transform duration-500 text-[#c5a059]" /> warp home
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-24 flex items-center gap-8 text-[#c5a059]/40 font-black text-[9px] uppercase tracking-[0.5em] animate-in fade-in duration-1000">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c5a059]/30" />
        <span className="italic">Toollix Protocol Overload</span>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c5a059]/30" />
      </div>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#c5a059]/20 rounded-full blur-3xl opacity-10 pointer-events-none" />
    </div>
  );
}
