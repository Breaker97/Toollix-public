"use client";
import { create } from 'zustand';

export type ElementType = 'text' | 'image' | 'shape' | 'circle' | 'form' | 'link';

export interface PdfElement {
  id: string;
  type: ElementType;
  x: number; // canvas coordinates
  y: number;
  pageIndex: number; // NEW: Multi-page support
  // Specific properties per type
  content?: string; // for text
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  src?: string; // for image
  url?: string; // for links
  width?: number; // image width
  height?: number; // image height
  // shape properties could be added later
}

interface PdfEditorState {
  elements: PdfElement[];
  history: PdfElement[][];
  future: PdfElement[][];
  addElement: (el: PdfElement) => void;
  updateElement: (id: string, updates: Partial<PdfElement>) => void;
  removeElement: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
}

export const usePdfEditorStore = create<PdfEditorState>((set, get) => ({
  elements: [],
  history: [],
  future: [],
  
  addElement: (el) => set((state) => ({ 
    history: [...state.history, state.elements], 
    future: [],
    elements: [...state.elements, el] 
  })),
  
  updateElement: (id, updates) => set((state) => {
    const newElements = state.elements.map(el => (el.id === id ? { ...el, ...updates } : el));
    return { 
      history: [...state.history, state.elements], 
      future: [],
      elements: newElements 
    };
  }),
  
  removeElement: (id) => set((state) => ({ 
    history: [...state.history, state.elements],
    future: [],
    elements: state.elements.filter(el => el.id !== id) 
  })),
  
  undo: () => set((state) => {
    if (state.history.length === 0) return state;
    const newHistory = [...state.history];
    const previousState = newHistory.pop() || [];
    return { 
        elements: previousState, 
        history: newHistory,
        future: [state.elements, ...state.future]
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const newFuture = [...state.future];
    const nextState = newFuture.shift() || [];
    return {
        elements: nextState,
        history: [...state.history, state.elements],
        future: newFuture
    };
  }),
  
  clearAll: () => set((state) => ({ 
    history: [...state.history, state.elements], 
    future: [],
    elements: [] 
  })),
}));
