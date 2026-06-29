import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Layers, Scissors, FileDown, FileImage, FileText,
  Lock, KeyRound, PenLine, ScanLine, AlignJustify,
  PackageSearch, Maximize2, Crop, ArrowLeftRight, GitBranch,
  Eraser, Wand2, Braces, Database, Binary,
  SearchCode, Link2, FileCode, Table, QrCode,
  Pipette, Palette, SunMoon, Sunset, Hash,
  BarChart3, MessageCircle, Terminal, AtSign,
  Clock, Video, MonitorPlay, UserSquare, BookOpen, Book, Smile,
  LayoutGrid, ImageIcon, Link, Mic, Type, AlignLeft, Activity, 
  RefreshCw as RefreshCwIcon, CircleDot, Monitor, Square, Layout
} from "lucide-react";

export type SingleIcon  = { type: "single"; icon: any; color: string; bg: string };
export type ConvertIcon = { type: "convert"; from: any; fromBg: string; fromColor: string; to: any; toBg: string; toColor: string };
export type ToolIconDef = SingleIcon | ConvertIcon;

export const PdfSvgIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 421 511.605" {...props}>
    <path fill="#E44B4D" d="M95.705.014h199.094L421 136.548v317.555c0 31.54-25.961 57.502-57.502 57.502H95.705c-31.55 0-57.502-25.873-57.502-57.502V57.515C38.203 25.886 64.076.014 95.705.014z"/>
    <path fill="#CD4445" d="M341.028 133.408h-.019L421 188.771v-52.066h-54.357c-9.458-.15-17.998-1.274-25.615-3.297z"/>
    <path fill="#FBCFD0" d="M294.8 0L421 136.533v.172h-54.357c-45.068-.718-69.33-23.397-71.843-61.384V0z"/>
    <path fill="#CD4445" fillRule="nonzero" d="M0 431.901V253.404l.028-1.261c.668-16.446 14.333-29.706 30.936-29.706h7.238v50.589h342.975c12.862 0 23.373 10.51 23.373 23.371v135.504c0 12.83-10.543 23.373-23.373 23.373H23.373C10.541 455.274 0 444.75 0 431.901z"/>
    <path fill="#963232" fillRule="nonzero" d="M143.448 240.364a8.496 8.496 0 01-8.496-8.497 8.496 8.496 0 018.496-8.497h163.176a8.496 8.496 0 018.496 8.497 8.496 8.496 0 01-8.496 8.497H143.448zm0-59.176a8.496 8.496 0 010-16.993h172.304a8.496 8.496 0 110 16.993H143.448z"/>
    <path fill="#fff" fillRule="nonzero" d="M11.329 276.171v154.728c0 7.793 6.38 14.178 14.179 14.178h354.667c7.799 0 14.178-6.379 14.178-14.178V297.405c0-7.798-6.388-14.178-14.178-14.178H37.892c-12.618-.096-19.586-1.638-26.563-7.056z"/>
    <path fill="#1A1A1A" fillRule="nonzero" d="M136.343 381.787h-17.035v19.785H93.103v-81.894h41.274c18.782 0 28.171 10.09 28.171 30.269 0 11.094-2.445 19.306-7.336 24.634-1.835 2.008-4.367 3.712-7.6 5.11-3.233 1.396-6.988 2.096-11.269 2.096zm-17.035-41.144v20.179h6.029c3.145 0 5.438-.327 6.878-.982 1.443-.656 2.162-2.162 2.162-4.522v-9.171c0-2.359-.719-3.866-2.162-4.521-1.44-.655-3.733-.983-6.878-.983h-6.029zm53.069 60.929v-81.894h36.689c14.762 0 24.895 3.145 30.399 9.435 5.502 6.289 8.255 16.794 8.255 31.512 0 14.72-2.753 25.223-8.255 31.513-5.504 6.29-15.637 9.434-30.399 9.434h-36.689zm37.083-60.929h-10.878v39.965h10.878c3.581 0 6.178-.416 7.794-1.244 1.616-.831 2.426-2.732 2.426-5.701v-26.075c0-2.969-.81-4.87-2.426-5.699-1.616-.83-4.213-1.246-7.794-1.246zm97.879 30.53h-22.277v30.399h-26.206v-81.894h53.724l-3.276 20.965h-24.242v11.008h22.277v19.522z"/>
  </svg>
);

