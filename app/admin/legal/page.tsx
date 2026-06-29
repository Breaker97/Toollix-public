"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  Shield, 
  Scale, 
  Cookie, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  Clock,
  Layout,
  PlusCircle,
  AlertTriangle,
  Globe,
  FileText,
  Gavel,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface LegalDoc {
  slug: string;
  title: string;
  sections: Section[];
  showInFooter: boolean;
  lastUpdated?: string | Date;
}

const PROTECTED_SLUGS = ["privacy-policy", "terms-of-service", "cookie-policy"];

export default function AdminLegalPage() {
  const [activeTab, setActiveTab] = useState("privacy-policy");
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Page Form
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/admin/legal");
      const data = await res.json();
      if (data.contents) {
        setDocs(data.contents);
        if (data.contents.length > 0 && !data.contents.find((d: any) => d.slug === activeTab)) {
            setActiveTab(data.contents[0].slug);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const activeDoc = docs.find(d => d.slug === activeTab);

  const updateActiveDoc = (updates: Partial<LegalDoc>) => {
    setDocs(docs.map(d => d.slug === activeTab ? { ...d, ...updates } : d));
  };

  const addSection = () => {
    if (!activeDoc) return;
    const newId = `section-${Date.now()}`;
    const newSections = [...(activeDoc.sections || []), { id: newId, title: "New Clause Heading", content: "" }];
    updateActiveDoc({ sections: newSections });
  };

  const removeSection = (id: string) => {
    if (!activeDoc) return;
    const newSections = activeDoc.sections.filter(s => s.id !== id);
    updateActiveDoc({ sections: newSections });
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    if (!activeDoc) return;
    const newSections = activeDoc.sections.map(s => s.id === id ? { ...s, ...updates } : s);
    updateActiveDoc({ sections: newSections });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!activeDoc) return;
    const newSections = [...activeDoc.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    updateActiveDoc({ sections: newSections });
  };

  const handleSave = async () => {
    if (!activeDoc) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...activeDoc,
          lastUpdated: new Date()
        })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = async () => {
    if (!newTitle || !newSlug) return;
    setSaving(true);
    try {
        const res = await fetch("/api/admin/legal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newTitle,
                slug: newSlug.toLowerCase().replace(/\s+/g, '-'),
                sections: [],
                showInFooter: true
            })
        });
        if (res.ok) {
            await fetchDocs();
            setActiveTab(newSlug);
            setIsNewDialogOpen(false);
            setNewTitle("");
            setNewSlug("");
        }
    } catch (e) {
        console.error(e);
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (PROTECTED_SLUGS.includes(slug)) return;
    if (!confirm(`Are you sure you want to permanently delete the "${slug}" policy?`)) return;
    
    try {
      const res = await fetch(`/api/admin/legal?slug=${slug}`, { method: "DELETE" });
      if (res.ok) {
        setDocs(docs.filter(d => d.slug !== slug));
        if (activeTab === slug) {
          setActiveTab(PROTECTED_SLUGS[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Syncing Compliance Data</p>
         </div>
      </div>
    );
  }

  const getIcon = (slug: string) => {
    if (slug === "privacy-policy") return Shield;
    if (slug === "terms-of-service") return Scale;
    if (slug === "cookie-policy") return Cookie;
    return FileText;
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Legal Infrastructure</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Managed Policies & Compliance Manifest</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-xl font-bold gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 shadow-lg shadow-zinc-900/10 transition-all text-xs uppercase tracking-widest">
                <PlusCircle className="w-4 h-4" /> Add Protocol
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-10 sm:max-w-md border-none shadow-2xl animate-in zoom-in-95 duration-300">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Initiate Protocol</DialogTitle>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Custom Policy Configuration</p>
              </DialogHeader>
              <div className="space-y-6 py-6 font-sans">
                <div className="space-y-2.5">
                  <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Display Registry Title</Label>
                  <Input id="title" placeholder="Refund & Cancellation" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm outline-none focus:ring-2 ring-primary/20" />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="slug" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Universal Entry Slug</Label>
                  <Input id="slug" placeholder="refund-policy" value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm outline-none focus:ring-2 ring-primary/20" />
                  <p className="text-[9px] font-bold text-zinc-400 pl-1 uppercase tracking-tighter">Public URL Node: /legal/{newSlug || '...'}</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateNew} disabled={saving} className="w-full h-14 rounded-2xl bg-primary text-white font-extrabold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                   {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Protocol"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleSave} 
            disabled={saving || !activeDoc}
            className={cn(
                "h-14 px-10 rounded-2xl font-extrabold uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] gap-3",
                saveSuccess 
                    ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                    : "bg-zinc-900 dark:bg-primary text-white shadow-zinc-900/20 dark:shadow-primary/20"
            )}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            <span>{saveSuccess ? "Manifest Published" : "Commit Changes"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#232333] p-4 rounded-3xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-1 h-fit sticky top-24 border border-zinc-50 dark:border-none">
            <p className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Policy Registry</p>
            {docs.map((doc) => {
              const Icon = getIcon(doc.slug);
              const isActive = activeTab === doc.slug;
              return (
                <div key={doc.slug} className="group flex items-center gap-1 pr-1">
                    <button
                        onClick={() => { setActiveTab(doc.slug); setSaveSuccess(false); }}
                        className={cn(
                            "flex-1 flex items-center justify-between gap-3 px-5 py-4 rounded-2xl text-[13px] font-bold transition-all",
                            isActive 
                                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-zinc-400")} />
                            <span className="truncate max-w-[120px]">{doc.title}</span>
                        </div>
                        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isActive ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
                    </button>
                    {!PROTECTED_SLUGS.includes(doc.slug) && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(doc.slug)}
                            className="rounded-xl h-10 w-10 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
              );
            })}
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-800/30 p-6 rounded-3xl space-y-4 border border-white dark:border-zinc-800/50">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Operational Note
             </div>
             <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                Changes to these documents reflect globally across all automated SEO indexes and site-wide footer segments immediately after publication.
             </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-10">
          {!activeDoc ? (
            <div className="p-20 text-center animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary opacity-20" />
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              
              <section className="bg-white dark:bg-[#232333] rounded-[2.5rem] p-10 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-10 border border-zinc-50 dark:border-none">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800/50 pb-8">
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shadow-inner">
                                <FileText className="w-7 h-7 text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 leading-tight">{activeDoc.title}</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Registry Signal: <span className="text-primary tracking-normal font-sans">/legal/{activeDoc.slug}</span></p>
                            </div>
                         </div>
                         <div className="flex items-center gap-5 bg-zinc-50 dark:bg-zinc-800 px-6 py-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex flex-col gap-0.5 items-end">
                                <Label htmlFor="footer-toggle" className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest leading-none">Footer Visibility</Label>
                                <span className={cn("text-[9px] font-black uppercase tracking-tighter shrink-0", activeDoc.showInFooter ? 'text-emerald-500' : 'text-zinc-400')}>{activeDoc.showInFooter ? 'Broadcast active' : 'Hidden'}</span>
                            </div>
                            <Switch 
                                id="footer-toggle" 
                                checked={activeDoc.showInFooter} 
                                onCheckedChange={(val) => updateActiveDoc({ showInFooter: val })}
                                className="data-[state=checked]:bg-emerald-500"
                            />
                         </div>
                    </div>

                    {PROTECTED_SLUGS.includes(activeDoc.slug) && (
                        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/10 text-[10px] font-extrabold uppercase tracking-widest">
                            <AlertTriangle className="w-4 h-4" /> 
                            <span>System Core Protocol — Terminate Protection Active</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-1.5 bg-primary rounded-full" />
                                <h2 className="text-lg font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Document Clauses</h2>
                            </div>
                            <Button onClick={addSection} variant="outline" className="h-10 px-4 rounded-xl font-bold bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[11px] gap-2 uppercase tracking-widest">
                                <Plus className="w-4 h-4" /> Append Clause
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {(!activeDoc.sections || activeDoc.sections.length === 0) ? (
                            <div className="bg-zinc-50 dark:bg-zinc-800/30 border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-16 rounded-[2.5rem] text-center space-y-6 group">
                                <div className="bg-white dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                    <Gavel className="w-8 h-8 text-zinc-300" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-zinc-500 dark:text-zinc-400 font-extrabold uppercase text-xs tracking-widest">Clause Registry Empty</p>
                                    <p className="text-[11px] text-zinc-400 font-medium max-w-[200px] mx-auto">No legal sections have been drafted for this node yet.</p>
                                </div>
                                <Button onClick={addSection} variant="link" className="font-extrabold text-primary uppercase text-[10px] tracking-widest hover:no-underline hover:text-primary transition-colors">Start Design Phase</Button>
                            </div>
                            ) : (
                            <div className="space-y-6">
                                {activeDoc.sections.map((section, idx) => (
                                    <div key={section.id} className="bg-zinc-50 dark:bg-zinc-800/30 p-8 rounded-3xl space-y-6 group transition-all border border-zinc-100 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow-xl">
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-5 flex-1">
                                                <div className="flex flex-col gap-1.5 items-center px-1">
                                                    <button onClick={() => moveSection(idx, 'up')} className="text-zinc-300 hover:text-primary transition-colors disabled:opacity-10" disabled={idx === 0}><ChevronUp className="w-5 h-5" /></button>
                                                    <div className="text-[10px] font-black bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 w-6 h-6 flex items-center justify-center rounded-full">{idx + 1}</div>
                                                    <button onClick={() => moveSection(idx, 'down')} className="text-zinc-300 hover:text-primary transition-colors disabled:opacity-10" disabled={idx === activeDoc.sections.length - 1}><ChevronDown className="w-5 h-5" /></button>
                                                </div>
                                                <Input 
                                                    value={section.title} 
                                                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                                    placeholder="Section Header (e.g. 1. Terms of Use)"
                                                    className="font-extrabold text-xl border-none bg-transparent focus-visible:ring-0 px-0 h-auto text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-300"
                                                />
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => removeSection(section.id)}
                                                className="rounded-xl h-10 w-10 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                        <Textarea 
                                            value={section.content}
                                            onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                            placeholder="Draft the compliance conditions node here..."
                                            className="min-h-[160px] rounded-2xl bg-white dark:bg-zinc-900 border-none px-6 py-5 text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed shadow-inner outline-none focus:ring-2 ring-primary/20 transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                            )}
                        </div>
                    </div>
              </section>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
