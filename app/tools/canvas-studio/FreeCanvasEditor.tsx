"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Transformer, Star, RegularPolygon, Path } from "react-konva";
import useImage from "use-image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Type, 
  Trash2, 
  Download, 
  Plus, 
  Layers, 
  ChevronUp, 
  ChevronDown,
  Upload,
  Undo2,
  Redo2,
  Copy,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Lock,
  CloudUpload,
  Sparkles,
  Triangle,
  CaseSensitive,
  Wand2,
  Crop,
  FlipHorizontal,
  FlipVertical,
  Save,
  Loader2,
  History,
  Image as ImageIcon,
  Settings2,
  Grid,
  Maximize2,
  Minus,
  Check,
  MousePointer2,
  Hand,
  Search,
  Moon,
  Sun,
  Palette,
  Circle as CircleIcon,
  Square as RectIcon,
  X,
  PlusCircle,
  Shapes,
  LayoutGrid
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadCanvasAsset } from "./actions";
import { cn } from "@/lib/utils";

// --- Types ---
interface CanvasElement {
  id: string;
  type: "text" | "rect" | "circle" | "image" | "triangle" | "star";
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: "none" | "underline" | "line-through";
  textAlign?: string;
  src?: string;
  zIndex: number;
  rotation: number;
  opacity: number;
  fontFamily?: string;
  isLocked?: boolean;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowOffset?: { x: number; y: number };
}

// --- Components ---
const URLImage = ({ element, isSelected, onSelect, onChange }: { 
  element: CanvasElement; 
  isSelected: boolean; 
  onSelect: () => void;
  onChange: (updates: Partial<CanvasElement>) => void;
}) => {
  const [img, status] = useImage(element.src || "", "anonymous");
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  // Auto-adjust aspect ratio on load
  useEffect(() => {
    if (status === 'loaded' && img && element.w === 200 && element.h === 200) {
      const maxWidth = 400;
      const ratio = img.width / img.height;
      onChange({ 
        w: maxWidth, 
        h: maxWidth / ratio 
      });
    }
  }, [status, img]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      const layer = trRef.current.getLayer();
      if (layer) layer.batchDraw();
    }
  }, [isSelected, img, status]);

  return (
    <>
      {status !== 'loaded' && (
        <Rect
          x={element.x}
          y={element.y}
          width={element.w}
          height={element.h}
          rotation={element.rotation}
          fill="#F0F2F5"
          stroke="#E2E8F0"
          dash={[5, 5]}
          cornerRadius={8}
        />
      )}
      {status === 'loading' && (
        <Text
          x={element.x}
          y={element.y + element.h / 2 - 10}
          width={element.w}
          text="Loading Image..."
          fontSize={12}
          fontStyle="bold"
          align="center"
          fill="#6C5CE7"
        />
      )}
      {status === 'failed' && (
        <Text
          x={element.x}
          y={element.y + element.h / 2 - 10}
          width={element.w}
          text="Failed to load"
          fontSize={12}
          fontStyle="bold"
          align="center"
          fill="#EF4444"
        />
      )}
      <KonvaImage
        image={img}
        x={element.x}
        y={element.y}
        width={element.w}
        height={element.h}
        rotation={element.rotation}
        opacity={status === 'loaded' ? (element.opacity ?? 1) : 0}
        shadowBlur={element.shadowBlur}
        shadowColor={element.shadowColor}
        shadowOpacity={element.shadowOpacity}
        shadowOffsetX={element.shadowOffset?.x}
        shadowOffsetY={element.shadowOffset?.y}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        draggable={!element.isLocked}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            w: Math.max(5, node.width() * scaleX),
            h: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !element.isLocked && (
        <Transformer 
          ref={trRef} 
          rotateEnabled 
          keepRatio 
          borderStroke="#6C5CE7" 
          anchorFill="#6C5CE7" 
          anchorSize={8}
          borderDash={[3, 3]}
        />
      )}
    </>
  );
};

