"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ToolIcon, TOOL_ICON_MAP, type SingleIcon } from "@/lib/tool-icons";
import { ALL_TOOLS, CATEGORIES, type Tool } from "@/lib/tools-data";
import { Sparkles, ArrowRight, Zap, LayoutGrid, FileText, ImageIcon, Terminal, QrCode, Palette, Link as LinkIcon, Activity } from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  all: LayoutGrid,
  pdf: FileText,
  image: ImageIcon,
  dev: Terminal,
  qr: QrCode,
  color: Palette,
  marketing: LinkIcon,
  generators: Sparkles,
  calculators: Activity
};

export function ToolsGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramMapValue: Record<string, string> = Object.fromEntries(
    CATEGORIES.map(c => [c.slug, c.value])
  );

  const initialCategory = (() => {
    const param = searchParams.get("cat");
    return param ? (paramMapValue[param] ?? "all") : "all";
  })();

  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const handleCategoryChange = (catValue: string) => {
    setActiveCategory(catValue);
    const cat = CATEGORIES.find(c => c.value === catValue);
    if (catValue === "all") router.replace("/", { scroll: false });
    else router.replace(`/?cat=${cat?.slug}`, { scroll: false });
  };

  const filteredTools = activeCategory === "all"
    ? ALL_TOOLS
    : ALL_TOOLS.filter(t => t.category === activeCategory);

  const grouped = activeCategory === "all"
    ? CATEGORIES.slice(1).reduce((acc, cat) => {
        const tools = ALL_TOOLS.filter(t => t.category === cat.value);
        if (tools.length) acc[cat.value] = tools;
        return acc;
      }, {} as Record<string, Tool[]>)
    : null;

  return (
    <div className="w-full">
    <div className="w-full max-w-7xl mx-auto pb-20 pt-2 px-4">
      
      {/* Category Filter Bar */}
      <div className="flex w-full overflow-x-auto no-scrollbar pt-4 pb-12 px-0 flex-nowrap md:justify-center gap-2 snap-x snap-proximity md:snap-none">
          {CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat.slug] || LayoutGrid;
            const isActive = activeCategory === cat.value;
            
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`shrink-0 px-4 py-2.5 min-h-[40px] rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all snap-center flex items-center gap-2 border ${
                  isActive
                    ? "bg-[#c5a059] text-white border-[#c5a059] shadow-lg shadow-[#c5a059]/30 sm:scale-105"
                    : "bg-white text-zinc-500 hover:text-zinc-900 border-zinc-100 shadow-sm md:hover:bg-zinc-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#c5a059]"}`} />
                {cat.label}
              </button>
            );
          })}
      </div>

      {grouped ? (
        <div className="space-y-20">
          {Object.entries(grouped).map(([catName, tools]) => (
            <div key={catName} className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#333333]">{catName}</h3>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tools.map((tool) => (
                  <ToolCard 
                    key={tool.href} 
                    tool={tool} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard 
              key={tool.href} 
              tool={tool}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const slug = tool.href.split("/").pop() || "";
  const iconDef = TOOL_ICON_MAP[slug] ?? null;

  const isNew = tool.createdAt
    ? (Date.now() - new Date(tool.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000
    : false;

  // Generate a unique subtle color bias for each tool
  const tints = ["#ef4444", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#6366f1", "#06b6d4", "#14b8a6", "#f97316", "#d946ef"];
  const charSum = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const uniqueTint = tints[charSum % tints.length];

  return (
    <Link 
      href={tool.href} 
      className="relative group block rounded-[32px] p-4 sm:p-8 border border-zinc-200 transition-all duration-500 hover:border-[#c5a059] hover:shadow-[0_45px_90px_-20px_rgba(197,160,89,0.25)] hover:-translate-y-2 overflow-hidden h-full flex flex-col active:scale-[0.98]"
      style={{ 
        background: `linear-gradient(135deg, #ffffff 0%, ${uniqueTint}10 100%)`,
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.06)"
      }}
    >
      {isNew && (
        <div className="absolute top-0 left-0 z-20 px-3 py-1 sm:px-4 sm:py-2 bg-[#c5a059] rounded-tl-[32px] rounded-br-2xl flex items-center gap-1.5 shadow-sm">
          <Sparkles size={10} className="text-white fill-white" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">New</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 mb-6">
        {iconDef?.type === "convert" ? (
          <>
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm border border-zinc-200/50" style={{ background: iconDef.fromBg }}>
              <iconDef.from className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} style={{ color: iconDef.fromColor }} />
            </div>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-[#c5a059] transition-colors shrink-0" />
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm border border-zinc-200/50" style={{ background: iconDef.toBg }}>
              <iconDef.to className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} style={{ color: iconDef.toColor }} />
            </div>
          </>
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm border border-zinc-200/50" style={{ background: iconDef?.bg ?? "#fef3c7" }}>
            {iconDef ? (
              <iconDef.icon className="w-7 h-7 sm:w-9 sm:h-9" strokeWidth={1.5} style={{ color: (iconDef as SingleIcon).color }} />
            ) : (
              <Zap className="w-7 h-7 sm:w-9 sm:h-9 text-amber-500" strokeWidth={1.5} />
            )}
          </div>
        )}
      </div>

      <div className="text-center flex-1">
        <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight group-hover:text-[#c5a059] transition-colors">{tool.title}</h3>
        <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2">{tool.description}</p>
        {tool.proOnly && (
          <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-600 px-2 py-0.5 bg-amber-50 rounded-full border border-amber-100">
            <Sparkles className="w-2.5 h-2.5" /> Pro
          </span>
        )}
      </div>
    </Link>
  );
}
