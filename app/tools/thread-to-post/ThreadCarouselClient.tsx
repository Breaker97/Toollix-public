"use client";

import { useState, useRef } from 'react';
import { Download, Layout, Palette, Type, User, Loader2, Image as ImageIcon, Plus, Layers, Sparkles, RefreshCw, X, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { ToolLayout } from "@/components/tool-layout";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "midnight", name: "Midnight Modern", bg: "bg-[#0A0A0A]", text: "text-white", accent: "#c5a059", border: "border-white/10" },
  { id: "royal", name: "Royal Noir", bg: "bg-black", text: "text-[#c5a059]", accent: "#c5a059", border: "border-[#c5a059]/20" },
  { id: "brand", name: "Toollix White", bg: "bg-white", text: "text-black", accent: "#c5a059", border: "border-black/10" },
  { id: "neon", name: "Neon Pulse", bg: "bg-[#050505]", text: "text-white", accent: "#f0abfc", border: "border-fuchsia-500/20" },
  { id: "indigo", name: "Vibrant Indigo", bg: "bg-gradient-to-br from-indigo-600 to-violet-700", text: "text-white", accent: "#ffffff", border: "border-white/20" },
  { id: "sunset", name: "Golden Hour", bg: "bg-gradient-to-br from-orange-500 to-rose-600", text: "text-white", accent: "#ffffff", border: "border-white/20" },
  { id: "ghost", name: "Ghost Minimal", bg: "bg-zinc-50", text: "text-zinc-900", accent: "#3b82f6", border: "border-zinc-200" },
  { id: "emerald", name: "Deep Emerald", bg: "bg-[#064e3b]", text: "text-emerald-50", accent: "#10b981", border: "border-white/10" },
  { id: "blood", name: "Blood Moon", bg: "bg-[#1a0000]", text: "text-red-50", accent: "#ef4444", border: "border-red-900/50" },
  { id: "nordic", name: "Nordic Frost", bg: "bg-[#f8fafc]", text: "text-[#1e293b]", accent: "#0ea5e9", border: "border-blue-100" },
  { id: "custom", name: "Custom Studio", bg: "bg-white", text: "text-black", accent: "#c5a059", border: "border-black/10" },
];