export const WordSvgIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 421 511.605" {...props}>
    <path fill="#2563EB" d="M95.705.014h199.094L421 136.548v317.555c0 31.54-25.961 57.502-57.502 57.502H95.705c-31.55 0-57.502-25.873-57.502-57.502V57.515C38.203 25.886 64.076.014 95.705.014z"/>
    <path fill="#1D4ED8" d="M341.028 133.408h-.019L421 188.771v-52.066h-54.357c-9.458-.15-17.998-1.274-25.615-3.297z"/>
    <path fill="#DBEAFE" d="M294.8 0L421 136.533v.172h-54.357c-45.068-.718-69.33-23.397-71.843-61.384V0z"/>
    <path fill="#1D4ED8" fillRule="nonzero" d="M0 431.901V253.404l.028-1.261c.668-16.446 14.333-29.706 30.936-29.706h7.238v50.589h354.304c12.862 0 23.373 10.51 23.373 23.371v135.504c0 12.83-10.543 23.373-23.373 23.373H23.373C10.541 455.274 0 444.75 0 431.901z"/>
    <path fill="#1E3A8A" fillRule="nonzero" d="M143.448 240.364a8.496 8.496 0 01-8.496-8.497 8.496 8.496 0 018.496-8.497h163.176a8.496 8.496 0 018.496 8.497 8.496 8.496 0 01-8.496 8.497H143.448zm0-59.176a8.496 8.496 0 010-16.993h172.304a8.496 8.496 0 110 16.993H143.448z"/>
    <path fill="#fff" fillRule="nonzero" d="M11.329 276.171v154.728c0 7.793 6.38 14.178 14.179 14.178h365.996c7.799 0 14.178-6.379 14.178-14.178V297.405c0-7.798-6.392-14.178-14.178-14.178H37.892c-12.618-.096-19.586-1.638-26.563-7.056z"/>
    <path fill="#1A1A1A" fillRule="nonzero" d="M53.76 401.572v-81.894h36.689c14.762 0 24.895 3.145 30.399 9.435 5.502 6.289 8.255 16.794 8.255 31.512 0 14.72-2.753 25.223-8.255 31.513-5.504 6.29-15.637 9.434-30.399 9.434H53.76zm37.083-60.929H79.965v39.965h10.878c3.581 0 6.178-.416 7.794-1.244 1.617-.831 2.425-2.732 2.425-5.701v-26.075c0-2.969-.808-4.87-2.425-5.699-1.616-.83-4.213-1.246-7.794-1.246zm45.465 20.049c0-14.939 2.797-25.835 8.386-32.692 5.592-6.857 15.681-10.287 30.269-10.287 14.587 0 24.677 3.43 30.266 10.287 5.592 6.857 8.388 17.753 8.388 32.692 0 7.424-.591 13.671-1.77 18.736-1.178 5.067-3.21 9.477-6.093 13.234-2.882 3.758-6.857 6.508-11.922 8.255-5.068 1.747-11.357 2.621-18.869 2.621-7.512 0-13.802-.874-18.869-2.621-5.065-1.747-9.041-4.497-11.925-8.255-2.881-3.757-4.913-8.167-6.092-13.234-1.177-5.065-1.769-11.312-1.769-18.736zm28.171-13.629v34.069h10.878c3.579 0 6.178-.415 7.794-1.246 1.617-.828 2.426-2.729 2.426-5.699v-34.068h-11.008c-3.494 0-6.048.415-7.664 1.245-1.616.829-2.426 2.73-2.426 5.699zm114.653 31.055l1.965 22.014c-5.504 2.271-12.404 3.406-20.704 3.406-8.297 0-14.957-.874-19.982-2.621-5.022-1.747-8.974-4.497-11.858-8.255-2.881-3.757-4.892-8.167-6.026-13.234-1.137-5.065-1.704-11.312-1.704-18.736 0-7.427.567-13.693 1.704-18.803 1.134-5.11 3.145-9.543 6.026-13.301 5.592-7.248 15.855-10.875 30.793-10.875 3.319 0 7.228.328 11.728.983 4.497.655 7.839 1.464 10.023 2.425l-3.93 20.047c-5.68-1.223-10.876-1.835-15.594-1.835-4.716 0-7.992.437-9.826 1.31-1.835.874-2.754 2.62-2.754 5.241v34.33c3.409.7 6.86 1.048 10.353 1.048 7.425 0 14.021-1.048 19.786-3.144zm36.295-58.44l9.04 21.884h1.311l9.04-21.884h28.434l-18.214 39.571 18.214 42.323h-29.089l-9.826-23.585h-1.18l-9.696 23.585h-27.778l17.819-41.535-17.819-40.359h29.744z"/>
  </svg>
);

