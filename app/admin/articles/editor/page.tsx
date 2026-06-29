"use client";

import { useEffect, useState, Suspense } from "react";
import { 
  Loader2, Save, ArrowLeft, Bold, Italic, Link as LinkIcon, 
  Code, List, ListOrdered, Heading1, Heading2, Eye, PenTool 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ALL_TOOLS } from "@/lib/tools-data";
import { Search, X, CheckCircle2 } from "lucide-react";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [article, setArticle] = useState<any>({
    title: "", slug: "", content: "", seoTitle: "", seoDescription: "", published: false, relatedTools: []
  });
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [toolSearch, setToolSearch] = useState("");
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetch("/api/admin/articles")
        .then(res => res.json())
        .then(data => {
          const found = data.articles?.find((a: any) => a._id === id);
          if (found) setArticle(found);
          setLoading(false);
        });
    }
  }, [id]);

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = id ? article.slug : generateSlug(title);
    setArticle({ ...article, title, slug });
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    
    setArticle({ ...article, content: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 10);
  };

  const handleSave = async () => {
    if (!article.title || !article.slug) return alert("Title and Slug are required.");
    setSaving(true);
    const url = id ? `/api/admin/articles/${id}` : "/api/admin/articles";
    const method = id ? "PUT" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article)
      });
      if (res.ok) {
        router.push("/admin/articles");
      } else {
        alert("Failed to save.");
      }
    } catch (e) {
      alert("Error saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 max-w-6xl mx-auto">
       <div className="flex items-center justify-between pb-6 border-b border-border/50">
         <div className="flex items-center gap-4">
           <Link href="/admin/articles">
             <Button variant="outline" size="icon" className="rounded-xl"><ArrowLeft className="w-4 h-4" /></Button>
           </Link>
           <div>
             <h1 className="text-3xl font-black text-foreground">{id ? "Edit Guide" : "Create New Guide"}</h1>
             <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1">CMS Engine v2.0</p>
           </div>
         </div>
         <Button onClick={handleSave} disabled={saving} className="h-12 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-bold gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {id ? "Update Content" : "Publish Article"}
         </Button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 space-y-6">
            
            <div className="bg-background border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Main Title</Label>
                <Input id="title" value={article.title} onChange={handleTitleChange} className="h-14 text-xl font-bold rounded-2xl" placeholder="How to process PDFs like a pro..." />
              </div>
            </div>

            <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
               <div className="px-4 py-2 bg-muted/20 border-b border-border/50 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => insertText("**", "**")}><Bold className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => insertText("_", "_")}><Italic className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => insertText("# ")}><Heading1 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => insertText("## ")}><Heading2 className="w-4 h-4" /></Button>
                    <div className="w-[1px] h-4 bg-border mx-1" />
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => insertText("[", "](url)")}><LinkIcon className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => insertText("```\n", "\n```")}><Code className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => insertText("- ")}><List className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex bg-muted/40 p-1 rounded-xl gap-1">
                    <button 
                      onClick={() => setActiveTab("write")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'write' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                    >
                      <PenTool className="w-3.5 h-3.5" /> Write
                    </button>
                    <button 
                      onClick={() => setActiveTab("preview")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'preview' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
               </div>
               
               <div className="flex-1 relative">
                 {activeTab === 'write' ? (
                   <textarea 
                    id="content" 
                    value={article.content} 
                    onChange={e => setArticle({...article, content: e.target.value})}
                    placeholder="Build your guide using Markdown..."
                    className="w-full h-full min-h-[500px] p-6 font-mono text-base bg-transparent focus:outline-none resize-none leading-relaxed"
                   />
                 ) : (
                   <div className="p-8 prose prose-lg dark:prose-invert max-w-none overflow-y-auto max-h-[700px]">
                      <ReactMarkdown>{article.content || "_No content yet. Use the editor to start writing..._"}</ReactMarkdown>
                   </div>
                 )}
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-background border border-border p-6 rounded-3xl space-y-6 shadow-sm sticky top-8">
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground mb-4">Discovery Settings</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-xs font-bold">Safe URL Slug</Label>
                    <Input id="slug" value={article.slug} onChange={e => setArticle({...article, slug: e.target.value})} placeholder="how-to-merge-pdfs" className="bg-muted/10 font-mono text-xs" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-2xl group transition-colors hover:border-primary/30">
                    <div className="space-y-0.5">
                      <Label htmlFor="published" className="text-sm font-bold cursor-pointer transition-colors group-hover:text-primary">Publish Status</Label>
                      <p className="text-[10px] text-muted-foreground">Visible to search engines</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="published" 
                      checked={article.published} 
                      onChange={e => setArticle({...article, published: e.target.checked})}
                      className="w-5 h-5 rounded-md accent-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Featured Tools</h3>
                  {article.relatedTools?.length > 0 && (
                    <button 
                      onClick={() => setArticle({...article, relatedTools: []})}
                      className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input 
                      placeholder="Find tools..." 
                      value={toolSearch}
                      onChange={e => setToolSearch(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-xl bg-muted/20" 
                    />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                    {ALL_TOOLS.filter(t => t.title.toLowerCase().includes(toolSearch.toLowerCase())).map(tool => {
                      const isSelected = article.relatedTools?.includes(tool.href);
                      return (
                        <button
                          key={tool.href}
                          onClick={() => {
                            const current = article.relatedTools || [];
                            const next = isSelected 
                              ? current.filter((h: string) => h !== tool.href)
                              : [...current, tool.href];
                            setArticle({...article, relatedTools: next});
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                            isSelected 
                              ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" 
                              : "bg-background border-border hover:border-primary/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tool.bgClass}`}>
                               <span className="text-[10px] font-bold text-primary">{tool.title[0]}</span>
                            </div>
                            <span className={`text-[11px] font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                              {tool.title}
                            </span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                     <span>Selected Tools</span>
                     <span className="text-primary">{article.relatedTools?.length || 0}</span>
                  </div>
                </div>
              </div>

              {article.content && (
                <div className="pt-6 border-t border-border/50 text-xs font-bold text-muted-foreground space-y-1">
                   <p>Word Count: {article.content.trim().split(/\s+/).length}</p>
                   <p>Reading Time: ~{Math.ceil(article.content.trim().split(/\s+/).length / 200)} min</p>
                </div>
              )}
            </div>
         </div>
       </div>
    </div>
  );
}

export default function AdminEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <EditorContent />
    </Suspense>
  );
}
