"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, ArrowLeftRight, Zap, Hash, Smartphone, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CopiedKey = string | null;

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b]
    .map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
    .join("").toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function HexRgbClient() {
  const [mode, setMode] = useState<"hex-to-rgb" | "rgb-to-hex">("hex-to-rgb");
  const [hex, setHex] = useState("#c5a059");
  const [rVal, setRVal] = useState("197");
  const [gVal, setGVal] = useState("160");
  const [bVal, setBVal] = useState("89");
  const [copiedKey, setCopiedKey] = useState<CopiedKey>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
    toast.success(`Copied: ${text}`);
  };

  // HEX → RGB
  const hexResult = hexToRgb(hex);
  const hsl = hexResult ? rgbToHsl(hexResult.r, hexResult.g, hexResult.b) : null;

  // RGB → HEX
  const r = parseInt(rVal) || 0;
  const g = parseInt(gVal) || 0;
  const b = parseInt(bVal) || 0;
  const rgbHexResult = rgbToHex(r, g, b);
  const rgbHsl = rgbToHsl(r, g, b);

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copy(text, id)}
      className="ml-2 shrink-0 p-3 rounded-xl hover:bg-[#c5a059]/10 transition-all text-muted-foreground hover:text-[#c5a059] border border-transparent hover:border-[#c5a059]/20"
    >
      {copiedKey === id ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
    </button>
  );

  return (
    <ToolLayout
      title="Spectrum Transcoder"
      description="Bi-directional color matrix conversion. Transcode between HEX, RGB, and HSL formats with zero-loss precision and instant rendering."
      fullWidth={true}
    >
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[420px_1fr] lg:gap-16 items-start w-full overflow-x-hidden">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:sticky lg:top-28 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            
            {/* Phase 01: Protocol Switch */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 space-y-10 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Protocol Matrix</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Transcoder Mode</p>
               </div>

               <div className="flex bg-zinc-50 dark:bg-zinc-800/80 p-2 rounded-[2rem] shadow-inner-soft relative z-10">
                  <button
                    onClick={() => setMode("hex-to-rgb")}
                    className={cn(
                      "flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                      mode === "hex-to-rgb" ? "bg-[#c5a059] text-white shadow-xl scale-[1.02]" : "text-muted-foreground/40 hover:text-[#c5a059]"
                    )}
                  >HEX → RGB</button>
                  <button
                    onClick={() => setMode("rgb-to-hex")}
                    className={cn(
                      "flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                      mode === "rgb-to-hex" ? "bg-[#c5a059] text-white shadow-xl scale-[1.02]" : "text-muted-foreground/40 hover:text-[#c5a059]"
                    )}
                  >RGB → HEX</button>
               </div>
            </div>

            {/* Support Info: Ecosystem */}
            <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-10 shadow-xl rounded-[2.5rem] sm:rounded-[3.5rem] space-y-10 relative overflow-hidden group border border-[#c5a059]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                     <ArrowLeftRight className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Chroma Registry</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Synced</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {[
                    { icon: Hash, label: "Hexadecimal", detail: "Standard" },
                    { icon: Palette, label: "RGB Matrix", detail: "Additive" },
                    { icon: Smartphone, label: "HSL Space", detail: "Perceptual" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-[#c5a059]/10 group/item hover:bg-[#c5a059]/5 transition-all">
                       <div className="flex items-center gap-4">
                          <item.icon className="w-4 h-4 text-[#c5a059] opacity-40 group-hover/item:opacity-100" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400">{item.label}</span>
                       </div>
                       <span className="text-[9px] font-black text-[#c5a059] uppercase italic opacity-40">{item.detail}</span>
                    </div>
                  ))}
               </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Studio Workspace */}
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] sm:rounded-[3.5rem] min-h-[600px] lg:min-h-[800px] p-6 sm:p-10 lg:p-16 flex flex-col relative shadow-2xl overflow-hidden">
               
               <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                  <div className="flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Conversion Feed</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059] opacity-80">Extraction Matrix</p>
                  </div>
                  <div className="bg-[#c5a059]/10 text-[#c5a059] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" /> Live Stream
                  </div>
               </div>

               <div className="space-y-12">
                  {mode === "hex-to-rgb" ? (
                    <div className="space-y-10">
                        {/* HEX Input Studio */}
                        <div className="flex flex-col md:flex-row items-center gap-10 bg-zinc-50 dark:bg-zinc-800/80 p-10 rounded-[3.5rem] border border-zinc-100 dark:border-zinc-800 shadow-inner-soft group">
                           <div className="relative shrink-0">
                               <input
                                 type="color"
                                 value={hexResult ? hex : "#000000"}
                                 onChange={e => setHex(e.target.value.toUpperCase())}
                                 className="w-32 h-32 rounded-[2.5rem] border-4 border-white dark:border-zinc-700 p-0 cursor-pointer bg-transparent shadow-2xl transition-transform group-hover:scale-105 duration-700"
                               />
                               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center border-2 border-[#c5a059]/20 shadow-xl">
                                  <Hash className="w-5 h-5 text-[#c5a059]" />
                               </div>
                           </div>
                           <div className="flex-1 space-y-4 w-full">
                              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-4 italic">Inbound HEX Vector</label>
                              <Input
                                value={hex}
                                onChange={e => setHex(e.target.value.toUpperCase())}
                                maxLength={7}
                                placeholder="#3B82F6"
                                className="font-mono text-4xl h-24 bg-white dark:bg-zinc-900 border-none rounded-[2rem] uppercase tracking-widest text-[#c5a059] font-black text-center shadow-sm focus-visible:ring-4 focus-visible:ring-[#c5a059]/10 transition-all"
                              />
                           </div>
                        </div>

                        {/* HEX Results Matrix */}
                        {hexResult ? (
                          <div className="grid sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {[
                              { label: "RGB Matrix", value: `rgb(${hexResult.r}, ${hexResult.g}, ${hexResult.b})`, id: "rgb" },
                              { label: "Atomic Flow", value: `${hexResult.r} / ${hexResult.g} / ${hexResult.b}`, id: "rgb-raw" },
                              { label: "HSL Space", value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "—", id: "hsl" },
                            ].map(item => (
                              <div key={item.id} className="p-8 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] space-y-4 shadow-sm hover:shadow-xl transition-all group/card">
                                <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">{item.label}</p>
                                <div className="flex items-center justify-between gap-4">
                                  <code className="text-sm font-mono font-black break-all text-[#c5a059] opacity-80">{item.value}</code>
                                  <CopyBtn text={item.value} id={item.id} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 bg-red-500/10 border-2 border-red-500/20 rounded-[2.5rem] text-center">
                             <p className="text-red-500 text-xs font-black uppercase tracking-widest">Protocol Failure: Invalid HEX Syntax</p>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="space-y-10">
                        {/* RGB Inputs Studio */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {[
                            { label: "Red (R)", val: rVal, set: setRVal, color: "text-red-500" },
                            { label: "Green (G)", val: gVal, set: setGVal, color: "text-emerald-500" },
                            { label: "Blue (B)", val: bVal, set: setBVal, color: "text-blue-500" },
                          ].map(ch => (
                            <div key={ch.label} className="bg-zinc-50 dark:bg-zinc-800/80 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 space-y-6 shadow-inner-soft group/rgb">
                              <label className={cn("text-[10px] font-black uppercase tracking-[0.4em] italic leading-none ml-2", ch.color)}>{ch.label}</label>
                              <Input
                                type="number"
                                min={0}
                                max={255}
                                value={ch.val}
                                onChange={e => ch.set(e.target.value)}
                                className="font-mono text-4xl h-20 text-center bg-white dark:bg-zinc-900 border-none rounded-2xl font-black text-[#c5a059] shadow-sm focus-visible:ring-4 focus-visible:ring-[#c5a059]/10"
                              />
                              <input
                                type="range"
                                min={0}
                                max={255}
                                value={parseInt(ch.val) || 0}
                                onChange={e => ch.set(e.target.value)}
                                className="w-full h-2 accent-[#c5a059] cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                              />
                            </div>
                          ))}
                        </div>

                        {/* RGB Results Matrix */}
                        <div className="grid sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                          {[
                            { label: "HEX Transcode", value: rgbHexResult, id: "hex-out" },
                            { label: "RGB Matrix", value: `rgb(${r}, ${g}, ${b})`, id: "rgb-out" },
                            { label: "HSL Space", value: `hsl(${rgbHsl.h}, ${rgbHsl.s}%, ${rgbHsl.l}%)`, id: "hsl-out" },
                          ].map(item => (
                            <div key={item.id} className="p-8 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] space-y-4 shadow-sm hover:shadow-xl transition-all">
                              <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">{item.label}</p>
                              <div className="flex items-center justify-between gap-4">
                                <code className="text-sm font-mono font-black break-all text-[#c5a059] opacity-80">{item.value}</code>
                                <CopyBtn text={item.value} id={item.id} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Live Swatch Monitor */}
                        <div
                          className="w-full h-32 rounded-[2.5rem] shadow-2xl border-8 border-white dark:border-zinc-800 transition-colors duration-1000 relative overflow-hidden group"
                          style={{ backgroundColor: `rgb(${r},${g},${b})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-black uppercase tracking-[1em] text-white/40 drop-shadow-lg">LIVE MONITOR</span>
                            </div>
                        </div>
                    </div>
                  )}
               </div>

               {/* Footer Branding Overlay */}
               <div className="absolute bottom-12 right-12 flex items-center gap-4 hidden sm:flex">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none mb-1">Session Protocol</p>
                        <p className="text-[10px] font-mono font-black text-[#c5a059] uppercase leading-none">{Math.random().toString(36).substring(7)}</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
                    <Zap className="w-5 h-5 text-[#c5a059]" />
               </div>
            </div>
        </div>
      </div>
      
      <style jsx global>{`
        .shadow-inner-soft {
           box-shadow: inset 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </ToolLayout>
  );
}
