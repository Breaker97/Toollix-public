"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Sword, 
  Moon, 
  Sun, 
  Flame,
  Star,
  Activity,
  History,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAME_DATA = {
  celestial: {
    prefixes: ["Astra", "Caelum", "Ether", "Sol", "Luna", "Orion", "Lyra", "Nova", "Aero", "Zephyr"],
    suffixes: ["is", "ion", "ium", "as", "os", "us", "ia", "elis", "ara", "on"],
    titles: ["The Eternal", "Star-Born", "Light-Bringer", "Void-Walker", "Cosmic Weaver"]
  },
  dark: {
    prefixes: ["Morg", "Shadow", "Necro", "Vile", "Abyss", "Dread", "Void", "Grim", "Bane", "Night"],
    suffixes: ["ath", "rax", "or", "ius", "eth", "on", "ar", "is", "ex", "ul"],
    titles: ["The Corrupted", "Death-Singer", "Night-Stalker", "Abyssal King", "Harbinger of Ruin"]
  },
  elemental: {
    prefixes: ["Pyro", "Hydro", "Terra", "Volt", "Glacio", "Magma", "Storm", "Gale", "Obsidian", "Aura"],
    suffixes: ["thor", "mar", "is", "os", "us", "ax", "en", "el", "ia", "on"],
    titles: ["The Unstoppable", "Earth-Shaker", "Flame-Herald", "Tide-Master", "Wind-Walker"]
  },
  ancient: {
    prefixes: ["Xer", "Thar", "Bel", "Anu", "En", "Mard", "Gil", "Ishtar", "Zus", "Kron"],
    suffixes: ["os", "us", "on", "ia", "ar", "is", "ax", "eth", "or", "as"],
    titles: ["The Ancient", "First-Born", "Time-Keeper", "Wise-One", "Stone-Guardian"]
  }
};

export default function GodlyNameClient() {
  const [style, setStyle] = useState<keyof typeof NAME_DATA>("celestial");
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateNames = () => {
    const data = NAME_DATA[style];
    const newNames: string[] = [];
    
    for (let i = 0; i < 6; i++) {
      const prefix = data.prefixes[Math.floor(Math.random() * data.prefixes.length)];
      const suffix = data.suffixes[Math.floor(Math.random() * data.suffixes.length)];
      const title = data.titles[Math.floor(Math.random() * data.titles.length)];
      
      const fullName = Math.random() > 0.3 ? `${prefix}${suffix}` : `${prefix}${suffix} ${title}`;
      newNames.push(fullName);
    }
    
    setGeneratedNames(newNames);
    setHistory(prev => [...newNames, ...prev].slice(0, 50));
    toast.success("Divine names manifested!");
  };

  const copyToClipboard = (name: string, index: number) => {
    navigator.clipboard.writeText(name);
    setCopiedIndex(index);
    toast.success(`${name} copied!`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <ToolLayout 
      title="Godly Name Generator" 
      description="Manifest powerful, ethereal, and mythological identities. Perfect for fantasy world-building, character creation, or legendary branding."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 space-y-8 sm:space-y-12 overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center bg-zinc-50/30 dark:bg-zinc-900/30 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl">
              
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Manifestation Chamber</h3>
              </div>

              {generatedNames.length === 0 ? (
                <div className="text-center space-y-6">
                   <div className="w-24 h-24 bg-[#c5a059]/10 text-[#c5a059] rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
                      <Star className="w-10 h-10" />
                   </div>
                   <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ready to Manifest</h2>
                      <p className="text-sm text-slate-400 font-medium uppercase tracking-widest italic">Choose a style and invoke the ritual</p>
                   </div>
                   <Button 
                      onClick={generateNames}
                      className="h-16 px-10 rounded-2xl bg-[#c5a059] text-white hover:bg-[#b08d4a] text-xs font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                   >
                      <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                      INVOKE RITUAL
                   </Button>
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-500">
                   {generatedNames.map((name, i) => (
                     <div 
                        key={i}
                        onClick={() => copyToClipboard(name, i)}
                        className="group relative p-6 bg-white dark:bg-zinc-800 rounded-2xl border-2 border-zinc-100 dark:border-zinc-700 hover:border-[#c5a059] transition-all cursor-pointer shadow-sm hover:shadow-xl flex items-center justify-between"
                     >
                        <div className="text-left">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Manifestation {i+1}</p>
                           <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{name}</h4>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-slate-300 group-hover:text-[#c5a059] transition-colors">
                           {copiedIndex === i ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </div>
                     </div>
                   ))}
                   <div className="md:col-span-2 pt-8 flex justify-center">
                      <Button 
                        onClick={generateNames}
                        className="h-14 px-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        MANIFEST AGAIN
                      </Button>
                   </div>
                </div>
              )}
            </div>

            <div className="suite-card rounded-3xl p-8 space-y-6">
               <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <div className="flex items-center gap-3">
                     <History className="w-5 h-5 text-[#c5a059]" />
                     <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Manifestations</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setHistory([])}
                    className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Purge History
                  </Button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {history.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No previous manifestations recorded.</p>
                  ) : (
                    history.map((name, i) => (
                      <span 
                        key={i} 
                        className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700 hover:border-[#c5a059] cursor-pointer transition-all"
                        onClick={() => copyToClipboard(name, -1)}
                      >
                        {name}
                      </span>
                    ))
                  )}
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Divine Style</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Aesthetic Essence</p>
               </div>

               <div className="space-y-3">
                  {[
                    { id: "celestial", label: "Celestial", icon: Sun, desc: "Stars, light, and ethereal beings" },
                    { id: "dark", label: "Shadow", icon: Moon, desc: "Void, abyss, and dark divinity" },
                    { id: "elemental", label: "Elemental", icon: Flame, desc: "Nature, power, and raw forces" },
                    { id: "ancient", label: "Ancient", icon: Sword, desc: "Mythology, stone, and old gods" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setStyle(item.id as any)}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 group",
                        style === item.id 
                          ? "bg-[#c5a059]/5 border-[#c5a059] shadow-lg shadow-[#c5a059]/10" 
                          : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 hover:border-[#c5a059]/30"
                      )}
                    >
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                         style === item.id ? "bg-[#c5a059] text-white" : "bg-zinc-50 dark:bg-zinc-900 text-slate-400 group-hover:text-[#c5a059]"
                       )}>
                          <item.icon className="w-5 h-5" />
                       </div>
                       <div>
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            style === item.id ? "text-slate-900 dark:text-white" : "text-slate-500"
                          )}>{item.label}</p>
                          <p className="text-[9px] text-slate-400 italic leading-none">{item.desc}</p>
                       </div>
                    </button>
                  ))}
               </div>
            </div>

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Lore Algorithm</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Combines sacred prefixes, suffixes, and divine titles using linguistic patterns found in mythology and epic fantasy.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
