"use client";

import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  FileText, Loader2, CheckCircle2, Download, RotateCcw, Upload, Check, Type,
  ImagePlus, Pointer, Trash2, Save, Palette, Undo, Link2,
  FileSignature, PenTool, Eraser, RectangleHorizontal, Circle, Trash, Minus, Plus, GripVertical,
  Highlighter, Baseline, ShieldCheck, Zap
} from "lucide-react";

import nextDynamic from "next/dynamic";
const Document = nextDynamic(() => import("react-pdf").then((mod) => {
  mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
  return mod.Document;
}), { ssr: false });
const Page = nextDynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { usePdfEditorStore, PdfElement } from "@/lib/pdf-editor-store";
// import { PDFDocument, rgb, StandardFonts, PDFName } from "pdf-lib"; // Moved to dynamic imports inside functions

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Initialize PDF.js worker logic moved to useEffect inside the component

// Sortable Thumbnail Component
const SortableThumbnail = ({ index, onClick, onDelete }: { index: number, onClick: () => void, onDelete: (e: React.MouseEvent) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative group mb-6", isDragging ? "opacity-50" : "opacity-100")}>
        <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab hover:bg-zinc-200 p-1 rounded active:cursor-grabbing text-zinc-400 transition-colors">
                <GripVertical className="w-4 h-4" />
            </div>
            <div className="relative cursor-pointer hover:ring-2 ring-primary rounded transition-all shadow-sm bg-white" onClick={onClick}>
                <Page pageNumber={index + 1} width={140} renderTextLayer={false} renderAnnotationLayer={false} />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-zinc-500 text-[10px] px-2 py-0.5 rounded-full font-mono bg-zinc-100 shadow-sm border border-zinc-200/50">
                    {index + 1}
                </div>
                {/* Delete overlay */}
                <button 
                    onClick={onDelete} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md z-10"
                    title="Delete Page"
                >
                    <Trash className="w-3 h-3" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default function EditPdfClient() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const { elements, addElement, updateElement, removeElement, undo, redo, clearAll } = usePdfEditorStore();
  const [activeTool, setActiveTool] = useState<"text" | "image" | "select" | "whiteout" | "shapes" | "circle" | "form" | "link">("select");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(typeof window !== 'undefined' ? Math.min(window.innerWidth - 64, 1000) : 1000);
  const viewerRef = useRef<HTMLDivElement>(null);

  // PDF.js worker is initialized dynamically above

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && viewerRef.current) {
        const isSm = typeof window !== 'undefined' && window.innerWidth >= 640;
        const padding = isSm ? 96 : 48; // Increased from 32 to 48 on mobile to prevent side cut-off
        let availableWidth = entries[0].contentRect.width - padding;
        // Limit max width on PC for better readability and to prevent layout breaking
        if (availableWidth > 1000) availableWidth = 1000;
        setContainerWidth(Math.floor(Math.max(200, availableWidth)));
      }
    });

    if (viewerRef.current) observer.observe(viewerRef.current);
    return () => observer.disconnect();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (file) {
      file.arrayBuffer().then(buffer => {
        setPdfBytes(new Uint8Array(buffer));
        setStep(2);
      });
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const visualScale = containerWidth / 1000;

  const rgbStringToHex = (rgb: string) => {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return "#000000";
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
  };

  const handleCanvasClick = async (e: React.MouseEvent, pageIndex: number) => {
    // Phase 3: Smart Text Engine - In-Line Editing
    const target = e.target as HTMLElement;
    if (activeTool === "select" && target.tagName.toLowerCase() === 'span' && target.closest('.react-pdf__Page__textContent')) {
        e.stopPropagation();
        
        const computedStyle = window.getComputedStyle(target);
        const rect = target.getBoundingClientRect();
        const canvasRect = e.currentTarget.getBoundingClientRect();
        
        const x = (rect.left - canvasRect.left) / visualScale;
        const y = (rect.top - canvasRect.top) / visualScale;
        const width = rect.width / visualScale;
        const height = rect.height / visualScale;
        
        const fontSizePx = parseFloat(computedStyle.fontSize);
        const fontSize = fontSizePx / visualScale;
        const content = target.innerText || target.textContent || "";
        const fontFamilyStr = computedStyle.fontFamily || "Helvetica";
        
        // Detect Bold and Italic
        const isBold = parseInt(computedStyle.fontWeight) >= 600 || computedStyle.fontWeight === "bold" || fontFamilyStr.toLowerCase().includes("bold");
        const isItalic = computedStyle.fontStyle === "italic" || fontFamilyStr.toLowerCase().includes("italic") || fontFamilyStr.toLowerCase().includes("oblique");

        let mappedFont = "Helvetica";
        if (fontFamilyStr.includes("Times")) mappedFont = "Times-Roman";
        else if (fontFamilyStr.includes("Courier")) mappedFont = "Courier";

        if (isBold && isItalic) {
            if (mappedFont === "Helvetica") mappedFont = "Helvetica-BoldOblique";
            if (mappedFont === "Times-Roman") mappedFont = "Times-BoldItalic";
            if (mappedFont === "Courier") mappedFont = "Courier-BoldOblique";
        } else if (isBold) {
            if (mappedFont === "Helvetica") mappedFont = "Helvetica-Bold";
            if (mappedFont === "Times-Roman") mappedFont = "Times-Bold";
            if (mappedFont === "Courier") mappedFont = "Courier-Bold";
        } else if (isItalic) {
            if (mappedFont === "Helvetica") mappedFont = "Helvetica-Oblique";
            if (mappedFont === "Times-Roman") mappedFont = "Times-Italic";
            if (mappedFont === "Courier") mappedFont = "Courier-Oblique";
        }
        
        // Hide original text by making it transparent
        target.style.opacity = "0";
        
        const id = "reflow_" + Date.now().toString();
        const whiteoutId = "whiteout_" + Date.now().toString();
        
        // 1. Create a whiteout block to erase the baked-in PDF text
        addElement({
            id: whiteoutId,
            type: "shape",
            x: x - 1, 
            y: y - 1, 
            pageIndex, 
            width: width + 2, 
            height: height + 2, 
            color: "#ffffff"
        });
        
        // 2. Spawn an editable text block exactly on top with the same content
        addElement({ 
            id, 
            type: "text", 
            x, 
            y: y,
            pageIndex, 
            content: content.trim() || " ", 
            fontSize, 
            color: rgbStringToHex(computedStyle.color) || "#000000", 
            fontFamily: fontFamilyStr, 
            fontWeight: computedStyle.fontWeight,
            fontStyle: computedStyle.fontStyle,
            width: width + 100, 
            height: height + 20 
        });
        
        setActiveElementId(id);
        return;
    }

    if (activeTool === "select") {
      setActiveElementId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / visualScale;
    const y = (e.clientY - rect.top) / visualScale;
    const id = Date.now().toString();
    
    if (activeTool === "text") {
      const { StandardFonts } = await import("pdf-lib");
      addElement({ id, type: "text", x, y, pageIndex, content: "Double-click to edit", fontSize: 18, color: "#000000", fontFamily: StandardFonts.Helvetica, width: 200, height: 50 });
      setActiveElementId(id);
      setActiveTool("select");
    } else if (activeTool === "image" && imageFile) {
      const src = URL.createObjectURL(imageFile);
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        let w = 150;
        let h = 150;
        if (aspect > 1) { h = 150 / aspect; } 
        else { w = 150 * aspect; }
        
        addElement({ id, type: "image", x, y, pageIndex, src, width: w, height: h });
        setActiveElementId(id);
        setImageFile(null);
        setActiveTool("select");
      };
      img.src = src;
    } else if (activeTool === "whiteout") {
      addElement({ id, type: "shape", x, y, pageIndex, width: 100, height: 50, color: "#ffffff" });
      setActiveElementId(id);
      setActiveTool("select");
    } else if (activeTool === "shapes") {
      addElement({ id, type: "shape", x, y, pageIndex, width: 100, height: 100, color: "#3b82f6" });
      setActiveElementId(id);
      setActiveTool("select");
    } else if (activeTool === "circle") {
      addElement({ id, type: "circle", x, y, pageIndex, width: 100, height: 100, color: "#ef4444" });
      setActiveElementId(id);
      setActiveTool("select");
    } else if (activeTool === "form") {
      addElement({ id, type: "form", x, y, pageIndex, width: 150, height: 30, content: "" });
      setActiveElementId(id);
      setActiveTool("select");
    } else if (activeTool === "link") {
      addElement({ id, type: "link", x, y, pageIndex, width: 150, height: 30, url: "https://" });
      setActiveElementId(id);
      setActiveTool("select");
    }
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, el: PdfElement) => {
    if (activeTool !== "select") return;
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const startX = clientX;
    const startY = clientY;
    
    const move = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const deltaX = (currentX - startX) / visualScale;
      const deltaY = (currentY - startY) / visualScale;
      updateElement(el.id, { x: el.x + deltaX, y: el.y + deltaY });
    };
    
    const up = () => {
      window.removeEventListener("mousemove", move as any);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move as any);
      window.removeEventListener("touchend", up);
    };
    
    window.addEventListener("mousemove", move as any);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move as any, { passive: false });
    window.addEventListener("touchend", up);
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, el: PdfElement, direction: 'w' | 'h' | 'both') => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const startX = clientX;
    const startY = clientY;
    const startWidth = el.width || 100;
    const startHeight = el.height || 50;
    const startFontSize = el.fontSize || 18;

    const move = (moveEvent: MouseEvent | TouchEvent) => {
        const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
        
        const deltaX = (currentX - startX) / visualScale;
        const deltaY = (currentY - startY) / visualScale;
        
        const updates: Partial<PdfElement> = {};
        
        if (direction === 'both' && (el.type === 'image' || el.type === 'text' || el.type === 'circle')) {
            const scale = Math.max(0.1, 1 + deltaX / startWidth);
            updates.width = Math.max(20, startWidth * scale);
            updates.height = Math.max(20, startHeight * scale);
            if (el.type === 'text') {
                updates.fontSize = Math.max(6, startFontSize * scale);
            }
        } else {
            if (direction === 'w' || direction === 'both') {
                updates.width = Math.max(20, startWidth + deltaX);
            }
            if (direction === 'h' || direction === 'both') {
                updates.height = Math.max(20, startHeight + deltaY);
            }
        }
        updateElement(el.id, updates);
    };

    const up = () => {
        window.removeEventListener("mousemove", move as any);
        window.removeEventListener("mouseup", up);
        window.removeEventListener("touchmove", move as any);
        window.removeEventListener("touchend", up);
    };

    window.addEventListener("mousemove", move as any);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move as any, { passive: false });
    window.addEventListener("touchend", up);
  };

  const scrollToPage = (pageIndex: number) => {
    const el = document.getElementById(`page_${pageIndex}`);
    if (el && viewerRef.current) {
        viewerRef.current.scrollTo({
            top: el.offsetTop - 20,
            behavior: 'smooth'
        });
    }
  };

  const ResizeHandles = ({ el }: { el: PdfElement }) => {
    if (activeTool !== "select") return null;
    const isText = el.type === 'text' || el.type === 'form' || el.type === 'link';
    
    return (
        <>
            {/* Width-only handle for text wrapping (Right Side) */}
            {isText && (
                <div 
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-10 bg-[#c5a059] rounded-full border-2 border-white shadow-lg cursor-ew-resize flex items-center justify-center touch-none"
                    onMouseDown={(e) => handleResizeStart(e, el, 'w')}
                    onTouchStart={(e) => handleResizeStart(e, el, 'w')}
                    title="Adjust Width / Fix Line Breaks"
                >
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                </div>
            )}

            {/* Main Scaling Handle (Corner Only) */}
            <div 
                className="absolute -right-2.5 -bottom-2.5 w-7 h-7 bg-[#c5a059] rounded-full cursor-nwse-resize z-[60] hover:scale-110 active:scale-95 transition-all shadow-lg border-2 border-white opacity-0 group-hover/el:opacity-100 flex items-center justify-center"
                onMouseDown={(e) => handleResizeStart(e, el, 'both')}
                title={isText ? "Scale Text & Font Size" : "Scale Element"}
            >
                <div className="w-2 h-2 bg-white rounded-sm transform rotate-45" />
            </div>
        </>
    );
  };

  const deletePage = async (pageIndex: number) => {
    if (!pdfBytes) return;
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.removePage(pageIndex);
      const newBytes = await pdfDoc.save();
      setPdfBytes(newBytes);
      const blob = new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setFile(new File([blob], file?.name || "document.pdf", { type: "application/pdf" }));
    } catch (err) {
      console.error(err);
    }
  };

  const addPage = async () => {
    if (!pdfBytes) return;
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.addPage();
      const newBytes = await pdfDoc.save();
      setPdfBytes(newBytes);
      const blob = new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setFile(new File([blob], file?.name || "document.pdf", { type: "application/pdf" }));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageReorder = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !pdfBytes) return;
    if (active.id !== over.id) {
        const oldIndex = parseInt(active.id as string);
        const newIndex = parseInt(over.id as string);
        
        try {
            const { PDFDocument } = await import("pdf-lib");
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const newPdfDoc = await PDFDocument.create();
            
            const pageIndices = Array.from({ length: numPages }, (_, i) => i);
            const [moved] = pageIndices.splice(oldIndex, 1);
            pageIndices.splice(newIndex, 0, moved);
            
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach(page => newPdfDoc.addPage(page));
            
            const newBytes = await newPdfDoc.save();
            setPdfBytes(newBytes);
            const blob = new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            setFile(new File([blob], file?.name || "document.pdf", { type: "application/pdf" }));
        } catch (err) {
            console.error(err);
        }
    }
  };

  const exportPdf = async () => {
    if (!pdfBytes) return;
    setIsExporting(true);
    try {
      const { PDFDocument, rgb, StandardFonts, PDFName } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      
      let form;
      try { form = pdfDoc.getForm(); } catch (e) {}

      for (const el of elements) {
        if (el.pageIndex >= pages.length) continue;
        const page = pages[el.pageIndex];
        const { height } = page.getSize();
        
        const scale = page.getWidth() / 1000;

        if (el.type === "text") {
          const fontName = el.fontFamily?.toLowerCase() || "";
          const isBold = el.fontWeight === "bold" || parseInt(el.fontWeight || "400") >= 600 || fontName.includes("bold");
          const isItalic = el.fontStyle === "italic" || fontName.includes("italic") || fontName.includes("oblique");
          
          let standardFont = StandardFonts.Helvetica;
          if (fontName.includes("times")) {
            if (isBold && isItalic) standardFont = StandardFonts.TimesRomanBoldItalic;
            else if (isBold) standardFont = StandardFonts.TimesRomanBold;
            else if (isItalic) standardFont = StandardFonts.TimesRomanItalic;
            else standardFont = StandardFonts.TimesRoman;
          } else if (fontName.includes("courier")) {
            if (isBold && isItalic) standardFont = StandardFonts.CourierBoldOblique;
            else if (isBold) standardFont = StandardFonts.CourierBold;
            else if (isItalic) standardFont = StandardFonts.CourierOblique;
            else standardFont = StandardFonts.Courier;
          } else {
            if (isBold && isItalic) standardFont = StandardFonts.HelveticaBoldOblique;
            else if (isBold) standardFont = StandardFonts.HelveticaBold;
            else if (isItalic) standardFont = StandardFonts.HelveticaOblique;
            else standardFont = StandardFonts.Helvetica;
          }

          let fontToUse = await pdfDoc.embedFont(standardFont);
          
          const lines = (el.content ?? "").split('\n');
          const fontSizeScaled = (el.fontSize ?? 18) * scale;
          const lineHeight = fontSizeScaled * 1.2;

          for (let i = 0; i < lines.length; i++) {
              page.drawText(lines[i], {
                  x: el.x * scale,
                  y: height - (el.y * scale) - fontSizeScaled - (i * lineHeight),
                  size: fontSizeScaled,
                  color: rgb(...hexToRgb(el.color ?? "#000000")),
                  font: fontToUse,
                  maxWidth: el.width ? el.width * scale : undefined,
                  wordBreaks: [' '],
              });
          }
        } else if (el.type === "image" && el.src) {
          const imgBytes = await fetch(el.src).then(r => r.arrayBuffer());
          const pngImg = await pdfDoc.embedPng(imgBytes);
          const drawWidth = (el.width ?? pngImg.width) * scale;
          const drawHeight = (el.height ?? pngImg.height) * scale;
          page.drawImage(pngImg, {
            x: el.x * scale,
            y: height - (el.y * scale) - drawHeight,
            width: drawWidth,
            height: drawHeight,
          });
        } else if (el.type === "shape") {
          page.drawRectangle({
            x: el.x * scale,
            y: height - (el.y * scale) - ((el.height ?? 50) * scale),
            width: (el.width ?? 100) * scale,
            height: (el.height ?? 50) * scale,
            color: rgb(...hexToRgb(el.color ?? "#ffffff")),
          });
        } else if (el.type === "circle") {
          page.drawEllipse({
            x: (el.x * scale) + ((el.width ?? 100) * scale) / 2,
            y: height - (el.y * scale) - ((el.height ?? 100) * scale) / 2,
            xScale: ((el.width ?? 100) * scale) / 2,
            yScale: ((el.height ?? 100) * scale) / 2,
            color: rgb(...hexToRgb(el.color ?? "#ffffff")),
          });
        } else if (el.type === "form" && form) {
          try {
            const textField = form.createTextField(`field_${el.id}`);
            if (el.content) textField.setText(el.content);
            textField.addToPage(page, {
              x: el.x * scale,
              y: height - (el.y * scale) - ((el.height ?? 30) * scale),
              width: (el.width ?? 150) * scale,
              height: (el.height ?? 30) * scale,
            });
          } catch (e) { console.warn("Failed to create form field", e); }
        } else if (el.type === "link" && el.url) {
          try {
            const linkAnnot = pdfDoc.context.obj({
              Type: 'Annot',
              Subtype: 'Link',
              Rect: [
                el.x * scale, 
                height - (el.y * scale) - ((el.height ?? 30) * scale), 
                (el.x * scale) + ((el.width ?? 150) * scale), 
                height - (el.y * scale)
              ],
              Border: [0, 0, 0],
              A: {
                Type: 'Action',
                S: 'URI',
                URI: pdfDoc.context.obj(el.url),
              },
            });
            
            let annots = page.node.Annots();
            if (!annots) {
              annots = pdfDoc.context.obj([]);
              page.node.set(PDFName.of('Annots'), annots);
            }
            annots.push(linkAnnot);
          } catch (e) { console.warn("Failed to create link", e); }
        }
      }
      const mergedPdfBytes = await pdfDoc.save();
      const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStep(3);
    } catch (err) {
      console.error(err);
      setError("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return [0, 0, 0];
    const bigint = parseInt(clean, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return [r, g, b];
  };

  const resetAll = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setPdfBytes(null);
    setStep(1);
    setDownloadUrl(null);
    clearAll();
  };

  const buttonClass = (isActive: boolean) => cn(
      "rounded-full font-semibold shrink-0 transition-all px-4 h-9 shadow-none", 
      isActive ? "bg-[#c5a059] text-white shadow-md hover:bg-[#b08d4b]" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 bg-transparent"
  );

  return (
    <ToolLayout title="Edit PDF" description="Professional online PDF editor. Add text, images, forms, shapes, and manage pages effortlessly." fullWidth>
      <style dangerouslySetInnerHTML={{ __html: `
        .react-pdf__Page__canvas {
          max-width: 100% !important;
          height: auto !important;
          margin: 0 auto !important;
        }
      ` }} />
      
      <div className="flex flex-col w-full max-w-full min-w-0 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-2xl relative" style={{ height: 'calc(100vh - 2rem)', minHeight: '1000px' }}>
        
        {/* Header (Always Visible in Step 2) */}
        {step === 2 && file && (
            <header className="h-16 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-6 flex items-center justify-end z-40 shrink-0">
                <button onClick={exportPdf} disabled={isExporting} className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#a38448] text-white px-4 sm:px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded shadow-sm disabled:opacity-50">
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                    <span className="hidden sm:inline">{isExporting ? "Saving..." : "Save & Download"}</span>
                    <span className="sm:hidden">{isExporting ? "Saving..." : "Save"}</span>
                </button>
            </header>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f3f4f6] dark:bg-[#121212]">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-light mb-2 tracking-tight">Advanced PDF Editor</h2>
              <p className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">In-Line Edit • Annotate • Format</p>
            </div>
            <div 
              onClick={() => document.getElementById("edit-upload")?.click()}
              className="group relative h-64 w-full max-w-2xl border-2 border-dashed border-[#c5a059]/40 bg-[#c5a059]/5 hover:bg-[#c5a059]/10 flex flex-col items-center justify-center cursor-pointer transition-all rounded-xl shadow-sm"
            >
              <Upload className="w-10 h-10 text-[#c5a059]/60 mb-4 group-hover:text-[#c5a059] transition-colors" />
              <span className="text-xs uppercase tracking-widest font-bold text-[#c5a059]">Click to upload document</span>
              <input id="edit-upload" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
            </div>
          </main>
        )}

        {/* Step 2: Edit Workspace */}
        {step === 2 && file && (
          <div className="flex flex-col sm:flex-row flex-1 overflow-hidden bg-[#f3f4f6] dark:bg-[#121212]">
            
            {/* Left Toolbar — mobile: pill row, desktop: vertical column */}
            <aside className="w-full max-w-full min-w-0 sm:w-20 bg-white dark:bg-zinc-950 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-zinc-800 flex flex-col items-center py-3 sm:py-8 shrink-0 overflow-y-auto overflow-x-hidden px-2 sm:px-0 z-10">

              {/* Mobile: 2-column grid toolbar */}
              <div className="grid grid-cols-2 sm:hidden gap-2 w-full max-w-full min-w-0 px-1">
                <button onClick={undo} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 w-full">
                  <Undo className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase whitespace-nowrap">Undo</span>
                </button>
                <button onClick={redo} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 w-full">
                  <RotateCcw className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase whitespace-nowrap">Redo</span>
                </button>
                {[
                  { id: 'select', icon: Pointer, label: 'Select' },
                  { id: 'text', icon: Baseline, label: 'Text' },
                  { id: 'link', icon: Link2, label: 'Links' },
                  { id: 'form', icon: FileSignature, label: 'Forms' },
                  { id: 'image', icon: ImagePlus, label: 'Images' },
                  { id: 'whiteout', icon: Eraser, label: 'Erase' },
                  { id: 'shapes', icon: RectangleHorizontal, label: 'Shapes' },
                  { id: 'circle', icon: Circle, label: 'Circle' },
                ].map(tool => (
                  <button key={tool.id}
                    onClick={() => { if (tool.id === 'image') { document.getElementById('img-up-m')?.click(); } else { setActiveTool(tool.id as any); } }}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all w-full ${activeTool === tool.id ? 'bg-[#c5a059] border-[#c5a059] text-white' : 'bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500'}`}
                  >
                    <tool.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-black uppercase whitespace-nowrap">{tool.label}</span>
                    {tool.id === 'image' && <input id="img-up-m" type="file" accept="image/png,image/jpeg" className="hidden" onChange={e => { setImageFile(e.target.files?.[0] ?? null); setActiveTool('image'); }} />}
                  </button>
                ))}
              </div>

              {/* Desktop: vertical icon column */}
              <div className="hidden sm:flex flex-col items-center gap-6 w-full">
                <div className="flex flex-col items-center gap-1.5">
                  <button onClick={undo} className="group flex flex-col items-center gap-1 text-gray-400 hover:text-black dark:hover:text-white shrink-0">
                    <div className="p-2 border border-transparent rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900"><Undo className="w-4 h-4" /></div>
                    <span className="text-[6px] uppercase font-black tracking-tighter">Undo</span>
                  </button>
                  <button onClick={redo} className="group flex flex-col items-center gap-1 text-gray-400 hover:text-black dark:hover:text-white shrink-0">
                    <div className="p-2 border border-transparent rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900"><RotateCcw className="w-4 h-4 scale-x-[-1]" /></div>
                    <span className="text-[6px] uppercase font-black tracking-tighter">Redo</span>
                  </button>
                </div>
                <div className="w-8 h-px bg-gray-200 dark:bg-zinc-800 shrink-0" />
                {[
                  { id: 'select', icon: Pointer, label: 'Select' },
                  { id: 'text', icon: Baseline, label: 'Text' },
                  { id: 'link', icon: Link2, label: 'Links' },
                  { id: 'form', icon: FileSignature, label: 'Forms' },
                  { id: 'image', icon: ImagePlus, label: 'Images' },
                  { id: 'whiteout', icon: Eraser, label: 'Erase' },
                  { id: 'shapes', icon: RectangleHorizontal, label: 'Shapes' },
                  { id: 'circle', icon: Circle, label: 'Circle' },
                ].map(tool => (
                  <button key={tool.id}
                    onClick={() => { if (tool.id === 'image') { document.getElementById('edit-image-upload')?.click(); } else { setActiveTool(tool.id as any); } }}
                    className={`group flex flex-col items-center gap-1 shrink-0 ${activeTool === tool.id ? 'text-[#c5a059]' : 'text-gray-400 hover:text-black dark:hover:text-white transition-colors'}`}
                  >
                    <div className={`relative p-2 sm:p-3 border rounded-xl transition-all ${activeTool === tool.id ? 'border-[#c5a059] bg-[#c5a059]/5 shadow-md scale-105' : 'border-transparent opacity-70'}`}>
                      <tool.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {tool.id === 'image' && <input id="edit-image-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={e => { setImageFile(e.target.files?.[0] ?? null); setActiveTool("image"); }} />}
                    </div>
                    <span className="text-[6px] sm:text-[8px] uppercase font-black tracking-widest">{tool.label}</span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Workspace Layout */}
            <div className="flex flex-1 flex-col overflow-hidden relative">
                
                {/* Editor Status Bar */}
                <div className="h-10 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 text-[9px] uppercase font-bold text-gray-400 z-30 shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-green-500" /> Secure</span>
                        <span className="hidden sm:inline flex items-center gap-1.5"><Zap className="w-3 h-3 text-[#c5a059]" /> Turbo</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 tracking-widest">
                            Page 1 of {numPages}
                        </span>
                    </div>
                </div>

                {/* Workspace Content (Viewer + Sidebar) */}
                <div className="flex flex-1 flex-row overflow-hidden relative w-full max-w-full">
                    
                    {/* PDF Viewer - Wide Version without borders */}
                    <div className="flex-1 overflow-x-auto overflow-y-auto px-4 py-8 sm:p-12 flex flex-col items-center bg-[#f3f4f6] dark:bg-[#121212] min-w-0 scrollbar-thin w-full max-w-full" ref={viewerRef}>
                    <Document file={file} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error} className="flex flex-col items-center gap-10 w-full max-w-full">
                        {Array.from(new Array(numPages), (el, index) => (
                            <div key={`page_wrapper_${index}`} className="flex flex-col items-center gap-3 w-full">
                                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1">
                                    Document Page {index + 1}
                                </span>
                                <div 
                                    key={`page_${index}`} 
                                    id={`page_${index}`} 
                                    className={cn(
                                        "relative bg-white shadow-2xl rounded-sm transition-all duration-200 block mx-auto group overflow-hidden border border-zinc-200/50 w-fit max-w-full [&_.react-pdf__Page]:!w-fit [&_.react-pdf__Page]:!max-w-full [&_.react-pdf__Page__canvas]:!max-w-full [&_.react-pdf__Page__canvas]:!w-full [&_.react-pdf__Page__canvas]:!h-auto",
                                        activeTool !== "select" ? "cursor-crosshair" : ""
                                    )}
                                    onClick={(e) => handleCanvasClick(e, index)}
                                >
                                {/* The Page Render - Responsive Layout */}
                                <Page 
                                    pageNumber={index + 1} 
                                    renderTextLayer={true} 
                                    renderAnnotationLayer={false} 
                                    width={containerWidth} 
                                    className="max-w-full" 
                                />
                                
                                {/* Overlay Interactions */}
                                <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                                    {elements.filter(el => el.pageIndex === index).map(el => {
                                        const isActive = el.id === activeElementId;
                                        const isWhiteout = el.id.startsWith("whiteout_");
                                        return (
                                            <div 
                                                key={el.id} 
                                                className={cn(
                                                    "absolute flex items-center justify-center transition-all duration-75",
                                                    isWhiteout ? "pointer-events-none" : "cursor-move pointer-events-auto",
                                                    (isActive && !isWhiteout) ? "ring-2 ring-[#c5a059] bg-[#c5a059]/5 z-50" : (!isWhiteout && "hover:ring-1 hover:ring-zinc-300")
                                                )}
                                                style={{ 
                                                    left: el.x * visualScale, 
                                                    top: el.y * visualScale, 
                                                    width: (el.width ?? 100) * visualScale, 
                                                    height: (el.height ?? 50) * visualScale 
                                                }}
                                                onMouseDown={(e) => { 
                                                    if (isWhiteout) return;
                                                    e.stopPropagation(); 
                                                    setActiveElementId(el.id); 
                                                    handleDrag(e, el); 
                                                }}
                                                onTouchStart={(e) => { 
                                                    if (isWhiteout) return;
                                                    e.stopPropagation(); 
                                                    setActiveElementId(el.id); 
                                                    handleDrag(e, el); 
                                                }}
                                                onClick={(e) => {
                                                    if (!isWhiteout) e.stopPropagation();
                                                }}
                                            >
                                            {/* Text Edit */}
                                            {el.type === "text" && (
                                                <div className="group/el relative flex flex-col w-full h-full hover:ring-2 ring-primary/50 rounded border border-transparent hover:border-black/10">
                                                    <textarea 
                                                        value={el.content} 
                                                        onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                                        className={cn(
                                                            "w-full h-full bg-transparent border-none outline-none resize-none p-0 m-0 font-sans leading-[1] overflow-hidden hover:bg-primary/5 focus:bg-primary/5 transition-colors rounded",
                                                            activeTool === "select" ? "pointer-events-auto" : "pointer-events-none"
                                                        )}
                                                        style={{ 
                                                            fontSize: (el.fontSize ?? 18) * visualScale, 
                                                            color: el.color || "#000000", 
                                                            lineHeight: 1,
                                                            fontFamily: el.fontFamily,
                                                            fontWeight: el.fontWeight || 'normal',
                                                            fontStyle: el.fontStyle || 'normal'
                                                        }}
                                                    />
                                                    {activeTool === "select" && (
                                                        <>
                                                            <div className={cn(
                                                                "absolute -top-14 left-0 bg-white shadow-xl rounded-full p-2 transition-opacity flex items-center gap-1.5 z-50 pointer-events-auto border min-w-max",
                                                                isActive ? "opacity-100" : "opacity-0 group-hover/el:opacity-100"
                                                            )}>
                                                                <select 
                                                                    className="text-xs border-none rounded-full px-2 py-1 outline-none text-zinc-700 bg-zinc-100 cursor-pointer font-medium"
                                                                    value={el.fontFamily || "Helvetica"}
                                                                    onChange={async (e) => { 
                                                                        e.stopPropagation(); 
                                                                        await import("pdf-lib");
                                                                        updateElement(el.id, { fontFamily: e.target.value }); 
                                                                    }}
                                                                >
                                                                    <optgroup label="Helvetica">
                                                                        <option value={"Helvetica"}>Regular</option>
                                                                        <option value={"Helvetica-Bold"}>Bold</option>
                                                                        <option value={"Helvetica-Oblique"}>Italic</option>
                                                                        <option value={"Helvetica-BoldOblique"}>Bold Italic</option>
                                                                    </optgroup>
                                                                    <optgroup label="Times Roman">
                                                                        <option value={"Times-Roman"}>Regular</option>
                                                                        <option value={"Times-Bold"}>Bold</option>
                                                                        <option value={"Times-Italic"}>Italic</option>
                                                                        <option value={"Times-BoldItalic"}>Bold Italic</option>
                                                                    </optgroup>
                                                                    <optgroup label="Courier">
                                                                        <option value={"Courier"}>Regular</option>
                                                                        <option value={"Courier-Bold"}>Bold</option>
                                                                        <option value={"Courier-Oblique"}>Italic</option>
                                                                        <option value={"Courier-BoldOblique"}>Bold Italic</option>
                                                                    </optgroup>
                                                                </select>
                                                                <div className="w-px h-4 bg-border" />
                                                                <div className="flex items-center bg-zinc-100 rounded-full overflow-hidden">
                                                                    <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, { fontSize: Math.max(8, (el.fontSize ?? 18) - 2) }); }} className="p-1.5 hover:bg-zinc-200"><Minus className="w-3.5 h-3.5 text-zinc-600" /></button>
                                                                    <span className="text-xs font-mono px-1 text-zinc-600 font-bold">{el.fontSize}</span>
                                                                    <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, { fontSize: Math.min(120, (el.fontSize ?? 18) + 2) }); }} className="p-1.5 hover:bg-zinc-200"><Plus className="w-3.5 h-3.5 text-zinc-600" /></button>
                                                                </div>
                                                                <div className="w-px h-4 bg-border" />
                                                                <input 
                                                                    type="color" 
                                                                    value={el.color || "#000000"} 
                                                                    onChange={(e) => updateElement(el.id, { color: e.target.value })}
                                                                    className="w-7 h-7 p-0 border-0 rounded-full cursor-pointer overflow-hidden"
                                                                />
                                                                <div className="w-px h-4 bg-border" />
                                                                <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded-full">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <ResizeHandles el={el} />
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Image Edit */}
                                            {el.type === "image" && el.src && (
                                                <div className="group/el relative w-full h-full rounded hover:ring-2 ring-primary/50 ring-offset-2">
                                                    <img src={el.src} alt="overlay" style={{ width: "100%", height: "100%", pointerEvents: "none" }} className="rounded shadow-sm" />
                                                    {activeTool === "select" && (
                                                        <>
                                                            <div className="absolute -top-12 left-0 bg-white shadow-xl rounded-full p-1.5 opacity-0 group-hover/el:opacity-100 transition-opacity flex gap-1 z-50 pointer-events-auto border">
                                                                <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded-full">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <ResizeHandles el={el} />
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Shape Edit (Square) */}
                                            {el.type === "shape" && (
                                                <div 
                                                    className={cn(
                                                        "group/el relative w-full h-full transition-all",
                                                        isWhiteout ? "" : "rounded shadow-sm hover:ring-2 ring-primary/50 ring-offset-2 border border-black/10"
                                                    )} 
                                                    style={{ backgroundColor: el.color }}
                                                >
                                                    {activeTool === "select" && (
                                                        <>
                                                            <div className="absolute -top-12 left-0 bg-white shadow-xl rounded-full p-1.5 opacity-0 group-hover/el:opacity-100 transition-opacity flex gap-1.5 z-50 pointer-events-auto border min-w-max">
                                                                <input 
                                                                    type="color" 
                                                                    value={el.color || "#3b82f6"} 
                                                                    onChange={(e) => updateElement(el.id, { color: e.target.value })}
                                                                    className="w-7 h-7 p-0 border-0 rounded-full cursor-pointer overflow-hidden"
                                                                />
                                                                <div className="w-px h-4 bg-border self-center" />
                                                                <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                                            </div>
                                                            <ResizeHandles el={el} />
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Shape Edit (Circle) */}
                                            {el.type === "circle" && (
                                                <div className="group/el relative w-full h-full rounded-full shadow-sm hover:ring-2 ring-primary/50 ring-offset-2 border border-black/10" style={{ backgroundColor: el.color }}>
                                                    {activeTool === "select" && (
                                                        <>
                                                            <div className="absolute -top-12 left-0 bg-white shadow-xl rounded-full p-1.5 opacity-0 group-hover/el:opacity-100 transition-opacity flex gap-1.5 z-50 pointer-events-auto border min-w-max">
                                                                <input 
                                                                    type="color" 
                                                                    value={el.color || "#ef4444"} 
                                                                    onChange={(e) => updateElement(el.id, { color: e.target.value })}
                                                                    className="w-7 h-7 p-0 border-0 rounded-full cursor-pointer overflow-hidden"
                                                                />
                                                                <div className="w-px h-4 bg-border self-center" />
                                                                <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                                            </div>
                                                            <ResizeHandles el={el} />
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Form Edit */}
                                            {el.type === "form" && (
                                                <div className="group/el relative w-full h-full bg-blue-50/80 border border-blue-400 rounded-sm hover:ring-2 ring-blue-500/50">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Form Input" 
                                                        defaultValue={el.content} 
                                                        onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                                        className={cn(
                                                            "w-full h-full bg-transparent border-none outline-none text-sm px-2 text-blue-900 font-mono",
                                                            activeTool === "select" ? "pointer-events-auto" : "pointer-events-none"
                                                        )}
                                                    />
                                                    {activeTool === "select" && (
                                                        <>
                                                            <div className="absolute -top-12 left-0 bg-white shadow-xl rounded-full p-1.5 opacity-0 group-hover/el:opacity-100 transition-opacity flex gap-1 z-50 pointer-events-auto border min-w-max">
                                                                <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                                            </div>
                                                            <ResizeHandles el={el} />
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Link Edit */}
                                            {el.type === "link" && (
                                                <div className="group/el relative w-full h-full bg-emerald-500/20 border border-emerald-500/50 rounded-sm hover:ring-2 ring-emerald-500/50 flex items-center justify-center" style={{ width: (el.width ?? 150) * visualScale, height: (el.height ?? 30) * visualScale }}>
                                                    <Link2 className="w-4 h-4 text-emerald-700 opacity-50" />
                                                    {activeTool === "select" && (
                                                        <>
                                                            <div className="absolute -top-14 left-0 bg-white shadow-xl rounded-full p-1.5 opacity-0 group-hover/el:opacity-100 transition-opacity flex flex-col gap-1 z-50 pointer-events-auto border min-w-max">
                                                                <div className="flex items-center gap-1">
                                                                    <input 
                                                                        type="url" 
                                                                        placeholder="https://" 
                                                                        defaultValue={el.url} 
                                                                        onChange={(e) => updateElement(el.id, { url: e.target.value })}
                                                                        className="text-xs border px-2 py-1 rounded-full outline-none w-48 font-mono bg-zinc-50"
                                                                    />
                                                                    <div className="w-px h-4 bg-border mx-1" />
                                                                    <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                                                </div>
                                                            </div>
                                                            <ResizeHandles el={el} />
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                                {/* Page Context Toolbar */}
                                <div className="absolute -left-12 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white rounded-lg shadow-md border z-50 hidden md:flex">
                                    <button onClick={() => deletePage(index)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete Page">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>

                                </div>
                            </div>
                        ))}
                    </Document>
                </div>
                
                {/* Right Sidebar - Sortable Thumbnails */}
                <aside className="hidden sm:flex w-72 bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 p-6 flex-col gap-6 shrink-0 overflow-y-auto z-10">
                   <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">Pages</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Manage pages</p>
                       </div>
                       <button 
                         onClick={addPage}
                         className="p-2 bg-[#c5a059]/10 text-[#c5a059] rounded-lg hover:bg-[#c5a059]/20 transition-all flex items-center gap-1.5"
                         title="Add Blank Page"
                       >
                         <Plus className="w-3.5 h-3.5" />
                         <span className="text-[9px] font-black uppercase">Add</span>
                       </button>
                   </div>
                   <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePageReorder}>
                            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                                <SortableContext items={Array.from({ length: numPages }, (_, i) => i.toString())} strategy={verticalListSortingStrategy}>
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <SortableThumbnail 
                                            key={`thumb_${index}`} 
                                            index={index} 
                                            onClick={() => scrollToPage(index)} 
                                            onDelete={(e) => { e.stopPropagation(); deletePage(index); }}
                                        />
                                    ))}
                                </SortableContext>
                            </Document>
                        </DndContext>
                    </div>
                 </aside>

                </div>
            </div>
          </div>
        )}

        {/* Step 3: Result & Download */}
        {step === 3 && downloadUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#f3f4f6] dark:bg-[#121212] animate-in zoom-in-95 duration-500">
             <div className="bg-white dark:bg-zinc-950 p-6 sm:p-12 rounded-xl shadow-xl text-center max-w-xl w-full border border-gray-200 dark:border-zinc-800 mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-light mb-2 tracking-tight">Document Saved</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-8">All Edits Rendered</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
                   <a href={downloadUrl} download={`edited_${file?.name || 'document.pdf'}`} className="flex items-center justify-center gap-2 bg-[#c5a059] hover:bg-[#a38448] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded shadow-md w-full sm:w-auto">
                      <Download className="w-4 h-4" /> Download PDF
                   </a>
                   <button onClick={resetAll} className="flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-800 px-8 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-all rounded w-full sm:w-auto">
                      <RotateCcw className="w-4 h-4" /> Edit Another
                   </button>
                </div>
             </div>
          </div>
        )}

      </div>
    </ToolLayout>
  );
}
