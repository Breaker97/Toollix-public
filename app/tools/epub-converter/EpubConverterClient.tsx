"use client";

import { useState } from 'react';
import { Upload, Download, RefreshCw, Loader2, BookOpen, FileJson, Type, Settings2, Sparkles, XCircle, ShieldCheck, Check, Info, Maximize2, Zap, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ePub from 'epubjs';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { ToolLayout } from "@/components/tool-layout";
import { cn } from "@/lib/utils";

export default function EpubConverterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<{ markdown: string, title: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.name.endsWith('.epub')) {
      setFile(selected); setExtractedData(null); setMetadata(null);
    } else {
      toast.error("Please upload a valid .epub file.");
    }
  };

  const processEpub = async () => {
    if (!file) return;
    setLoading(true); setStatus("Initializing..."); setProgress(10);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = new JSZip();
      let zipContent;
      try { zipContent = await zip.loadAsync(arrayBuffer); } catch (e) { throw new Error("Invalid format"); }
      if (zipContent.file("META-INF/encryption.xml")) throw new Error("DRM Protected");

      const book = ePub(arrayBuffer); await book.ready;
      const meta = await book.loaded.metadata; setMetadata(meta);
      setProgress(30);

      let markdown = `# ${meta.title || 'Untitled'}\n\n`;
      if (meta.creator) markdown += `*Author: ${meta.creator}*\n\n---\n\n`;

      const spine = (book as any).spine;
      const totalItems = spine.length || (spine.items ? spine.items.length : 0);
      let capturedCount = 0;
      
      for (let i = 0; i < totalItems; i++) {
        const item = spine.get(i);
        if (item) {
          try {
            const doc = await item.load(book.load.bind(book));
            const text = doc?.body?.innerText || "";
            if (text.trim()) { markdown += `\n${text.trim()}\n\n---\n`; capturedCount++; }
          } catch (itemErr) {}
          setProgress(Math.round(30 + (i / totalItems) * 70));
        }
      }
      if (capturedCount === 0) throw new Error("No readable text");
      setExtractedData({ markdown, title: meta.title || 'Converted_Book' });
      toast.success("Conversion complete!");
    } catch (e: any) {
      toast.error(e.message || "Conversion failed");
    } finally {
      setLoading(false); setStatus(null);
    }
  };

  const downloadFile = (fmt: 'md' | 'pdf') => {
    if (!extractedData) return;
    if (fmt === 'md') {
      const blob = new Blob([extractedData.markdown], { type: 'text/markdown' });
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
      link.download = `${extractedData.title.replace(/\s+/g, '_')}.md`; link.click();
    } else {
      const doc = new jsPDF();
      doc.setFontSize(24); doc.text(extractedData.title, 10, 20);
      doc.setFontSize(10); const lines = doc.splitTextToSize(extractedData.markdown.slice(0, 10000), 190);
      doc.text(lines, 10, 40); doc.save(`${extractedData.title.replace(/\s+/g, '_')}.pdf`);
    }
  };

  return (
    <ToolLayout 
      title="eBook Converter" 
      description="Convert EPUB files into clean Markdown or minimalist PDFs for Notion, Obsidian, and e-readers."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Extraction Workspace */}
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/30">
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Extraction Studio</h3>
              </div>

              {!file ? (
                 <div className="flex flex-col items-center gap-6 py-12">
                    <div className="w-20 h-20 bg-[#c5a059]/10 text-[#c5a059] rounded-2xl flex items-center justify-center animate-bounce">
                       <Upload className="w-10 h-10" />
                    </div>
                    <div className="text-center space-y-2">
                       <h3 className="text-xl font-black uppercase tracking-widest">Load eBook</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">EPUB Format • Open Container</p>
                    </div>
                    <input type="file" id="epub-upload" className="hidden" accept=".epub" onChange={handleFileChange} />
                    <Button asChild className="h-16 px-10 rounded-2xl bg-[#c5a059] text-white font-black uppercase tracking-[0.2em] shadow-xl">
                       <label htmlFor="epub-upload">Browse Library</label>
                    </Button>
                 </div>
              ) : extractedData ? (
                 <div className="w-full space-y-8 animate-in zoom-in-95">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border-2 border-[#c5a059]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-4 text-left">
                          <Check className="w-12 h-12 text-green-500" />
                          <div>
                             <h4 className="text-lg font-black uppercase tracking-tight">{extractedData.title}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synthesis Complete • Vector Output Ready</p>
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Button onClick={() => downloadFile('md')} className="h-20 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest shadow-xl">
                          <FileJson className="w-5 h-5 mr-3" /> Export Markdown
                       </Button>
                       <Button onClick={() => downloadFile('pdf')} className="h-20 rounded-2xl bg-[#c5a059] text-white font-black uppercase tracking-widest shadow-xl">
                          <Download className="w-5 h-5 mr-3" /> Export PDF
                       </Button>
                    </div>
                 </div>
              ) : (
                 <div className="flex flex-col items-center gap-8 w-full max-w-md animate-in slide-in-from-bottom-4">
                    <div className="w-32 h-48 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border flex items-center justify-center relative group">
                       <BookOpen className="w-12 h-12 text-[#c5a059]/20" />
                       <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-sm font-black uppercase tracking-tight">{file.name}</p>
                       <p className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.4em] italic">{loading ? "Decoding Manifest..." : "Identity Verified"}</p>
                    </div>
                    {loading && <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-[#c5a059] transition-all duration-300" style={{ width: `${progress}%` }} /></div>}
                 </div>
              )}
            </div>

            {/* Main Action (Mobile First) */}
            <div className="flex flex-col sm:flex-row gap-4">
               {file && !extractedData && (
                  <Button 
                    onClick={processEpub}
                    disabled={loading}
                    className="flex-1 h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform" />}
                    {loading ? `PARSING ${progress}%` : "INITIALIZE CONVERSION"}
                  </Button>
               )}
               {(file || extractedData) && (
                  <Button onClick={() => { setFile(null); setExtractedData(null); }} variant="outline" className="h-20 px-10 rounded-[2rem] border-zinc-200 text-slate-400 font-black text-xs uppercase tracking-widest">
                     Reset Studio
                  </Button>
               )}
            </div>
          </div>

          {/* Right Column: Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Studio Driver</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Identity Configuration</p>
               </div>

               <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Maximize2 className="w-4 h-4 text-[#c5a059] opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target: Universal</span>
                     </div>
                     <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Type className="w-4 h-4 text-[#c5a059] opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sanitized Text</span>
                     </div>
                     <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                  </div>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <Maximize2 className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">E-Ink Ready</span>
               </div>
               <div className="suite-card p-6 rounded-3xl flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059] opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">DRM Scan</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
