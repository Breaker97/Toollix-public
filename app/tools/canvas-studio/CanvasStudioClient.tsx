"use client";

import dynamic from "next/dynamic";

const FreeCanvasEditor = dynamic(() => import("./FreeCanvasEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 h-screen w-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Studio...</p>
      </div>
    </div>
  ),
});

export default function CanvasStudioClient() {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans selection:bg-[#c5a059]/30">
      <FreeCanvasEditor />
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet" />
    </div>
  );
}
