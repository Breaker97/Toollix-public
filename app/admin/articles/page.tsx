"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Edit, Trash2, FileText, Globe, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/articles")
      .then(res => res.json())
      .then(data => {
        if (data.articles) setArticles(data.articles);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles(articles.filter(a => a._id !== id));
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Fetching Content Index</p>
         </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
       
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
         <div className="space-y-1">
           <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Content Authority</h1>
           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Platform Editorial & SEO Catalog</p>
         </div>
         <Link href="/admin/articles/editor">
           <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3">
              <Plus className="w-4 h-4" /> 
              <span>Deploy Entry</span>
           </Button>
         </Link>
       </div>

       {/* Main List Container */}
       <div className="space-y-4">
         {articles.length === 0 ? (
           <div className="bg-white dark:bg-[#232333] rounded-3xl p-20 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] text-center">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-zinc-300" />
              </div>
              <h2 className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100 mb-2">Editorial Registry Empty</h2>
              <p className="text-sm text-zinc-400 font-medium max-w-xs mx-auto">No "How-To" guides or blog posts have been indexed yet. Start by deploying your first entry.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 gap-4">
             {articles.map((article) => (
               <div 
                 key={article._id} 
                 className="bg-white dark:bg-[#232333] p-6 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all border border-zinc-50 dark:border-none group"
               >
                 <div className="flex items-start gap-4">
                    <div className={cn(
                        "p-3 rounded-xl shrink-0 mt-1",
                        article.published ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-lg text-zinc-800 dark:text-zinc-100 group-hover:text-primary transition-colors leading-tight">
                            {article.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                             <div className="flex items-center gap-1 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-zinc-500 uppercase tracking-tight">
                                <Link href={`/blog/${article.slug}`} target="_blank" className="hover:underline flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> /{article.slug}
                                </Link>
                             </div>
                             <span className={cn(
                                "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border",
                                article.published 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-none" 
                                    : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-none"
                             )}>
                                {article.published ? "LIVE" : "DRAFT"}
                             </span>
                        </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 justify-end">
                    <Link href={`/admin/articles/editor?id=${article._id}`}>
                      <Button variant="outline" className="h-10 px-4 rounded-xl border-zinc-200 dark:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold text-xs gap-2">
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                    </Link>
                    <Button 
                        variant="outline" 
                        onClick={() => handleDelete(article._id)}
                        className="h-10 px-4 rounded-xl border-zinc-200 dark:border-zinc-700 bg-transparent hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold text-xs text-red-500 gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge</span>
                    </Button>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
    </div>
  );
}
