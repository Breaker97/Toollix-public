"use client";

import { 
  FileText, 
  Image as ImageIcon, 
  QrCode, 
  Terminal, 
  ScanLine, 
  Palette, 
  Mail, 
  Shield,
  Zap,
  Code,
  Scissors,
  FileSignature,
  FileCheck,
  Files,
  BookOpen,
  Crop,
  Layers,
  Hammer,
  Link as LinkIcon,
  Search,
  Lock,
  Activity,
  Hash,
  Braces,
  Webhook,
  BarChart,
  Globe,
  Cpu,
  Database,
  Server
} from "lucide-react";

const icons = [
  // Area 1: Top / Hero
  { icon: FileText, top: '5%', left: '5%', size: 48, anim: 'animate-sway', delay: '0s', dur: '15s', color: 'text-orange-500' },
  { icon: FileCheck, top: '2%', left: '45%', size: 40, anim: 'animate-drift', delay: '2s', dur: '20s', color: 'text-orange-400' },
  { icon: Palette, top: '5%', left: '75%', size: 38, anim: 'animate-pulse-slow', delay: '2s', dur: '13s', color: 'text-purple-500' },
  { icon: Code, top: '20%', left: '20%', size: 46, anim: 'animate-drift', delay: '2.5s', dur: '17s', color: 'text-indigo-500' },
  { icon: ScanLine, top: '8%', left: '15%', size: 42, anim: 'animate-sway', delay: '4s', dur: '16s', color: 'text-sky-600' },
  { icon: Shield, top: '35%', left: '8%', size: 42, anim: 'animate-pulse-slow', delay: '0.5s', dur: '12s', color: 'text-indigo-600' },
  { icon: Zap, top: '45%', left: '45%', size: 48, anim: 'animate-sway', delay: '4s', dur: '10s', color: 'text-yellow-500' },

  // Area 2: Transition
  { icon: Terminal, top: '48%', left: '88%', size: 54, anim: 'animate-sway', delay: '6s', dur: '18s', color: 'text-primary' },
  { icon: Server, top: '42%', left: '70%', size: 46, anim: 'animate-drift', delay: '2s', dur: '21s', color: 'text-slate-600' },
  { icon: Globe, top: '55%', left: '95%', size: 40, anim: 'animate-drift', delay: '0s', dur: '22s', color: 'text-violet-500' },

  // Area 3: Tool Catalog
  { icon: Files, top: '75%', left: '10%', size: 44, anim: 'animate-sway', delay: '3s', dur: '18s', color: 'text-orange-600' },
  { icon: Scissors, top: '82%', left: '55%', size: 42, anim: 'animate-drift', delay: '5s', dur: '19s', color: 'text-pink-500' },
  { icon: Layers, top: '78%', left: '90%', size: 48, anim: 'animate-sway', delay: '0s', dur: '15s', color: 'text-emerald-600' },
  { icon: QrCode, top: '92%', left: '80%', size: 44, anim: 'animate-drift', delay: '2s', dur: '20s', color: 'text-zinc-500' },
  { icon: ImageIcon, top: '72%', left: '22%', size: 52, anim: 'animate-drift', delay: '4s', dur: '22s', color: 'text-emerald-500' },
];

export function FloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.15] z-0">
      {icons.map((item, idx) => {
        const Icon = item.icon;
        // Optimization: Hidden on mobile for most icons to reduce CPU/GPU load
        // We only keep the most prominent ones for mobile
        const isProminent = idx % 4 === 0;

        return (
          <div 
            key={idx}
            className={`absolute ${item.anim} ${item.color} ${!isProminent ? 'hidden md:block' : ''}`}
            style={{ 
              top: item.top, 
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.dur,
              willChange: 'transform' // Trigger GPU acceleration
            }}
          >
            <Icon size={item.size} strokeWidth={1} />
          </div>
        );
      })}
    </div>
  );
}