export const TOOL_ICON_MAP: Record<string, ToolIconDef> = {
  // PDF Tools
  "merge-pdf":           { type:"single",  icon: Layers,         color:"#ef4444", bg:"#fef2f2" },
  "split-pdf":           { type:"single",  icon: Scissors,       color:"#ef4444", bg:"#fef2f2" },
  "compress-pdf":        { type:"single",  icon: FileDown,       color:"#ef4444", bg:"#fef2f2" },
  "pdf-to-image":        { type:"convert", from: PdfSvgIcon, fromBg:"#fef2f2", fromColor:"#ef4444", to: FileImage, toBg:"#eff6ff", toColor:"#3b82f6" },
  "image-to-pdf":        { type:"convert", from: FileImage, fromBg:"#eff6ff", fromColor:"#3b82f6", to: PdfSvgIcon, toBg:"#fef2f2", toColor:"#ef4444" },
  "pdf-to-word":         { type:"convert", from: PdfSvgIcon, fromBg:"#fef2f2", fromColor:"#ef4444", to: WordSvgIcon, toBg:"#eff6ff", toColor:"#2563eb" },
  "word-to-pdf":         { type:"convert", from: WordSvgIcon, fromBg:"#eff6ff", fromColor:"#2563eb", to: PdfSvgIcon, toBg:"#fef2f2", toColor:"#ef4444" },

  "protect-pdf":         { type:"single",  icon: Lock,           color:"#ef4444", bg:"#fef2f2" },
  "unlock-pdf":          { type:"single",  icon: KeyRound,       color:"#ef4444", bg:"#fef2f2" },
  "sign-pdf":            { type:"single",  icon: PenLine,        color:"#ef4444", bg:"#fef2f2" },
  "ocr-pdf":             { type:"convert", from: ScanLine, fromBg:"#f0fdf4", fromColor:"#22c55e", to: FileText, toBg:"#fef2f2", toColor:"#ef4444" },
  // Image Tools
  "compress-image":      { type:"single",  icon: PackageSearch,  color:"#3b82f6", bg:"#eff6ff" },
  "resize-image":        { type:"single",  icon: Maximize2,      color:"#3b82f6", bg:"#eff6ff" },
  "crop-image":          { type:"single",  icon: Crop,           color:"#3b82f6", bg:"#eff6ff" },
  "convert-image":       { type:"convert", from: FileImage, fromBg:"#eff6ff", fromColor:"#3b82f6", to: ArrowLeftRight, toBg:"#faf5ff", toColor:"#8b5cf6" },
  "remove-background":   { type:"single",  icon: Eraser,         color:"#3b82f6", bg:"#eff6ff" },
  "photo-enhancer":      { type:"single",  icon: Wand2,          color:"#3b82f6", bg:"#eff6ff" },
  // Developer Tools
  "json-formatter":      { type:"single",  icon: Braces,         color:"#8b5cf6", bg:"#faf5ff" },
  "sql-formatter":       { type:"single",  icon: Database,       color:"#8b5cf6", bg:"#faf5ff" },
  "base64":              { type:"single",  icon: Binary,         color:"#8b5cf6", bg:"#faf5ff" },
  "regex-tester":        { type:"single",  icon: SearchCode,     color:"#8b5cf6", bg:"#faf5ff" },
  "url-encoder":         { type:"single",  icon: Link2,          color:"#8b5cf6", bg:"#faf5ff" },
  "html-minifier":       { type:"single",  icon: FileCode,       color:"#8b5cf6", bg:"#faf5ff" },
  "csv-to-json":         { type:"convert", from: Table, fromBg:"#f0fdf4", fromColor:"#22c55e", to: Braces, toBg:"#faf5ff", toColor:"#8b5cf6" },
  // QR Tools
  "qr-generator":        { type:"single",  icon: QrCode,         color:"#10b981", bg:"#ecfdf5" },
  "qr-scanner":          { type:"single",  icon: ScanLine,       color:"#10b981", bg:"#ecfdf5" },
  // Color Tools
  "color-picker":        { type:"single",  icon: Pipette,        color:"#ec4899", bg:"#fdf2f8" },
  "palette-generator":   { type:"single",  icon: Palette,        color:"#ec4899", bg:"#fdf2f8" },
  "contrast-checker":    { type:"single",  icon: SunMoon,        color:"#ec4899", bg:"#fdf2f8" },
  "gradient-generator":  { type:"single",  icon: Sunset,         color:"#ec4899", bg:"#fdf2f8" },
  "hex-rgb":             { type:"convert", from: Hash, fromBg:"#fdf2f8", fromColor:"#ec4899", to: Palette, toBg:"#eff6ff", toColor:"#3b82f6" },
  // Marketing Tools
  "utm-builder":         { type:"single",  icon: BarChart3,      color:"#f59e0b", bg:"#fffbeb" },
  "social-checker":      { type:"single",  icon: AtSign,         color:"#f59e0b", bg:"#fffbeb" },
  "whatsapp-no-save":    { type:"single",  icon: MessageCircle,  color:"#f59e0b", bg:"#fffbeb" },
  "env-validator":       { type:"single",  icon: Terminal,       color:"#8b5cf6", bg:"#faf5ff" },
  "json-to-typescript":  { type:"convert", from: Braces, fromBg:"#faf5ff", fromColor:"#8b5cf6", to: FileCode, toBg:"#eff6ff", toColor:"#3b82f6" },
  "cron-humanizer":      { type:"single",  icon: Clock,          color:"#8b5cf6", bg:"#faf5ff" },
  "brand-kit":           { type:"single",  icon: Palette,        color:"#f59e0b", bg:"#fffbeb" },
  "qr-menu":             { type:"convert", from: QrCode, fromBg:"#ecfdf5", fromColor:"#10b981", to: FileText, toBg:"#fef2f2", toColor:"#ef4444" },
  "screen-gif":          { type:"single",  icon: MonitorPlay,    color:"#3b82f6", bg:"#eff6ff" },
  "passport-photo":      { type:"single",  icon: UserSquare,     color:"#3b82f6", bg:"#eff6ff" },
  "favicon-studio":      { type:"single",  icon: Smile,          color:"#ec4899", bg:"#fdf2f8" },
  "pdf-to-booklet":      { type:"single",  icon: BookOpen,       color:"#ef4444", bg:"#fef2f2" },
  "thread-carousel":     { type:"single",  icon: Layers,         color:"#f59e0b", bg:"#fffbeb" },
  "epub-converter":      { type:"convert", from: Book, fromBg:"#faf5ff", fromColor:"#8b5cf6", to: FileText, toBg:"#fef2f2", toColor:"#ef4444" },
  "password-generator":  { type:"single",  icon: KeyRound,       color:"#8b5cf6", bg:"#faf5ff" },
  "youtube-thumbnail":   { type:"single",  icon: Video,          color:"#f59e0b", bg:"#fffbeb" },
  "thumbnail-maker":     { type:"single",  icon: ImageIcon,      color:"#3b82f6", bg:"#eff6ff" },
  "text-to-speech":      { type:"single",  icon: Mic,            color:"#8b5cf6", bg:"#faf5ff" },
  "lorem-ipsum":         { type:"single",  icon: AlignLeft,      color:"#8b5cf6", bg:"#faf5ff" },
  "case-converter":      { type:"single",  icon: Type,           color:"#8b5cf6", bg:"#faf5ff" },
  "keyword-density":     { type:"single",  icon: Activity,       color:"#f59e0b", bg:"#fffbeb" },
  
  // New Tools
  "godly-name-generator": { type:"single",  icon: Wand2,          color:"#c5a059", bg:"#c5a05910" },
  "invoice-generator":    { type:"single",  icon: FileText,       color:"#c5a059", bg:"#c5a05910" },
  "text-pixel-width":     { type:"single",  icon: Type,           color:"#c5a059", bg:"#c5a05910" },
  "spin-the-wheel-decider": { type:"single", icon: RefreshCwIcon, color:"#c5a059", bg:"#c5a05910" },
  "image-to-ascii-art":   { type:"single",  icon: Type,           color:"#c5a059", bg:"#c5a05910" },
  "indian-coin-flip":     { type:"single",  icon: CircleDot,      color:"#c5a059", bg:"#c5a05910" },
  "screenshot-beautifier": { type:"single", icon: Monitor,       color:"#c5a059", bg:"#c5a05910" },
  "add-border-to-image":  { type:"single",  icon: Square,        color:"#c5a059", bg:"#c5a05910" },
  "image-inverter":       { type:"single",  icon: ArrowLeftRight, color:"#c5a059", bg:"#c5a05910" },
  "combine-images-online": { type:"single", icon: Layout,        color:"#c5a059", bg:"#c5a05910" },
  
  // Category Icons (for Navbar)
  "pdf":                 { type:"single",  icon: FileText,       color:"#c5a059", bg:"#c5a05910" },
  "image":               { type:"single",  icon: ImageIcon,      color:"#c5a059", bg:"#c5a05910" },
  "dev":                 { type:"single",  icon: Terminal,       color:"#c5a059", bg:"#c5a05910" },
  "qr":                  { type:"single",  icon: QrCode,         color:"#c5a059", bg:"#c5a05910" },
  "color":               { type:"single",  icon: Palette,        color:"#c5a059", bg:"#c5a05910" },
  "marketing":           { type:"single",  icon: Link,           color:"#c5a059", bg:"#c5a05910" },
};

