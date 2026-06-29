"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  Download, 
  Copy, 
  CheckCircle2, 
  Zap,
  Terminal,
  ShieldCheck,
  Search,
  ImageIcon,
  Link as LinkIcon,
  ExternalLink,
  Eye,
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Thumbnail = {
  label: string;
  url: string;
  quality: string;
  size: string;
};

export default function YoutubeThumbnailPage() {
  const [url, setUrl] = useState("");
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [videoId, setVideoId] = useState("");

  const extractVideoId = (input: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = input.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const analyzeUrl = () => {
    const id = extractVideoId(url);
    if (!id) {
      toast.error("Invalid YouTube URL provided.");
      return;
    }

    setAnalyzing(true);
    setVideoId(id);

    setTimeout(() => {
      const base = `https://img.youtube.com/vi/${id}`;
      const thumbs: Thumbnail[] = [
        { label: "Maximum Resolution", url: `${base}/maxresdefault.jpg`, quality: "4K/HD", size: "1280x720" },
        { label: "High Definition", url: `${base}/sddefault.jpg`, quality: "High", size: "640x480" },
        { label: "High Quality", url: `${base}/hqdefault.jpg`, quality: "Standard", size: "480x360" },
        { label: "Medium Quality", url: `${base}/mqdefault.jpg`, quality: "Medium", size: "320x180" }
      ];
      setThumbnails(thumbs);
      setAnalyzing(false);
      toast.success("Thumbnails extracted successfully!");
    }, 800);
  };

  const handleDownload = async (thumbnailUrl: string, label: string) => {
    try {
      const response = await fetch(thumbnailUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `youtube-thumbnail-${videoId}-${label.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to download image. Try opening in new tab.");
      window.open(thumbnailUrl, '_blank');
    }
  };

  return (
    <ToolLayout 
      title="YouTube Media Extractor" 
      description="Professional YouTube thumbnail extraction engine. Harvest high-fidelity marketing assets directly from any video manifest."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Preview/Results Area */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Input Suite */}
            <div className="suite-card rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center">
                       <LinkIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Video Manifest</h3>
                 </div>
                 {thumbnails.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => { setThumbnails([]); setUrl(""); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500">
                       <X className="w-3.5 h-3.5 mr-2" /> Reset
                    </Button>
                 )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                 <div className="flex-1 relative group">
                    <input 
                       type="text"
                       placeholder="Paste YouTube video URL here..."
                       className="w-full h-16 pl-6 pr-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 text-[14px] font-medium focus:outline-none focus:border-[#c5a059] transition-all"
                       value={url}
                       onChange={(e) => setUrl(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && analyzeUrl()}
                    />
                 </div>
                 <Button 
                    onClick={analyzeUrl}
                    disabled={analyzing || !url}
                    className="h-16 px-10 rounded-2xl bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all"
                 >
                    {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                    EXTRACT MEDIA
                 </Button>
              </div>
            </div>

            {/* Results Grid */}
            {thumbnails.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-700">
                  {thumbnails.map((thumb, i) => (
                    <div key={i} className="group/item suite-card p-4 rounded-[2.5rem] space-y-4 hover:shadow-2xl transition-all duration-500 border border-zinc-100 dark:border-zinc-800">
                       <div className="relative aspect-video rounded-[1.8rem] overflow-hidden bg-black shadow-inner">
                          <img 
                             src={thumb.url} 
                             alt={thumb.label}
                             className="w-full h-full object-cover transition-transform duration-1000 group-hover/item:scale-110"
                             onError={(e) => { (e.target as any).src = "https://placehold.co/1280x720/c5a059/white?text=Quality+Unavailable"; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end p-6">
                             <div className="flex gap-2 w-full">
                                <Button 
                                   onClick={() => handleDownload(thumb.url, thumb.label)}
                                   className="flex-1 h-12 rounded-xl bg-white text-zinc-900 hover:bg-white/90 text-[9px] font-black uppercase tracking-widest"
                                >
                                   <Download className="w-3.5 h-3.5 mr-2" /> Download
                                </Button>
                             </div>
                          </div>
                          <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black text-[#c5a059] border border-[#c5a059]/20 shadow-sm">
                             {thumb.size}
                          </div>
                       </div>
                       <div className="flex justify-between items-center px-4">
                          <div className="space-y-0.5">
                             <h4 className="text-[11px] font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest">{thumb.label}</h4>
                             <p className="text-[9px] text-[#c5a059] font-black uppercase tracking-widest italic">{thumb.quality}</p>
                          </div>
                          <Button 
                             variant="ghost" 
                             size="icon"
                             onClick={() => {
                                navigator.clipboard.writeText(thumb.url);
                                toast.success("Image URL copied!");
                             }}
                             className="h-10 w-10 rounded-xl hover:bg-[#c5a059]/10 text-[#c5a059]"
                          >
                             <Copy className="w-3.5 h-3.5" />
                          </Button>
                       </div>
                    </div>
                  ))}
               </div>
            ) : (
               <div className="h-[500px] suite-card rounded-[3rem] flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-30 border-dashed border-2">
                  <Video className="w-16 h-16 text-[#c5a059]" />
                  <div className="space-y-1">
                     <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Awaiting Extraction</p>
                     <p className="text-[12px] font-black text-[#c5a059] uppercase tracking-widest">Paste a video URL to generate assets</p>
                  </div>
               </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
             <div className="suite-card rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Media Info</h2>
                   <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Asset Metadata</p>
                </div>
                
                <div className="space-y-4">
                   {[
                      { icon: Eye, label: "Video ID", detail: videoId || "..." },
                      { icon: ImageIcon, label: "Assets", detail: thumbnails.length > 0 ? "4 Pack" : "None" },
                      { icon: ShieldCheck, label: "Safe Link", detail: "Active" }
                   ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center px-2">
                         <div className="flex items-center gap-3">
                            <item.icon className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                         </div>
                         <span className="text-[9px] font-black text-slate-800 dark:text-zinc-200 uppercase italic truncate max-w-[80px]">{item.detail}</span>
                      </div>
                   ))}
                </div>
             </div>

             <div className="suite-card p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                <Zap className="w-5 h-5 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 italic">Turbo Fetch Active</span>
             </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