export default function ThreadCarouselClient() {
  const [handle, setHandle] = useState("@yourhandle");
  const [name, setName] = useState("Your Name");
  const [content, setContent] = useState("Hello world! Write your thread here.\n\nSplit slides using a double newline.\n\nEvery block becomes a high-quality 1080x1080 slide.");
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [customBgColor, setCustomBgColor] = useState("#c5a059");
  const [customTextColor, setCustomTextColor] = useState("#000000");
  const [accentColor, setAccentColor] = useState(THEMES[0].accent);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const slides = content.split('\n\n').filter(s => s.trim().length > 0);

  const handleExport = async () => {
    if (slides.length === 0) return;
    setExporting(true);
    setProgress(0);
    try {
      const zip = new JSZip();
      for (let i = 0; i < slides.length; i++) {
        const slideEl = slideRefs.current[i];
        if (slideEl) {
          // Make temporarily visible for capture if needed, though hidden absolute usually works
          slideEl.style.display = 'flex';
          const dataUrl = await toPng(slideEl, { pixelRatio: 2, quality: 1.0 });
          slideEl.style.display = 'none';
          const base64Data = dataUrl.split(',')[1];
          zip.file(`slide-${i + 1}.png`, base64Data, { base64: true });
        }
        setProgress(Math.round(((i + 1) / slides.length) * 100));
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "carousel-pack-toollix.zip";
      link.click();
      toast.success(`Successfully generated ${slides.length} slides!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to export slides.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <ToolLayout 
      title="Thread to Carousel" 
      description="Elite social storytelling engine. Convert raw text into high-fidelity premium image packs for Instagram and LinkedIn."
      fullWidth
    >
      <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Slides Preview Area (The Stage) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative group rounded-[3rem] p-4 sm:p-12 overflow-hidden bg-zinc-950 border-2 border-zinc-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col min-h-[800px]">
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#c5a059]/5 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
              
              <div className="relative flex items-center justify-between border-b border-zinc-800/50 pb-8 mb-12">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 leading-none">Creative Stage</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059]">Visual Manifestation</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-3">
                       <div className="w-2 h-2 bg-[#c5a059] rounded-full animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">{slides.length} Vectors Loaded</span>
                    </div>
                 </div>
              </div>

              <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12 py-12 px-4 max-h-[1000px] overflow-y-auto no-scrollbar mask-fade">
                 {slides.map((slide, idx) => (
                    <div key={idx} className="relative group w-full">
                       <div className="absolute -inset-6 bg-[#c5a059]/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                       
                       <div className="relative space-y-4">
                          <div className="flex items-center justify-between px-4 opacity-40 group-hover:opacity-100 transition-opacity">
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a059]">Slide {idx + 1}</span>
                             </div>
                             <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">HD</span>
                          </div>

                          {/* Preview Card (Responsive Grid Item) */}
                          <div 
                             className={cn(
                                 "relative w-full aspect-square rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border transition-all duration-700 overflow-hidden group-hover:scale-[1.05] group-hover:border-[#c5a059]/30",
                                 selectedTheme.id === 'custom' ? 'border-white/10' : selectedTheme.border
                             )}
                             style={{ 
                                 backgroundColor: selectedTheme.id === 'custom' ? customBgColor : undefined,
                                 background: selectedTheme.id === 'custom' ? undefined : (selectedTheme.bg.startsWith('bg-[') ? selectedTheme.bg.slice(4, -1) : undefined),
                                 color: selectedTheme.id === 'custom' ? customTextColor : (selectedTheme.text.includes('white') || selectedTheme.text.includes('emerald-50') || selectedTheme.text.includes('red-50') ? 'white' : (selectedTheme.id === 'royal' ? '#c5a059' : 'black'))
                             }}
                          >
                             <div className="h-full w-full p-[12%] flex flex-col">
                                <div className="flex items-center gap-3 mb-[15%]">
                                   <div className="w-[18%] aspect-square rounded-xl border flex items-center justify-center shadow-xl overflow-hidden shrink-0" style={{ borderColor: accentColor + '33' }}>
                                      <User className="w-[60%] h-[60%]" style={{ color: accentColor }} />
                                   </div>
                                   <div className="space-y-0.5 min-w-0">
                                      <h4 className="text-[clamp(0.7rem,1.5vw,1rem)] font-black italic uppercase tracking-tighter truncate">{name}</h4>
                                      <p className="text-[clamp(0.5rem,1vw,0.7rem)] font-black opacity-40 uppercase tracking-[0.2em] truncate" style={{ color: accentColor }}>{handle}</p>
                                   </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                   <p className="text-[clamp(0.7rem,1.4vw,1.1rem)] font-black leading-tight tracking-tighter whitespace-pre-wrap italic opacity-90">
                                      {slide}
                                   </p>
                                </div>

                                <div className="mt-auto flex items-center justify-between opacity-20 border-t border-current pt-[8%]">
                                   <div className="flex items-center gap-2">
                                      <Layers className="w-[clamp(0.6rem,1.5vw,0.9rem)] h-[clamp(0.6rem,1.5vw,0.9rem)]" />
                                      <span className="text-[clamp(0.6rem,1.5vw,0.9rem)] font-black">{idx + 1} / {slides.length}</span>
                                   </div>
                                   <span className="text-[clamp(0.5rem,1vw,0.7rem)] font-black uppercase tracking-[0.3em] italic">toollix.io</span>
                                </div>
                             </div>
                          </div>

                          {/* Hidden Export Engine (1080x1080) */}
                          <div 
                             ref={el => { slideRefs.current[idx] = el; }}
                             className="absolute top-0 left-0 hidden flex-col p-20"
                             style={{ 
                                 width: '1080px', 
                                 height: '1080px', 
                                 backgroundColor: selectedTheme.id === 'custom' ? customBgColor : undefined,
                                 background: selectedTheme.id === 'custom' ? undefined : (selectedTheme.bg.startsWith('bg-[') ? selectedTheme.bg.slice(4, -1) : undefined),
                                 color: selectedTheme.id === 'custom' ? customTextColor : (selectedTheme.text.includes('white') || selectedTheme.text.includes('emerald-50') || selectedTheme.text.includes('red-50') ? 'white' : (selectedTheme.id === 'royal' ? '#c5a059' : 'black'))
                             }}
                          >
                             <div className="flex items-center gap-8 mb-20">
                                <div className="w-24 h-24 rounded-[2rem] border-4 flex items-center justify-center shadow-2xl shrink-0" style={{ borderColor: accentColor + '33' }}>
                                   <User className="w-12 h-12" style={{ color: accentColor }} />
                                </div>
                                <div className="space-y-1">
                                   <h4 className="text-5xl font-black italic uppercase tracking-tighter">{name}</h4>
                                   <p className="text-2xl font-black opacity-50 uppercase tracking-[0.2em]" style={{ color: accentColor }}>{handle}</p>
                                </div>
                             </div>
                             <div className="flex-1 flex flex-col justify-center px-4">
                                <p className="text-[5.5rem] font-black leading-[1.02] tracking-tighter whitespace-pre-wrap italic">
                                   {slide}
                                </p>
                             </div>
                             <div className="mt-auto flex items-center justify-between opacity-10 border-t-4 border-current pt-12">
                                <div className="flex items-center gap-6">
                                   <Layers className="w-10 h-10" />
                                   <span className="text-3xl font-black">{idx + 1} / {slides.length}</span>
                                </div>
                                <span className="text-3xl font-black uppercase tracking-[0.3em] italic">toollix.io</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}

                 {slides.length === 0 && (
                    <div className="h-96 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-1000">
                       <div className="relative">
                          <div className="absolute -inset-10 bg-[#c5a059]/5 blur-[60px] rounded-full animate-pulse" />
                          <Sparkles className="w-20 h-20 text-[#c5a059]/20" />
                       </div>
                       <div className="space-y-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-700">Awaiting Signal</p>
                          <p className="text-[9px] font-medium text-zinc-800 uppercase italic tracking-widest">Hydrate the payload to initialize creative output</p>
                       </div>
                    </div>
                 )}
              </div>
            </div>

            {/* Export Deck */}
            <div className="flex flex-col sm:flex-row gap-6">
               <Button 
                  onClick={handleExport}
                  disabled={exporting || slides.length === 0}
                  className="flex-1 h-24 rounded-[2.5rem] bg-[#c5a059] text-white hover:bg-black dark:hover:bg-white dark:hover:text-black text-[14px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(197,160,89,0.3)] group transition-all duration-500"
                >
                  {exporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6 mr-4 group-hover:translate-y-1 transition-transform" />}
                  {exporting ? `SYNTHESIZING ${progress}%` : "EXPORT CAROUSEL PACK"}
                </Button>
                <div className="flex items-center gap-6 px-10 h-24 rounded-[2.5rem] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl">
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Export Count</span>
                      <span className="text-2xl font-black text-[#c5a059] italic uppercase">{slides.length} Slids</span>
                   </div>
                </div>
            </div>
          </div>

          {/* Right Column: Identity Configuration Panel */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[3rem] p-10 space-y-10 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Design Driver</h2>
                  <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic leading-none mt-2">Identity Configuration</p>
               </div>

               <div className="space-y-8">
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 ml-2">
                           <User className="w-3 h-3 text-[#c5a059]" />
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Identity</label>
                        </div>
                        <Input 
                           value={name} 
                           onChange={e => setName(e.target.value)}
                           className="h-16 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border-none font-black text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-[#c5a059]/20 transition-all text-lg italic px-6 shadow-inner"
                           placeholder="Your Name"
                        />
                     </div>
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 ml-2">
                           <Type className="w-3 h-3 text-[#c5a059]" />
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Signal Handle</label>
                        </div>
                        <Input 
                           value={handle} 
                           onChange={e => setHandle(e.target.value)}
                           className="h-16 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border-none font-black text-[#c5a059] focus-visible:ring-2 focus-visible:ring-[#c5a059]/20 transition-all text-lg italic px-6 shadow-inner"
                           placeholder="@handle"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center gap-2 ml-2">
                        <Layers className="w-3 h-3 text-[#c5a059]" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content Stream</label>
                     </div>
                     <Textarea 
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="h-64 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border-none p-8 font-medium text-base resize-none focus-visible:ring-2 focus-visible:ring-[#c5a059]/20 transition-all leading-relaxed shadow-inner"
                        placeholder="Double Enter to split slides..."
                     />
                  </div>

                  {/* Enhanced Themes & Colors */}
                  <div className="space-y-6">
                     <div className="space-y-5">
                        <div className="flex items-center gap-2 ml-2">
                           <Palette className="w-3 h-3 text-[#c5a059]" />
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Studio Aesthetics</label>
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                           {THEMES.map(t => (
                              <button 
                                 key={t.id}
                                 onClick={() => { setSelectedTheme(t); setAccentColor(t.accent); }}
                                 className={cn(
                                    "aspect-square rounded-2xl border-4 transition-all duration-500 hover:scale-110 shadow-lg",
                                    selectedTheme.id === t.id ? "border-[#c5a059] scale-110 shadow-[#c5a059]/20" : "border-transparent opacity-60 hover:opacity-100"
                                 )}
                                 style={{ background: t.bg.startsWith('bg-[') ? t.bg.slice(4, -1) : (t.id === 'midnight' ? '#0A0A0A' : (t.id === 'ghost' ? '#f8fafc' : (t.id === 'royal' ? '#000' : '#fff'))) }}
                                 title={t.name}
                              />
                           ))}
                        </div>
                     </div>

                     {selectedTheme.id === 'custom' && (
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4">
                           <div className="space-y-2">
                              <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-2">BG Color</label>
                              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                                 <input type="color" value={customBgColor} onChange={e => setCustomBgColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                                 <span className="text-[10px] font-mono font-black">{customBgColor}</span>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-2">Text Color</label>
                              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                                 <input type="color" value={customTextColor} onChange={e => setCustomTextColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                                 <span className="text-[10px] font-mono font-black">{customTextColor}</span>
                              </div>
                           </div>
                        </div>
                     )}

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Accent Emphasis</label>
                        <div className="flex flex-wrap gap-3">
                           {["#c5a059", "#6366f1", "#f0abfc", "#ef4444", "#10b981", "#ffffff"].map(c => (
                              <button 
                                 key={c}
                                 onClick={() => setAccentColor(c)}
                                 className={cn(
                                    "w-8 h-8 rounded-full border-2 transition-all hover:scale-125",
                                    accentColor === c ? "border-[#c5a059] scale-125 shadow-lg" : "border-transparent"
                                 )}
                                 style={{ backgroundColor: c }}
                              />
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-8 rounded-[2.5rem] flex flex-col items-center text-center gap-3 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl group hover:border-[#c5a059]/30 transition-all">
                  <Layout className="w-6 h-6 text-[#c5a059] opacity-40 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">1080x1080</span>
               </div>
               <div className="suite-card p-8 rounded-[2.5rem] flex flex-col items-center text-center gap-3 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl group hover:border-[#c5a059]/30 transition-all">
                  <RefreshCw className="w-6 h-6 text-[#c5a059] opacity-40 group-hover:rotate-180 transition-all duration-700" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auto Split</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