const TextElement = ({ element, isSelected, onSelect, onChange }: { 
  element: CanvasElement; 
  isSelected: boolean; 
  onSelect: () => void;
  onChange: (updates: Partial<CanvasElement>) => void;
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        text={element.content}
        x={element.x}
        y={element.y}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily || "Inter"}
        fontStyle={`${element.fontWeight} ${element.fontStyle}`}
        fill={element.fill}
        rotation={element.rotation}
        opacity={element.opacity}
        align={element.textAlign}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        draggable={!element.isLocked}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          node.scaleX(1);
          onChange({
            x: node.x(),
            y: node.y(),
            w: Math.max(5, node.width() * scaleX),
            rotation: node.rotation(),
            fontSize: node.fontSize() * scaleX
          });
        }}
      />
      {isSelected && !element.isLocked && <Transformer ref={trRef} enabledAnchors={["middle-left", "middle-right"]} borderStroke="#6C5CE7" anchorFill="#6C5CE7" />}
    </>
  );
};

export default function SimpleImageEditor() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- Canvas State ---
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [zoom, setZoom] = useState(0.5);
  const [isProductMode, setIsProductMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "text" | "layers" | "adjust" | "bg" | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<any>(null);

  // --- Element Management ---
  const addElement = (type: CanvasElement["type"], src?: string) => {
    const newId = `el-${Date.now()}`;
    const newElement: CanvasElement = {
      id: newId,
      type,
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 100,
      w: 200,
      h: 200,
      zIndex: elements.length,
      rotation: 0,
      opacity: 1,
      isLocked: false,
      ...(type === "text" ? { 
        content: "Double click to edit", 
        fontSize: 48, 
        fill: "#000000", 
        fontWeight: "bold",
        textAlign: "center"
      } : {}),
      ...(type === "image" ? { src } : {}),
      ...(type === "rect" || type === "circle" ? { fill: "#6C5CE7" } : {})
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedId(newId);
    saveHistory(newElements);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
    setElements(newElements);
    saveHistory(newElements);
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    setSelectedId(null);
    saveHistory(newElements);
  };

  const saveHistory = (newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setElements(JSON.parse(JSON.stringify(prev)));
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setElements(JSON.parse(JSON.stringify(next)));
      setHistoryIndex(historyIndex + 1);
    }
  };

  // --- Specialized Features ---
  const toggleProductMode = () => {
    const nextMode = !isProductMode;
    setIsProductMode(nextMode);
    
    if (nextMode) {
      // Auto-center primary image and add shadow
      const imageEl = elements.find(el => el.type === "image");
      if (imageEl) {
        updateElement(imageEl.id, {
          x: canvasSize.width / 2 - imageEl.w / 2,
          y: canvasSize.height / 2 - imageEl.h / 2,
          shadowBlur: 30,
          shadowColor: "rgba(0,0,0,0.15)",
          shadowOpacity: 0.5,
          shadowOffset: { x: 10, y: 10 }
        });
        setBackgroundColor("#F8F9FB");
        toast.success("Product Mode Activated");
      }
    }
  };

  const applySocialPreset = (type: "insta" | "story" | "whatsapp") => {
    const sizes = {
      insta: { width: 1080, height: 1080, label: "Instagram Post" },
      story: { width: 1080, height: 1920, label: "Social Story" },
      whatsapp: { width: 800, height: 800, label: "WhatsApp Product" }
    };
    const preset = sizes[type];
    setCanvasSize({ width: preset.width, height: preset.height });
    toast.info(`Resized to ${preset.label}`);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await uploadCanvasAsset(formData);
      if (res.success && "url" in res && res.url) {
        console.log("[Canvas] Image uploaded successfully. GCS URL:", res.url);
        addElement("image", res.url);
        toast.success("Image uploaded");
      } else {
        console.error("[Canvas] GCS Upload failed, using local blob fallback.");
        const localUrl = URL.createObjectURL(file);
        addElement("image", localUrl);
        toast.info("Using local preview");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeBackground = () => {
    if (!selectedId) return toast.error("Select an image first");
    const el = elements.find(e => e.id === selectedId);
    if (el?.type !== "image") return toast.error("Please select an image");
    
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'AI is analyzing pixels...',
        success: 'Background removed! (API Simulation)',
        error: 'AI failed to process image',
      }
    );
  };

  const downloadCanvas = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'toollix-design.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Design downloaded");
  };

  // --- Auto Resize Canvas based on Window ---
  useEffect(() => {
    const updateZoom = () => {
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth - 100;
        const ch = containerRef.current.clientHeight - 100;
        const scale = Math.min(cw / canvasSize.width, ch / canvasSize.height, 0.9);
        setZoom(scale);
      }
    };
    window.addEventListener('resize', updateZoom);
    updateZoom();
    return () => window.removeEventListener('resize', updateZoom);
  }, [canvasSize]);

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FB] text-zinc-900 overflow-hidden select-none">
      
      {/* 1. TOP BAR */}
      <header className="h-16 bg-white border-b border-zinc-200 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6C5CE7] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#6C5CE7]/20">
            <Sparkles size={20} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-sm uppercase tracking-tighter">Simple Editor <span className="text-[#6C5CE7]">MVP</span></h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">by Toollix AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0} className="w-9 h-9 rounded-full">
            <Undo2 size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1} className="w-9 h-9 rounded-full">
            <Redo2 size={18} />
          </Button>
          <div className="w-[1px] h-6 bg-zinc-200 mx-2" />
          <Button 
            className={cn(
              "rounded-full px-5 font-bold text-xs uppercase tracking-widest transition-all",
              isProductMode ? "bg-[#00B894] text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            )}
            onClick={toggleProductMode}
          >
            {isProductMode ? <Check size={14} className="mr-2" /> : <Sparkles size={14} className="mr-2" />}
            Product Mode
          </Button>
          <Button 
            onClick={downloadCanvas}
            className="bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white rounded-full px-6 font-bold text-xs uppercase tracking-widest h-10 shadow-lg shadow-[#6C5CE7]/30"
          >
            <Download size={14} className="mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 2. SIDEBAR (Desktop) / Hidden on Mobile (use bottom bar) */}
        <aside className="hidden lg:flex w-20 bg-white border-r border-zinc-200 flex-col py-6 items-center gap-6 z-40">
          <button 
            onClick={() => setActiveTab(activeTab === "upload" ? null : "upload")}
            className={cn("p-3 rounded-2xl transition-all group", activeTab === "upload" ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20" : "text-zinc-400 hover:bg-zinc-50")}
          >
            <CloudUpload size={24} />
          </button>
          <button 
            onClick={() => setActiveTab(activeTab === "bg" ? null : "bg")}
            className={cn("p-3 rounded-2xl transition-all group", activeTab === "bg" ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20" : "text-zinc-400 hover:bg-zinc-50")}
          >
            <Wand2 size={24} />
          </button>
          <button 
            onClick={() => setActiveTab(activeTab === "text" ? null : "text")}
            className={cn("p-3 rounded-2xl transition-all group", activeTab === "text" ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20" : "text-zinc-400 hover:bg-zinc-50")}
          >
            <Type size={24} />
          </button>
          <button 
            onClick={() => setActiveTab(activeTab === "layers" ? null : "layers")}
            className={cn("p-3 rounded-2xl transition-all group", activeTab === "layers" ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20" : "text-zinc-400 hover:bg-zinc-50")}
          >
            <Layers size={24} />
          </button>
          <button 
            onClick={() => setActiveTab(activeTab === "adjust" ? null : "adjust")}
            className={cn("p-3 rounded-2xl transition-all group", activeTab === "adjust" ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20" : "text-zinc-400 hover:bg-zinc-50")}
          >
            <Settings2 size={24} />
          </button>
        </aside>

        {/* 3. TOOL DRAWER */}
        {activeTab && (
          <div className="absolute inset-x-0 bottom-20 top-16 bg-white z-40 lg:relative lg:inset-auto lg:block lg:w-72 lg:border-r lg:border-zinc-200 p-6 overflow-auto animate-in slide-in-from-bottom lg:slide-in-from-left duration-300">
            <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
              <h3 className="font-black text-sm uppercase tracking-widest text-[#6C5CE7]">Tools</h3>
              <Button variant="ghost" size="icon" onClick={() => setActiveTab(null)} className="w-8 h-8 rounded-full"><X size={16} /></Button>
            </div>
          {activeTab === "upload" && (
            <div className="space-y-6">
              <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400">Assets</h3>
              <label className="block p-8 border-2 border-dashed border-zinc-100 rounded-[32px] cursor-pointer hover:border-[#6C5CE7] transition-all bg-zinc-50 group text-center">
                <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {isUploading ? <Loader2 size={24} className="text-[#6C5CE7] animate-spin" /> : <Upload size={24} className="text-zinc-400" />}
                </div>
                <p className="font-black text-xs uppercase tracking-widest text-zinc-900">Upload Image</p>
                <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold">Support JPG, PNG</p>
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Upload History could go here */}
              </div>
            </div>
          )}

          {activeTab === "text" && (
            <div className="space-y-6">
              <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400">Typography</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => addElement("text")}
                  className="w-full h-14 bg-zinc-50 rounded-2xl flex items-center px-4 gap-4 hover:bg-zinc-100 transition-all border border-zinc-100"
                >
                  <Type size={20} className="text-[#6C5CE7]" />
                  <span className="font-bold text-sm">Add Text Layer</span>
                </button>
                
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Presets</p>
                  <div className="grid grid-cols-1 gap-2">
                    <button className="h-10 bg-white rounded-lg font-black text-[#6C5CE7] text-xs uppercase tracking-widest border border-zinc-100 hover:shadow-md transition-all">SALE 70% OFF</button>
                    <button className="h-10 bg-white rounded-lg font-black text-zinc-900 text-xs uppercase tracking-widest border border-zinc-100 hover:shadow-md transition-all">NEW ARRIVAL</button>
                    <button className="h-10 bg-white rounded-lg font-black text-[#00B894] text-xs uppercase tracking-widest border border-zinc-100 hover:shadow-md transition-all">LIMITED EDITION</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "adjust" && (
            <div className="space-y-6 text-zinc-900">
              <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400">Quick Filters</h3>
              <div className="grid grid-cols-2 gap-2">
                 <Button variant="outline" className="h-20 flex-col gap-2 rounded-2xl border-zinc-100 hover:border-[#6C5CE7]" onClick={() => selectedId && updateElement(selectedId, { opacity: 0.5 })}>
                    <Moon size={18} className="text-[#6C5CE7]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Grayscale</span>
                 </Button>
                 <Button variant="outline" className="h-20 flex-col gap-2 rounded-2xl border-zinc-100 hover:border-[#6C5CE7]" onClick={() => selectedId && updateElement(selectedId, { shadowBlur: 50, shadowColor: "rgba(0,0,0,0.2)" })}>
                    <Sun size={18} className="text-[#6C5CE7]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Glow</span>
                 </Button>
              </div>

              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Social Snap</p>
                <div className="space-y-2">
                  <Button variant="outline" onClick={() => applySocialPreset("insta")} className="w-full justify-start rounded-xl h-12 border-zinc-100 font-bold text-xs uppercase tracking-widest">
                    <Grid size={16} className="mr-3 text-[#6C5CE7]" />
                    Instagram Post (1:1)
                  </Button>
                  <Button variant="outline" onClick={() => applySocialPreset("story")} className="w-full justify-start rounded-xl h-12 border-zinc-100 font-bold text-xs uppercase tracking-widest">
                    <Maximize2 size={16} className="mr-3 text-[#6C5CE7]" />
                    Story / TikTok (9:16)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bg" && (
            <div className="space-y-6">
              <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400">AI Background</h3>
              <Button 
                onClick={removeBackground}
                className="w-full bg-[#6C5CE7] text-white rounded-2xl h-14 font-black uppercase tracking-widest"
              >
                <Wand2 size={20} className="mr-2" />
                Remove Background
              </Button>
              
              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Canvas Presets</p>
                <div className="grid grid-cols-2 gap-2">
                   {["#FFFFFF", "#F8F9FB", "#000000", "#6C5CE7"].map(color => (
                     <button 
                       key={color} 
                       onClick={() => setBackgroundColor(color)}
                       className="aspect-square rounded-xl border-2 border-white shadow-sm" 
                       style={{ backgroundColor: color }} 
                     />
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "layers" && (
            <div className="space-y-6">
              <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400">Layer Stack</h3>
              <div className="space-y-2">
                 {[...elements].reverse().map((el, i) => (
                   <div 
                     key={el.id} 
                     onClick={() => setSelectedId(el.id)}
                     className={cn(
                       "p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer",
                       selectedId === el.id ? "bg-[#6C5CE7]/5 border-[#6C5CE7]" : "bg-white border-zinc-100"
                     )}
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center">
                            {el.type === "image" ? <ImageIcon size={14} className="text-zinc-400" /> : <Type size={14} className="text-zinc-400" />}
                         </div>
                         <span className="text-xs font-bold truncate w-24 uppercase tracking-tighter">
                            {el.type} Layer
                         </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}><Trash2 size={12} /></Button>
                      </div>
                   </div>
                 ))}
                 {elements.length === 0 && <p className="text-xs text-center text-zinc-400 py-12 uppercase font-black tracking-widest">No Layers Yet</p>}
              </div>
            </div>
          )}
        </div>
        )}

        {/* 4. MAIN CANVAS AREA */}
        <main 
          ref={containerRef}
          className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F0F2F5] relative overflow-hidden"
          onClick={() => setSelectedId(null)}
        >
          <div 
            className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white relative transition-transform duration-300 ease-out"
            style={{ 
              width: canvasSize.width * zoom, 
              height: canvasSize.height * zoom,
              backgroundColor: backgroundColor
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
              <Stage
                width={canvasSize.width}
                height={canvasSize.height}
                ref={stageRef}
                onMouseDown={(e) => {
                  if (e.target === e.target.getStage()) setSelectedId(null);
                }}
              >
                <Layer>
                  {/* Background Rect is handled by the parent div for easier styling */}
                  {elements.map((el) => (
                    el.type === "image" ? (
                      <URLImage 
                        key={el.id} 
                        element={el} 
                        isSelected={el.id === selectedId}
                        onSelect={() => setSelectedId(el.id)}
                        onChange={(updates) => updateElement(el.id, updates)}
                      />
                    ) : (
                      <TextElement 
                        key={el.id} 
                        element={el}
                        isSelected={el.id === selectedId}
                        onSelect={() => setSelectedId(el.id)}
                        onChange={(updates) => updateElement(el.id, updates)}
                      />
                    )
                  ))}
                </Layer>
              </Stage>
            </div>
          </div>

          {/* Canvas Floating Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-white shadow-xl z-20">
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}><Minus size={14} /></Button>
                <span className="text-[10px] font-black w-10 text-center uppercase tracking-widest">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><Plus size={14} /></Button>
             </div>
             <div className="w-[1px] h-4 bg-zinc-200" />
             <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className={cn("w-8 h-8 rounded-full", canvasSize.width === 1080 ? "text-[#6C5CE7]" : "text-zinc-400")} onClick={() => setCanvasSize({ width: 1080, height: 1080 })}><RectIcon size={14} /></Button>
                <Button variant="ghost" size="icon" className={cn("w-8 h-8 rounded-full", canvasSize.width === 1080 && canvasSize.height === 1920 ? "text-[#6C5CE7]" : "text-zinc-400")} onClick={() => setCanvasSize({ width: 1080, height: 1920 })}><Maximize2 size={14} className="rotate-90" /></Button>
             </div>
          </div>
        </main>

        {/* 5. RIGHT PANEL (Properties) */}
        {selectedElement && (
          <aside className="absolute inset-x-0 bottom-20 top-16 bg-white z-40 xl:relative xl:inset-auto xl:flex xl:w-72 xl:border-l xl:border-zinc-200 flex-col p-6 overflow-auto animate-in slide-in-from-bottom xl:slide-in-from-right duration-300">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-black text-sm uppercase tracking-widest text-[#6C5CE7]">Properties</h3>
               <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)} className="w-8 h-8 rounded-full"><X size={16} /></Button>
             </div>

             <div className="space-y-8">
                {/* Element Specific Controls */}
                {selectedElement.type === "text" && (
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Text Content</p>
                         <textarea 
                           className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#6C5CE7] outline-none transition-all h-24 resize-none"
                           value={selectedElement.content}
                           onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Font Size</p>
                          <input 
                            type="number" 
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-lg p-2 text-xs font-bold"
                            value={Math.round(selectedElement.fontSize || 48)}
                            onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Color</p>
                          <input 
                            type="color" 
                            className="w-full h-8 bg-transparent cursor-pointer p-0 border-none"
                            value={selectedElement.fill}
                            onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                          />
                        </div>
                      </div>
                   </div>
                )}

                {selectedElement.type === "image" && (
                   <div className="space-y-6">
                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">AI Tools</p>
                         <Button onClick={removeBackground} className="w-full bg-zinc-900 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-widest">
                           <Wand2 size={14} className="mr-2" />
                           Cut Out Object
                         </Button>
                      </div>
                      
                      <div className="space-y-3 pt-6 border-t border-zinc-100">
                         <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Adjustments</p>
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-bold uppercase text-zinc-500">Opacity</span>
                               <span className="text-[10px] font-black text-[#6C5CE7]">{Math.round(selectedElement.opacity * 100)}%</span>
                            </div>
                            <input 
                              type="range" min="0" max="1" step="0.01" 
                              className="w-full accent-[#6C5CE7]"
                              value={selectedElement.opacity}
                              onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                            />
                         </div>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-zinc-100">
                         <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Layer Control</p>
                         <div className="flex gap-2">
                           <Button variant="outline" className="flex-1 rounded-xl h-10 border-zinc-100" onClick={() => updateElement(selectedElement.id, { isLocked: !selectedElement.isLocked })}>
                             <Lock size={14} className={selectedElement.isLocked ? "text-[#6C5CE7]" : ""} />
                           </Button>
                           <Button variant="outline" className="flex-1 rounded-xl h-10 border-zinc-100" onClick={() => deleteElement(selectedElement.id)}>
                             <Trash2 size={14} />
                           </Button>
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </aside>
        )}
      </div>

      {/* 6. MOBILE BOTTOM BAR */}
      <nav className="lg:hidden h-20 bg-white border-t border-zinc-200 flex items-center justify-around px-4 z-50">
          <button onClick={() => setActiveTab(activeTab === "upload" ? null : "upload")} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "upload" ? "text-[#6C5CE7]" : "text-zinc-400")}>
            <CloudUpload size={20} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Upload</span>
          </button>
          <button onClick={() => setActiveTab(activeTab === "bg" ? null : "bg")} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "bg" ? "text-[#6C5CE7]" : "text-zinc-400")}>
            <Wand2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-tighter">AI Edit</span>
          </button>
          <button onClick={() => setActiveTab(activeTab === "text" ? null : "text")} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "text" ? "text-[#6C5CE7]" : "text-zinc-400")}>
            <Type size={20} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Text</span>
          </button>
          <button onClick={() => setActiveTab(activeTab === "layers" ? null : "layers")} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "layers" ? "text-[#6C5CE7]" : "text-zinc-400")}>
            <Layers size={20} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Layers</span>
          </button>
          <button onClick={() => setActiveTab(activeTab === "adjust" ? null : "adjust")} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "adjust" ? "text-[#6C5CE7]" : "text-zinc-400")}>
            <Settings2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Adjust</span>
          </button>
      </nav>

    </div>
  );
}
