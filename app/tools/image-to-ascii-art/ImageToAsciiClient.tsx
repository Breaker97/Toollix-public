"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Type, 
  Upload, 
  Copy, 
  Download, 
  CheckCircle2, 
  Settings2, 
  Activity,
  Image as ImageIcon,
  Maximize,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ASCII_CHARS = "@#S%?*+;:,. ";
const ASCII_CHARS_DETAILED = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

export default function ImageToAsciiClient() {
  const [image, setImage] = useState<string | null>(null);
  const [ascii, setAscii] = useState("");
  const [width, setWidth] = useState(100);
  const [contrast, setContrast] = useState(1);
  const [detailed, setDetailed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        generateAscii(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAscii = (imgSrc: string) => {
    if (!imgSrc) return;
    setIsProcessing(true);
    
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const aspectRatio = img.height / img.width;
      const height = Math.round(width * aspectRatio * 0.55); // Adjust for font aspect ratio
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      
      const charSet = detailed ? ASCII_CHARS_DETAILED : ASCII_CHARS;
      let asciiResult = "";
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          let brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          
          // Apply contrast
          brightness = (brightness - 0.5) * contrast + 0.5;
          brightness = Math.max(0, Math.min(1, brightness));
          
          const charIndex = Math.floor((1 - brightness) * (charSet.length - 1));
          asciiResult += charSet[charIndex];
        }
        asciiResult += "\n";
      }
      
      setAscii(asciiResult);
      setIsProcessing(false);
    };
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ascii);
    setCopied(true);
    toast.success("ASCII art copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (image) {
      const timeout = setTimeout(() => generateAscii(image), 300);
      return () => clearTimeout(timeout);
    }
  }, [width, contrast, detailed]);

  return (
    <ToolLayout 
      title="ASCII Vision" 
      description="Manifest images as character-based art. Transform photos into classic computer-age ASCII textures for creative projects."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 min-h-[500px] flex flex-col relative overflow-hidden bg-zinc-950 border-2 border-zinc-900 shadow-2xl">
              
              <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
                 <div className="w-10 h-10 bg-zinc-900 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm border border-zinc-800">
                    <Type className="w-5 h-5" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Terminal Output</h3>
              </div>

              {!image ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                   <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700 border-2 border-dashed border-zinc-800">
                      <Upload className="w-10 h-10" />
                   </div>
                   <div className="text-center space-y-2">
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Upload Image</h2>
                      <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest italic">Prepare for text conversion</p>
                   </div>
                   <label className="h-16 px-10 rounded-2xl bg-[#c5a059] text-white hover:bg-[#b08d4a] text-xs font-black uppercase tracking-[0.3em] shadow-xl flex items-center cursor-pointer transition-all">
                      <Upload className="w-4 h-4 mr-2" />
                      SELECT SOURCE
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                   </label>
                </div>
              ) : (
                <div className="flex-1 flex flex-col pt-16">
                   <div className="flex-1 overflow-auto bg-zinc-900/30 rounded-2xl p-4 sm:p-8 border border-zinc-900 relative">
                      <pre className="text-[6px] sm:text-[8px] leading-[0.8] font-mono text-emerald-500/80 whitespace-pre">
                        {ascii}
                      </pre>
                      {isProcessing && (
                        <div className="absolute inset-0 bg-zinc-950/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                           <RefreshCw className="w-8 h-8 text-[#c5a059] animate-spin" />
                        </div>
                      )}
                   </div>
                   
                   <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center gap-4">
                         <Button 
                            variant="ghost" 
                            onClick={() => setImage(null)}
                            className="text-[10px] font-black uppercase text-zinc-500 hover:text-white"
                         >
                            Reset
                         </Button>
                      </div>
                      <div className="flex gap-3">
                         <Button 
                            onClick={copyToClipboard}
                            className="h-12 px-6 rounded-xl bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 text-[10px] font-black uppercase tracking-widest"
                         >
                            {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            COPY ASCII
                         </Button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Art Config</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Conversion Logic</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                     <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolution</label>
                        <span className="text-[10px] font-bold text-[#c5a059]">{width} chars</span>
                     </div>
                     <input 
                        type="range" min="20" max="250" value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value))}
                        className="w-full accent-[#c5a059]"
                     />
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contrast</label>
                        <span className="text-[10px] font-bold text-[#c5a059]">{contrast}x</span>
                     </div>
                     <input 
                        type="range" min="0.5" max="3" step="0.1" value={contrast}
                        onChange={(e) => setContrast(parseFloat(e.target.value))}
                        className="w-full accent-[#c5a059]"
                     />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                     <div className="flex items-center gap-3">
                        <Maximize className="w-4 h-4 text-[#c5a059]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Detail Mode</span>
                     </div>
                     <button 
                        onClick={() => setDetailed(!detailed)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          detailed ? "bg-[#c5a059]" : "bg-zinc-200 dark:bg-zinc-700"
                        )}
                     >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          detailed ? "left-7" : "left-1"
                        )} />
                     </button>
                  </div>
               </div>
            </div>

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Matrix Logic</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Pixel luminosity is mapped to character density. Higher resolution works best for high-contrast portraits.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