export function ToolIcon({ slug, className = "", iconColor, bgColor }: { slug: string; className?: string; iconColor?: string; bgColor?: string }) {
  const def = TOOL_ICON_MAP[slug];
  if (!def) return null;

  if (def.type === "single") {
    const Icon = def.icon;
    return (
      <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${className}`} style={{ backgroundColor: bgColor || def.bg }}>
        <Icon className="w-5 h-5" style={{ color: iconColor || def.color }} />
      </div>
    );
  }

  const { from: FromI, to: ToI } = def;
  return (
    <div className={`relative w-12 h-12 flex items-center justify-center shrink-0 ${className}`}>
      <div className="absolute top-0 left-0 p-1.5 rounded-lg -rotate-6 shadow-sm z-0 opacity-40 bg-white dark:bg-zinc-800" style={{ backgroundColor: bgColor || def.fromBg }}>
        <FromI className="w-4 h-4" style={{ color: iconColor || def.fromColor }} />
      </div>
      <div className="relative p-2 rounded-xl shadow-md rotate-3 z-10 bg-white dark:bg-zinc-800 border border-zinc-100" style={{ backgroundColor: bgColor || def.toBg }}>
        <ToI className="w-6 h-6" style={{ color: iconColor || def.toColor }} />
      </div>
    </div>
  );
}
