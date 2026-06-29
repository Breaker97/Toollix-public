import { Metadata } from 'next';
import { ShieldAlert, ArrowLeft, Zap, Construction } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Coming Soon - AI Image Enhancer',
  description: 'Our professional AI-powered image upscaling engine is currently undergoing maintenance and upgrades.',
  robots: 'noindex, nofollow',
};

export default function AIUpscalerPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-[#c5a059]/10 rounded-[2rem] flex items-center justify-center border border-[#c5a059]/20 shadow-inner">
             <Zap className="w-10 h-10 text-[#c5a059] animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
             <Construction className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Status: Restricted</span>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic text-zinc-900 dark:text-white leading-none">AI IMAGE<br/>ENHANCER</h1>
           </div>
           
           <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 rounded-[1.5rem] relative overflow-hidden group">
              <p className="text-xs font-medium text-muted-foreground leading-relaxed relative z-10">
                 Our professional high-resolution upscaling engine is currently undergoing maintenance and node upgrades. Direct access is temporarily restricted to ensure stability.
              </p>
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#c5a059_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
           </div>
        </div>

        <div className="flex flex-col gap-3">
           <Link href="/">
              <Button className="w-full h-14 bg-zinc-900 text-white hover:bg-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                 <ArrowLeft className="w-4 h-4" /> RETURN TO PLATFORM
              </Button>
           </Link>
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#c5a059] italic animate-pulse">Coming Soon to Toollix Studio</p>
        </div>
      </div>
    </div>
  );
}
